import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IndianRupee, ShoppingBag, Users, Package, Filter, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const currentYear = new Date().getFullYear();
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(currentYear.toString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mock data fallback
  const mockData = {
    totalRevenue: 125400,
    totalOrders: 342,
    totalCustomers: 89,
    totalProducts: 45,
    recentOrders: [
      { _id: '1', user: { name: 'John Doe' }, totalAmount: 1200, status: 'Pending', createdAt: new Date().toISOString() },
      { _id: '2', user: { name: 'Jane Smith' }, totalAmount: 3400, status: 'Shipped', createdAt: new Date().toISOString() },
      { _id: '3', user: { name: 'Raj Kumar' }, totalAmount: 850, status: 'Delivered', createdAt: new Date().toISOString() },
    ],
    monthlyRevenue: [
      { month: 1, revenue: 4000 }, { month: 2, revenue: 3000 }, { month: 3, revenue: 2000 },
      { month: 4, revenue: 2780 }, { month: 5, revenue: 1890 }, { month: 6, revenue: 2390 },
      { month: 7, revenue: 3490 }, { month: 8, revenue: 0 }, { month: 9, revenue: 0 },
      { month: 10, revenue: 0 }, { month: 11, revenue: 0 }, { month: 12, revenue: 0 },
    ],
    categorySales: [
      { name: 'Nuts', value: 45000 },
      { name: 'Dates', value: 38000 },
      { name: 'Spices', value: 21000 },
      { name: 'Dried Fruits', value: 21400 },
    ],
    orderRatio: {
      success: 280,
      cancelled: 42,
      pending: 20
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      // Build Query String
      let queryParams = [];
      if (filterMonth && filterYear) {
        queryParams.push(`month=${filterMonth}&year=${filterYear}`);
      } else if (filterYear) {
        queryParams.push(`year=${filterYear}`);
      }
      
      if (startDate && endDate) {
        queryParams.push(`startDate=${startDate}&endDate=${endDate}`);
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/dashboard/stats${queryString}`, config);
      setStats(response.data);
    } catch (error) {
      console.warn("Failed to fetch real stats. Using mock data.", error.message);
      setStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const handleApplyFilters = () => {
    fetchStats();
  };

  const handleClearFilters = () => {
    setFilterMonth('');
    setFilterYear(currentYear.toString());
    setStartDate('');
    setEndDate('');
    // Need to fetch immediately after state clears in a real app, 
    // but for mock, we'll just trigger fetchStats and it'll use mock data anyway.
    setTimeout(() => fetchStats(), 0);
  };

  if (loading && !stats) {
    return <div className="loading-state">Loading advanced dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <IndianRupee size={24} />, color: 'primary' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag size={24} />, color: 'warning' },
    { title: 'Customers', value: stats.totalCustomers, icon: <Users size={24} />, color: 'success' },
    { title: 'Products', value: stats.totalProducts, icon: <Package size={24} />, color: 'danger' },
  ];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = stats.monthlyRevenue.map(item => ({
    name: monthNames[item.month - 1],
    revenue: item.revenue
  }));

  // Colors for Pie Chart - Using Brand Gold palette variations
  const PIE_COLORS = ['#d4af37', '#b8860b', '#f5deb3', '#8b6508', '#e6c200'];

  // Calculate Order Ratio Percentage
  const totalRatioOrders = stats.orderRatio.success + stats.orderRatio.cancelled;
  const successPercentage = totalRatioOrders > 0 ? Math.round((stats.orderRatio.success / totalRatioOrders) * 100) : 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div className="dashboard-title">
          <h1>Dashboard Overview</h1>
          <p className="text-muted">Welcome back! Analyze your store's performance.</p>
        </div>
        
        {/* Filters Section */}
        <div className="filters-container glass-card">
          <div className="filter-header">
            <Filter size={16} /> <span>Filters</span>
          </div>
          <div className="filter-controls">
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="filter-select">
              <option value="">All Months</option>
              {monthNames.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="filter-select">
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>

            <span className="filter-divider">OR Date Range:</span>

            <div className="date-inputs">
              <input autoComplete="off" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="filter-date" />
              <span>to</span>
              <input autoComplete="off" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="filter-date" />
            </div>

            <div className="filter-actions">
              <button onClick={handleApplyFilters} className="btn-apply">Apply</button>
              <button onClick={handleClearFilters} className="btn-clear">Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        {statCards.map((card, index) => (
          <div key={index} className={`glass-card stat-card border-${card.color}`}>
            <div className={`icon-wrapper bg-${card.color}`}>
              {card.icon}
            </div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        {/* Revenue Chart */}
        <div className="glass-card chart-container">
          <h2>Revenue Over Time</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212, 175, 55, 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a0aec0'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#a0aec0'}} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#05140f', borderRadius: '8px', border: '1px solid #d4af37', boxShadow: '0 4px 15px rgba(212,175,55,0.2)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  itemStyle={{color: '#d4af37'}}
                />
                <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} dot={{r: 4, fill: '#d4af37', strokeWidth: 2, stroke: '#05140f'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="glass-card chart-container">
          <h2>Sales by Category</h2>
          <div className="chart-wrapper pie-chart-wrapper">
            {stats.categorySales && stats.categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#05140f', borderRadius: '8px', border: '1px solid #d4af37' }}
                    formatter={(value) => [`₹${value}`, 'Sales']}
                    itemStyle={{color: '#fff'}}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{color: '#a0aec0', fontSize: '0.85rem'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No category data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid ratio-grid">
        {/* Order Success Ratio Visualizer */}
        <div className="glass-card ratio-container">
          <h2>Order Success Ratio</h2>
          <p className="ratio-subtitle">Successful Deliveries vs Cancellations</p>
          
          <div className="ratio-visual">
            <div className="ratio-circle">
              <div className="ratio-percent">{successPercentage}%</div>
              <div className="ratio-label">Success Rate</div>
            </div>
            
            <div className="ratio-stats">
              <div className="ratio-stat-item">
                <span className="dot success-dot"></span>
                <div>
                  <h4>{stats.orderRatio.success}</h4>
                  <p>Successful Orders</p>
                </div>
              </div>
              <div className="ratio-stat-item">
                <span className="dot danger-dot"></span>
                <div>
                  <h4>{stats.orderRatio.cancelled}</h4>
                  <p>Cancelled Orders</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{width: `${successPercentage}%`}}
            ></div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-card recent-orders">
          <h2>Recent Orders</h2>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="order-id">#{order._id.substring(0, 8)}</td>
                    <td>{order.user?.name || 'Guest'}</td>
                    <td className="amount">₹{order.totalAmount}</td>
                    <td>
                      <span className={`badge badge-${
                        ['Delivered', 'Payment Received', 'Shipped'].includes(order.status) ? 'success' : 
                        order.status === 'Cancelled' ? 'danger' : 'warning'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
