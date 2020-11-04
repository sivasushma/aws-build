'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const citiesSchema = new Schema({
  name: {type: String},
  state: {type: Schema.Types.ObjectId, ref: 'State', default: null},
  state_code: {type: String},
  country_code: {type: String},
  country: {type: Schema.Types.ObjectId, ref: 'Country', default: null},
  zipcodes: [],
}, {
  timestamps: true,
});

export default mongoose.model('City', citiesSchema, 'cities');
