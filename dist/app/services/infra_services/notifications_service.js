"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _request = _interopRequireDefault(require("request"));

var _config = _interopRequireDefault(require("config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NotificationsService {
  sendWelcomeEmail(user, old_password) {
    const welcomeConfig = _config.default.get('notifications.welcome');

    const options = {
      method: 'post',
      body: {
        to: {
          'name': user.name,
          'email': user.email
        },
        subject: welcomeConfig.subject,
        content: {
          name: user.name,
          email: user.email,
          password: old_password
        },
        template_name: welcomeConfig.template_name
      },
      json: true,
      url: _config.default.get('notifications.url')
    };
    return new Promise((resolve, reject) => {
      (0, _request.default)(options, (err, res, body) => {
        if (err) {
          console.error('error posting json: ', err);
          reject(err);
        }

        resolve(body);
      });
    });
  }

  sendOTP(user, otp) {
    const notificationConfig = _config.default.get('notifications.otp');

    const options = {
      method: 'post',
      body: {
        to: {
          'name': user.name,
          'email': user.email
        },
        subject: notificationConfig.subject,
        content: {
          name: user.name,
          otp: otp.code
        },
        template_name: notificationConfig.template_name
      },
      json: true,
      url: _config.default.get('notifications.url')
    };
    return new Promise((resolve, reject) => {
      (0, _request.default)(options, (err, res, body) => {
        if (err) {
          console.error('error posting json: ', err);
          reject(err);
        }

        resolve(body);
      });
    });
  }

  send_password(user, password) {
    const notificationConfig = _config.default.get('notifications.new_password');

    const options = {
      method: 'post',
      body: {
        to: {
          'name': user.name,
          'email': user.email
        },
        subject: notificationConfig.subject,
        content: {
          name: user.name,
          password: password
        },
        template_name: notificationConfig.template_name
      },
      json: true,
      url: _config.default.get('notifications.url')
    };
    return new Promise((resolve, reject) => {
      (0, _request.default)(options, (err, res, body) => {
        if (err) {
          console.error('error posting json: ', err);
          reject(err);
        }

        resolve(body);
      });
    });
  }

}

exports.default = NotificationsService;