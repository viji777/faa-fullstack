import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, X, Search } from 'lucide-react';
import '../pages/Dashboard.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, fromDate, toDate]);

  const filteredOrders = orders.filter(order => {
    // 1. Search Match (Order ID, Customer Name, or Phone)
    const searchMatch = searchTerm === '' || 
      order._id.substring(order._id.length - 6).toLowerCase().includes(searchTerm.toLowerCase()) || 
      (order.shippingAddress?.name || order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shippingAddress?.phone || '').includes(searchTerm);
    
    // 2. Status Match
    const statusMatch = statusFilter === '' || order.status === statusFilter;
    
    // 3. Date Match (From / To)
    let dateMatch = true;
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    
    if (fromDate && toDate) {
      dateMatch = orderDate >= fromDate && orderDate <= toDate;
    } else if (fromDate) {
      dateMatch = orderDate >= fromDate;
    } else if (toDate) {
      dateMatch = orderDate <= toDate;
    }
    
    return searchMatch && statusMatch && dateMatch;
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, getAuthHeaders());
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
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${orderId}/status`, { status: newStatus }, getAuthHeaders());
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

      {/* Filter Bar */}
      <div className="filters-container" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
        <div className="filter-controls">
          <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="modern-input" 
              placeholder="Search by Order ID, Name, or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', background: '#fff' }}
            />
          </div>
          
          <select 
            className="filter-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.75rem 1rem', minWidth: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>From</span>
            <input 
              type="date" 
              className="filter-date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ padding: '0.75rem 1rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>To</span>
            <input 
              type="date" 
              className="filter-date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ padding: '0.75rem 1rem' }}
            />
          </div>
          
          {(searchTerm || statusFilter || fromDate || toDate) && (
            <button 
              className="btn-clear" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setFromDate('');
                setToDate('');
              }}
              style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

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
                    <th style={{ color: 'white', padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', width: '60px', textAlign: 'center' }}>S.No</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Order ID</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Customer</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Date</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Total Amount</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Status</th>
                    <th className="text-center" style={{ color: 'white', padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order, idx) => {
                    const serialNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                    return (
                    <tr key={order._id}>
                      <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>{serialNumber}</td>
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
                      <td className="text-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <button 
                          onClick={() => setSelectedOrder(order)} 
                          style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View Details"
                        >
                          <Eye size={18} color="#475569" />
                        </button>
                        <select 
                          className="modern-input" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: '130px', cursor: 'pointer', appearance: 'auto', background: '#fff', margin: 0 }}
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
                  )})}
                </tbody>
              </table>
            </div>
          )}
          
          {Math.ceil(filteredOrders.length / itemsPerPage) > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#94a3b8' : '#334155', fontWeight: 600 }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                Page {currentPage} of {Math.ceil(filteredOrders.length / itemsPerPage)}
              </span>
              <button 
                disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)} 
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? '#f8fafc' : '#fff', cursor: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? 'not-allowed' : 'pointer', color: currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? '#94a3b8' : '#334155', fontWeight: 600 }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Shipping Address</h4>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{selectedOrder.shippingAddress?.name}</strong><br/>
                  <div style={{ color: '#475569', marginTop: '0.5rem', lineHeight: '1.5' }}>
                    {selectedOrder.shippingAddress?.addressLine1}<br/>
                    {selectedOrder.shippingAddress?.addressLine2 && <>{selectedOrder.shippingAddress?.addressLine2}<br/></>}
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br/>
                    {selectedOrder.shippingAddress?.country} - {selectedOrder.shippingAddress?.pincode}<br/>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Order Items</h4>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: idx < selectedOrder.items.length - 1 ? '0.8rem' : '0' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Size: {item.size} | Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingRight: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Total Amount:</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>₹{selectedOrder.totalAmount}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
