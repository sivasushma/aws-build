'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _underscore = _interopRequireDefault(require("underscore"));

var _validators = require("../validators");

var _services = require("../services");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const userSchema = new Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  middleName: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    min: 8,
    validate: {
      validator: _validators.PasswordValidator.validate,
      message: 'should contain atleast one uppercase, one lowercase, one number and one special character. Allowed special characters are #?!@$%^&*-'
    }
  },
  password_history: [String],
  phone_no: {
    type: String
  },
  dob: {
    type: Date
  },
  empId: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: 'State',
    default: null
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    requried: true
  },
  tenant_id: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
  reporting_manager: [{
    type: Schema.Types.ObjectId
  }],
  zipcode: {
    type: String
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    default: null
  },
  profile_pic: {
    type: String
  },
  stations_assigned: [{
    type: Schema.Types.ObjectId
  }],
  building_id: [{
    type: Schema.Types.ObjectId
  }]
}, {
  timestamps: true,
  versionKey: false
});
userSchema.index({
  firstName: 'text'
});
userSchema.pre('validate', function (next) {
  if (!this.isModified('password')) return next();

  const password_compares = _underscore.default.map(this.password_history, prev_password => {
    return _services.PasswordService.compare_password(this.password, prev_password);
  });

  if (_underscore.default.some(password_compares)) {
    next({
      code: 422,
      name: 'unprocessable_entity',
      message: 'Password already used previously, Please choose another password.'
    });
  } else {
    next();
  }
});
userSchema.pre('save', function (next) {
  if (this.isModified('password') && this.password) {
    this.password = _services.PasswordService.prototype.bcrypt_password(this.password);
    this.password_history.unshift(this.password);
    this.password_history = this.password_history.slice(0, 8);
  }

  next();
});

var _default = _mongoose.default.model('User', userSchema, 'users');

exports.default = _default;