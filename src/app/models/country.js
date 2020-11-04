'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const countrySchema = new Schema({
  name: {type: String},
  code: {type: String},
  geonameId: {type: Number},
  active: {type: Boolean},

}, {
  timestamps: true,
});

export default mongoose.model('Country', countrySchema, 'countries');
