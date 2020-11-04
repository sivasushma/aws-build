"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _index = require("../controllers/v1/index");

var _index2 = require("../middleware/index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Router = _express.default.Router();

Router.route('/').post(_index2.AuthenticationMiddleware.prototype.authenticate_user);
var _default = Router;
exports.default = _default;