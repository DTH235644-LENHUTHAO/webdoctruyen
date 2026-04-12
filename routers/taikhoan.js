var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var TaiKhoan = require('../models/taikhoan');
var Truyen = require('../models/truyen');
var Chuong = require('../models/chuong');
var BinhLuan = require('../models/binhluan');
const upload = require('../config/multer');

// GET: Danh sách tài khoản
router.get('/', async (req, res) => {
	var tk = await TaiKhoan.find();
	res.render('taikhoan', {
		title: 'Danh sách tài khoản',
		taikhoan: tk
	});
});

// GET: Thêm tài khoản
router.get('/them', async (req, res) => {
	res.render('taikhoan_them', {
		title: 'Thêm tài khoản'
	});
});

// POST: Thêm tài khoản
router.post('/them',upload.single('HinhAnh'), async (req, res) => {
	if (req.body.MatKhau !== req.body.XacNhanMatKhau) {
        return res.redirect('/error');
    }
	
	let hinh = '/images/noimage.png';
	if (req.file) {
		hinh = req.file.path; // link cloudinary
	}
	var check = await TaiKhoan.findOne({
		TenDangNhap: req.body.TenDangNhap
	});

	if(check){
		return res.redirect('/taikhoan'); 
	}
	var salt = bcrypt.genSaltSync(10);
	var data = {
		HoVaTen: req.body.HoVaTen,
		Email: req.body.Email,
		HinhAnh: hinh,
		TenDangNhap: req.body.TenDangNhap,
		MatKhau: bcrypt.hashSync(req.body.MatKhau, salt),
		QuyenHan: 0,  
		KichHoat: 1
	};
	await TaiKhoan.create(data);
	res.redirect('/taikhoan');
});

// GET: Sửa tài khoản
router.get('/sua/:id', async (req, res) => {
	var id = req.params.id;
	var tk = await TaiKhoan.findById(id);
	if(!tk){
		return res.redirect('/taikhoan');
	}
	res.render('taikhoan_sua', {
		title: 'Sửa tài khoản',
		taikhoan: tk
	});
});

// POST: Sửa tài khoản
router.post('/sua/:id', upload.single('HinhAnh'), async (req, res) => {

	var id = req.params.id;
	// 1. lấy dữ liệu cũ
	var tk = await TaiKhoan.findById(id);

	// 2. mặc định giữ ảnh cũ
	let hinh = tk.HinhAnh;

	// 3. nếu có upload ảnh mới
	if (req.file) {
		hinh = req.file.path;
	}
	var salt = bcrypt.genSaltSync(10);
	var data = {
		HoVaTen: req.body.HoVaTen,
		Email: req.body.Email,
		HinhAnh: hinh,
		TenDangNhap: req.body.TenDangNhap,
		QuyenHan: req.body.QuyenHan,
		KichHoat: req.body.KichHoat
	};
	if(req.body.MatKhau)
		data['MatKhau'] = bcrypt.hashSync(req.body.MatKhau, salt);
	await TaiKhoan.findByIdAndUpdate(id, data);
	res.redirect('/taikhoan');
});

router.get('/xoa/:id', async (req, res) => {


	// chỉ admin mới được xóa
	if (req.session.QuyenHan !== 'admin') {
		return res.redirect('/error');
	}

	var id = req.params.id;

	// không cho xóa chính mình
	if (req.session.MaNguoiDung.toString() === id) {
		return res.redirect('/error');
	}

	// lấy tất cả truyện của user
	let truyenList = await Truyen.find({ TaiKhoan: id });

	let truyenIds = truyenList.map(t => t._id);

	// xóa bình luận theo truyện
	await BinhLuan.deleteMany({
		Chuong: { $in: await Chuong.find({ Truyen: { $in: truyenIds } }).distinct('_id') }
	});

	// xóa chương
	await Chuong.deleteMany({
		Truyen: { $in: truyenIds }
	});

	// xóa truyện
	await Truyen.deleteMany({
		TaiKhoan: id
	});

	// xóa tài khoản
	await TaiKhoan.findByIdAndDelete(id);

	res.redirect('/taikhoan');
});

router.get('/profile', async (req, res) => {

  if (!req.session.MaNguoiDung)
    return res.redirect('/dangnhap');

  const user = await TaiKhoan.findById(req.session.MaNguoiDung);

  res.render('profile', { 
	title: 'Hồ sơ cá nhân',
	user: user
});
});

router.post('/profile', upload.single('HinhAnh'), async (req, res) => {

  if (!req.session.MaNguoiDung)
    return res.redirect('/dangnhap');

  let data = {
    HoVaTen: req.body.HoVaTen,
    Email: req.body.Email
  };

  // nếu có upload ảnh
  if (req.file) {
    data.HinhAnh = req.file.path; // Cloudinary URL
  }

  await TaiKhoan.findByIdAndUpdate(req.session.MaNguoiDung, data);

  res.redirect('/taikhoan/profile');
});

module.exports = router;