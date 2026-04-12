var express = require('express');
var router = express.Router();
var firstImage = require('../modules/firstimage');
var Truyen = require('../models/truyen');
var TheLoai = require('../models/theloai');
var Chuong = require('../models/chuong');
var TaiKhoan = require('../models/taikhoan');
var BinhLuan = require('../models/binhluan');
var formatTime = require('../modules/timeFormat');

// GET: Trang chủ
router.get('/', async (req, res) => {
	//Lấy thể loại hiển thị vào menu
	var cm = await TheLoai.find()
		.sort({TenTheLoai: 1}).exec();

	//Lay 20 truyen moi nhat
	var tr = await Truyen.find({KiemDuyet:1})
		.sort({ NgayDang:-1})
		.populate('TheLoai')
		.populate('TaiKhoan')
		.limit(10)
		.exec();

	//Lay 3 truyen xem nhieu nhat hien thi cot phai
	var xnn = await Truyen.find({KiemDuyet:1})
		.sort({LuotXem: -1})
		.populate('TheLoai')
		.populate('TaiKhoan')
		.limit(3)
		.exec();

	// Lấy 5 truyện ngẫu nhiên làm đề cử
	var tdc = await Truyen.aggregate([
		{ $match: { KiemDuyet: 1 } },
		{ $sample: { size: 5 } }
	]);

	// populate thủ công 
	tdc = await Truyen.populate(tdc, [
		{ path: 'TheLoai' },
		{ path: 'TaiKhoan' }
	]);

	res.render('index',{
		title:'Trang chủ',
		chuyenmuc: cm,
		truyen: tr,
		xemnhieunhat: xnn,
		truyenDeCu: tdc,
		firstImage: firstImage,
		formatTime: formatTime,
		tukhoa: ''
	});
});

// GET: Lấy các truyen cùng thể loại
router.get('/truyen/theloai/:id', async (req, res) => {
	var id = req.params.id;

	//Lay chuyen muc hien thi vao menu
	var cm = await TheLoai.find()
		.sort({TenTheLoai: 1}).exec();

	//Lay thong tin the loai hien tai
	var tl = await TheLoai.findById(id);

	//Lay 8 truyen moi nhat cung the loai
	var tr = await Truyen.find({KiemDuyet:1,TheLoai:id})
		.sort({NgayDang:-1})
		.populate('TheLoai')
		.populate('TaiKhoan')
		.limit(8)
		.exec();

	//Lay 3 truyen xem nhieu nhat hien thi vao cot phai
	var xnn = await Truyen.find({KiemDuyet:1,TheLoai:id})
		.sort({LuotXem:-1})
		.populate('TheLoai')
		.populate('TaiKhoan')
		.limit(3)
		.exec();

	res.render('truyen_theloai',{
		title:'Truyện cùng thể loại',
		chuyenmuc: cm,
		theloai: tl,
		truyen: tr,
		xemnhieunhat: xnn,
		firstImage: firstImage,
		formatTime: formatTime
	});
	
});

// GET: Xem truyen
router.get('/truyen/chitiet/:id', async (req, res) => {
	var id = req.params.id;

    var dsChuong = await Chuong.find({ Truyen: req.params.id, KiemDuyet: 1 })
        .sort({ SoChuong: 1 });

	//Lay chuyen muc hien thi vao menu
	var cm = await TheLoai.find().sort({TenTheLoai: 1}).exec();

	//Lay thong tin truyen hien tai
	var tr = await Truyen.findById(id)
		.populate('TheLoai')
		.populate('TaiKhoan')
		.exec();


	if(!req.session.DaXem)
	{
		req.session.DaXem={};
	}
	if(!req.session.DaXem[tr._id]){
		await Truyen.findByIdAndUpdate(id,{
			$inc:{LuotXem:1}
			//LuotXem:tr.LuotXem + 1
		});

		//Danh dau da xem
		req.session.DaXem[tr._id]=1;
	}

	//Lay truyen xem nhieu nhat hien thi vao cot phai
	var xnn = await Truyen.find({KiemDuyet:1})
		.sort({LuotXem:-1})
		.populate('TheLoai')
		.populate('TaiKhoan')
		.limit(3)
		.exec();

	// Lấy 5 bình luận mới nhất của truyện
	var binhluanRaw = await BinhLuan.find()
		.populate({
			path: 'Chuong',
			match: { Truyen: id }
		})
		.populate('TaiKhoan')
		.sort({ createdAt: -1 })
		.limit(5);

	// lọc comment đúng truyện
	var binhluan = binhluanRaw.filter(bl => bl.Chuong != null);

	res.render('truyen_chitiet',{
		chuyenmuc: cm,
		truyen: tr,
		xemnhieunhat: xnn,
		dsChuong: dsChuong,
		binhluan: binhluan,
		firstImage: firstImage,
		formatTime: formatTime
	});
		
});

// GET: Truyện mới nhất
router.get('/truyenmoi', async (req, res) => {

	const truyen = await Truyen.find({KiemDuyet:1})
		.sort({ NgayDang: -1 })
		.limit(10);

	res.render('truyenmoi', {
		title: 'Truyện vừa đăng',
		truyen: truyen  
	});
});

// truyen chua duyet
router.get('/chuaduyet', async (req, res) => {

	if(req.session.QuyenHan != 'admin'){
		return res.redirect('/error');
	}

	const truyen = await Truyen.find({ KiemDuyet: 0 })
		.sort({ NgayDang: -1 });

	res.render('truyen_duyet', {
		title: 'Truyện cần duyệt',
		truyen: truyen
	});
});

// POST: Kết quả tìm kiếm
router.post('/timkiem', async (req, res) => {
    let tukhoa = req.body.tukhoa || '';

    let tr = [];

    if (tukhoa.trim() !== '') {
        tr = await Truyen.find({
            TenTruyen: { $regex: tukhoa, $options: 'i' }
        })
        .populate('TheLoai')
        .populate('TaiKhoan');
    }

    // LẤY MENU + SIDEBAR (QUAN TRỌNG để không lỗi undefined)
    let cm = await TheLoai.find().sort({ TenTheLoai: 1 });

    let xnn = await Truyen.find({ KiemDuyet: 1 })
        .sort({ LuotXem: -1 })
        .populate('TheLoai')
        .limit(3);

    res.render('timkiem', {
        title: 'Kết quả tìm kiếm',
        chuyenmuc: cm,
        xemnhieunhat: xnn,
        truyen: tr,
        tukhoa: tukhoa,
		firstImage: firstImage,
		formatTime: formatTime
    });
});



// GET: Lỗi
router.get('/error', async (req, res) => {
	res.render('error', {
		title: 'Lỗi'
	});
});

// GET: Thành công
router.get('/success', async (req, res) => {
	res.render('success', {
		title: 'Hoàn thành'
	});
});



module.exports = router;