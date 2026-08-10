require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const categoriesData = [
  { name: 'Nuts', slug: 'nuts', description: 'Premium quality nuts' },
  { name: 'Dry Fruits', slug: 'dry-fruits', description: 'Delicious and healthy dry fruits' },
  { name: 'Seeds', slug: 'seeds', description: 'Nutritious seeds for a healthy diet' },
  { name: 'Hampers', slug: 'hampers', description: 'Gift hampers for every occasion' }
];

const productsData = [
  // Nuts
  { name: 'Premium Almonds', slug: 'premium-almonds', description: 'Crunchy and healthy premium almonds.', catSlug: 'nuts', isFeatured: true, isSpecial: true, images: [{url: 'https://images.unsplash.com/photo-1599557457498-84274c3e80f2?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '500g', price: 12}] },
  { name: 'Roasted Cashews', slug: 'roasted-cashews', description: 'Deliciously roasted cashews.', catSlug: 'nuts', isFeatured: true, isSpecial: false, images: [{url: 'https://images.unsplash.com/photo-1596541604085-f55a1d09ff92?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '500g', price: 15}] },
  { name: 'Salted Pistachios', slug: 'salted-pistachios', description: 'Lightly salted premium pistachios.', catSlug: 'nuts', isFeatured: false, isSpecial: false, images: [{url: 'https://images.unsplash.com/photo-1591873113944-ff0295112db4?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '250g', price: 10}] },
  { name: 'Organic Walnuts', slug: 'organic-walnuts', description: 'Fresh and organic walnuts.', catSlug: 'nuts', isFeatured: false, isSpecial: true, images: [{url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '500g', price: 14}] },
  
  // Dry Fruits
  { name: 'Sun-Dried Apricots', slug: 'sun-dried-apricots', description: 'Sweet and tangy sun-dried apricots.', catSlug: 'dry-fruits', isFeatured: true, isSpecial: false, images: [{url: 'https://images.unsplash.com/photo-1599557457498-84274c3e80f2?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '500g', price: 8}] },
  { name: 'Premium Dates', slug: 'premium-dates', description: 'Soft and sweet premium dates.', catSlug: 'dry-fruits', isFeatured: false, isSpecial: true, images: [{url: 'https://images.unsplash.com/photo-1596541604085-f55a1d09ff92?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '500g', price: 9}] },
  { name: 'Sweet Dried Figs', slug: 'sweet-dried-figs', description: 'Naturally sweet dried figs.', catSlug: 'dry-fruits', isFeatured: false, isSpecial: false, images: [{url: 'https://images.unsplash.com/photo-1591873113944-ff0295112db4?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '250g', price: 7}] },
  { name: 'Golden Raisins', slug: 'golden-raisins', description: 'Plump and juicy golden raisins.', catSlug: 'dry-fruits', isFeatured: false, isSpecial: false, images: [{url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '500g', price: 6}] },

  // Seeds
  { name: 'Organic Chia Seeds', slug: 'organic-chia-seeds', description: 'High-quality organic chia seeds.', catSlug: 'seeds', isFeatured: true, isSpecial: true, images: [{url: 'https://images.unsplash.com/photo-1599557457498-84274c3e80f2?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '250g', price: 5}] },
  { name: 'Roasted Pumpkin Seeds', slug: 'roasted-pumpkin-seeds', description: 'Crunchy roasted pumpkin seeds.', catSlug: 'seeds', isFeatured: false, isSpecial: false, images: [{url: 'https://images.unsplash.com/photo-1596541604085-f55a1d09ff92?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '250g', price: 6}] },
  { name: 'Sunflower Seeds', slug: 'sunflower-seeds', description: 'Fresh sunflower seeds.', catSlug: 'seeds', isFeatured: false, isSpecial: false, images: [{url: 'https://images.unsplash.com/photo-1591873113944-ff0295112db4?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '250g', price: 4}] },
  { name: 'Flax Seeds', slug: 'flax-seeds', description: 'Nutrient-rich flax seeds.', catSlug: 'seeds', isFeatured: false, isSpecial: true, images: [{url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: '500g', price: 7}] },

  // Hampers
  { name: 'Festive Delight Hamper', slug: 'festive-delight-hamper', description: 'A beautiful hamper for festive gifting.', catSlug: 'hampers', isFeatured: true, isSpecial: true, images: [{url: 'https://images.unsplash.com/photo-1599557457498-84274c3e80f2?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: 'Standard', price: 45}] },
  { name: 'Healthy Mix Hamper', slug: 'healthy-mix-hamper', description: 'A mix of nuts, seeds, and dry fruits.', catSlug: 'hampers', isFeatured: false, isSpecial: false, images: [{url: 'https://images.unsplash.com/photo-1596541604085-f55a1d09ff92?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: 'Standard', price: 35}] },
  { name: 'Premium Nut Hamper', slug: 'premium-nut-hamper', description: 'An assortment of premium nuts.', catSlug: 'hampers', isFeatured: true, isSpecial: false, images: [{url: 'https://images.unsplash.com/photo-1591873113944-ff0295112db4?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: 'Standard', price: 40}] },
  { name: 'Sweet & Salty Hamper', slug: 'sweet-salty-hamper', description: 'Perfect combination of sweet and salty snacks.', catSlug: 'hampers', isFeatured: false, isSpecial: true, images: [{url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=500&fit=crop', isPrimary: true}], variants: [{size: 'Standard', price: 30}] },
];

const seedDB = async () => {
  await connectDB();
  
  try {
    for (const catData of categoriesData) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = new Category(catData);
        await category.save();
        console.log(`Created category: ${category.name}`);
      }
    }

    const categories = await Category.find();
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.slug] = c._id);

    // clear all products first for idempotency? Let's just insert if not exists
    for (const prodData of productsData) {
      const { catSlug, ...productFields } = prodData;
      let product = await Product.findOne({ slug: productFields.slug });
      if (!product) {
        product = new Product({
          ...productFields,
          category: categoryMap[catSlug]
        });
        await product.save();
        console.log(`Created product: ${product.name}`);
      } else {
        console.log(`Product already exists: ${product.name}`);
      }
    }

    console.log('Seed completed.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
