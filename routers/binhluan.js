var express = require('express');
var router = express.Router();
var BinhLuan = require('../models/binhluan');

// POST: thêm bình luận
router.post('/them', async (req, res) => {
	if(!req.session.MaNguoiDung){
		return res.redirect('/dangnhap');
	}

	await BinhLuan.create({
		Chuong: req.body.Chuong,
		TaiKhoan: req.session.MaNguoiDung,
		NoiDung: req.body.NoiDung
	});

	res.redirect('/chuong/chitiet/' + req.body.Chuong);
});

module.exports = router;