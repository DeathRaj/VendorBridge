import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Plus, BarChart3, Eye } from 'lucide-react';

const Rfqs = () => {
  const { rfqs, vendors, user } = useContext(AppContext);
  const navigate = useNavigate();

  const headers = ['Reference', 'Title', 'Deadline', 'Assigned Vendors', 'Status', 'Actions'];
  const keys = ['name', 'title', 'deadline', 'assigned_vendor_ids', 'status', 'actions'];

  const getVendorNames = (ids) => {
    if (!ids || ids.length === 0) return 'None';
    return ids.map(id => {
      const v = vendors.find(vendor => vendor.id === id);
      return v ? v.name : `Vendor #${id}`;
    }).join(', ');
  };

  const renderRow = (rfq) => (
    <tr key={rfq.id}>
      <td className="font-semibold text-accent-blue">{rfq.name}</td>
      <td className="font-medium">{rfq.title}</td>
      <td>{rfq.deadline}</td>
      <td className="text-muted text-sm truncate max-w-xs">{getVendorNames(rfq.assigned_vendor_ids)}</td>
      <td><StatusBadge status={rfq.status} /></td>
      <td>
        <div className="table-actions">
          {user?.role !== 'Vendor' && (rfq.status === 'received' || rfq.status === 'closed') && (
            <button 
              className="btn btn-success btn-xs" 
              onClick={() => navigate(`/comparison?rfq_id=${rfq.id}`)}
              title="Compare Quotations"
            >
              <BarChart3 size={14} />
              <span>Compare</span>
            </button>
          )}
          <button 
            className="btn btn-outline btn-xs"
            onClick={() => alert(`RFQ Details:\nReference: ${rfq.name}\nTitle: ${rfq.title}\nProduct Details: ${rfq.product_details}\nQuantity: ${rfq.quantity}`)}
          >
            <Eye size={14} />
            <span>View</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="page-content">
      <DataTable 
        headers={headers}
        data={rfqs}
        keys={keys}
        renderRow={renderRow}
        actions={
          user?.role !== 'Vendor' && user?.role !== 'Manager' && user?.role !== 'Admin' && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-rfq')}>
              <Plus size={16} />
              <span>Create RFQ</span>
            </button>
          )
        }
      />
    </div>
  );
};

export default Rfqs;
