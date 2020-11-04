"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../services/index");

/**
 * @export
 * @class CountryStateController
 */
class CountryStateController {
  /**
   * @param {HTTPRequest} req
   * @param {HTTPResponse} res
   * @param {CallableFunction} next
   * @description update country state data
   * @memberof CountryStateController
   */
  updateCountryStateData(req, res, next) {
    _index.CountryStateService.prototype.updateCountryStateData().then(() => {
      res.status(200).json('country state data has been updated');
    }).catch(error => {
      next(error);
    });
  }

}

exports.default = CountryStateController;