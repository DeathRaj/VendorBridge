import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  PlusSquare,
  BarChart3,
  CheckSquare,
  ShoppingBag,
  Receipt,
  Activity,
  TrendingUp,
  LogOut,
  Landmark
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Vendors', path: '/vendors', icon: <Users size={20} /> },
    { name: 'RFQs', path: '/rfqs', icon: <FileText size={20} /> },
    { name: 'Create RFQ', path: '/create-rfq', icon: <PlusSquare size={20} /> },
    { name: 'Compare Bids', path: '/comparison', icon: <BarChart3 size={20} /> },
    { name: 'Approvals', path: '/approvals', icon: <CheckSquare size={20} /> },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: <ShoppingBag size={20} /> },
    { name: 'Invoices', path: '/invoices', icon: <Receipt size={20} /> },
    { name: 'Activity Logs', path: '/logs', icon: <Activity size={20} /> },
    { name: 'Reports', path: '/reports', icon: <TrendingUp size={20} /> }
  ];

  if (user?.role === 'Admin') {
    menuItems.push({ name: 'Manage Users', path: '/manage-users', icon: <Users size={20} /> });
  }

  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'Vendor') {
      return ['Dashboard', 'Vendors', 'RFQs', 'Purchase Orders'].includes(item.name);
    }
    if (user?.role === 'Procurement Officer') {
      return !['Vendors', 'Approvals'].includes(item.name);
    }
    if (user?.role === 'Manager') {
      return !['Create RFQ', 'Vendors'].includes(item.name);
    }
    if (user?.role === 'Admin') {
      return !['RFQs', 'Create RFQ', 'Compare Bids', 'Approvals'].includes(item.name);
    }
    return true;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Landmark className="brand-icon" size={24} />
        <h2>VendorBridge</h2>
      </div>
      
      <div className="user-profile-summary">
        <div className="user-avatar">{(user.name || user.username || "U").charAt(0).toUpperCase()}</div>
        <div className="user-meta">
          <span className="user-name">{user.name || user.username || "User"}</span>
          <span className="user-role">{user.role}</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <ul>
          {filteredMenuItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
