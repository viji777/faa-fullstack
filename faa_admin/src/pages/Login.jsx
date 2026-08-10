import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import loginBg from '../assets/Login page.png';
import brandLogo from '../assets/735786382_18114217105789853_6216282968904017031_n.jpg';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Load saved email if exists
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email address is required.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
        email,
        password
      });

      // Save token based on remember me
      if (rememberMe) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        localStorage.setItem('rememberedEmail', email);
      } else {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userInfo', JSON.stringify(response.data));
        localStorage.removeItem('rememberedEmail');
      }
      
      setLoading(false);
      navigate('/'); // Go to dashboard
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'An error occurred during login. Please try again.' });
      }
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side: Form */}
      <div className="auth-left">
        <div className="auth-glow"></div>
        
        <div className="auth-card">
          <div className="auth-icon-wrapper">
            <img src={brandLogo} alt="Faa Nuts Logo" className="auth-logo" />
          </div>
          
          <h2>Admin Login</h2>
          <p className="auth-subtitle">Welcome back! Please login to your account.</p>

          {errors.general && (
            <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form" noValidate autoComplete="off">
            {/* Hidden fields to trick Chrome autofill */}
            <input type="email" style={{ display: 'none' }} name="fakeusernameremembered" autoComplete="email" />
            <input type="password" style={{ display: 'none' }} name="fakepasswordremembered" autoComplete="current-password" />

            <div className="input-group">
              <div className={`input-wrapper ${errors.email ? 'input-error' : ''}`}>
                <Mail size={18} className="input-icon" />
                <input autoComplete="off" 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="nope"
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="input-group">
              <div className={`input-wrapper ${errors.password ? 'input-error' : ''}`}>
                <Lock size={18} className="input-icon" />
                <input autoComplete="off" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input autoComplete="off" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
