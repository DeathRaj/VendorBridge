import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Landmark } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Procurement Officer');
  const [error, setError] = useState('');
  const { signup } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    const res = await signup(name, email, password, role);
    if (res.success) {
      alert(`Account created successfully as ${role}! Redirecting to login.`);
      navigate('/login');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Landmark size={36} className="text-accent-blue" />
          </div>
          <h2>Create Account</h2>
          <p>Get started with VendorBridge ERP</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} />
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="john.doe@company.com"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
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

          <div className="form-group">
            <label>ERP Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '0.95rem',
                outline: 'none',
                marginTop: '0.25rem',
                cursor: 'pointer'
              }}
            >
              <option value="Admin">Admin</option>
              <option value="Procurement Officer">Procurement Officer</option>
              <option value="Vendor">Vendor</option>
              <option value="Manager">Manager / Approver</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>
            <User size={18} />
            <span>Create ERP Account</span>
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
