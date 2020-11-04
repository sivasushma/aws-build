"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UtilityRoutes = exports.UserOpenRoutes = exports.UserSecureRoutes = void 0;

var _express = _interopRequireDefault(require("express"));

var _index = require("../controllers/v1/index");

var _index2 = require("../middleware/index");

var _countrystate_controller = _interopRequireDefault(require("../controllers/countrystate_controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SecureRouter = _express.default.Router();

exports.UserSecureRoutes = SecureRouter;

const OpenRouter = _express.default.Router();

exports.UserOpenRoutes = OpenRouter;

const UtilRouter = _express.default.Router();

exports.UtilityRoutes = UtilRouter;
SecureRouter.use(_index2.AuthenticationMiddleware.prototype.authorize('admin')); // Internal route for adding features into the feature table

OpenRouter.route('/addFeature').post(_index.FeatureController.prototype.addFeature);
OpenRouter.route('/roles/add').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.FeatureController.prototype.getFeatures);
OpenRouter.route('/roles/add/:id').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.RoleController.prototype.getRoleFeatures);
OpenRouter.route('/').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.list);
OpenRouter.route('/add').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.addUser); // new API added for cereating a new user by sukesha and sekhar

OpenRouter.route('/creareUser').post(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.create); // api/v1/user-management/roles/action?type=default

OpenRouter.route('/roles/action').post(_index2.AuthenticationMiddleware.prototype.authenticate, _index.RoleController.prototype.addDefaultRole); // API to get tenant roles

OpenRouter.route('/roles').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.RoleController.prototype.getTenantRoles); // API to get perticular tenant role details

OpenRouter.route('/roles/:id').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.RoleController.prototype.getRoleDetails); // API for adding custom roles

OpenRouter.route('/roles').post(_index2.AuthenticationMiddleware.prototype.authenticate, _index.RoleController.prototype.addCustomRole);
OpenRouter.route('/roles').put(_index2.AuthenticationMiddleware.prototype.authenticate, _index.RoleController.prototype.updateRole);
OpenRouter.route('/stationsBybuildingId').post(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.getStationsByBuildingId);
OpenRouter.route('/:country/states').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.getStates);
OpenRouter.route('/:country/states/:state/cities').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.getCities); // APi for getting counrty list

OpenRouter.route('/country').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.getCountry);
OpenRouter.route('/login').post(_index2.AuthenticationMiddleware.prototype.authenticate_user, _index.UsersController.prototype.login);
OpenRouter.route('/forgot_password').post(_index.UsersController.prototype.forgot_password);
OpenRouter.route('/change_password').post(_index2.AuthenticationMiddleware.prototype.parseAuthorizationHeader, _index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.change_password);
OpenRouter.route('/rmusers').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.getRmList);
OpenRouter.route('/logout').delete(_index.UsersController.prototype.logout);
OpenRouter.route('/:user_id').put(_index2.AuthenticationMiddleware.prototype.parseAuthorizationHeader, _index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.update).delete(_index.UsersController.prototype.delete);
OpenRouter.route('/:user_id').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.getCurrentUser);
OpenRouter.route('/residential/roles').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.RoleController.prototype.getResidentialDefaultRole);
OpenRouter.route('/familymembers').post(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.addFamilyMambers);
OpenRouter.route('/residential/list').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.getFamilyMember);
OpenRouter.route('/:id').put(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.deactivateMember);
OpenRouter.route('/residential/:userid').put(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.updateMember);
OpenRouter.route('/residential/search').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.UsersController.prototype.searchMember); // Created By Sandeep
// APi for generating VVDN access token

OpenRouter.route('/device/accessToken').get(_index2.AuthenticationMiddleware.prototype.authenticate, _index.FeatureController.prototype.getDeviceAccessToken);
UtilRouter.route('/updateCountryStateData').get(_countrystate_controller.default.prototype.updateCountryStateData);