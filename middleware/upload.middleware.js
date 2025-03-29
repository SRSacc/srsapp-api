// middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');

// Configure storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists or create it
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `img_${Date.now()}${ext}`;
    cb(null, uniqueName);
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
