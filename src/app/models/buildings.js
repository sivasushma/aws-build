'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const buildingSchema = new Schema({
  name: {type: String},
  tenant_id: {type: Schema.Types.ObjectId, ref: 'Tenant', required: true},

}, {
  timestamps: true,
});

export default mongoose.model('Building', buildingSchema, 'buildings');
