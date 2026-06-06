import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  FileText,
  CheckSquare,
  DollarSign,
  Activity,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { vendors, rfqs, approvals, invoices, activityLogs, approveQuotation, quotations, user } = useContext(AppContext);
  const navigate = useNavigate();

  const totalVendors = vendors.length;
  const activeRfqs = rfqs.filter(r => r.status === 'sent' || r.status === 'received').length;
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  
  const totalInvoiced = invoices
    .filter(i => i.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const pendingApprovalRecords = approvals
    .filter(a => a.status === 'pending')
    .slice(0, 5)
    .map(app => {
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

  const handleQuickApprove = (qtnId) => {
    approveQuotation(qtnId, "Quick approved via Dashboard.");
  };

  return (
    <div className="page-content">
      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard 
          title="Total Vendors" 
          value={totalVendors} 
          icon={<Users size={24} />} 
          change="+1" 
          changeType="positive"
          colorClass="blue"
        />
        <MetricCard 
          title="Active RFQs" 
          value={activeRfqs} 
          icon={<FileText size={24} />} 
          change="+2" 
          changeType="positive"
          colorClass="orange"
        />
        <MetricCard 
          title="Pending Approvals" 
          value={pendingApprovals} 
          icon={<CheckSquare size={24} />} 
          change="-1" 
          changeType="positive"
          colorClass="purple"
        />
        <MetricCard 
          title="Total Invoiced Value" 
          value={`$${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={<DollarSign size={24} />} 
          change="+$10,350" 
          changeType="positive"
          colorClass="green"
        />
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: user?.role === 'Manager' ? '1fr' : '2fr 1fr' }}>
        {/* Left Side: Pending Approvals (for Admin/Manager) or Active RFQs (for others) */}
        <div className="dashboard-card card-large">
          <div className="card-header">
            {user?.role === 'Admin' || user?.role === 'Manager' ? (
              <>
                <h3>
                  <CheckSquare size={18} className="text-accent-purple" />
                  <span>Pending Quotation Approvals</span>
                </h3>
                <button className="btn btn-outline btn-xs" onClick={() => navigate('/approvals')}>
                  View All
                </button>
              </>
            ) : (
              <>
                <h3>
                  <FileText size={18} className="text-accent-blue" />
                  <span>Active Requests for Quotations</span>
                </h3>
                <button className="btn btn-outline btn-xs" onClick={() => navigate('/rfqs')}>
                  View All
                </button>
              </>
            )}
          </div>
          <div className="card-body">
            {user?.role === 'Admin' || user?.role === 'Manager' ? (
              pendingApprovalRecords.length > 0 ? (
                <div className="table-responsive">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>RFQ</th>
                        <th>Quotation</th>
                        <th>Vendor</th>
                        <th className="text-right">Amount</th>
                        <th>Status</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovalRecords.map((app) => (
                        <tr key={app.id}>
                          <td>{app.rfqName}</td>
                          <td>{app.qtnName}</td>
                          <td>{app.vendorName}</td>
                          <td className="text-right font-medium">${app.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td><StatusBadge status={app.status} /></td>
                          <td className="text-center">
                            <button 
                              className="btn btn-success btn-xs" 
                              onClick={() => handleQuickApprove(app.quotation_id)}
                            >
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state py-5">
                  <p>No approvals pending review.</p>
                </div>
              )
            ) : (
              rfqs.filter(r => r.status === 'sent' || r.status === 'received').length > 0 ? (
                <div className="table-responsive">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Title</th>
                        <th>Deadline</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqs.filter(r => r.status === 'sent' || r.status === 'received').slice(0, 5).map((rfq) => (
                        <tr key={rfq.id}>
                          <td className="font-semibold text-accent-blue">{rfq.name}</td>
                          <td>{rfq.title}</td>
                          <td>{rfq.deadline}</td>
                          <td><StatusBadge status={rfq.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state py-5">
                  <p>No active RFQs found.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Side: Quick Shortcuts & Actions */}
        {user?.role !== 'Manager' && (
          <div className="dashboard-card card-small">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="card-body py-3">
              <div className="quick-actions-list">
                {user?.role !== 'Vendor' && user?.role !== 'Admin' && (
                  <button className="btn btn-primary btn-block mb-3" onClick={() => navigate('/create-rfq')}>
                    <Plus size={16} />
                    <span>Create New RFQ</span>
                  </button>
                )}
                {user?.role !== 'Procurement Officer' && (
                  <button className="btn btn-outline btn-block mb-3" onClick={() => navigate('/vendors')}>
                    <span>Add Vendor Profile</span>
                  </button>
                )}
                {user?.role !== 'Vendor' && (
                  <button className="btn btn-outline btn-block" onClick={() => navigate('/comparison')}>
                    <span>Compare Bid Pricing</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Logs Row */}
      <div className="dashboard-card mt-4">
        <div className="card-header">
          <h3>
            <Activity size={18} className="text-accent-blue" />
            <span>Recent ERP Activities</span>
          </h3>
          <button className="btn btn-outline btn-xs" onClick={() => navigate('/logs')}>
            Full Log
          </button>
        </div>
        <div className="card-body">
          <ul className="activity-timeline">
            {activityLogs.slice(0, 5).map((log) => (
              <li key={log.id} className="timeline-item">
                <span className="timeline-dot"></span>
                <div className="timeline-content">
                  <div className="timeline-meta">
                    <span className="timeline-time">{log.timestamp}</span>
                    <span className="timeline-user">by {log.user}</span>
                  </div>
                  <div className="timeline-message">
                    <strong>{log.action}</strong> — {log.remarks}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
