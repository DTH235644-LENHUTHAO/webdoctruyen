var express = require('express');
var router = express.Router();
var TheLoai = require('../models/theloai');

router.use((req, res, next) => {
	if(!req.session.MaNguoiDung){
		return res.redirect('/dangnhap');
	}
	if(req.session.QuyenHan != 'admin'){
		return res.redirect('/error');
	}
	next();
});

// GET: Danh sách thể loại
router.get('/', async (req, res) => {
	var tl = await TheLoai.find();
	res.render('theloai', {
		title: 'Danh sách thể loại',
		theloai: tl
	});
});

// GET: Thêm thể loại
router.get('/them', async (req, res) => {
	res.render('theloai_them', {
		title: 'Thêm thể loại'
	});
});

// POST: Thêm thể loại
router.post('/them', async (req, res) => {
	var data = {
		TenTheLoai: req.body.TenTheLoai
	};
	var check = await TheLoai.findOne({
	TenTheLoai: req.body.TenTheLoai
	});

	if(check){
		return res.redirect('/theloai');
	}
	await TheLoai.create(data);
	res.redirect('/theloai');
});


// GET: Sửa thể loại
router.get('/sua/:id', async (req, res) => {
	var id = req.params.id;
	var tl = await TheLoai.findById(id);
	res.render('theloai_sua', {
		title: 'Sửa thể loại',
		theloai: tl
	});
});

// POST: Sửa thể loại
router.post('/sua/:id', async (req, res) => {
	var id = req.params.id;
	var data = {
		TenTheLoai: req.body.TenTheLoai
	};
	var check = await TheLoai.findOne({
	TenTheLoai: req.body.TenTheLoai,
	_id: { $ne: id }
	});

	if(check){
		return res.redirect('/theloai');
	}
	await TheLoai.findByIdAndUpdate(id, data);
	res.redirect('/theloai');
});

// GET: Xóa thể loại
router.get('/xoa/:id', async (req, res) => {
	var id = req.params.id;
	await TheLoai.findByIdAndDelete(id);
	res.redirect('/theloai');
});

module.exports = router;