'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const tenantSchema = new Schema({
  name: {type: String},
  addt_info: {type: String},
  email_id: {type: String, unique: true},
  account_no: {type: String, unique: true},
  expiry_date: {type: Date},
  created_by: {type: Schema.Types.ObjectId, ref: 'User', default: null},
  type: {type: String, enum: ['Commercial', 'Residential']},
  onHoldExpiry: {type: Number, default: 5},
  show_alert_from: {type: Number, default: 15},
  allocated_untis: {type: Number},
  subscription_type: {type: String, enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'], default: 'Monthly'},
  price: {type: Number},
  is_expired: {type: Boolean, default: true},
}, {
  timestamps: true,
});


export default mongoose.model('Tenant', tenantSchema);
