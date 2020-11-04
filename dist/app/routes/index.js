"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UtilityRoutes = exports.OpenRoutes = exports.SecureRoutes = void 0;

var _express = _interopRequireDefault(require("express"));

var _otps_route = _interopRequireDefault(require("./otps_route"));

var _users_route = require("./users_route");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SecureRouter = _express.default.Router();

exports.SecureRoutes = SecureRouter;

const OpenRouter = _express.default.Router();

exports.OpenRoutes = OpenRouter;

const UtilityRouter = _express.default.Router();

exports.UtilityRoutes = UtilityRouter;
SecureRouter.use('/users', _users_route.UserSecureRoutes);
UtilityRouter.use('/utils', _users_route.UtilityRoutes);
OpenRouter.use('/users', _users_route.UserOpenRoutes).use('/otps', _otps_route.default);