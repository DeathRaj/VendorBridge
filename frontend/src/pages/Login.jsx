import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, Mail, Lock, Landmark } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('officer@vendorbridge.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Landmark size={36} className="text-accent-blue" />
          </div>
          <h2>Welcome back!</h2>
          <p>Login to your VendorBridge ERP portal</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="officer@vendorbridge.com"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            <ShieldCheck size={18} />
            <span>Secure Login</span>
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account? </span>
          <Link to="/signup" className="auth-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
