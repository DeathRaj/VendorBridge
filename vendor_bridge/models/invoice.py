# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class VendorBridgeInvoice(models.Model):
    _name = 'vendor.bridge.invoice'
    _description = 'Invoice'
    _order = 'id desc'

    invoice_number = fields.Char(string='Invoice Number', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    purchase_order_id = fields.Many2one('vendor.bridge.purchase.order', string='Purchase Order', required=True)
    tax_amount = fields.Float(string='Tax Amount', default=0.0)
    total_amount = fields.Float(string='Total Amount', required=True)
    status = fields.Selection([
        ('draft', 'Draft Invoice'),
        ('open', 'Open'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled')
    ], string='Status', default='draft')
    invoice_date = fields.Date(string='Invoice Date', default=fields.Date.context_today)
    quotation_line_ids = fields.One2many('vendor.bridge.quotation.line', compute='_compute_quotation_lines', string='Quotation Lines')

    def _compute_quotation_lines(self):
        for invoice in self:
            invoice.quotation_line_ids = invoice.purchase_order_id.quotation_line_ids

    @api.model
    def create(self, vals):
        if vals.get('invoice_number', _('New')) == _('New'):
            vals['invoice_number'] = self.env['ir.sequence'].next_by_code('vendor.bridge.invoice') or _('New')
        invoice = super(VendorBridgeInvoice, self).create(vals)
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.invoice',
            'res_id': invoice.id,
            'action': 'Create Invoice',
            'remarks': 'Invoice %s generated for PO %s.' % (invoice.invoice_number, invoice.purchase_order_id.po_number)
        })
        return invoice

    def action_post_invoice(self):
        self.ensure_one()
        if self.status != 'draft':
            raise UserError(_("Only draft invoices can be posted."))
        self.status = 'open'
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.invoice',
            'res_id': self.id,
            'action': 'Post Invoice',
            'remarks': 'Invoice %s posted/opened.' % self.invoice_number
        })

    def action_register_payment(self):
        self.ensure_one()
        if self.status != 'open':
            raise UserError(_("Only open invoices can be paid."))
        self.status = 'paid'
        
        # Sync and mark PO as done
        if self.purchase_order_id and self.purchase_order_id.status == 'confirmed':
            self.purchase_order_id.status = 'done'
            
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.invoice',
            'res_id': self.id,
            'action': 'Register Payment',
            'remarks': 'Payment registered for Invoice %s. PO set to DONE.' % self.invoice_number
        })

    def action_cancel(self):
        self.ensure_one()
        self.status = 'cancelled'
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.invoice',
            'res_id': self.id,
            'action': 'Cancel Invoice',
            'remarks': 'Invoice %s cancelled.' % self.invoice_number
        })
