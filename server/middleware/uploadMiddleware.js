import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_TYPES.has(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
  },
});

export function handleItemImageUpload(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5MB or smaller'
        : error.message || 'Image upload failed';

    return res.status(400).json({ status: false, message });
  });
}
