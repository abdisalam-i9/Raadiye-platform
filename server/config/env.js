import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  JWT: {
    SECRET: process.env.JWT_SECRET,
  },
  DATABASE: {
    URI: process.env.MONGO_URI,
  },
  EMAIL: {
    EMAIL_USER: (process.env.EMAIL_USER || '').trim(),
    EMAIL_PASS: (process.env.EMAIL_PASS || '').replace(/\s/g, ''),
    HOST: (process.env.EMAIL_HOST || '').trim(),
    PORT: process.env.EMAIL_PORT || '',
  },
  CLIENT_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
  ADMIN: {
    NAME: process.env.ADMIN_NAME || 'Raadiye Admin',
    EMAIL: process.env.ADMIN_EMAIL,
    PASSWORD: process.env.ADMIN_PASSWORD,
    PHONE: process.env.ADMIN_PHONE || '+252610000000',
  },
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  },
};

export default env;
