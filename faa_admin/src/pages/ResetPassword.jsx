import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import brandLogo from '../assets/735786382_18114217105789853_6216282968904017031_n.jpg';
import './Login.css';

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || localStorage.getItem('resetPasswordEmail');

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!otp || otp.length !== 6) {
      newErrors.otp = "Please enter a valid 6-digit OTP.";
    }
    
    // Same password validation as signup
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/;
    if (!newPassword || !passwordRegex.test(newPassword)) {
      newErrors.newPassword = "Password must be 6-15 characters, with at least one uppercase, one lowercase, one number, and one special character.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/admin/reset-password`, {
        email,
        otp,
        newPassword
      });
      
      setLoading(false);
      localStorage.removeItem('resetPasswordEmail');
      alert('Password has been reset successfully! Please login with your new password.');
      navigate('/login'); 
    } catch (error) {
      setLoading(false);
      setErrors({ general: error.response?.data?.message || 'Failed to reset password.' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-card">
          <div className="auth-icon-wrapper">
            <img src={brandLogo} alt="Faa Nuts Logo" className="auth-logo" />
          </div>
          
          <h2>Reset Password</h2>
          <p className="auth-subtitle">Enter the 6-digit OTP sent to <strong>{email}</strong> and your new password.</p>

          {errors.general && (
            <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleReset} className="auth-form" noValidate>
            <div className="input-group">
              <div className={`input-wrapper ${errors.otp ? 'input-error' : ''}`}>
                <KeyRound size={18} className="input-icon" />
                <input autoComplete="off" 
                  type="text" 
                  placeholder="6-Digit OTP" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              {errors.otp && <div className="error-message">{errors.otp}</div>}
            </div>

            <div className="input-group">
              <div className={`input-wrapper ${errors.newPassword ? 'input-error' : ''}`}>
                <Lock size={18} className="input-icon" />
                <input autoComplete="off" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="New Password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : 'Reset Password'}
            </button>
          </form>

          <div className="auth-footer" style={{ display: 'flex', justifyContent: 'center' }}>
             <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}>
              Cancel & Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
