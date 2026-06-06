import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { UserPlus, Trash2, X } from 'lucide-react';
import api from '../api';

const ManageUsers = () => {
  const { user, signup, logActivity } = useContext(AppContext);
  const [usersList, setUsersList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Procurement Officer');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsersList(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !role) {
      alert("All fields are required.");
      return;
    }
    
    const res = await signup(username, email, password, role);
    if (res.success) {
      alert(`User ${username} successfully created!`);
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('Procurement Officer');
      setShowModal(false);
      fetchUsers();
    } else {
      alert(res.error || "Failed to register user.");
    }
  };

  const handleDelete = async (userId, uName) => {
    if (uName === user.username) {
      alert("You cannot delete your own logged-in admin account!");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${uName}"?`)) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      setUsersList(prev => prev.filter(u => u.id !== userId));
      logActivity("Delete User", `Deleted user account: ${uName}`);
      alert("User deleted successfully.");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete user.");
    }
  };

  const headers = ['User ID', 'Username', 'Email Address', 'ERP Role', 'Actions'];
  const keys = ['id', 'username', 'email', 'role', 'actions'];

  const renderRow = (u) => (
    <tr key={u.id}>
      <td className="font-semibold text-accent-purple">#{u.id}</td>
      <td className="font-medium">{u.username}</td>
      <td>{u.email}</td>
      <td>
        <span className={`badge ${
          u.role === 'Admin' ? 'badge-danger' : 
          u.role === 'Manager' ? 'badge-warning' : 
          u.role === 'Vendor' ? 'badge-neutral' : 'badge-info'
        }`}>
          {u.role}
        </span>
      </td>
      <td>
        <div className="table-actions">
          <button 
            className="btn btn-danger btn-xs"
            onClick={() => handleDelete(u.id, u.username)}
            disabled={u.username === user.username}
            title="Delete User"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="page-content">
      <DataTable 
        headers={headers}
        data={usersList}
        keys={keys}
        renderRow={renderRow}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <UserPlus size={16} />
            <span>Register User</span>
          </button>
        }
      />

      {/* Register User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New ERP User</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Username (No spaces) *</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())} 
                  placeholder="e.g. officer_john"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="e.g. john@vendorbridge.com"
                  required 
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Password *</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>ERP Role *</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="Procurement Officer">Procurement Officer</option>
                    <option value="Manager">Manager</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
