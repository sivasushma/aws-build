import {Feature} from '../../models/index';
import {featureServices, SessionsService} from '../../services/index';
import {reject} from 'underscore';

export default class FeatureController {
  addFeature(req, res, next) {
    // Check wheather the feature has already added or not
    Feature.find({name: req.body.name}).then((feature) => {
      if (feature.length == 0) {
        featureServices.prototype
            .saveFeature(req.body)
            .then((msg) => {
              res.status(200).send({status: 'success', code: 200, message: msg});
            }).catch((error) => next(error));
      } else {
        res.status(422).send({status: 'Fail', code: 422, message: 'Feature alredy exists.'});
      }
    }).catch((error) => next(error));
  }

  getFeatures(req, res, next) {
    featureServices.prototype.getFeatures().then((data) =>{
      if (data.length == 0) {
        res.status(422).send({status: 'Fail', code: 422, message: 'No feature available.'});
      } else {
        res.status(200).send({status: 'success', code: 200, data: data});
      }
    }).catch((error) => next(error));
  }

  // Method for getting VVDN Access token
  getDeviceAccessToken(req, res, next) {
    const tenantId = req.session.tenant_id;
    const oauth = req.session.token;

    SessionsService.prototype.getDeviceAccessToken(tenantId, oauth).then((data) =>{
      res.status(200).send({status: 'success', code: 200, data: data});
    }).catch((error) => res.status(422).send({status: 'Fail', code: 422, message: error.message}));
  }
}
