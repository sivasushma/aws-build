import Request from 'request';
import config from 'config';

export default class NotificationsService {
  sendWelcomeEmail(user, old_password) {
    const welcomeConfig = config.get('notifications.welcome');
    const options = {
      method: 'post',
      body: {
        to: {
          'name': user.name,
          'email': user.email,
        },

        subject: welcomeConfig.subject,
        content: {
          name: user.name,
          email: user.email,
          password: old_password,
        },
        template_name: welcomeConfig.template_name,
      },
      json: true,
      url: config.get('notifications.url'),
    };

    return new Promise((resolve, reject) => {
      Request(options, (err, res, body) =>{
        if (err) {
          console.error('error posting json: ', err);
          reject(err);
        }
        resolve(body);
      });
    });
  };

  sendOTP(user, otp) {
    const notificationConfig = config.get('notifications.otp');
    const options = {
      method: 'post',
      body: {
        to: {
          'name': user.name,
          'email': user.email,
        },
        subject: notificationConfig.subject,
        content: {
          name: user.name,
          otp: otp.code,
        },
        template_name: notificationConfig.template_name,
      },
      json: true,
      url: config.get('notifications.url'),
    };

    return new Promise((resolve, reject) => {
      Request(options, (err, res, body) =>{
        if (err) {
          console.error('error posting json: ', err);
          reject(err);
        }
        resolve(body);
      });
    });
  };

  send_password(user, password) {
    const notificationConfig = config.get('notifications.new_password');
    const options = {
      method: 'post',
      body: {
        to: {
          'name': user.name,
          'email': user.email,
        },
        subject: notificationConfig.subject,
        content: {
          name: user.name,
          password: password,
        },
        template_name: notificationConfig.template_name,
      },
      json: true,
      url: config.get('notifications.url'),
    };

    return new Promise((resolve, reject) => {
      Request(options, (err, res, body) =>{
        if (err) {
          console.error('error posting json: ', err);
          reject(err);
        }

        resolve(body);
      });
    });
  };
}
