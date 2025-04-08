// middleware/upload.middleware.js
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');


// Configure storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'subscribers',        // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }]
  }
});

// Optional: Filter allowed image types
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
