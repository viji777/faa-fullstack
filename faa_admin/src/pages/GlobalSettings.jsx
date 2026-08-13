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
  
  // Admin Profile State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Edit mode states
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchSettings();
    
    // Load admin profile from local storage
    const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setAdminName(userInfo.name || '');
        setAdminEmail(userInfo.email || '');
      } catch (err) {}
    }
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

  const handleGlobalSubmit = async (e) => {
    e.preventDefault();
    setLoadingGlobal(true);
    
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
      setIsEditingGlobal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoadingGlobal(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    
    try {
      const payload = {
        name: adminName,
        email: adminEmail,
      };
      
      if (adminPhone) payload.phone = adminPhone;
      if (adminPassword) payload.password = adminPassword;

      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/roles/profile`, payload, getAuthHeaders());
      
      // Update local storage with new name/email
      const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          userInfo.name = res.data.name;
          userInfo.email = res.data.email;
          if (localStorage.getItem('userInfo')) {
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          } else {
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          }
        } catch (err) {}
      }

      toast.success('Admin Profile updated successfully!');
      setAdminPassword(''); // clear password after success
      setIsEditingProfile(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Helper to safely display the logo (if it's a relative path, we show a generic icon or prefix with website URL if known)
  // For now, if it's a relative path, we can assume it's the default logo and let it break or handle gracefully
  const renderLogoPreview = () => {
    if (!imagePreview) return <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No Logo</span>;
    
    // If it's a relative path from the Next.js app, it might break on the admin Vite app. 
    // We could try to render it, but if it fails, maybe we show alt text.
    return <img src={imagePreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="color: #94a3b8; font-size: 0.9rem">Default Logo</span>'; }} />;
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

      <div className="dashboard-content" style={{ marginTop: '2rem', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <form onSubmit={handleGlobalSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Logo Configuration
            {!isEditingGlobal && (
              <button type="button" onClick={() => setIsEditingGlobal(true)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>
                Edit Settings
              </button>
            )}
          </h3>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Website Logo</label>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{ width: '150px', height: '150px', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', overflow: 'hidden' }}>
                {renderLogoPreview()}
              </div>
              {isEditingGlobal && (
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
              )}
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
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: isEditingGlobal ? '#fff' : '#f8fafc', color: isEditingGlobal ? 'inherit' : '#64748b' }}
              disabled={!isEditingGlobal}
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
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: isEditingGlobal ? '#fff' : '#f8fafc', color: isEditingGlobal ? 'inherit' : '#64748b' }}
              disabled={!isEditingGlobal}
              required
            />
          </div>

          {isEditingGlobal && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditingGlobal(false);
                  fetchSettings(); // reset values
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', color: '#475569', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loadingGlobal}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: loadingGlobal ? 'not-allowed' : 'pointer', opacity: loadingGlobal ? 0.7 : 1, transition: 'all 0.2s' }}
              >
                <Save size={18} />
                {loadingGlobal ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}
        </form>

        <form onSubmit={handleProfileSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Admin Profile Credentials
            {!isEditingProfile && (
              <button type="button" onClick={() => setIsEditingProfile(true)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>
                Edit Profile
              </button>
            )}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Update your personal login email, display name, and password here.</p>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Display Name</label>
            <input 
              type="text" 
              className="modern-input"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="e.g., Admin User"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: isEditingProfile ? '#fff' : '#f8fafc', color: isEditingProfile ? 'inherit' : '#64748b' }}
              disabled={!isEditingProfile}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Login Email</label>
            <input 
              type="email" 
              className="modern-input"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: isEditingProfile ? '#fff' : '#f8fafc', color: isEditingProfile ? 'inherit' : '#64748b' }}
              disabled={!isEditingProfile}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Personal Phone Number (Optional)</label>
            <input 
              type="text" 
              className="modern-input"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="e.g., 919876543210"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: isEditingProfile ? '#fff' : '#f8fafc', color: isEditingProfile ? 'inherit' : '#64748b' }}
              disabled={!isEditingProfile}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>New Password</label>
            <input 
              type="password" 
              className="modern-input"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: isEditingProfile ? '#fff' : '#f8fafc', color: isEditingProfile ? 'inherit' : '#64748b' }}
              disabled={!isEditingProfile}
            />
          </div>

          {isEditingProfile && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditingProfile(false);
                  // Reset from local storage
                  const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
                  if (userInfoStr) {
                    try {
                      const userInfo = JSON.parse(userInfoStr);
                      setAdminName(userInfo.name || '');
                      setAdminEmail(userInfo.email || '');
                    } catch (err) {}
                  }
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', color: '#475569', padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loadingProfile}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: loadingProfile ? 'not-allowed' : 'pointer', opacity: loadingProfile ? 0.7 : 1, transition: 'all 0.2s' }}
              >
                <Save size={18} />
                {loadingProfile ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default GlobalSettings;
