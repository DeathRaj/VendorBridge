import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Check, X, MessageSquare } from 'lucide-react';

const Approvals = () => {
  const { approvals, quotations, vendors, rfqs, approveQuotation, rejectQuotation } = useContext(AppContext);
  const [remarks, setRemarks] = useState({});

  const handleRemarkChange = (appId, val) => {
    setRemarks(prev => ({ ...prev, [appId]: val }));
  };

  const handleApprove = (app) => {
    const rmk = remarks[app.id] || "Approved via approvals queue.";
    approveQuotation(app.quotation_id, rmk);
    alert('Quotation approved!');
  };

  const handleReject = (app) => {
    const rmk = remarks[app.id] || "Rejected via approvals queue.";
    rejectQuotation(app.quotation_id, rmk);
    alert('Quotation rejected.');
  };

  const approvalRecords = approvals.map(app => {
    const qtn = quotations.find(q => q.id === app.quotation_id);
    const vendor = qtn ? vendors.find(v => v.id === qtn.vendor_id) : null;
    const rfq = qtn ? rfqs.find(r => r.id === qtn.rfq_id) : null;
    return {
      ...app,
      qtnName: qtn ? qtn.name : 'Unknown QTN',
      rfqName: rfq ? rfq.name : 'Unknown RFQ',
      vendorName: vendor ? vendor.name : 'Unknown Vendor',
      amount: qtn ? qtn.total_amount : 0
    };
  });

  const headers = ['Quotation', 'RFQ Source', 'Vendor', 'Amount', 'Date', 'Approver', 'Remarks', 'Status', 'Actions'];
  const keys = ['qtnName', 'rfqName', 'vendorName', 'amount', 'date', 'approver_name', 'remarks', 'status', 'actions'];

  const renderRow = (app) => (
    <tr key={app.id}>
      <td className="font-semibold text-accent-blue">{app.qtnName}</td>
      <td>{app.rfqName}</td>
      <td className="font-medium">{app.vendorName}</td>
      <td className="font-semibold">${app.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td>{app.date}</td>
      <td>{app.approver_name}</td>
      <td>
        {app.status === 'pending' ? (
          <div className="remarks-input-container">
            <MessageSquare size={14} className="text-muted" />
            <input 
              type="text" 
              placeholder="Add review remarks..." 
              value={remarks[app.id] || ''}
              onChange={(e) => handleRemarkChange(app.id, e.target.value)}
              className="remarks-inline-input"
            />
          </div>
        ) : (
          <span className="text-muted text-sm">{app.remarks || 'No remarks.'}</span>
        )}
      </td>
      <td><StatusBadge status={app.status} /></td>
      <td>
        {app.status === 'pending' ? (
          <div className="table-actions">
            <button 
              className="btn btn-success btn-xs" 
              onClick={() => handleApprove(app)}
              title="Approve Quotation"
            >
              <Check size={14} />
              <span>Approve</span>
            </button>
            <button 
              className="btn btn-danger btn-xs" 
              onClick={() => handleReject(app)}
              title="Reject Quotation"
            >
              <X size={14} />
              <span>Reject</span>
            </button>
          </div>
        ) : (
          <span className="text-muted text-xs">Closed</span>
        )}
      </td>
    </tr>
  );

  return (
    <div className="page-content">
      <DataTable 
        headers={headers}
        data={approvalRecords}
        keys={keys}
        renderRow={renderRow}
      />
    </div>
  );
};

export default Approvals;
