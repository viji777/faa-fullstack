import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import '../pages/Dashboard.css';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedIconFile, setSelectedIconFile] = useState(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    imageId: '',
    icon: '',
    iconId: ''
  });

  const [formLoading, setFormLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (mode, category = null) => {
    setModalMode(mode);
    setSelectedFile(null);
    setSelectedIconFile(null);
    if (mode === 'edit' && category) {
      setCurrentCategoryId(category._id);
      setPreviewUrl(category.image || '');
      setIconPreviewUrl(category.icon || '');
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        imageId: category.imageId || '',
        icon: category.icon || '',
        iconId: category.iconId || ''
      });
    } else {
      setCurrentCategoryId(null);
      setPreviewUrl('');
      setIconPreviewUrl('');
      setFormData({
        name: '',
        description: '',
        image: '',
        imageId: '',
        icon: '',
        iconId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'image') {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else if (type === 'icon') {
        setSelectedIconFile(file);
        setIconPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      return toast.error('Category name is required');
    }

    setFormLoading(true);
    try {
      let imageUrl = formData.image;
      let imageId = formData.imageId;
      let iconUrl = formData.icon;
      let iconId = formData.iconId;
      
      // Upload file to Cloudinary via backend if a new file is selected
      if (selectedFile) {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);
        
        const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadRes.data.url;
        imageId = uploadRes.data.imageId;
      }

      if (selectedIconFile) {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const uploadData = new FormData();
        uploadData.append('image', selectedIconFile);
        
        const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        iconUrl = uploadRes.data.url;
        iconId = uploadRes.data.imageId;
      }

      const payload = { ...formData, image: imageUrl, imageId, icon: iconUrl, iconId };

      if (modalMode === 'add') {
        await axios.post('http://localhost:5000/api/categories', payload, getAuthHeaders());
        toast.success('Category created successfully');
      } else {
        await axios.put(`http://localhost:5000/api/categories/${currentCategoryId}`, payload, getAuthHeaders());
        toast.success('Category updated successfully');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${id}`, getAuthHeaders());
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      <header className="dashboard-header-flex">
        <div className="dashboard-title">
          <h1>Categories</h1>
          <p className="text-muted">Manage your product categories.</p>
        </div>
        <button className="btn-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleOpenModal('add')}>
          <Plus size={18} /> Add Category
        </button>
      </header>

      <div className="dashboard-content" style={{ marginTop: '1rem' }}>
        <div style={{ padding: '0' }}>
          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="no-data">No categories found. Create one above.</p>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead style={{ background: 'var(--accent-primary)', borderRadius: '12px' }}>
                  <tr>
                    <th style={{ color: 'white', padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', width: '60px', textAlign: 'center' }}>S.No</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Image</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Name</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Slug</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Description</th>
                    <th className="text-center" style={{ color: 'white', padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', fontSize: '1.1rem' }}>
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td>
                        {category.image ? (
                          <div style={{ 
                            height: '60px', width: '60px', borderRadius: '12px', overflow: 'hidden',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '2px solid #fff'
                          }}>
                            <img src={category.image} alt={category.name} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ height: '60px', width: '60px', borderRadius: '12px', backgroundColor: 'rgba(10,39,29,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>No Img</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{category.name}</td>
                      <td>
                        <span style={{ 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem',
                          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))',
                          color: 'var(--accent-tertiary)',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}>
                          {category.slug}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          {category.description || 'No description provided.'}
                        </div>
                      </td>
                      <td className="text-center">
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                          <button className="icon-btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(10, 39, 29, 0.06)', color: 'var(--accent-primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleOpenModal('edit', category)}>
                            <Edit size={16} />
                          </button>
                          <button className="icon-btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleDelete(category._id)}>
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
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.75rem', 
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}>
                {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
              </h3>
              <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Category Name *</label>
                <input 
                  autoComplete="off"
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="E.g., Premium Dates"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Description (Optional)</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="Short description about this category..."
                  rows="3"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Category Image (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(10, 39, 29, 0.1)' }} 
                    />
                  )}
                  <label className="modern-input" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', justifyContent: 'center', border: '2px dashed rgba(10, 39, 29, 0.2)', backgroundColor: 'rgba(10, 39, 29, 0.02)', padding: '1.5rem' }}>
                    <UploadCloud size={24} color="var(--accent-secondary)" />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {selectedFile ? selectedFile.name : 'Click to upload image'}
                    </span>
                    <input autoComplete="off" 
                      type="file" 
                      accept="image/*"
                      name="imageFile" 
                      onChange={(e) => handleFileChange(e, 'image')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Category Icon (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {iconPreviewUrl && (
                    <img 
                      src={iconPreviewUrl} 
                      alt="Icon Preview" 
                      style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(10, 39, 29, 0.1)' }} 
                    />
                  )}
                  <label className="modern-input" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', justifyContent: 'center', border: '2px dashed rgba(10, 39, 29, 0.2)', backgroundColor: 'rgba(10, 39, 29, 0.02)', padding: '1.5rem' }}>
                    <UploadCloud size={24} color="var(--accent-secondary)" />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {selectedIconFile ? selectedIconFile.name : 'Click to upload icon (used in menus)'}
                    </span>
                    <input autoComplete="off" 
                      type="file" 
                      accept="image/*"
                      name="iconFile" 
                      onChange={(e) => handleFileChange(e, 'icon')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-clear" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-apply" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Category'}
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
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(10, 39, 29, 0.4)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
  padding: '1rem'
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '550px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: '#ffffff',
  borderRadius: '20px',
  boxShadow: '0 25px 50px -12px rgba(10, 39, 29, 0.25)',
  padding: '2.5rem',
  border: '1px solid rgba(10, 39, 29, 0.05)'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-secondary)'
};

export default Category;
