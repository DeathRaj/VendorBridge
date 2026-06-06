import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { BarChart3, Star, CheckCircle } from 'lucide-react';

const QuotationComparison = () => {
  const { rfqs, quotations, vendors, approveQuotation, generatePO, purchaseOrders, user } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedRfqId, setSelectedRfqId] = useState('');

  useEffect(() => {
    const rfqId = searchParams.get('rfq_id');
    if (rfqId) {
      setSelectedRfqId(rfqId);
    } else if (rfqs.length > 0) {
      const receivedRfq = rfqs.find(r => r.status === 'received' || r.status === 'closed');
      if (receivedRfq) {
        setSelectedRfqId(String(receivedRfq.id));
      } else {
        setSelectedRfqId(String(rfqs[0].id));
      }
    }
  }, [searchParams, rfqs]);

  const activeRfq = rfqs.find(r => String(r.id) === selectedRfqId);
  const activeQuotations = quotations.filter(q => String(q.rfq_id) === selectedRfqId);

  let lowestPriceQtnId = null;
  if (activeQuotations.length > 0) {
    const sorted = [...activeQuotations].sort((a, b) => a.total_amount - b.total_amount);
    lowestPriceQtnId = sorted[0].id;
  }

  const getVendor = (vendorId) => {
    return vendors.find(v => v.id === vendorId) || { name: 'Unknown Vendor', rating: '3' };
  };

  const handleApprove = (qtnId) => {
    approveQuotation(qtnId, "Quotation selected via comparison portal.");
    alert('Quotation approved successfully! The RFQ has been closed.');
  };

  return (
    <div className="page-content">
      <div className="comparison-selector-card mb-4">
        <div className="form-group mb-0 flex-grow-1">
          <label className="font-semibold block mb-2 text-sm text-muted">Select RFQ to Compare Bids</label>
          <select 
            value={selectedRfqId} 
            onChange={(e) => setSelectedRfqId(e.target.value)}
            className="rfq-dropdown-selector"
          >
            {rfqs.map(rfq => (
              <option key={rfq.id} value={rfq.id}>
                [{rfq.name}] {rfq.title} ({rfq.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeRfq && (
        <div className="rfq-info-summary mb-4">
          <h4>{activeRfq.title} Details</h4>
          <p className="text-muted text-sm mb-2">{activeRfq.product_details}</p>
          <div className="rfq-meta-items">
            <span><strong>Total Items Required:</strong> {activeRfq.quantity} units</span>
            <span><strong>Bidding Deadline:</strong> {activeRfq.deadline}</span>
            <span><strong>Status:</strong> <StatusBadge status={activeRfq.status} /></span>
          </div>
        </div>
      )}

      {activeQuotations.length > 0 ? (
        <div className="comparison-cards-container">
          {activeQuotations.map(qtn => {
            const vendor = getVendor(qtn.vendor_id);
            const isLowest = qtn.id === lowestPriceQtnId;
            return (
              <div 
                key={qtn.id} 
                className={`comparison-bid-card ${isLowest ? 'lowest-bid-highlight' : ''}`}
              >
                {isLowest && (
                  <div className="best-price-banner">
                    <span>Lowest Price Bid</span>
                  </div>
                )}
                
                <div className="bid-card-header">
                  <span className="qtn-ref">{qtn.name}</span>
                  <StatusBadge status={qtn.status} />
                </div>

                <div className="bid-card-vendor-info py-3 border-bottom">
                  <h4 className="vendor-title">{vendor.name}</h4>
                  <div className="vendor-rating">
                    {[...Array(5)].map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={12} 
                        fill={idx < parseInt(vendor.rating) ? "#FFD700" : "none"} 
                        stroke={idx < parseInt(vendor.rating) ? "#FFD700" : "#ccc"} 
                      />
                    ))}
                  </div>
                </div>

                <div className="bid-card-details py-3">
                  <div className="detail-row mb-2">
                    <span className="detail-label">Base Cost / Unit</span>
                    <span className="detail-value">${qtn.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="detail-row mb-2">
                    <span className="detail-label">Delivery Lead Time</span>
                    <span className="detail-value">{qtn.delivery_days} Days</span>
                  </div>
                  <div className="detail-row grand-total mt-3">
                    <span className="detail-label font-bold">Total Bid Value</span>
                    <span className="detail-value text-accent-green">
                      ${qtn.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bid-card-notes p-3 bg-light rounded text-sm text-muted mb-4">
                  <strong>Notes:</strong> {qtn.notes || 'No specific terms.'}
                </div>

                <div className="bid-card-actions">
                  {qtn.status === 'under_review' && (user?.role === 'Manager' || user?.role === 'Admin') && (
                    <button 
                      className="btn btn-success btn-block" 
                      onClick={() => handleApprove(qtn.id)}
                    >
                      <CheckCircle size={16} />
                      <span>Select &amp; Approve Bid</span>
                    </button>
                  )}
                  {qtn.status === 'approved' && (() => {
                    const poExists = purchaseOrders.some(p => p.quotation_id === qtn.id);
                    if (!poExists && user?.role === 'Procurement Officer') {
                      return (
                        <button 
                          className="btn btn-primary btn-block" 
                          onClick={async () => {
                            const po = await generatePO(qtn.id);
                            if (po) {
                              alert(`Purchase Order ${po.po_number} generated!`);
                              navigate('/purchase-orders');
                            }
                          }}
                        >
                          Generate PO
                        </button>
                      );
                    }
                    return (
                      <button 
                        className="btn btn-outline btn-block"
                        onClick={() => navigate('/purchase-orders')}
                      >
                        View Purchase Orders
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state py-5 card">
          <BarChart3 size={48} className="text-muted mb-3" />
          <h3>No Bids Received Yet</h3>
          <p className="text-muted">Wait for assigned vendors to submit their bids, or create a new RFQ.</p>
        </div>
      )}
    </div>
  );
};

export default QuotationComparison;
