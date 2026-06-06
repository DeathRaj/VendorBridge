# -*- coding: utf-8 -*-
from odoo import models, fields

class VendorBridgeVendor(models.Model):
    _name = 'vendor.bridge.vendor'
    _description = 'Vendor'

    name = fields.Char(string='Name', required=True)
    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    gst_number = fields.Char(string='GST Number')
    category = fields.Selection([
        ('goods', 'Goods'),
        ('services', 'Services'),
        ('construction', 'Construction'),
        ('other', 'Other')
    ], string='Category', default='goods')
    status = fields.Selection([
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('blacklisted', 'Blacklisted')
    ], string='Status', default='active')
    rating = fields.Selection([
        ('1', '1 Star'),
        ('2', '2 Stars'),
        ('3', '3 Stars'),
        ('4', '4 Stars'),
        ('5', '5 Stars')
    ], string='Rating', default='3')
