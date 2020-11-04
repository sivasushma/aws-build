"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _newrelic = _interopRequireDefault(require("newrelic"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _morgan = _interopRequireDefault(require("morgan"));

var _swaggerUiExpress = _interopRequireDefault(require("swagger-ui-express"));

var _config = _interopRequireDefault(require("config"));

var _swagger = _interopRequireDefault(require("./config/swagger"));

var _path = _interopRequireDefault(require("path"));

var _index = require("./app/middleware/index");

var _index2 = require("./app/routes/index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Main file
 */
const app = (0, _express.default)();
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Strict-Transport-Security', 'max-age=7776000;includeSubDomains'); // Request methods you wish to allow

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'); // Request headers you wish to allow

  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, domain, cache-control,Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers'); // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)

  res.setHeader('Access-Control-Allow-Credentials', true); // Set Cache Control

  res.header('X-Frame-Options', 'sameorigin');
  res.header('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    console.log('this is the request with headers', req.headers);
    return res.status(200).end();
  } // Pass to next layer of middleware


  next();
});
/* app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"]
        }
    },
    frameguard: { action: 'deny' },
    noCache: true
})); */

/* app.use(cors({
    origin: process.env.CROSS_ORIGIN,
    exposedHeaders: [
        'total_count',
        'total_pages',
        'current_page',
        'limit'
    ],
    methods: "GET,PUT,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 404
})); */
// Setting up request headers to support Angular applications

/*  DB Connection */

_mongoose.default.connect(process.env.DB_URL || _config.default.get('database.url'), {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
/* Middlewares */


app.use((0, _morgan.default)('combined')); // logging

app.use(_bodyParser.default.json()); // parsing request body

app.use(_bodyParser.default.urlencoded({
  extended: true
})); // parsing request queries

app.use('/tenants', _express.default.static(_path.default.join(__dirname, 'public/uploads')));
app.use(_config.default.get('v1_base_path'), _express.default.static('public'));
app.use(_config.default.get('v1_base_path') + '/document', _swaggerUiExpress.default.serve, _swaggerUiExpress.default.setup(_swagger.default));
app.use(_config.default.get('v1_base_path'), _index2.UtilityRoutes);
app.use(_config.default.get('v1_base_path'), _index.AuthenticationMiddleware.prototype.parseAuthorizationHeader, _index2.OpenRoutes);
app.use(_config.default.get('v1_base_path'), _index.AuthenticationMiddleware.prototype.parseAuthorizationHeader, _index.AuthenticationMiddleware.prototype.authenticate, _index2.SecureRoutes);
app.use(function (err, req, res, next) {
  console.log(err, err);
  res.status(err.code || 500).json({
    error: err.name,
    error_description: err.message
  });
});
var _default = app;
exports.default = _default;