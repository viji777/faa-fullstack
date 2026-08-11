"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user, token, updateUserLocally } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
      if (user.name) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } else {
      setIsEditing(true);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      return toast.error('Name must be at least 3 characters long');
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        return toast.error('Please enter a valid phone number (digits only, 10 to 15 digits)');
      }
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/customers/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        updateUserLocally({ name: data.name, phone: data.phone });
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <User size={32} />
        </div>
        <div>
          <h2 className={styles.title}>My Profile</h2>
          <p className={styles.subtitle}>Update your personal information</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address (Cannot be changed)</label>
          <input 
            type="email" 
            id="email" 
            value={user.email} 
            disabled 
            className={`${styles.input} ${styles.disabledInput}`}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className={`${styles.input} ${!isEditing ? styles.disabledInput : ''}`}
            required
            disabled={!isEditing}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            className={`${styles.input} ${!isEditing ? styles.disabledInput : ''}`}
            disabled={!isEditing}
            maxLength="15"
          />
        </div>

        <div className={styles.formActions}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {loading ? 'Saving...' : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
              {user?.name && (
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className={styles.saveBtn} 
                  style={{ backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }}
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <button 
              type="button" 
              className={styles.saveBtn} 
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
