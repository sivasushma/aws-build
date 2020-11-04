"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _swaggerJsdoc = _interopRequireDefault(require("swagger-jsdoc"));

var _config = _interopRequireDefault(require("config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const swaggerDefinition = {
  info: {
    title: 'PWC Startup Db Users Management Domain API\'S',
    version: '1.0.0',
    description: 'PWC'
  },
  basePath: process.env.SWAGGER_BASE_PATH || _config.default.get('v1_base_path'),
  securityDefinitions: {
    'Bearer': {
      'type': 'apiKey',
      'in': 'header',
      'name': 'Authorization'
    }
  },
  security: [{
    'Bearer': []
  }]
};
const options = {
  swaggerDefinition,
  apis: ['docs/*_swagger.js'] // <-- not in the definition, but in the options

};

var _default = (0, _swaggerJsdoc.default)(options);

exports.default = _default;