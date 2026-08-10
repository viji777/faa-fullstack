import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../pages/Dashboard.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/customers', getAuthHeaders());
      setCustomers(res.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      <header className="dashboard-header-flex">
        <div className="dashboard-title">
          <h1>Customers</h1>
          <p className="text-muted">Directory of all registered and guest customers.</p>
        </div>
      </header>

      <div className="dashboard-content" style={{ marginTop: '1rem' }}>
        <div style={{ padding: '0' }}>
          {loading ? (
            <p>Loading customers...</p>
          ) : customers.length === 0 ? (
            <p className="no-data">No customers found.</p>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead style={{ background: 'var(--accent-primary)', borderRadius: '12px' }}>
                  <tr>
                    <th style={{ color: 'white', padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', width: '50px', textAlign: 'center' }}>S.No</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Name</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Contact Info</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Address</th>
                    <th className="text-center" style={{ color: 'white', padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr key={customer._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.name}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{customer.email}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{customer.phone || '-'}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '250px' }}>
                        {customer.address?.city ? `${customer.address.city}, ${customer.address.state || ''} ${customer.address.country || ''}` : '-'}
                      </td>
                      <td className="text-center" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {formatDate(customer.createdAt)}
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

export default Customers;
