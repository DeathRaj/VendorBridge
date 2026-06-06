import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const CreateRfq = () => {
  const { vendors, createRfq } = useContext(AppContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [details, setDetails] = useState('');
  const [assignedVendors, setAssignedVendors] = useState([]);
  
  const [lines, setLines] = useState([
    { product_name: '', quantity: 1, description: '' }
  ]);

  const handleAddLine = () => {
    setLines([...lines, { product_name: '', quantity: 1, description: '' }]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, idx) => idx !== index));
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const handleVendorToggle = (vendorId) => {
    if (assignedVendors.includes(vendorId)) {
      setAssignedVendors(assignedVendors.filter(id => id !== vendorId));
    } else {
      setAssignedVendors([...assignedVendors, vendorId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !deadline) {
      alert('Title and Deadline date are required.');
      return;
    }
    if (assignedVendors.length === 0) {
      alert('Please assign at least one vendor.');
      return;
    }
    
    const invalidLines = lines.some(line => !line.product_name || line.quantity <= 0);
    if (invalidLines) {
      alert('Please fill out all line item details correctly.');
      return;
    }

    createRfq({
      title,
      deadline,
      product_details: details,
      quantity: lines.reduce((sum, line) => sum + Number(line.quantity), 0),
      assigned_vendor_ids: assignedVendors
    }, lines);

    alert('RFQ created successfully and sent to assigned vendors! Mock quotations will load in 1 second.');
    navigate('/rfqs');
  };

  return (
    <div className="page-content">
      <div className="page-header-actions mb-4">
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/rfqs')}>
          <ArrowLeft size={16} />
          <span>Back to RFQs</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="erp-form-card">
        <div className="card-header">
          <h3>Create Request for Quotation (RFQ)</h3>
        </div>
        
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label>RFQ Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Office Hardware Supply"
                required 
              />
            </div>
            <div className="form-group">
              <label>Deadline Date *</label>
              <input 
                type="date" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>General Product / Service Details</label>
            <textarea 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
              placeholder="Scope of work, specifications, compliance requirements..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="mb-2 block font-medium">Assign Vendors *</label>
            <div className="vendor-selection-grid">
              {vendors.filter(v => v.status === 'active').map(vendor => (
                <label key={vendor.id} className="checkbox-label-card">
                  <input 
                    type="checkbox" 
                    checked={assignedVendors.includes(vendor.id)}
                    onChange={() => handleVendorToggle(vendor.id)}
                  />
                  <div className="checkbox-card-content">
                    <span className="vendor-selection-name">{vendor.name}</span>
                    <span className="vendor-selection-cat capitalize">{vendor.category}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section-header mt-4 mb-2">
            <h4>Product / Service Items</h4>
          </div>
          <div className="form-lines-table">
            <table className="lines-entry-table">
              <thead>
                <tr>
                  <th>Product/Service Name *</th>
                  <th>Quantity *</th>
                  <th>Description</th>
                  <th className="text-center" style={{ width: '60px' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td>
                      <input 
                        type="text" 
                        value={line.product_name} 
                        onChange={(e) => handleLineChange(idx, 'product_name', e.target.value)}
                        placeholder="Item name"
                        required
                      />
                    </td>
                    <td style={{ width: '120px' }}>
                      <input 
                        type="number" 
                        value={line.quantity} 
                        onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                        min="1"
                        required
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={line.description} 
                        onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                        placeholder="Specifications / size / notes"
                      />
                    </td>
                    <td className="text-center">
                      <button 
                        type="button" 
                        className="btn btn-danger-link" 
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lines.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="btn btn-outline btn-sm mt-3" onClick={handleAddLine}>
              <Plus size={16} />
              <span>Add Line Item</span>
            </button>
          </div>
        </div>

        <div className="card-footer text-right">
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            <span>Create and Send RFQ</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRfq;
