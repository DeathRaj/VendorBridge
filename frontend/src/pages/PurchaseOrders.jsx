import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { CheckCircle2, FilePlus2, Printer, ShoppingBag, Eye, X } from 'lucide-react';

const PurchaseOrders = () => {
  const { purchaseOrders, vendors, confirmPO, generateInvoice, quotations, user } = useContext(AppContext);
  const navigate = useNavigate();

  const [selectedPO, setSelectedPO] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getVendorName = (vendorId) => {
    const v = vendors.find(vendor => vendor.id === vendorId);
    return v ? v.name : `Vendor #${vendorId}`;
  };

  const handleConfirm = (poId) => {
    confirmPO(poId);
    alert('Purchase Order confirmed!');
  };

  const handleGenerateInvoice = async (poId) => {
    const invoice = await generateInvoice(poId);
    if (invoice) {
      alert(`Invoice ${invoice.invoice_number} generated successfully as Draft!`);
      navigate('/invoices');
    }
  };

  const handlePrint = (po) => {
    const v = vendors.find(vendor => vendor.id === po.vendor_id);
    const qtn = quotations.find(q => q.id === po.quotation_id);
    const printContent = `
      ========================================
      PURCHASE ORDER PRINT OUT (MOCK)
      ========================================
      PO Reference: ${po.po_number}
      Date: ${po.order_date}
      Status: ${po.status.toUpperCase()}
      
      Vendor Details:
      Name: ${v ? v.name : 'Unknown Vendor'}
      Email: ${v ? v.email : 'N/A'}
      Phone: ${v ? v.phone : 'N/A'}
      
      Financial Summary:
      Subtotal: $${(po.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      Tax (0% Standard PO): $0.00
      Total: $${(po.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      
      Linked Bid: ${qtn ? qtn.name : 'N/A'}
      ========================================
    `;
    alert(printContent);
  };

  const headers = ['PO Number', 'Quotation Ref', 'Vendor', 'Order Date', 'Total Amount', 'Status', 'Actions'];
  const keys = ['po_number', 'quotation_id', 'vendor_id', 'order_date', 'total_amount', 'status', 'actions'];

  const getQtnName = (qtnId) => {
    const q = quotations.find(qtn => qtn.id === qtnId);
    return q ? q.name : `QTN #${qtnId}`;
  };

  const renderRow = (po) => (
    <tr key={po.id}>
      <td className="font-semibold text-accent-blue">{po.po_number}</td>
      <td>{getQtnName(po.quotation_id)}</td>
      <td className="font-medium">{getVendorName(po.vendor_id)}</td>
      <td>{po.order_date}</td>
      <td className="font-semibold">${(po.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td><StatusBadge status={po.status} /></td>
      <td>
        <div className="table-actions">
          {user?.role !== 'Vendor' && po.status === 'draft' && (
            <button 
              className="btn btn-success btn-xs" 
              onClick={() => handleConfirm(po.id)}
            >
              <CheckCircle2 size={14} />
              <span>Confirm</span>
            </button>
          )}
          {user?.role !== 'Vendor' && po.status === 'confirmed' && (
            <button 
              className="btn btn-primary btn-xs" 
              onClick={() => handleGenerateInvoice(po.id)}
            >
              <FilePlus2 size={14} />
              <span>Bill</span>
            </button>
          )}
          <button 
            className="btn btn-outline btn-xs"
            onClick={() => {
              setSelectedPO(po);
              setShowModal(true);
            }}
            title="View Details"
          >
            <Eye size={14} />
            <span>View</span>
          </button>
          <button 
            className="btn btn-outline btn-xs"
            onClick={() => handlePrint(po)}
            title="Print PO"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="page-content">
      {purchaseOrders.length > 0 ? (
        <DataTable 
          headers={headers}
          data={purchaseOrders}
          keys={keys}
          renderRow={renderRow}
        />
      ) : (
        <div className="empty-state py-5 card">
          <ShoppingBag size={48} className="text-muted mb-3" />
          <h3>No Purchase Orders Generated</h3>
          <p className="text-muted">Approve quotations in the comparison portal to generate Purchase Orders.</p>
        </div>
      )}

      {/* PO Detail Modal */}
      {showModal && selectedPO && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Purchase Order Details</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-form">
              <div className="form-grid" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label>PO Number</label>
                  <div className="font-semibold text-accent-blue" style={{ fontSize: '16px' }}>{selectedPO.po_number}</div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div>
                    <StatusBadge status={selectedPO.status} />
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Order Date</label>
                  <div className="font-medium">{selectedPO.order_date}</div>
                </div>
                <div className="form-group">
                  <label>Linked Bid / Quotation</label>
                  <div className="font-medium">{getQtnName(selectedPO.quotation_id)}</div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Vendor Details</label>
                {(() => {
                  const v = vendors.find(vendor => vendor.id === selectedPO.vendor_id);
                  return v ? (
                    <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)' }}>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>Email: {v.contact_email || v.email || 'N/A'}</p>
                      {v.gst_number && <p className="text-muted" style={{ fontSize: '13px' }}>GST Number: {v.gst_number}</p>}
                      {v.category && <p className="text-muted" style={{ fontSize: '13px' }}>Category: {v.category}</p>}
                    </div>
                  ) : (
                    <div>Unknown Vendor (ID: {selectedPO.vendor_id})</div>
                  );
                })()}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Financial Summary</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '8px', border: '1px solid #a7f3d0', backgroundColor: '#d1fae5' }}>
                  <span className="font-semibold" style={{ color: '#065f46' }}>Total Amount</span>
                  <span className="font-bold text-accent-green" style={{ fontSize: '18px', color: '#065f46' }}>
                    ${(selectedPO.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
