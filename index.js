var express = require('express');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var path = require('path');

var indexRouter = require('./routers/index');
var authRouter = require('./routers/auth');
var theloaiRouter = require('./routers/theloai');
var taikhoanRouter = require('./routers/taikhoan');
var chuongRouter = require('./routers/chuong');
var truyenRouter = require('./routers/truyen');
var binhluanRouter = require('./routers/binhluan');

var uri = 'mongodb://webdoctruyen:webdoctruyen123@ac-uhwobko-shard-00-02.qqh55dx.mongodb.net:27017/webdoctruyen?ssl=true&authSource=admin';
mongoose.connect(uri).catch(err => console.log(err));

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(session({
	name: 'WebDocTruyen',						// Tên session (tự chọn)
	secret: 'Mèo méo meo mèo meo',		// Khóa bảo vệ (tự chọn)
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 30 * 24 * 60 * 60 * 1000// Hết hạn sau 30 ngày
	}
}));

app.use((req, res, next) => {
	// Chuyển biến session thành biến cục bộ
	res.locals.session = req.session;
	
	// Lấy thông báo (lỗi, thành công) của trang trước đó (nếu có)
	var err = req.session.error;
	var msg = req.session.success;
	
	// Xóa session sau khi đã truyền qua biến trung gian
	delete req.session.error;
	delete req.session.success;
	
	// Gán thông báo (lỗi, thành công) vào biến cục bộ
	res.locals.message = '';
	if (err) res.locals.message = '<span class="text-danger">' + err + '</span>';
	if (msg) res.locals.message = '<span class="text-success">' + msg + '</span>';
	
	next();
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/truyen', truyenRouter);
app.use('/taikhoan', taikhoanRouter);
app.use('/chuong', chuongRouter);
app.use('/theloai', theloaiRouter);
app.use('/binhluan', binhluanRouter);

app.listen(3000, () => {
	console.log('Server is running at http://127.0.0.1:3000');
});