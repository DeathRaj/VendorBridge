import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Bell, Search, Calendar } from 'lucide-react';

const Navbar = () => {
  const { user, globalSearch, setGlobalSearch, notificationsCount, setNotificationsCount } = useContext(AppContext);
  const location = useLocation();

  if (!user) return null;

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'ERP Command Center';
      case '/vendors': return 'Vendor Management Portal';
      case '/rfqs': return 'Requests for Quotations (RFQs)';
      case '/create-rfq': return 'Initialize RFQ';
      case '/comparison': return 'Quotation Comparison Matrix';
      case '/approvals': return 'Workflow Approval Chain';
      case '/purchase-orders': return 'Purchase Orders Catalog';
      case '/invoices': return 'Vendor Invoicing Management';
      case '/logs': return 'Audit Trails & Activity Logs';
      case '/reports': return 'Procurement Insights & Reports';
      case '/manage-users': return 'ERP User Accounts Management';
      default: return 'VendorBridge';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1>{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="navbar-right">
        <div className="navbar-date">
          <Calendar size={16} />
          <span>{currentDate}</span>
        </div>

        <div className="navbar-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Global search..." 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>

        {user?.role === 'Manager' && (
          <div className="navbar-notifications" onClick={() => setNotificationsCount(0)} style={{ cursor: 'pointer' }}>
            <Bell size={20} className="bell-icon" />
            {notificationsCount > 0 && (
              <span className="notification-badge">{notificationsCount}</span>
            )}
          </div>
        )}

        <div className="user-profile-badge">
          <span>{user.name || user.username || "User"}</span>
          <div className="user-avatar-mini">{(user.name || user.username || "U").charAt(0).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
