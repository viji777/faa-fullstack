import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import '../pages/Dashboard.css';

const Staffs = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentStaffId, setCurrentStaffId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/roles/users`, getAuthHeaders());
      // Filter only support staff (role === 2)
      const staffList = res.data.filter(u => u.role === 2);
      setStaffs(staffList);
    } catch (error) {
      toast.error('Failed to fetch staffs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleOpenModal = (mode, staff = null) => {
    setModalMode(mode);
    if (mode === 'edit' && staff) {
      setCurrentStaffId(staff._id);
      setFormData({ name: staff.name, email: staff.email, password: '' });
    } else {
      setCurrentStaffId(null);
      setFormData({ name: '', email: '', password: '' });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return toast.error('Name and Email are required');
    if (modalMode === 'add' && !formData.password) return toast.error('Password is required');

    setFormLoading(true);
    try {
      const payload = { ...formData, role: 2 };
      if (modalMode === 'add') {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/roles/users`, payload, getAuthHeaders());
        toast.success('Staff created successfully');
      } else {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/roles/users/${currentStaffId}`, formData, getAuthHeaders());
        toast.success('Staff updated successfully');
      }
      handleCloseModal();
      fetchStaffs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/roles/users/${id}`, getAuthHeaders());
        toast.success('Staff deleted');
        fetchStaffs();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      <header className="dashboard-header-flex">
        <div className="dashboard-title">
          <h1>Staffs</h1>
          <p className="text-muted">Manage support staff accounts.</p>
        </div>
        <button className="btn-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleOpenModal('add')}>
          <Plus size={18} /> Add Staff
        </button>
      </header>

      <div className="dashboard-content" style={{ marginTop: '1rem' }}>
        <div style={{ padding: '0' }}>
          {loading ? (
            <p>Loading staffs...</p>
          ) : staffs.length === 0 ? (
            <p className="no-data">No staff members found.</p>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead style={{ background: 'var(--accent-primary)', borderRadius: '12px' }}>
                  <tr>
                    <th style={{ color: 'white', padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', width: '50px', textAlign: 'center' }}>S.No</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Name</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Email</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Role</th>
                    <th className="text-center" style={{ color: 'white', padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffs.map((staff, index) => (
                    <tr key={staff._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{staff.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{staff.email}</td>
                      <td>
                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-tertiary)' }}>
                          Support
                        </span>
                      </td>
                      <td className="text-center">
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                          <button className="icon-btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(10, 39, 29, 0.06)', color: 'var(--accent-primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleOpenModal('edit', staff)}>
                            <Edit size={16} />
                          </button>
                          <button className="icon-btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleDelete(staff._id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.75rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
                {modalMode === 'add' ? 'Add Staff' : 'Edit Staff'}
              </h3>
              <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="modern-input" required />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="modern-input" required />
              </div>
              <div>
                <label style={labelStyle}>{modalMode === 'add' ? 'Password *' : 'New Password (Optional)'}</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    className="modern-input" 
                    required={modalMode === 'add'} 
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-clear" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-apply" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 39, 29, 0.4)',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '1rem'
};

const modalContentStyle = {
  width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff',
  borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(10, 39, 29, 0.25)', border: '1px solid rgba(10, 39, 29, 0.05)'
};

const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' };

export default Staffs;
