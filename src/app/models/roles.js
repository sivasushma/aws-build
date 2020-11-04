'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: {type: String},
  access_list: [{type: Schema.Types.ObjectId, ref: 'Feature', default: null}],
  created_at: {type: Date, default: Date.now},
  tenant_id: {type: Schema.Types.ObjectId, ref: 'Tenant', default: null},
  status: {type: Boolean, default: true},
  type: {type: String},
  description: {type: String},
}, {
  timestamps: true,
});

export default mongoose.model('Role', roleSchema, 'roles');
