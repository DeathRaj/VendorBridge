import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Landmark, Lock, ArrowLeft, ShieldCheck, Key } from 'lucide-react';
import api from '../api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token || !newPassword) {
      setError('Token and new password are required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });
      setMessage(res.data.message || 'Password updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset password failed.');
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
          <h2>Create New Password</h2>
          <p>Enter your reset token and your new password</p>
        </div>

        {message && <div className="alert alert-success">{message} Redirecting to login...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Reset Token</label>
            <div className="input-with-icon">
              <Key size={18} />
              <input 
                type="text" 
                value={token} 
                onChange={(e) => setToken(e.target.value)} 
                placeholder="Enter token from forgot password page"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <ShieldCheck size={18} />
            <span>{loading ? 'Updating...' : 'Update Password'}</span>
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

export default ResetPassword;
