'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const floorSchema = new Schema({
  name: {type: String},
  description: {type: String},
  type: {type: String},
  image: {
    url: {type: String}, x: {type: String}, y: {type: String}, w: {type: String},
    h: {type: String},
  },
  number: {type: String},
  stations: [{
    bollards: [{}],
    name: {type: String},
    guard_id: [{type: Schema.Types.ObjectId, ref: 'User'}],
    coordinates: [],
    type: {type: String},
    stationId: {type: String},
  }],
  supervisor_id: {type: Schema.Types.ObjectId, ref: 'User'},
  building_id: {type: Schema.Types.ObjectId, ref: 'Building'},
  tenant_id: {type: Schema.Types.ObjectId, ref: 'Tenant'},
  active: {type: Boolean, default: true},
}, {
  timestamps: true,
  versionKey: false,
  autoIndex: false,
});

export default mongoose.model('Floor', floorSchema, 'floors');
