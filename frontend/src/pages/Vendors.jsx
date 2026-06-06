import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Star, Plus, X } from 'lucide-react';
import api from '../api';

const Vendors = () => {
  const { vendors, addVendor, user } = useContext(AppContext);
  const [localVendors, setLocalVendors] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gst, setGst] = useState('');
  const [category, setCategory] = useState('goods');
  const [rating, setRating] = useState('3');

  const fetchFilteredVendors = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      
      const res = await api.get('/vendors', { params });
      setLocalVendors(res.data);
    } catch (err) {
      console.error("Failed to load filtered vendors:", err);
    }
  };

  useEffect(() => {
    fetchFilteredVendors();
  }, [filterCategory, filterStatus, vendors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and Email are required.');
      return;
    }
    await addVendor({
      name,
      email,
      phone,
      gst_number: gst,
      category,
      rating
    });
    setName('');
    setEmail('');
    setPhone('');
    setGst('');
    setCategory('goods');
    setRating('3');
    setShowModal(false);
  };

  const headers = ['Name', 'Contact Email', 'Phone', 'GST Number', 'Category', 'Rating', 'Status'];
  const keys = ['name', 'contact_email', 'phone', 'gst_number', 'category', 'rating', 'status'];
  const searchKeys = ['name', 'contact_email'];

  const renderRatingStars = (ratingStr) => {
    const num = parseInt(ratingStr) || 3;
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            fill={i < num ? "#FFD700" : "none"} 
            stroke={i < num ? "#FFD700" : "#ccc"} 
          />
        ))}
      </div>
    );
  };

  const renderRow = (vendor) => (
    <tr key={vendor.id}>
      <td className="font-medium">{vendor.name}</td>
      <td>{vendor.contact_email}</td>
      <td>{vendor.phone || 'N/A'}</td>
      <td>{vendor.gst_number || 'N/A'}</td>
      <td className="capitalize">{vendor.category}</td>
      <td>{renderRatingStars(vendor.rating)}</td>
      <td><StatusBadge status={vendor.status} /></td>
    </tr>
  );

  return (
    <div className="page-content">
      <DataTable 
        headers={headers}
        data={localVendors}
        keys={keys}
        renderRow={renderRow}
        searchKeys={searchKeys}
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="table-search-input"
              style={{ width: '150px', height: '36px', padding: '0 10px' }}
            >
              <option value="">All Categories</option>
              <option value="goods">Goods Supply</option>
              <option value="services">Technical Services</option>
              <option value="construction">Construction &amp; Infra</option>
              <option value="other">Other</option>
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="table-search-input"
              style={{ width: '130px', height: '36px', padding: '0 10px' }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {user?.role !== 'Procurement Officer' && user?.role !== 'Vendor' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                <Plus size={16} />
                <span>Add Vendor</span>
              </button>
            )}
          </div>
        }
      />

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Vendor</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Vendor Business Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Apex Tech Corp"
                  required 
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Email *</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="sales@company.com"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="+1 (555) 012-3456"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>GST / Tax ID</label>
                  <input 
                    type="text" 
                    value={gst} 
                    onChange={(e) => setGst(e.target.value)} 
                    placeholder="GSTIN12345"
                  />
                </div>
                <div className="form-group">
                  <label>Service Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="goods">Goods Supply</option>
                    <option value="services">Technical Services</option>
                    <option value="construction">Construction &amp; Infra</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Initial Quality Rating</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Good)</option>
                  <option value="3">3 Stars (Standard)</option>
                  <option value="2">2 Stars (Sub-standard)</option>
                  <option value="1">1 Star (Critical Risk)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
