import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import axios from 'axios';
import brandLogo from '../assets/735786382_18114217105789853_6216282968904017031_n.jpg';
import './Login.css'; // Reusing Login.css layout
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // The email should ideally be passed from Signup/Login page state
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');

  useEffect(() => {
    if (!email) {
      navigate('/login'); // If no email context, send back to login
    }
  }, [email, navigate]);

  // Handle countdown timer for Resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP.' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/admin/verify-otp', {
        email,
        otp
      });
      
      // Verification successful, redirect to login
      localStorage.removeItem('pendingVerificationEmail');
      
      setLoading(false);
      toast.success('Account verified successfully! You can now login.');
      navigate('/login');
    } catch (error) {
      setLoading(false);
      setErrors({ general: error.response?.data?.message || 'Verification failed.' });
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setErrors({});
    try {
      await axios.post('http://localhost:5000/api/auth/admin/resend-otp', { email });
      setCountdown(60); // 60s cooldown
      toast.success('A new OTP has been sent to your email.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
      if (error.response?.status === 429) {
        // Parse time remaining from message if possible, or just default to 60
        setCountdown(60);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-card">
          <div className="auth-icon-wrapper">
            <img src={brandLogo} alt="Faa Nuts Logo" className="auth-logo" />
          </div>
          
          <h2>Verify Account</h2>
          <p className="auth-subtitle">We sent a 6-digit OTP to <strong>{email}</strong>. Enter it below to verify your account.</p>

          {errors.general && (
            <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleVerify} className="auth-form" noValidate autoComplete="off">
            <div className="input-group">
              <div className={`input-wrapper ${errors.otp ? 'input-error' : ''}`}>
                <KeyRound size={18} className="input-icon" />
                <input autoComplete="off" 
                  type="text" 
                  placeholder="6-Digit OTP" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="off"
                />
              </div>
              {errors.otp && <div className="error-message">{errors.otp}</div>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : 'Verify OTP'}
            </button>
          </form>

          <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={handleResend} 
              disabled={countdown > 0}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: countdown > 0 ? '#94a3b8' : '#10b981', 
                cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>
            <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
