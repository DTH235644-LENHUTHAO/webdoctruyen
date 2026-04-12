var mongoose = require('mongoose');

var truyenSchema = new mongoose.Schema({
	TenTruyen: { type: String, required: true },
	TheLoai: { type: mongoose.Schema.Types.ObjectId, ref: 'TheLoai' , required: true},
	TaiKhoan: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan' , required: true },
	TacGia: String ,
	TomTat: String,
	HinhAnh: String,
	LuotXem: { type: Number, default: 0 },
	KiemDuyet: { type: Number, default: 0 },
	NgayDang: { type: Date, default: Date.now }
});


var truyenModel = mongoose.model('Truyen', truyenSchema);

module.exports = truyenModel;