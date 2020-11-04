import express from 'express';
import {UsersController, RoleController, FeatureController} from '../controllers/v1/index';
import {AuthenticationMiddleware} from '../middleware/index';
import CountryStateController from '../controllers/countrystate_controller';

const SecureRouter = express.Router();
const OpenRouter = express.Router();
const UtilRouter = express.Router();

SecureRouter.use(
    AuthenticationMiddleware.prototype.authorize('admin'),
);

// Internal route for adding features into the feature table
OpenRouter.route('/addFeature')
    .post(FeatureController.prototype.addFeature);

OpenRouter.route('/roles/add')
    .get(AuthenticationMiddleware.prototype.authenticate, FeatureController.prototype.getFeatures);

OpenRouter.route('/roles/add/:id')
    .get(AuthenticationMiddleware.prototype.authenticate, RoleController.prototype.getRoleFeatures);

OpenRouter.route('/')
    .get(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.list);
OpenRouter.route('/add')
    .get(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.addUser);
// new API added for cereating a new user by sukesha and sekhar
OpenRouter.route('/creareUser')
    .post(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.create);

// api/v1/user-management/roles/action?type=default
OpenRouter.route('/roles/action')
    .post(AuthenticationMiddleware.prototype.authenticate, RoleController.prototype.addDefaultRole);

// API to get tenant roles
OpenRouter.route('/roles')
    .get(AuthenticationMiddleware.prototype.authenticate, RoleController.prototype.getTenantRoles);

// API to get perticular tenant role details
OpenRouter.route('/roles/:id')
    .get(AuthenticationMiddleware.prototype.authenticate, RoleController.prototype.getRoleDetails);

// API for adding custom roles
OpenRouter.route('/roles')
    .post(AuthenticationMiddleware.prototype.authenticate, RoleController.prototype.addCustomRole);
OpenRouter.route('/roles')
    .put(AuthenticationMiddleware.prototype.authenticate, RoleController.prototype.updateRole);
OpenRouter.route('/stationsBybuildingId')
    .post(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.getStationsByBuildingId);
OpenRouter.route('/:country/states')
    .get(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.getStates);
OpenRouter.route('/:country/states/:state/cities')
    .get(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.getCities);
// APi for getting counrty list
OpenRouter.route('/country')
    .get(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.getCountry);


OpenRouter.route('/login')
    .post(AuthenticationMiddleware.prototype.authenticate_user, UsersController.prototype.login);

OpenRouter.route('/forgot_password')
    .post(UsersController.prototype.forgot_password);

OpenRouter.route('/change_password')
    .post(AuthenticationMiddleware.prototype.parseAuthorizationHeader, AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.change_password);
OpenRouter.route('/rmusers')
    .get(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.getRmList);

OpenRouter.route('/logout')
    .delete(UsersController.prototype.logout);

OpenRouter.route('/:user_id')
    .put(AuthenticationMiddleware.prototype.parseAuthorizationHeader, AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.update)
    .delete(UsersController.prototype.delete);

OpenRouter.route('/:user_id')
    .get(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.getCurrentUser);

OpenRouter.route('/residential/roles')
    .get(AuthenticationMiddleware.prototype.authenticate, RoleController.prototype.getResidentialDefaultRole);

OpenRouter.route('/familymembers')
    .post(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.addFamilyMambers);

OpenRouter.route('/residential/list')
    .get(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.getFamilyMember);

OpenRouter.route('/:id')
    .put(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.deactivateMember);

OpenRouter.route('/residential/:userid')
    .put(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.updateMember);

OpenRouter.route('/residential/search')
    .get(AuthenticationMiddleware.prototype.authenticate, UsersController.prototype.searchMember);

// Created By Sandeep
// APi for generating VVDN access token
OpenRouter.route('/device/accessToken')
    .get(AuthenticationMiddleware.prototype.authenticate, FeatureController.prototype.getDeviceAccessToken);

UtilRouter.route('/updateCountryStateData')
    .get(CountryStateController.prototype.updateCountryStateData);


export {
  SecureRouter as UserSecureRoutes,
  OpenRouter as UserOpenRoutes,
  UtilRouter as UtilityRoutes,
};
