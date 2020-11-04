import {PasswordService, SessionsService, UsersService} from '../services/index';

/**
 * @export
 * @class AuthenticationMiddleware
 */
export default class AuthenticationMiddleware {
  /**
   * @param {Request} request HTTP request
   * @param {Response} response HTTP response
   * @param {Function} next next function
   * @memberof AuthenticationMiddleware
   */
  parseAuthorizationHeader(request, response, next) {
    if (request.headers.authorization) {
      request.token = request.headers.authorization.split('Bearer ')[1];
      next();
    } else {
      next({code: 401, name: 'unauthorized', message: 'no auth header'});
    }
  }

  /**
   * @param {Request} request
   * @param {Response} response
   * @param {Function} next next function
   * @memberof AuthenticationMiddleware
   */
  authenticate(request, response, next) {
    SessionsService
        .prototype
        .getCurrentUser(request.token)
        .then((session) => {
          const bypassAuth = AuthenticationMiddleware.prototype.authenticateRoutes(request.originalUrl, session.features);
          if (bypassAuth == false) {
            return next({code: 401, name: 'unauthoirzed', message: 'Access Denied'});
          }
          request.current_user = session.user_id;
          request.session = session;
          next();
        }).catch((error) => {
          error.code = 401;
          next(error);
        });
  };

  /**
   * @param {Request} request
   * @param {Response} response
   * @param {Function} next
   * @memberof AuthenticationMiddleware
   */
  authenticate_user(request, response, next) {
    UsersService
        .prototype
        .getUserByEmail(request.body.email)
        .then((user) => {
          if (PasswordService.compare_password(request.body.password, user.password)) {
            next();
          } else {
            next({code: 401, name: 'invalid_credentials', message: 'Authentication Failed'});
          }
        })
        .catch((error) => next({code: 401, name: 'invalid_credentials', message: 'Authentication Failed'}));
  }

  /**
   * @param {*} role
   * @return {Function} pass controll
   * @memberof AuthenticationMiddleware
   */
  authorize(role) {
    return (request, response, next) => {
      if (request.current_user && request.current_user.role === role) {
        next();
      } else {
        next({code: 401, name: 'access_denied', message: 'Access Denied'});
      }
    };
  }

  /**
   * @param {String} url Request url
   * @param {Array} features Array of features assigned to User
   * @return {Boolean}
   * @memberof AuthenticationMiddleware
   * @description returns authorization bypass value
   */
  authenticateRoutes(url, features) {
    console.log('>>>>>>>>>>>>>>>>>>>>');
    let bypassAuth = false;
    for (const i in features) {
      // skipping auth for country url
      if (url.indexOf('/users/country')>-1) {
        bypassAuth = true;
      } else if (features[i].indexOf('User Management') > -1) {
        bypassAuth = true;
        break;
      }
    }
    return bypassAuth;
  }
};


