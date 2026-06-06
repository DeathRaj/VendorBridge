import React, { useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Printer } from 'lucide-react';

const Reports = () => {
  const { purchaseOrders, invoices, vendors, rfqs } = useContext(AppContext);
  const reportRef = useRef();

  const totalPOAmount = purchaseOrders
    .filter(p => p.status === 'confirmed' || p.status === 'done')
    .reduce((sum, p) => sum + p.total_amount, 0);

  const totalPOCount = purchaseOrders.length;

  const totalInvoiced = invoices
    .filter(i => i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.total_amount, 0);

  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.total_amount, 0);

  const totalPendingPayment = invoices
    .filter(i => i.status === 'open')
    .reduce((sum, i) => sum + i.total_amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-content">
      <div className="report-controls mb-4">
        <button className="btn btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={16} />
          <span>Print Executive Summary</span>
        </button>
      </div>

      <div className="report-print-container" ref={reportRef}>
        <div className="report-header-banner">
          <h2>VendorBridge ERP Procurement Report</h2>
          <span className="report-timestamp">Generated on: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="report-section mt-4">
          <h3 className="section-title">Key Performance Indicators</h3>
          <div className="report-metrics-grid">
            <div className="report-metric-box">
              <span className="box-label">Total Purchase Orders</span>
              <span className="box-value">{totalPOCount}</span>
            </div>
            <div className="report-metric-box">
              <span className="box-label">Total Approved PO Value</span>
              <span className="box-value">${totalPOAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="report-metric-box">
              <span className="box-label">Total Invoiced Amount</span>
              <span className="box-value">${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="report-metric-box">
              <span className="box-label">Payments Released</span>
              <span className="box-value text-accent-green">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="report-grid mt-4">
          <div className="report-card">
            <h4>Vendor Category Breakdown</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Active Vendors</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Goods Supply</td>
                  <td className="text-right font-medium">{vendors.filter(v => v.category === 'goods').length}</td>
                </tr>
                <tr>
                  <td>Technical Services</td>
                  <td className="text-right font-medium">{vendors.filter(v => v.category === 'services').length}</td>
                </tr>
                <tr>
                  <td>Construction &amp; Infra</td>
                  <td className="text-right font-medium">{vendors.filter(v => v.category === 'construction').length}</td>
                </tr>
                <tr>
                  <td>Other</td>
                  <td className="text-right font-medium">{vendors.filter(v => v.category === 'other').length}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h4>Outstanding Vendor Payables</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Invoice Status</th>
                  <th className="text-right">Outstanding Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Draft Billing (Awaiting Posting)</td>
                  <td className="text-right font-medium">
                    ${invoices.filter(i => i.status === 'draft').reduce((sum, i) => sum + i.total_amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td>Awaiting Release (Open)</td>
                  <td className="text-right font-medium text-accent-orange">
                    ${totalPendingPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td>Settled (Paid)</td>
                  <td className="text-right font-medium text-accent-green">
                    ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-card mt-4">
          <h4>Active RFQ Status Overview</h4>
          <table className="report-table">
            <thead>
              <tr>
                <th>RFQ Reference</th>
                <th>Title</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map(rfq => (
                <tr key={rfq.id}>
                  <td className="font-semibold">{rfq.name}</td>
                  <td>{rfq.title}</td>
                  <td>{rfq.deadline}</td>
                  <td className="capitalize">{rfq.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
