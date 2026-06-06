import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Landmark, Mail, ArrowLeft, Send } from 'lucide-react';
import api from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Password reset token generated.');
      
      // Auto-navigate to reset page after 2 seconds for seamless mock experience
      if (res.data.token) {
        setTimeout(() => {
          navigate(`/reset-password?token=${res.data.token}`);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Landmark size={36} className="text-accent-blue" />
          </div>
          <h2>Reset Password</h2>
          <p>We'll generate a secure token to reset your credentials</p>
        </div>

        {message && <div className="alert alert-success">{message} Redirecting...</div>}
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
                placeholder="registered@email.com"
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <Send size={18} />
            <span>{loading ? 'Processing...' : 'Send Reset Token'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
