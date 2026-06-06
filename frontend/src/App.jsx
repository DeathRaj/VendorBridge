import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Rfqs from './pages/Rfqs';
import CreateRfq from './pages/CreateRfq';
import QuotationComparison from './pages/QuotationComparison';
import Approvals from './pages/Approvals';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';
import ManageUsers from './pages/ManageUsers';

const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user } = useContext(AppContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected App Routes */}
          <Route path="/dashboard" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />
          <Route path="/vendors" element={
            <ProtectedLayout>
              <Vendors />
            </ProtectedLayout>
          } />
          <Route path="/rfqs" element={
            <ProtectedLayout>
              <Rfqs />
            </ProtectedLayout>
          } />
          <Route path="/create-rfq" element={
            <ProtectedLayout>
              <CreateRfq />
            </ProtectedLayout>
          } />
          <Route path="/comparison" element={
            <ProtectedLayout>
              <QuotationComparison />
            </ProtectedLayout>
          } />
          <Route path="/approvals" element={
            <ProtectedLayout>
              <Approvals />
            </ProtectedLayout>
          } />
          <Route path="/purchase-orders" element={
            <ProtectedLayout>
              <PurchaseOrders />
            </ProtectedLayout>
          } />
          <Route path="/invoices" element={
            <ProtectedLayout>
              <Invoices />
            </ProtectedLayout>
          } />
          <Route path="/logs" element={
            <ProtectedLayout>
              <ActivityLogs />
            </ProtectedLayout>
          } />
          <Route path="/reports" element={
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          } />
          <Route path="/manage-users" element={
            <ProtectedLayout allowedRoles={["Admin"]}>
              <ManageUsers />
            </ProtectedLayout>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
