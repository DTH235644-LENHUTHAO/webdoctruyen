const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'truyen',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [
      { width: 500, height: 500, crop: 'fill' }
    ]
  }
});

const upload = multer({ storage });

module.exports = upload;