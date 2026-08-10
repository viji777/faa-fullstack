const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate, month, year } = req.query;
    
    // Build match stage for date filtering
    let dateMatch = {};
    if (startDate && endDate) {
      dateMatch.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month && year) {
      // Month is 1-indexed from frontend
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      dateMatch.createdAt = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    } else if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      dateMatch.createdAt = {
        $gte: startOfYear,
        $lte: endOfYear
      };
    }

    // 1. Total Revenue (excluding cancelled orders)
    const revenueMatch = { status: { $ne: 'Cancelled' }, ...dateMatch };
    const revenueAggregation = await Order.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // 2. Total Orders (with filter)
    const totalOrders = await Order.countDocuments(dateMatch);

    // 3. Total Customers (role 3 is Customer, filter by registration date)
    const totalCustomers = await User.countDocuments({ role: 3, ...dateMatch });

    // 4. Total Products (filter by creation date)
    const totalProducts = await Product.countDocuments(dateMatch);

    // 5. Recent 5 Orders (with filter)
    const recentOrders = await Order.find(dateMatch)
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(5);

    // 6. Monthly Revenue (Current Year or Selected Year)
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

    const formattedMonthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyRevenue.find(m => m._id === i + 1);
      return {
        month: i + 1,
        revenue: monthData ? monthData.revenue : 0
      };
    });

    // 7. Category Type Sales (Pie Chart Data)
    const categorySales = await Order.aggregate([
      { $match: revenueMatch },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            id: '$categoryDetails._id',
            name: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] }
          },
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          value: '$totalSales'
        }
      },
      { $sort: { value: -1 } }
    ]);

    // 8. Order Success vs Cancelled Ratio
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

    let successCount = 0;
    let cancelledCount = 0;
    let pendingCount = 0;

    orderStatusCounts.forEach(status => {
      if (status._id === 'Success') successCount = status.count;
      else if (status._id === 'Cancelled') cancelledCount = status.count;
      else if (status._id === 'Pending') pendingCount = status.count;
    });

    res.status(200).json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      monthlyRevenue: formattedMonthlyRevenue,
      categorySales,
      orderRatio: {
        success: successCount,
        cancelled: cancelledCount,
        pending: pendingCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
