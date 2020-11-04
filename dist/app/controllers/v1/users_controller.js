"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../services/index");

class UsersController {
  create(request, response, next) {
    _index.UsersService.prototype.creatNewUser(request, response).then(status => {
      response.status(status.code).json(status.message);
    }).catch(error => next(error));
  }

  list(request, response, next) {
    const args = request.query;
    args.tenant_id = request.session.tenant_id;
    args.timezone = request.session.timezone;

    _index.UsersService.prototype.getUsers(args).then(resp => {
      response.set(resp.headers || {});
      console.log(resp.userData.length);
      response.json(resp);
    }).catch(error => response.json(error));
  }

  login(request, response, next) {
    const reqBody = request.body;
    reqBody.token = request.token;

    _index.UsersService.prototype.login(reqBody).then(session => {
      response.json(session);
    }).catch(error => response.status(422).send({
      error: "Login Error",
      error_description: error
    }));
  }

  // update user role
  update(request, response, next) {
    _index.UsersService.prototype.updateUser(request, response).then(status => {
      response.status(status.code).json(status.message);
    }).catch(error => next(error));
  } // delete user details


  delete(request, response, next) {
    _index.UsersService.prototype.deleteUser(request.params.user_id).then(user => {
      response.json(user);
    }).catch(error => next(error));
  }

  logout(request, response, next) {
    _index.SessionsService.prototype.deleteUserSession(request.token).then(deletesession => {
      response.json({
        'message': deletesession
      });
    });
  }

  forgot_password(request, response, next) {
    _index.UsersService.prototype.getUserByEmail(request.body.email).then(async user => {
      // Generate user password
      const password = await _index.PasswordService.prototype.generatePassword(8); // Save in DB

      _index.UsersService.prototype.updateUser(user._id, {
        password
      }).then(result => {
        response.json({
          message: 'An email sent to registered email address'
        }); // Send notification

        _index.NotificationsService.prototype.send_password(user, password);
      });
    }) // Note: as part generalising messages, we are sending 200 status code to user
    .catch(error => response.json({
      message: 'An email sent to registered email address'
    }));
  }

  change_password(request, response, next) {
    if (_index.PasswordService.compare_password(request.body.old_password, request.current_user.password)) {
      _index.UsersService.prototype.updateUser(request.current_user._id, {
        password: request.body.new_password
      }).then(result => response.json({
        message: 'Password changed successfully'
      })).catch(error => {
        next({
          code: 422,
          name: 'unprocessable_entity',
          message: error.message
        });
      });
    } else {
      next({
        code: 422,
        name: 'unprocessable_entity',
        message: 'Incorrect Current password'
      });
    }
  }

  addUser(req, res, next) {
    const args = {
      tenant_id: req.session.tenant_id,
      id: req.query.id
    };

    _index.UsersService.prototype.addUser(args).then(result => {
      res.status(200).json(result);
    }).catch(error => {
      next(error);
    });
  } // create by sandeep Mokkarala


  getCurrentUser(request, response, next) {
    const args = {
      tenant_id: request.session.tenant_id,
      user_id: request.params.user_id
    };

    _index.UsersService.prototype.getCurrentUserEntities(args).then(user => {
      response.json(user);
    }).catch(error => next(error));
  }

  getStates(req, res, next) {
    const args = {
      country: req.params.country
    };

    _index.UsersService.prototype.getStates(args).then(statesData => {
      res.status(200).json(statesData);
    }).catch(error => next(error));
  }

  getCities(req, res, next) {
    const args = {
      country: req.params.country,
      state: req.params.state
    };

    _index.UsersService.prototype.getCities(args).then(citiesData => {
      res.status(200).json(citiesData);
    }).catch(error => next(error));
  } //Method for getting available country list


  getCountry(req, res, next) {
    _index.UsersService.prototype.getCountry().then(country => {
      res.status(200).send(country);
    }).catch(error => next(error));
  }

  getRmList(req, res, next) {
    console.log(req.session);
    const args = {
      tenant_id: req.session.tenant_id,
      user_id: req.query.user_id
    };
    console.log(args);

    _index.UsersService.prototype.getSupervisorList(args).then(rmlist => {
      res.json(rmlist);
    }).catch(error => next(error));
  }

  getStationsByBuildingId(req, res, next) {
    const args = {
      tenant_id: req.session.tenant_id,
      building_id: req.body.building_id
    };

    _index.UsersService.prototype.getStationsByBuildingId(args).then(status => {
      res.status(status.code).json(status.stationData);
    }).catch(error => next(error));
  } // Method for adding family mambers


  addFamilyMambers(req, res, next) {
    _index.UsersService.prototype.saveFamilyMember(req, res).then(status => {
      res.status(status.code).json(status.message);
    }).catch(error => next(error));
  } // Method for getting family memeber


  getFamilyMember(req, res, next) {
    const tenantID = req.session.tenant_id;

    _index.UsersService.prototype.getFamilyMember(tenantID).then(data => {
      res.status(200).send(data);
    }).catch(error => next(error));
  } // Method for deactivating an user


  deactivateMember(req, res, next) {
    const user_id = req.params.id;
    const action = req.query.Active;

    _index.UsersService.prototype.deactivateFamilyMember(user_id, action).then(data => {
      res.status(200).send(data);
    }).catch(error => next(error));
  } // Method for updating family member


  updateMember(req, res, next) {
    _index.UsersService.prototype.updateFamilyMember(req, res).then(result => {
      res.status(200).send(result);
    }).catch(error => next(error));
  } // Method for searching in users


  searchMember(req, res, next) {
    const filter = req.query;
    const tenantID = req.session.tenant_id;

    _index.UsersService.prototype.searchFamilyMember(filter, tenantID).then(result => {
      res.status(200).send({
        status: 'success',
        code: 200,
        usersList: result
      });
    }).catch(error => next(error));
  }

}

exports.default = UsersController;