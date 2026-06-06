# -*- coding: utf-8 -*-
{
    'name': 'VendorBridge',
    'version': '1.0.0',
    'summary': 'Custom Odoo module for Procurement & Vendor Management ERP',
    'description': """
        VendorBridge custom module provides capabilities for:
        - Vendor Management
        - RFQ (Request for Quotations) Creation
        - Vendor Quotation Submission & Lines
        - Quotation Comparison
        - Approval Workflow
        - Purchase Order Generation
        - Invoice Generation and payment logging
        - ERP Activity Log audit trail
    """,
    'author': 'DeathRaj',
    'category': 'Purchases',
    'depends': ['base'],
    'data': [
        'security/security_groups.xml',
        'security/ir.model.access.csv',
        'data/ir_sequence_data.xml',
        'views/vendor_views.xml',
        'views/rfq_views.xml',
        'views/quotation_views.xml',
        'views/approval_views.xml',
        'views/purchase_order_views.xml',
        'views/invoice_views.xml',
        'views/activity_log_views.xml',
        'views/menus.xml',
        'reports/purchase_order_report.xml',
        'reports/invoice_report.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
