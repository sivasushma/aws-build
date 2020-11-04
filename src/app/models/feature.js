'use strict';
import mongoose from 'mongoose';
const adminType = ['admin', 'non-admin'];

const Schema = mongoose.Schema;

const featureSchema = new Schema({
  name: {type: String},
  category: {type: String},
  type: {type: String, enum: adminType, default: adminType[0]},

}, {
  timestamps: true,
});

export default mongoose.model('Feature', featureSchema, 'features');
