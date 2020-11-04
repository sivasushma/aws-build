'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const siteSchema = new Schema({
  tenant_id: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  siteName: {
    type: String
  },
  address: {
    type: String
  },
  state: {
    type: Schema.Types.ObjectId
  },
  country: {
    type: Schema.Types.ObjectId
  },
  city: {
    type: String
  },
  zip: {
    type: String
  },
  active: {
    type: Boolean
  },
  buildings: [{
    _id: Schema.Types.ObjectId,
    name: String,
    active: Boolean
  }]
}, {
  timestamps: true
});

var _default = _mongoose.default.model('Site', siteSchema, 'sites');

exports.default = _default;