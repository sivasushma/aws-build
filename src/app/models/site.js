'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const siteSchema = new Schema({
  tenant_id: {type: Schema.Types.ObjectId, ref: 'Users'},
  siteName: {type: String},
  address: {type: String},
  state: {type: Schema.Types.ObjectId},
  country: {type: Schema.Types.ObjectId},
  city: {type: String},
  zip: {type: String},
  active: {type: Boolean},
  buildings: [{_id: Schema.Types.ObjectId, name: String, active: Boolean}],
}, {
  timestamps: true,
});

export default mongoose.model('Site', siteSchema, 'sites');
