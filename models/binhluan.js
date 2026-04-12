var mongoose = require('mongoose');

var binhLuanSchema = new mongoose.Schema({
	Chuong: { type: mongoose.Schema.Types.ObjectId, ref: 'Chuong', required: true },
	TaiKhoan: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan', required: true },
	NoiDung: { type: String, required: true },
	NgayDang: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('BinhLuan', binhLuanSchema);