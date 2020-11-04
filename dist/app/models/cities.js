'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const citiesSchema = new Schema({
  name: {
    type: String
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: 'State',
    default: null
  },
  state_code: {
    type: String
  },
  country_code: {
    type: String
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    default: null
  },
  zipcodes: []
}, {
  timestamps: true
});

var _default = _mongoose.default.model('City', citiesSchema, 'cities');

exports.default = _default;