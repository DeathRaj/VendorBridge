import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { CreditCard, ArrowRight, Printer, Receipt, Mail } from 'lucide-react';
import api from '../api';

const Invoices = () => {
  const { invoices, purchaseOrders, postInvoice, payInvoice } = useContext(AppContext);

  const getPoNumber = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    return po ? po.po_number : `PO #${poId}`;
  };

  const handlePost = (invId) => {
    postInvoice(invId);
    alert('Invoice posted successfully!');
  };

  const handlePay = (invId) => {
    payInvoice(invId);
    alert('Payment registered! Associated Purchase Order marked as DONE.');
  };

  const handleSendEmail = async (invId) => {
    try {
      const res = await api.post(`/invoices/${invId}/send-email`);
      alert(res.data.message || 'Invoice email sent successfully to the Vendor!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send invoice email.');
    }
  };

  const handleDownloadPDF = (inv) => {
    const po = purchaseOrders.find(p => p.id === inv.purchase_order_id);
    const subtotal = inv.total_amount - inv.tax_amount;
    
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups to print/download invoice PDF.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${inv.invoice_number}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: #2563eb;
            }
            .invoice-details {
              text-align: right;
            }
            .invoice-details h1 {
              margin: 0;
              font-size: 28px;
              color: #0f172a;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 40px;
            }
            .section-title {
              font-size: 12px;
              text-transform: uppercase;
              color: #94a3b8;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            .table th {
              background-color: #f8fafc;
              border-bottom: 2px solid #e2e8f0;
              text-align: left;
              padding: 12px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              color: #475569;
            }
            .table td {
              border-bottom: 1px solid #e2e8f0;
              padding: 12px;
              font-size: 14px;
            }
            .totals {
              margin-left: auto;
              width: 300px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .totals-row.grand-total {
              border-top: 2px solid #e2e8f0;
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              padding-top: 12px;
            }
            .footer {
              margin-top: 60px;
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">VendorBridge ERP</div>
              <p style="font-size: 12px; color: #475569; margin: 4px 0 0 0;">Procurement & Billing Portal</p>
            </div>
            <div class="invoice-details">
              <h1>INVOICE</h1>
              <p style="margin: 4px 0 0 0; font-weight: 600;"># ${inv.invoice_number}</p>
            </div>
          </div>
          
          <div class="grid">
            <div>
              <div class="section-title">Billed To</div>
              <strong>VendorBridge ERP</strong><br>
              Procurement Operations Division<br>
              Corporate HQ, Tech Park<br>
              admin@vendorbridge.com
            </div>
            <div class="invoice-details">
              <div class="section-title">Invoice Date</div>
              <p style="margin: 0; font-size: 14px;">${inv.invoice_date}</p>
              <div class="section-title" style="margin-top: 15px;">Linked PO</div>
              <p style="margin: 0; font-size: 14px;">${po ? po.po_number : 'N/A'}</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Quantity</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Goods/Services rendered under PO ${po ? po.po_number : 'N/A'}</td>
                <td style="text-align: right;">$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style="text-align: right;">1</td>
                <td style="text-align: right;">$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal (Net)</span>
              <span>$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="totals-row">
              <span>Tax (18% GST)</span>
              <span>$${inv.tax_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Grand Total</span>
              <span>$${inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for doing business with VendorBridge!</p>
            <p style="font-size: 10px; margin-top: 5px;">This is a system generated document and does not require a signature.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const headers = ['Invoice Number', 'PO Source', 'Invoice Date', 'Tax (18%)', 'Total Amount', 'Status', 'Actions'];
  const keys = ['invoice_number', 'purchase_order_id', 'invoice_date', 'tax_amount', 'total_amount', 'status', 'actions'];

  const renderRow = (inv) => (
    <tr key={inv.id}>
      <td className="font-semibold text-accent-blue">{inv.invoice_number}</td>
      <td>{getPoNumber(inv.purchase_order_id)}</td>
      <td>{inv.invoice_date}</td>
      <td>${inv.tax_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td className="font-semibold">${inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td><StatusBadge status={inv.status} /></td>
      <td>
        <div className="table-actions">
          {inv.status === 'draft' && (
            <button 
              className="btn btn-primary btn-xs" 
              onClick={() => handlePost(inv.id)}
            >
              <ArrowRight size={14} />
              <span>Post</span>
            </button>
          )}
          {inv.status === 'open' && (
            <button 
              className="btn btn-success btn-xs" 
              onClick={() => handlePay(inv.id)}
            >
              <CreditCard size={14} />
              <span>Pay</span>
            </button>
          )}
          <button 
            className="btn btn-outline btn-xs"
            onClick={() => handleDownloadPDF(inv)}
            title="Download PDF"
          >
            <Printer size={14} />
            <span>PDF</span>
          </button>
          <button 
            className="btn btn-outline btn-xs"
            onClick={() => handleSendEmail(inv.id)}
            title="Send Invoice Email"
          >
            <Mail size={14} />
            <span>Email</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="page-content">
      {invoices.length > 0 ? (
        <DataTable 
          headers={headers}
          data={invoices}
          keys={keys}
          renderRow={renderRow}
        />
      ) : (
        <div className="empty-state py-5 card">
          <Receipt size={48} className="text-muted mb-3" />
          <h3>No Invoices Generated</h3>
          <p className="text-muted">Generate invoices from confirmed Purchase Orders to manage billing.</p>
        </div>
      )}
    </div>
  );
};

export default Invoices;
