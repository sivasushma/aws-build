import {
  RoleService,
} from '../../services/index';
import {
  Role,
} from '../../models/index';
import mongoose from 'mongoose';

/*
    Controller for user role managemnet related methods.
*/
export default class RoleController {
  // Method for adding default sysetme role for an tenant.
  addDefaultRole(request, response, next) {
    const tenant_id = request.session.tenant_id;
    const userId = request.session.user_id;
    // Check wheather the tenant has already assigned default roles or not
    Role.find({
      tenant_id: tenant_id,
    }).then((tenant) => {
      if (tenant.length == 0) {
        RoleService.prototype
            .addDefaultRole(tenant_id, userId)
            .then((msg) => {
              response.status(200).send({
                status: 'success',
                code: 200,
                message: msg,
              });
            }).catch((error) => next(error));
      } else {
        response.status(422).send({
          status: 'fail',
          code: 422,
          message: 'Role exists for the user.',
        });
      }
    }).catch((error) => next(error));
  }

  // Method for getting tenant roles
  getTenantRoles(req, res, next) {
    const tenant_id = req.session.tenant_id;

    RoleService.prototype.getTenentRoles(tenant_id).then((status) => {
      res.status(200).send(status);
    }).catch((error) => next(error));
  }

  // Method for getting perticular tenant role details
  getRoleDetails(req, res, next) {
    const tenant_id = req.session.tenant_id;
    const roleId = req.params.id;

    RoleService.prototype.getPerticularRoleDetail(tenant_id, roleId).then((result) => {
      res.status(200).send({
        status: 'success',
        code: 200,
        roleList: result,
      });
    }).catch((error) => next(error));
  }
  // Method for adding custom role
  addCustomRole(req, res, next) {
    const tenantId = req.session.tenant_id;
    const role = req.body;
    const userId = req.session.user_id;
    // I have to check wheather the tenant has any default reole. than dont allow him
    Role.aggregate([{
      $match: {
        $and: [{
          tenant_id: mongoose.Types.ObjectId(tenantId),
        }, {
          type: 'Default',
        }],
      },
    }]).then((defaultRole) => {
      if (defaultRole.length == 0) {
        RoleService.prototype.addCustomRole(tenantId, role, userId).then((msg) => {
          res.status(200).send({
            status: 'success',
            code: 200,
            message: msg,
          });
        }).catch((msg) => res.status(422).send({
          status: 'Fail',
          code: 422,
          message: msg,
        }));
      } else {
        res.status(422).send({
          status: 'Fail',
          code: 422,
          message: 'Already default role exist. Can not add custom role',
        });
      }
    });
  }

  // Method for updating role
  updateRole(req, res, next) {
    const tenantId = req.session.tenant_id;
    const role = req.body;
    RoleService.prototype.updateRole(tenantId, role).then((msg) => {
      res.status(200).send({
        status: 'success',
        code: 200,
        message: msg,
      });
    }).catch((msg) => res.status(422).send({
      status: 'fail',
      code: 422,
      message: msg,
    }));
  }

  // Method for getting perticualr role
  getRoleFeatures(req, res, next) {
    const roleId = req.params.id;
    RoleService.prototype.getRoleFeatures(roleId).then((data) => {
      res.status(200).send({
        status: 'success',
        code: 200,
        data: data,
      });
    }).catch((msg) => res.status(422).send({
      status: 'fail',
      code: 422,
      message: msg,
    }));
  }

  // Method for getting residential default roles
  getResidentialDefaultRole(req, res, next) {
    RoleService.prototype.getResDeafaultRole().then((result) => {
      res.status(200).send({
        status: 'success',
        code: 200,
        roleList: result,
      });
    }).catch((error) => next(error));
  }
}
