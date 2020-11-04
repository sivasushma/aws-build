/*
 * Main file
 */
import newrelic from 'newrelic'
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import config from 'config';
import swaggerSpec from './config/swagger';
import path from 'path';

import {
  AuthenticationMiddleware,
} from './app/middleware/index';

import {
  SecureRoutes,
  OpenRoutes,
  UtilityRoutes,
} from './app/routes/index';

const app = express();


app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Strict-Transport-Security', 'max-age=7776000;includeSubDomains');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, domain, cache-control,Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Set Cache Control
  res.header('X-Frame-Options', 'sameorigin');
  res.header('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') {
    console.log('this is the request with headers', req.headers);
    return res.status(200).end();
  }
  // Pass to next layer of middleware
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
})); */// Setting up request headers to support Angular applications

/*  DB Connection */
mongoose.connect(process.env.DB_URL || config.get('database.url'), {useNewUrlParser: true, useUnifiedTopology: true});

/* Middlewares */
app.use(morgan('combined')); // logging
app.use(bodyParser.json()); // parsing request body
app.use(bodyParser.urlencoded({extended: true}));// parsing request queries
app.use('/tenants', express.static(path.join(__dirname, 'public/uploads')));
app.use(config.get('v1_base_path'), express.static('public'));


app.use(
    config.get('v1_base_path') + '/document',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
);

app.use(
    config.get('v1_base_path'),
    UtilityRoutes,
);

app.use(
    config.get('v1_base_path'),
    AuthenticationMiddleware.prototype.parseAuthorizationHeader,
    OpenRoutes,
);

app.use(
    config.get('v1_base_path'),
    AuthenticationMiddleware.prototype.parseAuthorizationHeader,
    AuthenticationMiddleware.prototype.authenticate,
    SecureRoutes,
);

app.use(function(err, req, res, next) {
  console.log(err, err);
  res.status(err.code || 500)
      .json({error: err.name, error_description: err.message});
});

export default app;
