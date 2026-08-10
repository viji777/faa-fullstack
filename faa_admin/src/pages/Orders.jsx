import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../pages/Dashboard.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/orders', getAuthHeaders());
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, getAuthHeaders());
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      <header className="dashboard-header-flex">
        <div className="dashboard-title">
          <h1>Orders</h1>
          <p className="text-muted">Manage customer orders and update statuses.</p>
        </div>
      </header>

      <div className="dashboard-content" style={{ marginTop: '1rem' }}>
        <div style={{ padding: '0' }}>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="no-data">No orders found.</p>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead style={{ background: 'var(--accent-primary)', borderRadius: '12px' }}>
                  <tr>
                    <th style={{ color: 'white', padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Order ID</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Customer</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Date</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Total Amount</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Status</th>
                    <th className="text-center" style={{ color: 'white', padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                        <span className="order-id">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.shippingAddress?.name || order.user?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.shippingAddress?.phone}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatDate(order.createdAt)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹ {order.totalAmount}</td>
                      <td>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          background: order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.1)' : 
                                      order.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 
                                      'rgba(245, 158, 11, 0.1)',
                          color: order.status === 'Delivered' ? '#10b981' : 
                                 order.status === 'Cancelled' ? '#ef4444' : 
                                 '#f59e0b'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <select 
                          className="modern-input" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: '130px', cursor: 'pointer', appearance: 'auto', background: '#fff' }}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
