import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationsCount, setNotificationsCount] = useState(0);
  
  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('vb_activity_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        timestamp: "2026-06-06 09:30:00",
        user: "System / Seed Data",
        action: "Database Initialized",
        remarks: "FastAPI PostgreSQL backend connected."
      }
    ];
  });

  // Sync activity logs to local storage
  useEffect(() => {
    localStorage.setItem('vb_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Fetch all live data from the backend
  const fetchData = async () => {
    if (!localStorage.getItem('vb_token')) return;

    try {
      const vendorsRes = await api.get('/vendors');
      setVendors(vendorsRes.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }

    try {
      const rfqsRes = await api.get('/rfqs');
      setRfqs(rfqsRes.data);
    } catch (err) {
      console.error("Error fetching rfqs:", err);
    }

    try {
      const quotesRes = await api.get('/quotations');
      setQuotations(quotesRes.data);
    } catch (err) {
      console.error("Error fetching quotations:", err);
    }

    try {
      const approvalsRes = await api.get('/approvals');
      setApprovals(approvalsRes.data);
    } catch (err) {
      console.error("Error fetching approvals:", err);
    }

    try {
      const poRes = await api.get('/purchase-orders');
      setPurchaseOrders(poRes.data);
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
    }

    try {
      const invoicesRes = await api.get('/invoices');
      setInvoices(invoicesRes.data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  // Fetch initial data when authenticated user is present
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const logActivity = (action, remarks) => {
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      user: user ? user.username : "System / Guest",
      action,
      remarks
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const signup = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/signup', {
        username: name.replace(/\s+/g, '_').toLowerCase(), // map name to a clean username
        email,
        password,
        role
      });
      return { success: true, user: res.data };
    } catch (err) {
      let errorMsg = "Signup failed.";
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        // Parse Pydantic validation errors list safely into a string
        errorMsg = detail.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ');
      }
      return { success: false, error: errorMsg };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user: loggedInUser } = res.data;
      
      localStorage.setItem('vb_token', access_token);
      localStorage.setItem('vb_user', JSON.stringify(loggedInUser));
      
      setUser(loggedInUser);
      logActivity("Login", `${loggedInUser.username} logged into the system.`);
      return { success: true };
    } catch (err) {
      let errorMsg = "Invalid email or password.";
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        // Parse Pydantic validation errors list safely into a string
        errorMsg = detail.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ');
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    setUser(null);
    setVendors([]);
    setRfqs([]);
    setQuotations([]);
    setApprovals([]);
    setPurchaseOrders([]);
    setInvoices([]);
  };

  const addVendor = async (vendorData) => {
    try {
      const res = await api.post('/vendors', {
        name: vendorData.name,
        category: vendorData.category,
        gst_number: vendorData.gst_number || null,
        contact_email: vendorData.email,
        status: 'active',
        phone: vendorData.phone || null,
        rating: vendorData.rating || "3"
      });
      setVendors(prev => [...prev, res.data]);
      logActivity("Add Vendor", `Registered new vendor: ${vendorData.name}`);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to register vendor.";
      alert(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const createRfq = async (rfqData, lines) => {
    try {
      const res = await api.post('/rfqs', {
        title: rfqData.title,
        description: rfqData.product_details || "",
        quantity: rfqData.quantity || 1,
        deadline: rfqData.deadline,
        status: 'sent'
      });
      const createdRfq = res.data;
      setRfqs(prev => [...prev, createdRfq]);
      logActivity("Create RFQ", `Created RFQ: "${rfqData.title}"`);

      // Simulate vendor quotes in 1 second using the backend simulator
      setTimeout(async () => {
        try {
          await api.post(`/rfqs/${createdRfq.id}/simulate-bids`);
          logActivity("Quotations Received", `Bids simulated automatically for RFQ: "${rfqData.title}"`);
          fetchData(); // Refresh state lists (rfqs, quotations, approvals)
        } catch (err) {
          console.error("Simulation failed:", err);
        }
      }, 1000);

      return createdRfq;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to create RFQ.";
      alert(errorMsg);
      return null;
    }
  };

  const approveQuotation = async (qtnId, remarks) => {
    try {
      await api.put(`/quotations/${qtnId}/approve`, { remarks });
      logActivity("Approve Quotation", `Approved quotation ID: ${qtnId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to approve quotation.");
    }
  };

  const rejectQuotation = async (qtnId, remarks) => {
    try {
      await api.put(`/quotations/${qtnId}/reject`, { remarks });
      logActivity("Reject Quotation", `Rejected quotation ID: ${qtnId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reject quotation.");
    }
  };

  const generatePO = async (qtnId) => {
    try {
      const res = await api.post('/purchase-orders', { quotation_id: qtnId });
      logActivity("Generate PO", `Generated Draft PO ${res.data.po_number}`);
      fetchData();
      return res.data;
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate Purchase Order.");
      return null;
    }
  };

  const confirmPO = async (poId) => {
    try {
      await api.put(`/purchase-orders/${poId}/confirm`);
      logActivity("Confirm PO", `Purchase Order ID ${poId} confirmed.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to confirm Purchase Order.");
    }
  };

  const generateInvoice = async (poId) => {
    try {
      const res = await api.post('/invoices', { purchase_order_id: poId });
      logActivity("Generate Invoice", `Generated Draft Invoice ${res.data.invoice_number}`);
      fetchData();
      return res.data;
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate Invoice.");
      return null;
    }
  };

  const postInvoice = async (invId) => {
    try {
      await api.put(`/invoices/${invId}/post`);
      logActivity("Post Invoice", `Invoice ID ${invId} posted as Open.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to post Invoice.");
    }
  };

  const payInvoice = async (invId) => {
    try {
      await api.put(`/invoices/${invId}/pay`);
      logActivity("Pay Invoice", `Invoice ID ${invId} marked as Paid.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to pay Invoice.");
    }
  };

  // Real-time WebSocket connection for Manager notifications
  useEffect(() => {
    if (user && user.role === 'Manager') {
      const wsUrl = `ws://localhost:8001/ws/notifications`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket notification received:", data);
          setNotificationsCount(prev => prev + 1);
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      return () => {
        ws.close();
      };
    }
  }, [user]);

  return (
    <AppContext.Provider value={{
      user, login, logout, signup,
      globalSearch, setGlobalSearch,
      vendors, addVendor,
      rfqs, createRfq,
      quotations,
      approvals, approveQuotation, rejectQuotation,
      purchaseOrders, generatePO, confirmPO,
      invoices, generateInvoice, postInvoice, payInvoice,
      activityLogs, logActivity,
      notificationsCount, setNotificationsCount
    }}>
      {children}
    </AppContext.Provider>
  );
};
