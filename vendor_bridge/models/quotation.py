# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class VendorBridgeQuotation(models.Model):
    _name = 'vendor.bridge.quotation'
    _description = 'Vendor Quotation'
    _order = 'id desc'

    name = fields.Char(string='Quotation Reference', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    rfq_id = fields.Many2one('vendor.bridge.rfq', string='RFQ', required=True, ondelete='cascade')
    vendor_id = fields.Many2one('vendor.bridge.vendor', string='Vendor', required=True)
    price = fields.Float(string='Price', help="Base price if lines are not used")
    delivery_days = fields.Integer(string='Delivery Lead Time (Days)')
    notes = fields.Text(string='Notes')
    status = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], string='Status', default='draft')
    line_ids = fields.One2many('vendor.bridge.quotation.line', 'quotation_id', string='Quotation Lines')
    total_amount = fields.Float(string='Total Amount', compute='_compute_total_amount', store=True)

    @api.depends('line_ids.subtotal', 'price')
    def _compute_total_amount(self):
        for record in self:
            if record.line_ids:
                record.total_amount = sum(line.subtotal for line in record.line_ids)
            else:
                record.total_amount = record.price

    @api.model
    def create(self, vals):
        if vals.get('name', _('New')) == _('New'):
            vals['name'] = self.env['ir.sequence'].next_by_code('vendor.bridge.quotation') or _('New')
        qtn = super(VendorBridgeQuotation, self).create(vals)
        
        # Update RFQ status if received
        if qtn.rfq_id and qtn.rfq_id.status in ['draft', 'sent']:
            qtn.rfq_id.status = 'received'
            
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.quotation',
            'res_id': qtn.id,
            'action': 'Create',
            'remarks': 'Quotation %s created for RFQ %s' % (qtn.name, qtn.rfq_id.name)
        })
        return qtn

    def action_submit_for_approval(self):
        self.ensure_one()
        self.status = 'under_review'
        
        existing_approval = self.env['vendor.bridge.approval'].search([
            ('quotation_id', '=', self.id),
            ('status', '=', 'pending')
        ], limit=1)
        
        if not existing_approval:
            self.env['vendor.bridge.approval'].create({
                'quotation_id': self.id,
                'status': 'pending',
                'remarks': 'Quotation submitted for review.'
            })
            
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.quotation',
            'res_id': self.id,
            'action': 'Submit for Approval',
            'remarks': 'Quotation submitted, approval workflow started.'
        })

    def action_approve(self):
        self.ensure_one()
        self.status = 'approved'
        approval = self.env['vendor.bridge.approval'].search([
            ('quotation_id', '=', self.id),
            ('status', '=', 'pending')
        ], limit=1)
        if approval:
            approval.write({
                'status': 'approved',
                'remarks': 'Approved directly from Quotation.',
                'approver_id': self.env.user.id,
            })
        else:
            self.env['vendor.bridge.approval'].create({
                'quotation_id': self.id,
                'status': 'approved',
                'remarks': 'Approved directly.',
                'approver_id': self.env.user.id,
            })
            
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.quotation',
            'res_id': self.id,
            'action': 'Approve',
            'remarks': 'Quotation approved by %s.' % self.env.user.name
        })

    def action_reject(self):
        self.ensure_one()
        self.status = 'rejected'
        approval = self.env['vendor.bridge.approval'].search([
            ('quotation_id', '=', self.id),
            ('status', '=', 'pending')
        ], limit=1)
        if approval:
            approval.write({
                'status': 'rejected',
                'remarks': 'Rejected from Quotation.',
                'approver_id': self.env.user.id,
            })
        else:
            self.env['vendor.bridge.approval'].create({
                'quotation_id': self.id,
                'status': 'rejected',
                'remarks': 'Rejected directly.',
                'approver_id': self.env.user.id,
            })
            
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.quotation',
            'res_id': self.id,
            'action': 'Reject',
            'remarks': 'Quotation rejected.'
        })

    def action_generate_po(self):
        self.ensure_one()
        if self.status != 'approved':
            raise UserError(_("You can only generate a Purchase Order from an Approved Quotation."))
        
        # Check if PO already exists
        existing_po = self.env['vendor.bridge.purchase.order'].search([('quotation_id', '=', self.id)], limit=1)
        if existing_po:
            raise UserError(_("A Purchase Order has already been generated for this Quotation: %s") % existing_po.po_number)
            
        po_vals = {
            'quotation_id': self.id,
            'vendor_id': self.vendor_id.id,
            'total_amount': self.total_amount,
            'status': 'draft',
        }
        po = self.env['vendor.bridge.purchase.order'].create(po_vals)
        
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.quotation',
            'res_id': self.id,
            'action': 'Generate Purchase Order',
            'remarks': 'Generated Purchase Order %s from quotation %s' % (po.po_number, self.name)
        })
        
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'vendor.bridge.purchase.order',
            'view_mode': 'form',
            'res_id': po.id,
            'target': 'current',
        }


class VendorBridgeQuotationLine(models.Model):
    _name = 'vendor.bridge.quotation.line'
    _description = 'Quotation Line'

    quotation_id = fields.Many2one('vendor.bridge.quotation', string='Quotation', ondelete='cascade')
    product_name = fields.Char(string='Product/Service Name', required=True)
    quantity = fields.Float(string='Quantity', default=1.0, required=True)
    unit_price = fields.Float(string='Unit Price', required=True)
    subtotal = fields.Float(string='Subtotal', compute='_compute_subtotal', store=True)

    @api.depends('quantity', 'unit_price')
    def _compute_subtotal(self):
        for line in self:
            line.subtotal = line.quantity * line.unit_price
