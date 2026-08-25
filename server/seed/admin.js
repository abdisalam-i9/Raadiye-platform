import bcrypt from 'bcrypt';
import User from '../model/UserModel.js';
import env from '../config/env.js';

export async function seedAdmin() {
  const email = (env.ADMIN.EMAIL || '').trim().toLowerCase();
  const password = env.ADMIN.PASSWORD;
  const name = (env.ADMIN.NAME || 'Raadiye Admin').trim();
  const phone = (env.ADMIN.PHONE || '+252610000000').trim();

  if (!email || !password) {
    console.log('ℹ️ Admin seed skipped (ADMIN_EMAIL / ADMIN_PASSWORD not set)');
    return;
  }

  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== 'admin' || !existing.isVerified || !existing.isActive) {
      existing.role = 'admin';
      existing.isVerified = true;
      existing.isActive = true;
      await existing.save();
      console.log(`✅ Admin account updated: ${email}`);
    } else {
      console.log(`✅ Admin account already exists: ${email}`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: 'admin',
    isVerified: true,
    isActive: true,
  });

  console.log(`✅ Admin account created: ${email}`);
}
