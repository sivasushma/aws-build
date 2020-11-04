'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const floorSchema = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  type: {
    type: String
  },
  image: {
    url: {
      type: String
    },
    x: {
      type: String
    },
    y: {
      type: String
    },
    w: {
      type: String
    },
    h: {
      type: String
    }
  },
  number: {
    type: String
  },
  stations: [{
    bollards: [{}],
    name: {
      type: String
    },
    guard_id: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    coordinates: [],
    type: {
      type: String
    },
    stationId: {
      type: String
    }
  }],
  supervisor_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  building_id: {
    type: Schema.Types.ObjectId,
    ref: 'Building'
  },
  tenant_id: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false,
  autoIndex: false
});

var _default = _mongoose.default.model('Floor', floorSchema, 'floors');

exports.default = _default;