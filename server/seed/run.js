import connectDatabase from '../config/database.js';
import { seedCategories } from './categories.js';
import { seedAdmin } from './admin.js';

async function runSeed() {
  try {
    await connectDatabase();
    await seedCategories();
    await seedAdmin();
    console.log('✅ Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

runSeed();
