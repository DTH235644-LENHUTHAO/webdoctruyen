const express = require('express');
const router = express.Router();
const Truyen = require('../models/truyen');
const TheLoai = require('../models/theloai');
const BinhLuan = require('../models/binhluan');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'truyen',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

const upload = multer({ storage });


// Danh sách truyện
router.get('/', async (req, res) => {
	var tr = await Truyen.find()
		.populate('TheLoai')
		.populate('TaiKhoan').exec();
	res.render('truyen', {
		title: 'Danh sách truyện',
		truyen: tr
	});
});

// GET: Đăng truyen
router.get('/them', async (req, res) => {
	// Lấy the loai hiển thị vào form thêm
	var tl = await TheLoai.find();
	res.render('truyen_them', {
		title: 'Đăng truyện',
		theloai: tl
	});
});

// POST: Đăng bài viết
router.post('/them', upload.single('HinhAnh'), async (req, res) => {
	let hinh = '/images/noimage.png';
	if (req.file) {
		hinh = req.file.path; // link cloudinary
	}
	if(req.session.MaNguoiDung) {
		var data = {
			TaiKhoan: req.session.MaNguoiDung,
			TenTruyen: req.body.TenTruyen,
			TheLoai: req.body.MaTheLoai,
			TacGia: req.body.TacGia,
			TomTat: req.body.TomTat,
			HinhAnh: hinh,
			KiemDuyet: 0
		};
		await Truyen.create(data);
		req.session.success = 'Đã đăng truyện thành công và đang chờ kiểm duyệt.';
		res.redirect('/success');
	} else {
		res.redirect('/dangnhap');
	}
});

// Xóa truyện
router.get('/xoa/:id', async (req, res) => {
	if(!req.session.MaNguoiDung){
		return res.redirect('/dangnhap');
	}

	var tr = await Truyen.findById(req.params.id);

	if(!tr){
		return res.redirect('/truyen');
	}

	// chỉ chủ truyện hoặc admin
	if(tr.TaiKhoan.toString() !== req.session.MaNguoiDung.toString() 
		&& req.session.QuyenHan != 'admin'){
		return res.redirect('/error');
	}

	await Truyen.findByIdAndDelete(req.params.id);
	res.redirect('/truyen');
});

// GET: Duyệt truyện
router.get('/duyet/:id', async (req, res) => {
	if(req.session.QuyenHan != 'admin'){
	return res.redirect('/error');
	}
	var id = req.params.id;
	var tr = await Truyen.findById(id);
	await Truyen.findByIdAndUpdate(id, { 'KiemDuyet': 1 - tr.KiemDuyet });
	
	
	res.redirect(req.get('Referrer') || '/');
});

// GET: Sửa truyện
router.get('/sua/:id', async (req, res) => {
	var id = req.params.id;
	var tl = await TheLoai.find();
	var tr = await Truyen.findById(id);
	if(!tr){
	return res.redirect('/truyen');
	}

	if(tr.TaiKhoan.toString() !== req.session.MaNguoiDung.toString() 
		&& req.session.QuyenHan != 'admin'){
		return res.redirect('/error');
	}
	res.render('truyen_sua', {
		title: 'Sửa truyện',
		truyen: tr,
		theloai: tl
	});
});

// POST: Sửa truyện
router.post('/sua/:id', upload.single('HinhAnh'), async (req, res) => {
	var id = req.params.id;
	// lấy truyện cũ (để giữ ảnh nếu không upload mới)
    var tr = await Truyen.findById(id);

	if (!tr) {
    return res.redirect('/truyen');
	}
	// kiểm tra quyền
    if (tr.TaiKhoan.toString() !== req.session.MaNguoiDung.toString() 
        && req.session.QuyenHan !== 'admin') {
        return res.redirect('/error');
    }

	// mặc định giữ ảnh cũ
    let hinh = tr.HinhAnh;

    // nếu có upload ảnh mới thì thay
    if (req.file) {
		hinh = req.file.path;
	}

	var data = {
        TenTruyen: req.body.TenTruyen,
        TheLoai: req.body.MaTheLoai,
        TacGia: req.body.TacGia,
        TomTat: req.body.TomTat,
        HinhAnh: hinh,
		KiemDuyet: 0
    };
	
	await Truyen.findByIdAndUpdate(id, data);
	req.session.success = 'Đã cập nhật truyện thành công và đang chờ kiểm duyệt.';
	res.redirect('/truyen');
});

// GET: Danh sách truyện của tôi
router.get('/cuatoi', async (req, res) => {
	if(req.session.MaNguoiDung) {
		var id = req.session.MaNguoiDung;

		var tr = await Truyen.find({ TaiKhoan: id })
			.populate('TheLoai')
			.populate('TaiKhoan')
			.exec();

		res.render('truyen_cuatoi', {
			title: 'Truyện của tôi',
			truyen: tr
		});
	} else {
		res.redirect('/dangnhap');
	}
});

module.exports = router;

