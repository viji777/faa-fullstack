"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { X, Eye, EyeOff } from 'lucide-react';
import styles from './AuthModal.module.css';

const AuthModal = () => {
  const { isAuthModalOpen, setAuthModalOpen, login, signup, googleLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      // Prevent typing numbers in name field
      setFormData({ ...formData, [name]: value.replace(/\d/g, '') });
    } else if (name === 'phone') {
      // Prevent typing letters/symbols in phone field
      setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Custom Validation
    if (!isLogin) {
      // Name validation: at least 3 letters, no numbers
      if (!formData.name || formData.name.trim().length < 3) {
        toast.error('Name must be at least 3 characters long.');
        return;
      }
      if (/\d/.test(formData.name)) {
        toast.error('Name cannot contain numbers.');
        return;
      }

      // Phone validation: only numbers, up to 15 digits (e.g. 10-15)
      if (!formData.phone || !/^\d{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
        toast.error('Phone number must contain 10 to 15 digits without letters.');
        return;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Logged in successfully!');
      } else {
        await signup(formData.name, formData.email, formData.password, formData.phone);
        toast.success('Account created successfully!');
      }
      setAuthModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', phone: '' });
    setShowPassword(false);
  };

  return (
    <div className={styles.overlay} onClick={() => setAuthModalOpen(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={() => setAuthModalOpen(false)}>
          <X size={24} />
        </button>

        <div className={styles.leftPanel}>
          <div className={styles.doodleOverlay}></div>
          <div className={styles.leftContent}>
            <img src="/faa_logo.png" alt="Faa Nuts Logo" className={styles.modalLogo} />
          </div>
        </div>

        <div className={styles.rightPanel}>
          <h2 className={styles.title}>{isLogin ? 'Welcome Back' : 'Join Faa'}</h2>
          <p className={styles.subtitle}>
            {isLogin 
              ? 'Sign in to place orders and manage your account.' 
              : 'Create an account to start ordering premium nuts and dates.'}
          </p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate autoComplete="off">
            {!isLogin && (
              <>
                <div className={styles.inputGroup}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    className={styles.input} 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className={styles.input} 
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    maxLength="15"
                  />
                </div>
              </>
            )}

            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                className={styles.input} 
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  className={styles.input} 
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span className={styles.toggleLink} onClick={toggleMode}>
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </div>

          <div className={styles.orDivider}>
            <span>or continue with</span>
          </div>

          <div className={styles.googleBtnWrapper}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                const res = await googleLogin(credentialResponse.credential);
                if (res.success) {
                  setAuthModalOpen(false);
                }
                setLoading(false);
              }}
              onError={() => {
                toast.error('Google Sign In was unsuccessful. Please try again.');
              }}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
