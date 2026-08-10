const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const logoPath = path.join(__dirname, '../faa_admin/src/assets/735786382_18114217105789853_6216282968904017031_n.jpg');

cloudinary.uploader.upload(logoPath, { folder: 'faa_assets', public_id: 'faa_logo' })
  .then(result => {
    console.log('UPLOAD_SUCCESS: ' + result.secure_url);
  })
  .catch(error => {
    console.error('UPLOAD_ERROR:', error);
  });
