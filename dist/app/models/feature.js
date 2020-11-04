'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const adminType = ['admin', 'non-admin'];
const Schema = _mongoose.default.Schema;
const featureSchema = new Schema({
  name: {
    type: String
  },
  category: {
    type: String
  },
  type: {
    type: String,
    enum: adminType,
    default: adminType[0]
  }
}, {
  timestamps: true
});

var _default = _mongoose.default.model('Feature', featureSchema, 'features');

exports.default = _default;