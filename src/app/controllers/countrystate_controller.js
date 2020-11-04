import {CountryStateService} from '../services/index';
/**
 * @export
 * @class CountryStateController
 */
export default class CountryStateController {
/**
 * @param {HTTPRequest} req
 * @param {HTTPResponse} res
 * @param {CallableFunction} next
 * @description update country state data
 * @memberof CountryStateController
 */
  updateCountryStateData(req, res, next) {
    CountryStateService.prototype.updateCountryStateData()
        .then(()=>{
          res.status(200).json('country state data has been updated');
        }).catch((error)=>{
          next(error);
        });
  }
}
