'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const countrySchema = new Schema({
  name: {
    type: String
  },
  code: {
    type: String
  },
  geonameId: {
    type: Number
  },
  active: {
    type: Boolean
  }
}, {
  timestamps: true
});

var _default = _mongoose.default.model('Country', countrySchema, 'countries');

exports.default = _default;