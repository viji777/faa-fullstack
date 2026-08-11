"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../profile/page.module.css'; // Reusing profile styles for the form

export default function AddressesPage() {
  const { user, token, updateUserLocally } = useAuth();
  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.address) {
      setFormData({
        addressLine1: user.address.addressLine1 || '',
        addressLine2: user.address.addressLine2 || '',
        city: user.address.city || '',
        state: user.address.state || '',
        country: user.address.country || '',
        pincode: user.address.pincode || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/customers/me/address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        updateUserLocally({ address: data.address });
        toast.success('Address updated successfully');
      } else {
        toast.error(data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating address');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <MapPin size={32} />
        </div>
        <div>
          <h2 className={styles.title}>My Address</h2>
          <p className={styles.subtitle}>Manage your default shipping address</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="addressLine1">Address Line 1</label>
          <input 
            type="text" 
            id="addressLine1" 
            name="addressLine1" 
            value={formData.addressLine1} 
            onChange={handleChange} 
            className={styles.input}
            required
            placeholder="Flat, House no., Building, Company"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="addressLine2">Address Line 2</label>
          <input 
            type="text" 
            id="addressLine2" 
            name="addressLine2" 
            value={formData.addressLine2} 
            onChange={handleChange} 
            className={styles.input}
            placeholder="Area, Street, Sector, Village"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className={styles.formGroup}>
            <label htmlFor="city">City / Town</label>
            <input 
              type="text" 
              id="city" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="state">State</label>
            <input 
              type="text" 
              id="state" 
              name="state" 
              value={formData.state} 
              onChange={handleChange} 
              className={styles.input}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className={styles.formGroup}>
            <label htmlFor="country">Country</label>
            <input 
              type="text" 
              id="country" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="pincode">Pincode</label>
            <input 
              type="text" 
              id="pincode" 
              name="pincode" 
              value={formData.pincode} 
              onChange={handleChange} 
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'Saving...' : (
              <>
                <Save size={18} />
                Save Address
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
