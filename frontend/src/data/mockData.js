export const initialVendors = [
  {
    id: 1,
    name: "Global Tech Solutions",
    email: "sales@globaltech.com",
    phone: "+1 555-0199",
    gst_number: "GST987654321",
    category: "goods",
    status: "active",
    rating: "4"
  },
  {
    id: 2,
    name: "Apex Services Inc.",
    email: "info@apexservices.com",
    phone: "+1 555-0244",
    gst_number: "GST123456789",
    category: "services",
    status: "active",
    rating: "5"
  },
  {
    id: 3,
    name: "BuildCorp Infra",
    email: "procure@buildcorp.com",
    phone: "+1 555-0377",
    gst_number: "GST456789123",
    category: "construction",
    status: "inactive",
    rating: "3"
  }
];

export const initialRfqs = [
  {
    id: 1,
    name: "RFQ/2026/00001",
    title: "Enterprise Laptops Procurement",
    product_details: "Requesting bids for 50 developer-grade laptops (32GB RAM, 1TB SSD).",
    quantity: 50,
    deadline: "2026-06-15",
    status: "received",
    assigned_vendor_ids: [1, 2],
    lines: [
      { id: 1, product_name: "Developer Laptop", description: "32GB RAM, 1TB SSD, Core i9", quantity: 50 }
    ]
  },
  {
    id: 2,
    name: "RFQ/2026/00002",
    title: "Office Renovation Services",
    product_details: "Looking for office redesign and painting services for the main floor.",
    quantity: 1,
    deadline: "2026-06-20",
    status: "sent",
    assigned_vendor_ids: [2, 3],
    lines: [
      { id: 2, product_name: "Renovation Service", description: "Design, painting and carpeting", quantity: 1 }
    ]
  },
  {
    id: 3,
    name: "RFQ/2026/00003",
    title: "Server Rack Cabinets",
    product_details: "Standard server rack cabinets 42U with cooling fans.",
    quantity: 5,
    deadline: "2026-05-30",
    status: "closed",
    assigned_vendor_ids: [1],
    lines: [
      { id: 3, product_name: "42U Server Rack", description: "With cooling fans and PDU", quantity: 5 }
    ]
  }
];

export const initialQuotations = [
  {
    id: 1,
    name: "QTN/2026/00001",
    rfq_id: 1,
    vendor_id: 1,
    price: 1200.00,
    delivery_days: 10,
    notes: "Includes 3 years warranty and free shipping.",
    status: "under_review",
    total_amount: 60000.00,
    lines: [
      { id: 1, product_name: "Developer Laptop", quantity: 50, unit_price: 1200.00, subtotal: 60000.00 }
    ]
  },
  {
    id: 2,
    name: "QTN/2026/00002",
    rfq_id: 1,
    vendor_id: 2,
    price: 1150.00,
    delivery_days: 15,
    notes: "Standard warranty, shipping extra $500.",
    status: "under_review",
    total_amount: 57500.00,
    lines: [
      { id: 2, product_name: "Developer Laptop", quantity: 50, unit_price: 1150.00, subtotal: 57500.00 }
    ]
  }
];

export const initialApprovals = [
  {
    id: 1,
    quotation_id: 1,
    approver_id: 1,
    approver_name: "Procurement Manager",
    status: "pending",
    remarks: "Quotation is under review.",
    date: "2026-06-06 10:00:00"
  }
];

export const initialPurchaseOrders = [
  {
    id: 1,
    po_number: "VB-PO/2026/00001",
    quotation_id: 2,
    vendor_id: 2,
    total_amount: 57500.00,
    status: "confirmed",
    order_date: "2026-06-05"
  }
];

export const initialInvoices = [
  {
    id: 1,
    invoice_number: "VB-INV/2026/00001",
    purchase_order_id: 1,
    tax_amount: 10350.00,
    total_amount: 67850.00,
    status: "open",
    invoice_date: "2026-06-06"
  }
];

export const initialActivityLogs = [
  {
    id: 1,
    timestamp: "2026-06-06 09:30:00",
    user: "Procurement Officer",
    action: "Create RFQ",
    remarks: "RFQ/2026/00001 created."
  },
  {
    id: 2,
    timestamp: "2026-06-06 09:45:00",
    user: "Apex Services Inc.",
    action: "Submit Quotation",
    remarks: "Quotation QTN/2026/00002 submitted for RFQ/2026/00001."
  },
  {
    id: 3,
    timestamp: "2026-06-06 10:00:00",
    user: "Procurement Officer",
    action: "Submit for Approval",
    remarks: "Quotation QTN/2026/00001 submitted for approval workflow."
  }
];
