"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../models/index");

const features_array = ['threat_simulation', 'user_management', 'facility_map', 'stations', 'devices', 'pre_planned_responses', 'payments', 'dashboard', 'activities', 'logs'];

class FeatureServices {
  saveFeature(newFeature) {
    return new Promise((resolve, reject) => {
      const feature = new _index.Feature();
      feature.name = newFeature.name;
      feature.category = newFeature.category;
      feature.type = newFeature.type;
      feature.save(feature).then(data => {
        resolve('New Feature added successfully.');
      }).catch(error => {
        reject(error.message);
      });
    });
  }

  getFeatures() {
    return new Promise((resolve, reject) => {
      _index.Feature.find({
        userType: 'Commercial'
      }, {
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
        userType: 0
      }).sort([['createdAt', 1]]).then(data => {
        resolve(data);
      }).catch(error => {
        reject(error.message);
      });
    });
  }

}

exports.default = FeatureServices;