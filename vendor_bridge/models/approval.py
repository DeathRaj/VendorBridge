# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class VendorBridgeApproval(models.Model):
    _name = 'vendor.bridge.approval'
    _description = 'Quotation Approval'
    _order = 'id desc'

    quotation_id = fields.Many2one('vendor.bridge.quotation', string='Quotation', required=True, ondelete='cascade')
    approver_id = fields.Many2one('res.users', string='Approver', required=True, default=lambda self: self.env.user)
    status = fields.Selection([
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], string='Status', default='pending', required=True)
    remarks = fields.Text(string='Remarks')
    date = fields.Datetime(string='Approval Date', default=fields.Datetime.now)

    @api.model
    def create(self, vals):
        approval = super(VendorBridgeApproval, self).create(vals)
        # Log activity
        self.env['vendor.bridge.activity.log'].create({
            'model_name': 'vendor.bridge.approval',
            'res_id': approval.id,
            'action': 'Create Approval',
            'remarks': 'Approval request created for Quotation %s.' % approval.quotation_id.name
        })
        return approval

    def write(self, vals):
        res = super(VendorBridgeApproval, self).write(vals)
        if 'status' in vals:
            for record in self:
                # Sync status with quotation
                if vals['status'] == 'approved' and record.quotation_id.status != 'approved':
                    record.quotation_id.status = 'approved'
                elif vals['status'] == 'rejected' and record.quotation_id.status != 'rejected':
                    record.quotation_id.status = 'rejected'
                
                # Log activity
                self.env['vendor.bridge.activity.log'].create({
                    'model_name': 'vendor.bridge.approval',
                    'res_id': record.id,
                    'action': 'Update Status',
                    'remarks': 'Approval %s. Remarks: %s' % (record.status.upper(), record.remarks or '')
                })
        return res
