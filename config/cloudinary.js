const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'de96rhre5',
  api_key: '126886436194563',
  api_secret: 'yT8YoZ3fMTUXBEqOOBWUPAZXhnY'
});

module.exports = cloudinary;