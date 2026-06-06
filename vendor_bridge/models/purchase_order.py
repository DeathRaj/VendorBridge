# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class VendorBridgePurchaseOrder(models.Model):
    _name = 'vendor.bridge.purchase.order'
    _description = 'Purchase Order'
    _order = 'id desc'

    po_number = fields.Char(string='PO Number', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    quotation_id = fields.Many2one('vendor.bridge.quotation', string='Quotation', required=True)
    vendor_id = fields.Many2one('vendor.bridge.vendor', string='Vendor', required=True)
    total_amount = fields.Float(string='Total Amount', required=True)
    status = fields.Selection([
        ('draft', 'Draft PO'),
        ('confirmed', 'Confirmed PO'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled')
    ], string='Status', default='draft')
    order_date = fields.Date(string='Order Date', default=fields.Date.context_today)
    quotation_line_ids = fields.One2many('vendor.bridge.quotation.line', compute='_compute_quotation_lines', string='Quotation Lines')

    def _compute_quotation_lines(self):
        for order in self:
            order.quotation_line_ids = order.quotation_id.line_ids

    @api.model
    def create(self, vals):
        if vals.get('po_number', _('New')) == _('New'):
            vals['po_number'] = self.env['ir.sequence'].next_by_code('vendor.bridge.purchase.order') or _('New')
        po = super(VendorBridgePurchaseOrder, self).create(vals)
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.purchase.order',
            'res_id': po.id,
            'action': 'Create PO',
            'remarks': 'Purchase Order %s generated.' % po.po_number
        })
        return po

    def action_confirm_order(self):
        self.ensure_one()
        self.status = 'confirmed'
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.purchase.order',
            'res_id': self.id,
            'action': 'Confirm PO',
            'remarks': 'Purchase Order confirmed.'
        })

    def action_generate_invoice(self):
        self.ensure_one()
        if self.status != 'confirmed':
            raise UserError(_("You can only generate an invoice for a Confirmed Purchase Order."))
            
        existing_invoice = self.env['vendor.bridge.invoice'].search([('purchase_order_id', '=', self.id)], limit=1)
        if existing_invoice:
            raise UserError(_("An invoice has already been generated for this Purchase Order: %s") % existing_invoice.invoice_number)
            
        invoice_vals = {
            'purchase_order_id': self.id,
            'tax_amount': self.total_amount * 0.18, # 18% GST default
            'total_amount': self.total_amount * 1.18, # Total with GST
            'status': 'draft',
        }
        invoice = self.env['vendor.bridge.invoice'].create(invoice_vals)
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.purchase.order',
            'res_id': self.id,
            'action': 'Generate Invoice',
            'remarks': 'Generated Invoice %s from PO %s' % (invoice.invoice_number, self.po_number)
        })
        
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'vendor.bridge.invoice',
            'view_mode': 'form',
            'res_id': invoice.id,
            'target': 'current',
        }

    def action_cancel(self):
        self.ensure_one()
        self.status = 'cancelled'
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.purchase.order',
            'res_id': self.id,
            'action': 'Cancel PO',
            'remarks': 'Purchase Order cancelled.'
        })
