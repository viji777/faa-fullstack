import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import '../pages/Dashboard.css';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentBannerId, setCurrentBannerId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedTabletFile, setSelectedTabletFile] = useState(null);
  const [tabletPreviewUrl, setTabletPreviewUrl] = useState('');
  const [selectedMobileFile, setSelectedMobileFile] = useState(null);
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    imageId: '',
    tabletImage: '',
    tabletImageId: '',
    mobileImage: '',
    mobileImageId: '',
    order: 1,
    linkType: 'None',
    linkCategory: '',
    linkProduct: ''
  });

  const [formLoading, setFormLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bannersRes, categoriesRes, productsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`)
      ]);
      setBanners(bannersRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (mode, banner = null) => {
    setModalMode(mode);
    setSelectedFile(null);
    setSelectedTabletFile(null);
    setSelectedMobileFile(null);
    if (mode === 'edit' && banner) {
      setCurrentBannerId(banner._id);
      setPreviewUrl(banner.image || '');
      setTabletPreviewUrl(banner.tabletImage || '');
      setMobilePreviewUrl(banner.mobileImage || '');
      setFormData({
        title: banner.title || '',
        image: banner.image || '',
        imageId: banner.imageId || '',
        tabletImage: banner.tabletImage || '',
        tabletImageId: banner.tabletImageId || '',
        mobileImage: banner.mobileImage || '',
        mobileImageId: banner.mobileImageId || '',
        order: banner.order || 1,
        linkType: banner.linkType || 'None',
        linkCategory: banner.linkCategory?._id || '',
        linkProduct: banner.linkProduct?._id || ''
      });
    } else {
      setCurrentBannerId(null);
      setPreviewUrl('');
      setTabletPreviewUrl('');
      setMobilePreviewUrl('');
      setFormData({
        title: '',
        image: '',
        imageId: '',
        tabletImage: '',
        tabletImageId: '',
        mobileImage: '',
        mobileImageId: '',
        order: banners.length + 1,
        linkType: 'None',
        linkCategory: '',
        linkProduct: ''
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
      [name]: name === 'order' ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e, type = 'desktop') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'desktop') {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else if (type === 'tablet') {
        setSelectedTabletFile(file);
        setTabletPreviewUrl(URL.createObjectURL(file));
      } else if (type === 'mobile') {
        setSelectedMobileFile(file);
        setMobilePreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image && !selectedFile) {
      return toast.error('Banner image is required');
    }

    setFormLoading(true);
    try {
      let imageUrl = formData.image;
      let imageId = formData.imageId;
      let tabletImageUrl = formData.tabletImage;
      let tabletImageId = formData.tabletImageId;
      let mobileImageUrl = formData.mobileImage;
      let mobileImageId = formData.mobileImageId;
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Upload file to Cloudinary via backend if a new file is selected
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);
        
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, uploadData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadRes.data.url;
        imageId = uploadRes.data.imageId;
      }
      
      if (selectedTabletFile) {
        const uploadData = new FormData();
        uploadData.append('image', selectedTabletFile);
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, uploadData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        tabletImageUrl = uploadRes.data.url;
        tabletImageId = uploadRes.data.imageId;
      }

      if (selectedMobileFile) {
        const uploadData = new FormData();
        uploadData.append('image', selectedMobileFile);
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, uploadData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        mobileImageUrl = uploadRes.data.url;
        mobileImageId = uploadRes.data.imageId;
      }

      const payload = { 
        ...formData, 
        image: imageUrl, 
        imageId,
        tabletImage: tabletImageUrl,
        tabletImageId,
        mobileImage: mobileImageUrl,
        mobileImageId
      };
      if (payload.linkType !== 'Category') payload.linkCategory = undefined;
      if (payload.linkType !== 'Product') payload.linkProduct = undefined;

      if (modalMode === 'add') {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`, payload, getAuthHeaders());
        toast.success('Banner created successfully');
      } else {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners/${currentBannerId}`, payload, getAuthHeaders());
        toast.success('Banner updated successfully');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners/${id}`, getAuthHeaders());
        toast.success('Banner deleted');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      <header className="dashboard-header-flex">
        <div className="dashboard-title">
          <h1>Banners</h1>
          <p className="text-muted">Manage your website hero banners (Max 5).</p>
        </div>
        <button className="btn-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleOpenModal('add')}>
          <Plus size={18} /> Add Banner
        </button>
      </header>

      <div className="dashboard-content">
        <div className="card">
          {loading ? (
            <p>Loading banners...</p>
          ) : banners.length === 0 ? (
            <p className="no-data">No banners found. Create one above.</p>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead style={{ background: 'var(--accent-primary)', borderRadius: '12px' }}>
                  <tr>
                    <th style={{ color: 'white', padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Order</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Image</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Title</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Link Type</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Link Target</th>
                    <th className="text-center" style={{ color: 'white', padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map(banner => (
                    <tr key={banner._id}>
                      <td><span className="order-id">#{banner.order}</span></td>
                      <td>
                        <img src={banner.image} alt={banner.title || 'Banner'} style={{ height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                      </td>
                      <td>{banner.title || '-'}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '999px', 
                          fontSize: '0.75rem',
                          background: banner.linkType === 'None' ? '#f3f4f6' : 'rgba(10, 39, 29, 0.1)',
                          color: banner.linkType === 'None' ? '#6b7280' : 'var(--accent-primary)'
                        }}>
                          {banner.linkType}
                        </span>
                      </td>
                      <td>
                        {banner.linkType === 'Category' ? banner.linkCategory?.name : 
                         banner.linkType === 'Product' ? banner.linkProduct?.name : '-'}
                      </td>
                      <td className="text-center">
                        <button className="icon-btn" style={{ display: 'inline-flex', color: 'var(--accent-primary)' }} onClick={() => handleOpenModal('edit', banner)}>
                          <Edit size={16} />
                        </button>
                        <button className="icon-btn" style={{ display: 'inline-flex', color: 'var(--danger)' }} onClick={() => handleDelete(banner._id)}>
                          <Trash2 size={16} />
                        </button>
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
                {modalMode === 'add' ? 'Add New Banner' : 'Edit Banner'}
              </h3>
              <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Banner Image *</label>
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
                      {selectedFile ? selectedFile.name : 'Click to upload desktop image'}
                    </span>
                    <input autoComplete="off" 
                      type="file" 
                      accept="image/*"
                      name="imageFile" 
                      onChange={(e) => handleFileChange(e, 'desktop')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Tablet Image (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {tabletPreviewUrl && (
                    <img 
                      src={tabletPreviewUrl} 
                      alt="Tablet Preview" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(10, 39, 29, 0.1)' }} 
                    />
                  )}
                  <label className="modern-input" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', justifyContent: 'center', border: '2px dashed rgba(10, 39, 29, 0.2)', backgroundColor: 'rgba(10, 39, 29, 0.02)', padding: '1.5rem' }}>
                    <UploadCloud size={24} color="var(--accent-secondary)" />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {selectedTabletFile ? selectedTabletFile.name : 'Click to upload tablet image'}
                    </span>
                    <input autoComplete="off" 
                      type="file" 
                      accept="image/*"
                      name="tabletImageFile" 
                      onChange={(e) => handleFileChange(e, 'tablet')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Mobile Image (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {mobilePreviewUrl && (
                    <img 
                      src={mobilePreviewUrl} 
                      alt="Mobile Preview" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(10, 39, 29, 0.1)' }} 
                    />
                  )}
                  <label className="modern-input" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', justifyContent: 'center', border: '2px dashed rgba(10, 39, 29, 0.2)', backgroundColor: 'rgba(10, 39, 29, 0.02)', padding: '1.5rem' }}>
                    <UploadCloud size={24} color="var(--accent-secondary)" />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {selectedMobileFile ? selectedMobileFile.name : 'Click to upload mobile image'}
                    </span>
                    <input autoComplete="off" 
                      type="file" 
                      accept="image/*"
                      name="mobileImageFile" 
                      onChange={(e) => handleFileChange(e, 'mobile')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Title (Optional)</label>
                <input 
                  autoComplete="off"
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="E.g., Summer Sale"
                />
              </div>

              <div>
                <label style={labelStyle}>Display Order (1-5)</label>
                <select 
                  name="order" 
                  value={formData.order} 
                  onChange={handleInputChange}
                  className="modern-input"
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Link Type</label>
                <select name="linkType" value={formData.linkType} onChange={handleInputChange} className="modern-input">
                  <option value="None">None</option>
                  <option value="Category">Link to Category</option>
                  <option value="Product">Link to Product</option>
                </select>
              </div>

              {formData.linkType === 'Category' && (
                <div>
                  <label style={labelStyle}>Select Category *</label>
                  <select name="linkCategory" value={formData.linkCategory} onChange={handleInputChange} className="modern-input" required>
                    <option value="">-- Choose Category --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.linkType === 'Product' && (
                <div>
                  <label style={labelStyle}>Select Product *</label>
                  <select name="linkProduct" value={formData.linkProduct} onChange={handleInputChange} className="modern-input" required>
                    <option value="">-- Choose Product --</option>
                    {products.map(prod => (
                      <option key={prod._id} value={prod._id}>{prod.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-clear" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-apply" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Banner'}
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

export default Banners;
