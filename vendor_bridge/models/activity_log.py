# -*- coding: utf-8 -*-
from odoo import models, fields

class VendorBridgeActivityLog(models.Model):
    _name = 'vendor.bridge.activity.log'
    _description = 'Activity Log'
    _order = 'timestamp desc'

    user_id = fields.Many2one('res.users', string='User', required=True, default=lambda self: self.env.user)
    model_name = fields.Char(string='Model/Entity')
    res_id = fields.Integer(string='Resource ID')
    action = fields.Char(string='Action Done')
    remarks = fields.Text(string='Remarks')
    timestamp = fields.Datetime(string='Timestamp', default=fields.Datetime.now)
