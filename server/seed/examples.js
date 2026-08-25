import { copyFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import connectDatabase from '../config/database.js';
import User from '../model/UserModel.js';
import Category from '../model/Category.js';
import FoundItem from '../model/FoundItem.js';
import LostItem from '../model/LostItem.js';
import { coordsForDistrict } from '../constants/geo.js';
import { seedCategories } from './categories.js';
import { notifyMatchesForItem } from '../utils/notifyMatch.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPIRES_MS = 90 * 24 * 60 * 60 * 1000;

function daysAgo(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

async function itemImage(filename) {
  const from = path.join(__dirname, 'images', filename);
  const destDir = path.join(__dirname, '..', 'uploads', 'items');
  await mkdir(destDir, { recursive: true });
  await copyFile(from, path.join(destDir, filename));
  return `/uploads/items/${filename}`;
}

async function ensureUser({ name, email, phone }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;

  const password = await bcrypt.hash('Demo123!', 10);
  return User.create({
    name,
    email,
    password,
    phone,
    role: 'user',
    isVerified: true,
    isActive: true,
    bio: 'Demo account used for sample listings.',
    district: 'Hodan',
  });
}

async function categoryId(slug) {
  const category = await Category.findOne({ slug, isActive: true });
  if (!category) throw new Error(`Category not found: ${slug}`);
  return category._id;
}

function withCoords(item) {
  const coords = coordsForDistrict(item.district);
  return {
    ...item,
    lat: coords.lat,
    lng: coords.lng,
    status: 'active',
    expiresAt: new Date(Date.now() + EXPIRES_MS),
  };
}

export async function seedExamples() {
  await seedCategories();

  const finder = await ensureUser({
    name: 'Amina Hassan',
    email: 'amina.finder@example.com',
    phone: '+252615001001',
  });
  const owner = await ensureUser({
    name: 'Hassan Ali',
    email: 'hassan.owner@example.com',
    phone: '+252615002002',
  });

  const cats = {
    wallet: await categoryId('wallet'),
    phone: await categoryId('phone'),
    keys: await categoryId('keys'),
    bags: await categoryId('bags'),
    passport: await categoryId('passport'),
    money: await categoryId('money'),
    documents: await categoryId('documents'),
  };

  const foundSamples = [
    {
      title: 'Black leather wallet',
      category: cats.wallet,
      district: 'Hodan',
      village: 'KM4',
      foundDate: daysAgo(2),
      contactPhone: '+252615001001',
      identifyingMarks: 'Small tear on the inner coin pocket, faded letter A on the lining',
      postedBy: finder._id,
      image: await itemImage('found-wallet.png'),
    },
    {
      title: 'Samsung phone with cracked screen',
      category: cats.phone,
      district: 'Waberi',
      village: 'Airport Road',
      foundDate: daysAgo(1),
      contactPhone: '+252615001001',
      identifyingMarks: 'Cracked glass on the top right, sticker of a football on the back',
      postedBy: finder._id,
      image: await itemImage('found-phone.png'),
    },
    {
      title: 'House keys with a green tag',
      category: cats.keys,
      district: 'Howlwadaag',
      village: 'Maka al-Mukarama',
      foundDate: daysAgo(4),
      contactPhone: '+252615001001',
      identifyingMarks: 'Green tag with the word HOME written in black marker',
      postedBy: finder._id,
      image: await itemImage('found-keys.png'),
    },
    {
      title: 'Brown backpack with school books',
      category: cats.bags,
      district: 'Karaan',
      village: 'Suuqa Karaan',
      foundDate: daysAgo(3),
      contactPhone: '+252615001001',
      identifyingMarks: 'Name Hassan written inside the front pocket, broken zipper pull',
      postedBy: finder._id,
      image: await itemImage('found-backpack.png'),
    },
  ];

  const lostSamples = [
    {
      title: 'Black wallet with ID cards',
      category: cats.wallet,
      district: 'Hodan',
      village: 'KM4',
      lostDate: daysAgo(3),
      contactPhone: '+252615002002',
      identifyingMarks: 'Blue ID sleeve inside, faded business card from Hodan pharmacy',
      postedBy: owner._id,
      image: await itemImage('lost-wallet.png'),
    },
    {
      title: 'iPhone 13 in a blue case',
      category: cats.phone,
      district: 'Wadajir',
      village: 'Medina',
      lostDate: daysAgo(2),
      contactPhone: '+252615002002',
      identifyingMarks: 'Blue case with a small dent on the camera ring',
      postedBy: owner._id,
      image: await itemImage('lost-iphone.png'),
    },
    {
      title: 'Somali passport',
      category: cats.passport,
      district: 'Hamar Weyne',
      village: 'Bakaaro',
      lostDate: daysAgo(5),
      contactPhone: '+252615002002',
      identifyingMarks: 'Last three digits of the passport number are 417, photo page has a fold',
      postedBy: owner._id,
      image: await itemImage('lost-passport.png'),
    },
    {
      title: 'House keys with a green tag',
      category: cats.keys,
      district: 'Howlwadaag',
      village: 'Maka al-Mukarama',
      lostDate: daysAgo(4),
      contactPhone: '+252615002002',
      identifyingMarks: 'Green tag with the word HOME written in black marker',
      postedBy: owner._id,
      image: await itemImage('lost-keys.png'),
    },
    {
      title: 'Small envelope with US dollars',
      category: cats.money,
      district: 'Daynile',
      village: 'Ex-Control',
      lostDate: daysAgo(1),
      contactPhone: '+252615002002',
      identifyingMarks: 'Envelope has a red ink mark on the flap and a name written in Somali',
      postedBy: owner._id,
      image: await itemImage('lost-money.png'),
    },
  ];

  let foundCreated = 0;
  let foundUpdated = 0;
  for (const sample of foundSamples) {
    const exists = await FoundItem.findOne({ title: sample.title, village: sample.village });
    if (exists) {
      exists.image = sample.image;
      if (sample.identifyingMarks) exists.identifyingMarks = sample.identifyingMarks;
      await exists.save();
      foundUpdated += 1;
      continue;
    }
    const item = await FoundItem.create(withCoords(sample));
    await item.populate('category', 'name slug');
    notifyMatchesForItem({ item, kind: 'found' }).catch(() => {});
    foundCreated += 1;
  }

  let lostCreated = 0;
  let lostUpdated = 0;
  for (const sample of lostSamples) {
    const exists = await LostItem.findOne({ title: sample.title, village: sample.village });
    if (exists) {
      exists.image = sample.image;
      if (sample.identifyingMarks) exists.identifyingMarks = sample.identifyingMarks;
      await exists.save();
      lostUpdated += 1;
      continue;
    }
    const item = await LostItem.create(withCoords(sample));
    await item.populate('category', 'name slug');
    notifyMatchesForItem({ item, kind: 'lost' }).catch(() => {});
    lostCreated += 1;
  }

  return { foundCreated, lostCreated, foundUpdated, lostUpdated };
}

const isDirectRun = process.argv[1]?.includes('examples.js');
if (isDirectRun) {
  try {
    await connectDatabase();
    const result = await seedExamples();
    console.log(
      `✅ Example listings ready (found +${result.foundCreated}/${result.foundUpdated} photos, lost +${result.lostCreated}/${result.lostUpdated} photos)`
    );
    process.exit(0);
  } catch (error) {
    console.error('❌ Example seed failed:', error.message);
    process.exit(1);
  }
}
