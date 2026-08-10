import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Mail } from 'lucide-react';
import axios from 'axios';
import loginBg from '../assets/Login page.png';
import brandLogo from '../assets/735786382_18114217105789853_6216282968904017031_n.jpg';
import './Login.css'; // Reusing Login.css for the same layout
import toast from 'react-hot-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    // Name validation: 3 to 50 characters, only letters, exactly one space between words, no leading/trailing space
    const nameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;
    if (!name || name.length < 3 || name.length > 50) {
      newErrors.name = "Name must be 3 to 50 characters long.";
    } else if (!nameRegex.test(name)) {
      newErrors.name = "Invalid name. Use only letters with single spaces between words.";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation: 6-15 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/;
    if (!password || !passwordRegex.test(password)) {
      newErrors.password = "Password must be 6-15 characters, with at least one uppercase, one lowercase, one number, and one special character.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/admin/signup`, {
        name,
        email,
        password
      });
      setLoading(false);
      // Save email for verification step
      localStorage.setItem('pendingVerificationEmail', email);
      toast.success(response.data.message || 'Registration successful. Check your email for OTP.');
      navigate('/verify-otp', { state: { email } }); 
    } catch (error) {
      setLoading(false);
      const serverError = error.response?.data?.message || 'Registration failed';
      setErrors({ ...errors, general: serverError });
      toast.error(serverError);
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
          
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join us to manage your store effortlessly.</p>

          {errors.general && (
            <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSignup} className="auth-form" noValidate autoComplete="off">
            {/* Hidden fields to trick Chrome autofill */}
            <input type="email" style={{ display: 'none' }} name="fakeusernameremembered" autoComplete="email" />
            <input type="password" style={{ display: 'none' }} name="fakepasswordremembered" autoComplete="new-password" />

            <div className="input-group">
              <div className={`input-wrapper ${errors.name ? 'input-error' : ''}`}>
                <User size={18} className="input-icon" />
                <input autoComplete="off" 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z ]/g, ''))}
                  autoComplete="nope"
                />
              </div>
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

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

            <button type="submit" className="auth-btn" style={{marginTop: '0.5rem'}} disabled={loading}>
              {loading ? <span className="loader"></span> : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
