import Category from '../model/Category.js';

const DEFAULT_CATEGORIES = [
  { name: 'Money', slug: 'money', image: '' },
  { name: 'Phone', slug: 'phone', image: '' },
  { name: 'Passport', slug: 'passport', image: '' },
  { name: 'Documents', slug: 'documents', image: '' },
  { name: 'Keys', slug: 'keys', image: '' },
  { name: 'Wallet', slug: 'wallet', image: '' },
  { name: 'Electronics', slug: 'electronics', image: '' },
  { name: 'Bags', slug: 'bags', image: '' },
  { name: 'Other', slug: 'other', image: '' },
];

export async function seedCategories() {
  for (const category of DEFAULT_CATEGORIES) {
    const exists = await Category.findOne({
      $or: [{ name: category.name }, { slug: category.slug }],
    });

    if (!exists) {
      await Category.create({ ...category, isActive: true });
    }
  }

  console.log('✅ Categories seed checked');
}
