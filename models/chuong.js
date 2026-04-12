var mongoose = require('mongoose');

const chuongSchema = new mongoose.Schema({
	Truyen: { type: mongoose.Schema.Types.ObjectId, ref: 'Truyen', required: true },
	TaiKhoan: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan', required: true },
	SoChuong: { type: Number, required: true },
	TieuDe: { type: String, required: true },
	KiemDuyet: { type: Number, default: 0 },
	NoiDung: { type: String, required: true },
	NgayDang: { type: Date, default: Date.now }
},{ timestamps: true });

var chuongModel = mongoose.model('Chuong', chuongSchema);

module.exports = chuongModel;