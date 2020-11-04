import {
  Feature,
} from '../../models/index';

const features_array = [
  'threat_simulation',
  'user_management',
  'facility_map',
  'stations',
  'devices',
  'pre_planned_responses',
  'payments',
  'dashboard',
  'activities',
  'logs',

];

export default class FeatureServices {
  saveFeature(newFeature) {
    return new Promise((resolve, reject) => {
      const feature = new Feature();
      feature.name = newFeature.name;
      feature.category = newFeature.category;
      feature.type = newFeature.type;

      feature.save(feature).then((data) => {
        resolve('New Feature added successfully.');
      }).catch((error) => {
        reject(error.message);
      });
    });
  }

  getFeatures() {
    return new Promise((resolve, reject) => {
      Feature.find({
        userType: 'Commercial',
      }, {
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
        userType: 0,
      }).sort([
        ['createdAt', 1],
      ]).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error.message);
      });
    });
  }
}
