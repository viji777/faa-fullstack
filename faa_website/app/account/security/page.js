"use client";
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../profile/page.module.css'; // Reusing profile styles for the form

export default function SecurityPage() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (formData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/customers/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Password updated successfully');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <Lock size={32} />
        </div>
        <div>
          <h2 className={styles.title}>Change Password</h2>
          <p className={styles.subtitle}>Ensure your account is secure</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="currentPassword">Current Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showCurrent ? "text" : "password"} 
              id="currentPassword" 
              name="currentPassword" 
              value={formData.currentPassword} 
              onChange={handleChange} 
              className={styles.input}
              required
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button 
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="newPassword">New Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showNew ? "text" : "password"} 
              id="newPassword" 
              name="newPassword" 
              value={formData.newPassword} 
              onChange={handleChange} 
              className={styles.input}
              required
              minLength={6}
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button 
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showConfirm ? "text" : "password"} 
              id="confirmPassword" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              className={styles.input}
              required
              minLength={6}
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button 
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'Updating...' : (
              <>
                <Save size={18} />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
