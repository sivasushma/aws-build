'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const stateSchema = new Schema({
  name: {type: String},
  code: {type: String},
  country_code: {type: String},
  country: {type: Schema.Types.ObjectId, ref: 'Country', default: null},

}, {
  timestamps: true,
});

export default mongoose.model('State', stateSchema, 'states');
