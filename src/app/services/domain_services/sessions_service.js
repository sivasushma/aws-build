import {
  Session,
  User,
  Role,
} from '../../models/index';
import mongoose from 'mongoose';
import _ from 'lodash';
import Utils from '../../utilities/utils';
const axios = require('axios');
const https = require('https');
export default class SessionsService {
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
        features: args.role.features,
      };
      Session.create(userObj, (error, session) => {
        if (error) {
          console.log(error);
          reject({
            code: 422,
            name: 'unprocessable_entity',
            message: 'Something went wrong',
          });
        } else {
          resolve(session);
        }
      });
    });
  };

  // Method for creating vvdn session
  createVvdnSession(tenantId, oauth) {
    return new Promise((resolve, reject) => {
      Utils.prototype.getReqId().then((reqId) => {
        const options = {
          // uri : 'http://localhost:3200/api/v1/user-management/users/residential/search',
          uri: 'https://Host:port/api/v1/initSession?tenantId=' + tenantId + '&oauth=' + oauth + '&reqId=' + reqId,
          headers: {
            'Authorization': 'Bearer ' + oauth,
          },
          json: true,
        };
        console.log('VVDN session created');
        rp(options)
            .then((result) => {
              resolve(result.status);
            })
            .catch((error) => {
              reject(error);
            });
      }).catch((err) => {
        reject(error);
      });
    });
  }


  deleteUserSession(token) {
    return new Promise((resolve, reject) => {
      Session.findOne({
        'token': token,
      }).exec().then((session) => {
        Session.updateOne({
          'token': session.token,
        }, {
          $set: {
            deletedAt: new Date(),
          },
        }).exec().then((session) => {
          // this.closeVvdnSession(session.tenant_id, token)
          resolve('successfully logged out');
        }).catch((error) => reject({
          code: 422,
          name: 'unprocessable_entity',
          message: 'Something went wrong',
        }));
      });
    });
  }

  // Method to delete VVDN session
  closeVvdnSession(tenantId, oauth) {
    return new Promise((resolve, reject) => {
      Utils.prototype.getReqId().then((reqId) => {
        const options = {
          // uri : 'http://localhost:3200/api/v1/user-management/users/residential/search',
          uri: 'https://Host:port/api/v1/terminateSession?tenantId=' + tenantId + '&oauth=' + oauth + '&reqId=' + reqId,
          headers: {
            'Authorization': 'Bearer ' + oauth,
          },
          json: true,
        };
        console.log('VVDN session closed');
        rp(options)
            .then((result) => {
              resolve(result.status);
            })
            .catch((error) => {
              reject(error);
            });
      }).catch((err) => {
        reject(error);
      });
    });
  }

  getCurrentUser(token) {
    return new Promise((resolve, reject) => {
      Session
          .findOne({
            token,
            deletedAt: {
              $exists: false,
            },
          })
      // .populate({ path: 'user_id', select: 'name role email password' })
          .lean()
          .exec()
          .then((session) => {
            if (session && session.user_id) {
              resolve(session);
            } else {
              reject({
                code: 401,
                name: 'unauthorized',
                message: 'Authentication failed',
              });
            }
          })
          .catch((error) => reject(error));
    });
  };

  // Method for getting vvdn access token
  getDeviceAccessToken(tenantId, oauth) {
    return new Promise((resolve, reject) => {
      // Making request to VVDn API
      const instance = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      Utils.prototype.getReqId().then((reqId) => {
        instance.post('https://ec2-54-203-61-54.us-west-2.compute.amazonaws.com:8000/auth/v1/getAccessToken?tenantId=' + tenantId + '&ouath=' + oauth + '&reqId=' + reqId,
        ).then((result) => {
          resolve({
            aaccessToken: result.data.accessToken,
            tenantId : tenantId
          });
        }).catch((error) => {
          console.log(error);
          reject({message: 'Error occured while calling VVDN API'});
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
};
