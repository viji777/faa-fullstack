import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X, UploadCloud, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import '../pages/Dashboard.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentProductId, setCurrentProductId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isFeatured: false,
    isSpecial: false,
  });
  const [variants, setVariants] = useState([{ size: '', price: '' }]);
  const [imagesData, setImagesData] = useState([
    { file: null, previewUrl: '', isPrimary: true, existingUrl: '', imageId: '' },
    { file: null, previewUrl: '', isPrimary: false, existingUrl: '', imageId: '' },
    { file: null, previewUrl: '', isPrimary: false, existingUrl: '', imageId: '' }
  ]);

  const [formLoading, setFormLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (mode, product = null) => {
    setModalMode(mode);
    if (mode === 'edit' && product) {
      setCurrentProductId(product._id);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        isFeatured: product.isFeatured || false,
        isSpecial: product.isSpecial || false,
      });
      setVariants(product.variants && product.variants.length > 0 ? product.variants : [{ size: '', price: '' }]);
      
      const newImagesData = [
        { file: null, previewUrl: '', isPrimary: true, existingUrl: '', imageId: '' },
        { file: null, previewUrl: '', isPrimary: false, existingUrl: '', imageId: '' },
        { file: null, previewUrl: '', isPrimary: false, existingUrl: '', imageId: '' }
      ];
      
      if (product.images) {
        product.images.forEach((img, index) => {
          if (index < 3) {
            newImagesData[index] = {
              file: null,
              previewUrl: img.url,
              isPrimary: img.isPrimary,
              existingUrl: img.url,
              imageId: img.imageId || ''
            };
          }
        });
        
        if (!newImagesData.some(img => img.isPrimary && (img.previewUrl || img.file))) {
          const firstValid = newImagesData.find(img => img.previewUrl || img.file);
          if (firstValid) firstValid.isPrimary = true;
        }
      }
      setImagesData(newImagesData);
    } else {
      setCurrentProductId(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        isFeatured: false,
        isSpecial: false,
      });
      setVariants([{ size: '', price: '' }]);
      setImagesData([
        { file: null, previewUrl: '', isPrimary: true, existingUrl: '', imageId: '' },
        { file: null, previewUrl: '', isPrimary: false, existingUrl: '', imageId: '' },
        { file: null, previewUrl: '', isPrimary: false, existingUrl: '', imageId: '' }
      ]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => setVariants([...variants, { size: '', price: '' }]);
  const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));

  const handleFileChange = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newImagesData = [...imagesData];
      newImagesData[index].file = file;
      newImagesData[index].previewUrl = URL.createObjectURL(file);
      setImagesData(newImagesData);
    }
  };

  const setPrimaryImage = (index) => {
    if (!imagesData[index].previewUrl && !imagesData[index].file) return;
    const newImagesData = imagesData.map((img, i) => ({ ...img, isPrimary: i === index }));
    setImagesData(newImagesData);
  };

  const removeImage = (index) => {
    const newImagesData = [...imagesData];
    newImagesData[index] = { file: null, previewUrl: '', isPrimary: false, existingUrl: '', imageId: '' };
    
    if (imagesData[index].isPrimary) {
      const nextValid = newImagesData.find(img => img.previewUrl || img.file);
      if (nextValid) nextValid.isPrimary = true;
    }
    setImagesData(newImagesData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return toast.error('Name and Category are required');
    if (!variants.some(v => v.size && v.price)) return toast.error('At least one valid variant is required');
    
    const validImages = imagesData.filter(img => img.file || img.existingUrl);
    if (validImages.length === 0) return toast.error('At least one image is required');

    setFormLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const finalImages = [];
      
      let orderCounter = 1;
      for (const img of imagesData) {
        if (img.file) {
          const uploadData = new FormData();
          uploadData.append('image', img.file);
          const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
          });
          finalImages.push({
            url: uploadRes.data.url,
            imageId: uploadRes.data.imageId,
            isPrimary: img.isPrimary,
            order: orderCounter++
          });
        } else if (img.existingUrl) {
          finalImages.push({
            url: img.existingUrl,
            imageId: img.imageId,
            isPrimary: img.isPrimary,
            order: orderCounter++
          });
        }
      }

      const validVariants = variants.filter(v => v.size && v.price).map(v => ({ size: v.size, price: Number(v.price) }));

      const payload = { ...formData, images: finalImages, variants: validVariants };

      if (modalMode === 'add') {
        await axios.post('http://localhost:5000/api/products', payload, getAuthHeaders());
        toast.success('Product created successfully');
      } else {
        await axios.put(`http://localhost:5000/api/products/${currentProductId}`, payload, getAuthHeaders());
        toast.success('Product updated successfully');
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, getAuthHeaders());
        toast.success('Product deleted');
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
          <h1>Products</h1>
          <p className="text-muted">Manage your inventory, variants, and pricing.</p>
        </div>
        <button className="btn-apply" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleOpenModal('add')}>
          <Plus size={18} /> Add Product
        </button>
      </header>

      <div className="dashboard-content" style={{ marginTop: '1rem' }}>
        <div style={{ padding: '0' }}>
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p className="no-data">No products found. Create one above.</p>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead style={{ background: 'var(--accent-primary)', borderRadius: '12px' }}>
                  <tr>
                    <th style={{ color: 'white', padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', width: '60px', textAlign: 'center' }}>Img</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Name & Category</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Price (Starting)</th>
                    <th style={{ color: 'white', padding: '1rem' }}>Status</th>
                    <th className="text-center" style={{ color: 'white', padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => {
                    const primaryImg = product.images?.find(img => img.isPrimary) || product.images?.[0];
                    const minPrice = product.variants?.length ? Math.min(...product.variants.map(v => v.price)) : 0;
                    
                    return (
                      <tr key={product._id}>
                        <td>
                          {primaryImg ? (
                            <img src={primaryImg.url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(10,39,29,0.1)' }} />
                          ) : (
                            <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundColor: 'rgba(10,39,29,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-secondary)', border: '1px solid rgba(10,39,29,0.1)' }}>No Img</div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.05rem' }}>{product.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{product.category?.name || 'Uncategorized'}</div>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹ {minPrice}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {product.isFeatured && <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-tertiary)', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>Featured</span>}
                            {product.isSpecial && <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>Special</span>}
                            {!product.isFeatured && !product.isSpecial && <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>-</span>}
                          </div>
                        </td>
                        <td className="text-center">
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button className="icon-btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(10, 39, 29, 0.06)', color: 'var(--accent-primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleOpenModal('edit', product)}>
                              <Edit size={16} />
                            </button>
                            <button className="icon-btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleDelete(product._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                {modalMode === 'add' ? 'Add Product' : 'Edit Product'}
              </h3>
              <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="modern-input" placeholder="e.g. Ajwa Dates" required />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="modern-input" required>
                    <option value="">-- Choose Category --</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="modern-input" placeholder="Product details..." rows="3" required style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '2rem', padding: '1rem', background: 'rgba(10,39,29,0.02)', borderRadius: '12px', border: '1px solid rgba(10,39,29,0.05)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
                  Featured Product
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <input type="checkbox" name="isSpecial" checked={formData.isSpecial} onChange={handleInputChange} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
                  Special Product
                </label>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)' }} />
              
              <div>
                <label style={labelStyle}>Variants (Size & Price) *</label>
                {variants.map((v, index) => (
                  <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                    <input type="text" placeholder="Size (e.g. 500g)" value={v.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="modern-input" required />
                    <input type="number" placeholder="Price (₹)" value={v.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="modern-input" required min="0" />
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(index)} style={{ padding: '0 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addVariant} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--accent-primary)', border: '2px dashed rgba(10,39,29,0.2)', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem', transition: 'all 0.2s' }}>
                  <Plus size={16} /> Add Variant
                </button>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)' }} />

              <div>
                <label style={labelStyle}>Product Images (Max 3) *</label>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>Upload images and select one as Primary (★).</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {imagesData.map((img, index) => (
                    <div key={index} style={{ position: 'relative', height: '150px', border: '2px dashed rgba(10,39,29,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: img.previewUrl ? '#000' : 'rgba(10,39,29,0.02)' }}>
                      {img.previewUrl ? (
                        <>
                          <img src={img.previewUrl} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                          
                          <button type="button" onClick={() => setPrimaryImage(index)} title="Set as Primary" style={{ position: 'absolute', top: '8px', left: '8px', width: '32px', height: '32px', borderRadius: '50%', background: img.isPrimary ? 'var(--accent-secondary)' : 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s' }}>
                            <Star size={16} fill={img.isPrimary ? "#fff" : "none"} />
                          </button>
                          
                          <button type="button" onClick={() => removeImage(index)} title="Remove Image" style={{ position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s' }}>
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '100%', height: '100%', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                          <UploadCloud size={28} color="var(--accent-secondary)" style={{ marginBottom: '0.5rem' }} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Click to Upload</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(index, e)} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-clear" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-apply" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (modalMode === 'add' ? 'Save Product' : 'Update Product')}
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
  width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff',
  borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(10, 39, 29, 0.25)', border: '1px solid rgba(10, 39, 29, 0.05)'
};

const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' };

export default Products;
