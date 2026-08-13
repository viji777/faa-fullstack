import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Upload, Settings as SettingsIcon } from 'lucide-react';
import './Dashboard.css';

const GlobalSettings = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoImageId, setLogoImageId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/settings`);
      if (res.data) {
        setPhone(res.data.phone || '');
        setEmail(res.data.email || '');
        setLogoUrl(res.data.logoUrl || '');
        setLogoImageId(res.data.logoImageId || '');
        setImagePreview(res.data.logoUrl || '');
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setFetching(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: getAuthHeaders().headers.Authorization
      }
    });
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let finalLogoUrl = logoUrl;
      let finalLogoId = logoImageId;

      if (imageFile) {
        const uploadRes = await uploadImage();
        if (uploadRes) {
          finalLogoUrl = uploadRes.url;
          finalLogoId = uploadRes.imageId;
        }
      }

      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/settings`, {
        phone,
        email,
        logoUrl: finalLogoUrl,
        logoImageId: finalLogoId
      }, getAuthHeaders());
      
      toast.success('Settings updated successfully!');
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ padding: '2rem' }}>Loading Settings...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-flex">
        <div className="dashboard-title">
          <h1><SettingsIcon size={28} style={{ marginRight: '10px', verticalAlign: 'middle', color: 'var(--accent-primary)' }}/> Global Settings</h1>
          <p className="text-muted">Manage website logo and public contact information.</p>
        </div>
      </header>

      <div className="dashboard-content" style={{ marginTop: '2rem', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Logo Configuration</h3>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Website Logo</label>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{ width: '150px', height: '150px', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', overflow: 'hidden' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No Logo</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="logo-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                  <Upload size={18} />
                  Choose New Logo
                </label>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Recommended size: 200x60 pixels. Max size: 2MB.</p>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Contact Information</h3>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Contact Phone Number (For WhatsApp & Calls)</label>
            <input 
              type="text" 
              className="modern-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 917200407943"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Contact Email</label>
            <input 
              type="email" 
              className="modern-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., faabusinessgroup@gmail.com"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalSettings;
