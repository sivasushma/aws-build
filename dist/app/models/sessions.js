'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const sessionSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  tenant_id: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null
  },
  deletedAt: {
    type: Date,
    expires: 60
  },
  role: {
    type: String
  },
  role_id: {
    type: Schema.Types.ObjectId
  },
  role_type: {
    type: String
  },
  license_type: {
    type: String
  },
  timezone: {
    type: String
  },
  user_name: {
    type: String
  },
  fcm_token: {
    type: String
  },
  features: []
}, {
  timestamps: true
});

var _default = _mongoose.default.model('Session', sessionSchema, 'sessions');

exports.default = _default;