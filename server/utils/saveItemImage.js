import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads', 'items');

const hasCloudinary = Boolean(
  env.CLOUDINARY.CLOUD_NAME && env.CLOUDINARY.API_KEY && env.CLOUDINARY.API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY.CLOUD_NAME,
    api_key: env.CLOUDINARY.API_KEY,
    api_secret: env.CLOUDINARY.API_SECRET,
  });
}

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function uploadToCloudinary(file, folder = 'items') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `raadiye/${folder}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

export async function saveItemImage(file, { folder = 'items' } = {}) {
  if (!file?.buffer) return '';

  if (hasCloudinary) {
    return uploadToCloudinary(file, folder);
  }

  const extension = EXTENSIONS[file.mimetype] || '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
  const dir = path.join(__dirname, '..', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), file.buffer);
  return `/uploads/${folder}/${filename}`;
}
