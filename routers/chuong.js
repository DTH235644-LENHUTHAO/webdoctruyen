var express = require('express');
var router = express.Router();
var Chuong = require('../models/chuong');
var Truyen = require('../models/truyen');
var TheLoai = require('../models/theloai');
var BinhLuan = require('../models/binhluan');

// GET: Danh sách chương
router.get('/', async (req, res) => {
	var ch = await Chuong.find()
		.populate('Truyen')
		.populate('TaiKhoan').exec();

		res.render('chuong', {
			title: 'Danh sách chương',
			chuong: ch
		});
		
	});


// GET: thêm chương
router.get('/them/:id', async (req, res) => {
	if(!req.session.MaNguoiDung){
		return res.redirect('/dangnhap');
	}

	const truyenId = req.params.id;

	var tr = await Truyen.findById(truyenId);

	//Lấy chương lớn nhất
	const lastChuong = await Chuong.find({ Truyen: truyenId })
		.sort({ SoChuong: -1 })
		.limit(1);

	// Tính số chương tiếp theo
	const nextSoChuong = lastChuong.length > 0 
		? lastChuong[0].SoChuong + 1 
		: 1;

	res.render('chuong_them', {
		title: 'Thêm chương',
		truyen: tr,
		nextSoChuong: nextSoChuong
	});
});

// POST: Thêm chương
router.post('/them', async (req, res) => {
	console.log("BODY:", req.body);
	if(req.session.MaNguoiDung) {

		// Kt trùng chương hay chưa
		const exists = await Chuong.findOne({
			Truyen: req.body.Truyen,
			SoChuong: req.body.SoChuong
		});

		if (exists) {
			req.session.error = 'Số chương đã tồn tại!';
			return res.redirect('back'); // quay lại form
		}
		var data = {
			Truyen: req.body.Truyen,
			TaiKhoan: req.session.MaNguoiDung,
			SoChuong: req.body.SoChuong,
			TieuDe: req.body.TieuDe,
			NoiDung: req.body.NoiDung,
			KiemDuyet: 0
		};
		await Chuong.create(data);
		req.session.success = 'Đã đăng chương thành công và đang chờ kiểm duyệt.';
		res.redirect('/chuong/truyen/' + req.body.Truyen);
	} else {
		res.redirect('/dangnhap');
	}
});

// GET: Sửa chương
router.get('/sua/:id', async (req, res) => {
	var id= req.params.id;
	var tr = await Truyen.find();
	if(!req.session.MaNguoiDung)
	{
		return res.redirect('/dangnhap');
	}
	var ch = await Chuong.findOne({
		_id: id,
		TaiKhoan: req.session.MaNguoiDung
	}).populate('Truyen').exec();
	if(!ch){
	return res.redirect('/');
	}
	res.render('chuong_sua', {
		title: 'Sửa chương',
		chuong: ch,
		truyen: ch.Truyen
	});
});

// POST: Sửa chương
router.post('/sua/:id', async (req, res) => {
	var id = req.params.id;
	var data = {
		Truyen: req.body.Truyen,
		SoChuong: req.body.SoChuong,
		TieuDe: req.body.TieuDe,
		NoiDung: req.body.NoiDung,
		KiemDuyet: 0
	};
	await Chuong.findOneAndUpdate({
			_id: id,
			TaiKhoan: req.session.MaNguoiDung
		}, data);
	req.session.success = 'Đã cập nhật chương thành công và đang chờ kiểm duyệt.';
	res.redirect('/success');
});

// GET: Xóa chương
router.get('/xoa/:id', async (req, res) => {
	var id = req.params.id;
	await Chuong.findOneAndDelete({
	_id: id,
	TaiKhoan: req.session.MaNguoiDung
});
	
	
	res.redirect(req.get('Referrer') || '/');
});
	
// GET: Duyệt chương
router.get('/duyet/:id', async (req, res) => {
	if(req.session.QuyenHan != 'admin'){
		return res.redirect('/error');
	}

	var id = req.params.id;
	var ch = await Chuong.findById(id);

	if(!ch){
	return res.redirect('/');
	}

	await Chuong.findByIdAndUpdate(id, {
		KiemDuyet: 1 - ch.KiemDuyet
	});

	res.redirect(req.get('Referrer') || '/');
});

// GET: Danh sách chương của tôi
router.get('/cuatoi', async (req, res) => {
	if(req.session.MaNguoiDung) {
		// Mã người dùng hiện tại
		var id = req.session.MaNguoiDung;
		var ch = await Chuong.find({ TaiKhoan: id })
			.populate('Truyen')
			.populate('TaiKhoan').exec();
		res.render('chuong_cuatoi', {
			title: 'Chương của tôi',
			chuong: ch
		});
	} else {
		res.redirect('/dangnhap');
	}
});

// GET: Danh sách chương theo truyện
router.get('/truyen/:id', async (req, res) => {
    const truyenId = req.params.id;

    const dsChuong = await Chuong.find({ Truyen: truyenId })
        .sort({ SoChuong: 1 })
        .populate('Truyen')
        .populate('TaiKhoan');

    const truyen = await Truyen.findById(truyenId);

    res.render('chuong', {
        title: 'Chương của ' + (truyen ? truyen.TenTruyen : ''),
        chuong: dsChuong,
        truyenId: truyenId
    });
});

// GET: Xem chi tiết chương
router.get('/chitiet/:id', async (req, res) => {
    const chuong = await Chuong.findById(req.params.id).populate("Truyen");

    const truyen = chuong.Truyen;

    const chuongTruoc = await Chuong.findOne({
        Truyen: truyen._id,
        SoChuong: { $lt: chuong.SoChuong }
    }).sort({ SoChuong: -1 });

    const chuongSau = await Chuong.findOne({
        Truyen: truyen._id,
        SoChuong: { $gt: chuong.SoChuong }
    }).sort({ SoChuong: 1 });

	var cm = await TheLoai.find().sort({TenTheLoai: 1}).exec();

	const binhluan = await BinhLuan.find({ Chuong: chuong._id })
		.populate('TaiKhoan')
		.sort({ createdAt: -1 });

    res.render('chuong_chitiet', {
        chuong,
        truyen,
		chuyenmuc: cm,
		binhluan,
        chuongTruoc,
        chuongSau
    });
});

module.exports = router;