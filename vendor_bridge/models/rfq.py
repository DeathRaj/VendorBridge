# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class VendorBridgeRfq(models.Model):
    _name = 'vendor.bridge.rfq'
    _description = 'Request For Quotation'
    _order = 'id desc'

    name = fields.Char(string='RFQ Reference', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    title = fields.Char(string='Title', required=True)
    product_details = fields.Text(string='Product/Service Details')
    quantity = fields.Float(string='Quantity', default=1.0)
    deadline = fields.Date(string='Deadline Date', required=True)
    assigned_vendor_ids = fields.Many2many('vendor.bridge.vendor', string='Assigned Vendors')
    status = fields.Selection([
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('received', 'Quotations Received'),
        ('closed', 'Closed'),
        ('cancelled', 'Cancelled')
    ], string='Status', default='draft')
    line_ids = fields.One2many('vendor.bridge.rfq.line', 'rfq_id', string='RFQ Lines')
    quotation_ids = fields.One2many('vendor.bridge.quotation', 'rfq_id', string='Quotations')

    @api.model
    def create(self, vals):
        if vals.get('name', _('New')) == _('New'):
            vals['name'] = self.env['ir.sequence'].next_by_code('vendor.bridge.rfq') or _('New')
        rfq = super(VendorBridgeRfq, self).create(vals)
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.rfq',
            'res_id': rfq.id,
            'action': 'Create',
            'remarks': 'RFQ %s created.' % rfq.name
        })
        return rfq

    def action_send_rfq(self):
        self.ensure_one()
        self.status = 'sent'
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.rfq',
            'res_id': self.id,
            'action': 'Send RFQ',
            'remarks': 'RFQ sent to assigned vendors.'
        })

    def action_cancel(self):
        self.ensure_one()
        self.status = 'cancelled'
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.rfq',
            'res_id': self.id,
            'action': 'Cancel RFQ',
            'remarks': 'RFQ cancelled.'
        })


class VendorBridgeRfqLine(models.Model):
    _name = 'vendor.bridge.rfq.line'
    _description = 'RFQ Line'

    rfq_id = fields.Many2one('vendor.bridge.rfq', string='RFQ', ondelete='cascade')
    product_name = fields.Char(string='Product/Service Name', required=True)
    description = fields.Text(string='Description')
    quantity = fields.Float(string='Quantity', default=1.0, required=True)
