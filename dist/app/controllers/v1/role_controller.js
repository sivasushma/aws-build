"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../services/index");

var _index2 = require("../../models/index");

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
    Controller for user role managemnet related methods.
*/
class RoleController {
  // Method for adding default sysetme role for an tenant.
  addDefaultRole(request, response, next) {
    const tenant_id = request.session.tenant_id;
    const userId = request.session.user_id; // Check wheather the tenant has already assigned default roles or not

    _index2.Role.find({
      tenant_id: tenant_id
    }).then(tenant => {
      if (tenant.length == 0) {
        _index.RoleService.prototype.addDefaultRole(tenant_id, userId).then(msg => {
          response.status(200).send({
            status: 'success',
            code: 200,
            message: msg
          });
        }).catch(error => next(error));
      } else {
        response.status(422).send({
          status: 'fail',
          code: 422,
          message: 'Role exists for the user.'
        });
      }
    }).catch(error => next(error));
  } // Method for getting tenant roles


  getTenantRoles(req, res, next) {
    const tenant_id = req.session.tenant_id;

    _index.RoleService.prototype.getTenentRoles(tenant_id).then(status => {
      res.status(200).send(status);
    }).catch(error => next(error));
  } // Method for getting perticular tenant role details


  getRoleDetails(req, res, next) {
    const tenant_id = req.session.tenant_id;
    const roleId = req.params.id;

    _index.RoleService.prototype.getPerticularRoleDetail(tenant_id, roleId).then(result => {
      res.status(200).send({
        status: 'success',
        code: 200,
        roleList: result
      });
    }).catch(error => next(error));
  } // Method for adding custom role


  addCustomRole(req, res, next) {
    const tenantId = req.session.tenant_id;
    const role = req.body;
    const userId = req.session.user_id; // I have to check wheather the tenant has any default reole. than dont allow him

    _index2.Role.aggregate([{
      $match: {
        $and: [{
          tenant_id: _mongoose.default.Types.ObjectId(tenantId)
        }, {
          type: 'Default'
        }]
      }
    }]).then(defaultRole => {
      if (defaultRole.length == 0) {
        _index.RoleService.prototype.addCustomRole(tenantId, role, userId).then(msg => {
          res.status(200).send({
            status: 'success',
            code: 200,
            message: msg
          });
        }).catch(msg => res.status(422).send({
          status: 'Fail',
          code: 422,
          message: msg
        }));
      } else {
        res.status(422).send({
          status: 'Fail',
          code: 422,
          message: 'Already default role exist. Can not add custom role'
        });
      }
    });
  } // Method for updating role


  updateRole(req, res, next) {
    const tenantId = req.session.tenant_id;
    const role = req.body;

    _index.RoleService.prototype.updateRole(tenantId, role).then(msg => {
      res.status(200).send({
        status: 'success',
        code: 200,
        message: msg
      });
    }).catch(msg => res.status(422).send({
      status: 'fail',
      code: 422,
      message: msg
    }));
  } // Method for getting perticualr role


  getRoleFeatures(req, res, next) {
    const roleId = req.params.id;

    _index.RoleService.prototype.getRoleFeatures(roleId).then(data => {
      res.status(200).send({
        status: 'success',
        code: 200,
        data: data
      });
    }).catch(msg => res.status(422).send({
      status: 'fail',
      code: 422,
      message: msg
    }));
  } // Method for getting residential default roles


  getResidentialDefaultRole(req, res, next) {
    _index.RoleService.prototype.getResDeafaultRole().then(result => {
      res.status(200).send({
        status: 'success',
        code: 200,
        roleList: result
      });
    }).catch(error => next(error));
  }

}

exports.default = RoleController;