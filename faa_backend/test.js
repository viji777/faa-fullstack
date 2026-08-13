const mongoose = require('mongoose'); 
require('dotenv').config({path: './faa_backend/.env'}); 

mongoose.connect(process.env.MONGO_URI).then(async () => { 
  const Order = require('./faa_backend/models/Order'); 
  const Product = require('./faa_backend/models/Product'); 
  const User = require('./faa_backend/models/User'); 
  
  try {
    // Paste the dashboard controller code basically
    const year = '2026';
    const filterYear = year ? parseInt(year) : new Date().getFullYear();
    const startOfYearAgg = new Date(filterYear, 0, 1);
    const endOfYearAgg = new Date(filterYear, 11, 31, 23, 59, 59);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startOfYearAgg, $lte: endOfYearAgg }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    console.log("Monthly Revenue:", monthlyRevenue);
    
    // Check order status counts
    const dateMatch = {
        createdAt: {
            $gte: startOfYearAgg,
            $lte: endOfYearAgg
        }
    };
    
    const orderStatusCounts = await Order.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: {
            $cond: [
              { $in: ['$status', ['Delivered', 'Payment Received', 'Shipped']] },
              'Success',
              { $cond: [{ $eq: ['$status', 'Cancelled'] }, 'Cancelled', 'Pending'] }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log("Order Status Counts:", orderStatusCounts);
    
    // Check recent orders
    const recentOrders = await Order.find(dateMatch)
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(5);
      
    console.log("Recent Orders length:", recentOrders.length);
    
  } catch (err) {
    console.error("Aggregation Error:", err);
  }

  process.exit(0); 
}).catch(console.error);
