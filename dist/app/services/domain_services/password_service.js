"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _randexp = _interopRequireDefault(require("randexp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PasswordService {
  generatePassword() {
    return new Promise((resolve, reject) => {
      resolve(new _randexp.default(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])([#!@$%&])([A-Z])([a-z])([0-9])([#!@$%&]).{6}$/).gen());
    });
  }

  bcrypt_password(password) {
    const salt = _bcryptjs.default.genSaltSync(10);

    return _bcryptjs.default.hashSync(password, salt);
  }

  static compare_password(password, hash) {
    return _bcryptjs.default.compareSync(password, hash);
  }

}

exports.default = PasswordService;