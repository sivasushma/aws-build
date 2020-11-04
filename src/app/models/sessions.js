'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  user_id: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
  token: {type: String, required: true, unique: true},
  tenant_id: {type: Schema.Types.ObjectId, ref: 'Tenant', default: null},
  deletedAt: {type: Date, expires: 60},
  role: {type: String},
  role_id: {type: Schema.Types.ObjectId},
  role_type: {type: String},
  license_type: {type: String},
  timezone: {type: String},
  user_name: {type: String},
  fcm_token: {type: String},
  features: [],

}, {
  timestamps: true,
});
export default mongoose.model('Session', sessionSchema, 'sessions');
