'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const roleSchema = new Schema({
  name: {
    type: String
  },
  access_list: [{
    type: Schema.Types.ObjectId,
    ref: 'Feature',
    default: null
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  tenant_id: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null
  },
  status: {
    type: Boolean,
    default: true
  },
  type: {
    type: String
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

var _default = _mongoose.default.model('Role', roleSchema, 'roles');

exports.default = _default;