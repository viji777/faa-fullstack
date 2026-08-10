import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import brandLogo from '../assets/735786382_18114217105789853_6216282968904017031_n.jpg';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'Email address is required.' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await axios.post('http://localhost:5000/api/auth/admin/forgot-password', { email });
      
      setLoading(false);
      // Save email so ResetPassword page can use it
      localStorage.setItem('resetPasswordEmail', email);
      navigate('/reset-password', { state: { email } }); 
    } catch (error) {
      setLoading(false);
      setErrors({ general: error.response?.data?.message || 'Failed to request password reset.' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-card">
          <div className="auth-icon-wrapper">
            <img src={brandLogo} alt="Faa Nuts Logo" className="auth-logo" />
          </div>
          
          <h2>Forgot Password?</h2>
          <p className="auth-subtitle">Enter your email address and we'll send you an OTP to reset your password.</p>

          {errors.general && (
            <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleForgot} className="auth-form" noValidate>
            <div className="input-group">
              <div className={`input-wrapper ${errors.email ? 'input-error' : ''}`}>
                <Mail size={18} className="input-icon" />
                <input autoComplete="off" 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : 'Send OTP'}
            </button>
          </form>

          <div className="auth-footer" style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
