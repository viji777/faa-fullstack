const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
// Load environment variables
dotenv.config();

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    console.warn('Firebase Service Account Path is missing from .env');
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error.message);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('Warning: MONGO_URI is not defined in .env. Connecting to local mongodb fallback.');
    }
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/faa_nuts';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const customerRoutes = require('./routes/customerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contactRoutes = require('./routes/contactRoutes');
// Basic route
app.get('/', (req, res) => {
  res.send('Faa Nuts and Dates Backend API is running');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/roles', roleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
