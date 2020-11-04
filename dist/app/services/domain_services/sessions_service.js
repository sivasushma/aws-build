"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../models/index");

var _mongoose = _interopRequireDefault(require("mongoose"));

var _lodash = _interopRequireDefault(require("lodash"));

var _utils = _interopRequireDefault(require("../../utilities/utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const axios = require('axios');

const https = require('https');

class SessionsService {
  createUserSession(args) {
    return new Promise((resolve, reject) => {
      const userObj = {
        user_id: args.user_id,
        token: args.token,
        tenant_id: args.tenant_id,
        role: args.role.name,
        role_id: args.role._id,
        role_type: args.role.type,
        license_type: args.license_type,
        timezone: args.timezone,
        user_name: args.firstName + ' ' + args.lastName,
        fcm_token: args.fcm_token,
        features: args.role.features
      };

      _index.Session.create(userObj, (error, session) => {
        if (error) {
          console.log(error);
          reject({
            code: 422,
            name: 'unprocessable_entity',
            message: 'Something went wrong'
          });
        } else {
          resolve(session);
        }
      });
    });
  }

  // Method for creating vvdn session
  createVvdnSession(tenantId, oauth) {
    return new Promise((resolve, reject) => {
      _utils.default.prototype.getReqId().then(reqId => {
        const options = {
          // uri : 'http://localhost:3200/api/v1/user-management/users/residential/search',
          uri: 'https://Host:port/api/v1/initSession?tenantId=' + tenantId + '&oauth=' + oauth + '&reqId=' + reqId,
          headers: {
            'Authorization': 'Bearer ' + oauth
          },
          json: true
        };
        console.log('VVDN session created');
        rp(options).then(result => {
          resolve(result.status);
        }).catch(error => {
          reject(error);
        });
      }).catch(err => {
        reject(error);
      });
    });
  }

  deleteUserSession(token) {
    return new Promise((resolve, reject) => {
      _index.Session.findOne({
        'token': token
      }).exec().then(session => {
        _index.Session.updateOne({
          'token': session.token
        }, {
          $set: {
            deletedAt: new Date()
          }
        }).exec().then(session => {
          // this.closeVvdnSession(session.tenant_id, token)
          resolve('successfully logged out');
        }).catch(error => reject({
          code: 422,
          name: 'unprocessable_entity',
          message: 'Something went wrong'
        }));
      });
    });
  } // Method to delete VVDN session


  closeVvdnSession(tenantId, oauth) {
    return new Promise((resolve, reject) => {
      _utils.default.prototype.getReqId().then(reqId => {
        const options = {
          // uri : 'http://localhost:3200/api/v1/user-management/users/residential/search',
          uri: 'https://Host:port/api/v1/terminateSession?tenantId=' + tenantId + '&oauth=' + oauth + '&reqId=' + reqId,
          headers: {
            'Authorization': 'Bearer ' + oauth
          },
          json: true
        };
        console.log('VVDN session closed');
        rp(options).then(result => {
          resolve(result.status);
        }).catch(error => {
          reject(error);
        });
      }).catch(err => {
        reject(error);
      });
    });
  }

  getCurrentUser(token) {
    return new Promise((resolve, reject) => {
      _index.Session.findOne({
        token,
        deletedAt: {
          $exists: false
        }
      }) // .populate({ path: 'user_id', select: 'name role email password' })
      .lean().exec().then(session => {
        if (session && session.user_id) {
          resolve(session);
        } else {
          reject({
            code: 401,
            name: 'unauthorized',
            message: 'Authentication failed'
          });
        }
      }).catch(error => reject(error));
    });
  }

  // Method for getting vvdn access token
  getDeviceAccessToken(tenantId, oauth) {
    return new Promise((resolve, reject) => {
      // Making request to VVDn API
      const instance = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });

      _utils.default.prototype.getReqId().then(reqId => {
        instance.post('https://ec2-54-203-61-54.us-west-2.compute.amazonaws.com:8000/auth/v1/getAccessToken?tenantId=' + tenantId + '&ouath=' + oauth + '&reqId=' + reqId).then(result => {
          resolve({
            aaccessToken: result.data.accessToken,
            tenantId: tenantId
          });
        }).catch(error => {
          console.log(error);
          reject({
            message: 'Error occured while calling VVDN API'
          });
        });
      }).catch(err => {
        reject(err);
      });
    });
  }

}

exports.default = SessionsService;
;