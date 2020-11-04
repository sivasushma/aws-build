"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _models = require("../models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @export
 * @class CountryStateService
 */
class CountryStateService {
  /**
   * @return {String} returns accesstoken from universal tutorial
   * @memberof CountryStateService
   * @description get accesstoken for accessing services
   */
  getAccessToken() {
    return new Promise((resolve, reject) => {
      const options = {
        'headers': {
          'api-token': 'ecsBkKrVX35TwndmmC0pGl617e3XFMwSMLIAgHYcW0PTgMePdR0iyo93NlWJ4NOEF0o',
          'Accept': 'application/json',
          'user-email': 'anilkumarb@wavelabs.ai'
        },
        'url': 'https://www.universal-tutorial.com/api/getaccesstoken',
        'method': 'GET'
      };
      (0, _axios.default)(options).then(accesstoken => {
        return resolve(accesstoken.data.auth_token);
      }).catch(error => reject(error));
    });
  }
  /**
   * @param {Object} args
   * @return {Array} List of countries from universal tutorial
   * @memberof CountryStateService
   */

  /* getCountries(args) {
    return new Promise((resolve, reject)=>{
      const options = {
        'headers': {'Authorization': 'Bearer '+args.accesstoken,
          'Accept': 'application/json'},
        'url': 'https://www.universal-tutorial.com/api/countries/',
        'method': 'GET',
      };
      axios(options)
          .then((countriesData)=>{
            return resolve({countriesData: countriesData.data, accesstoken: args.accesstoken});
          })
          .catch((error)=>reject(error));
    });
  } */

  /**
   * @return {Array} List of Countries
   * @memberof CountryStateService
   */


  async getCountries() {
    const options = {
      'headers': {
        'content-type': 'application/json'
      },
      'url': 'http://api.geonames.org/countryInfoJSON?username=aniinprni',
      'method': 'GET'
    };
    const countries = await (0, _axios.default)(options);
    return countries.data.geonames;
  }
  /**
   * @param {Object} args
   * @return {Array}List of states by Country name
   * @memberof CountryStateService
   */

  /* getStatesByCountry(args) {
    return new Promise((resolve, reject)=>{
      const options = {
        'headers': {'content-type': 'application/json',
          'Authorization': 'Bearer '+args.accesstoken,
          'Accept': 'application/json'},
        'url': 'https://www.universal-tutorial.com/api/states/'+args.countryName,
        'method': 'GET',
       };
      axios(options)
          .then((statesData)=>{
            return resolve(statesData.data);
          })
          .catch((error)=>reject(error));
    });
  } */

  /**
   * @param {String} geonameId
   * @return {Array} List of States
   * @memberof CountryStateService
   */


  async getStatesByCountry(geonameId) {
    const options = {
      'headers': {
        'content-type': 'application/json'
      },
      'url': 'http://api.geonames.org/childrenJSON?username=aniinprni&&geonameId=' + geonameId,
      'method': 'GET'
    };
    const statesData = await (0, _axios.default)(options);
    return statesData.data.geonames;
  }
  /**
   * @return {Object} Success or Failure
   * @description fetch countries and states and update to DB
   * @memberof CountryStateService
   */


  async updateCountryStateData() {
    const starttime = new Date();
    const countries = await CountryStateService.prototype.getCountries();
    await this.saveCountries(countries);
    await this.saveStates();
    const endtime = new Date();
    const timeDiff = endtime.getTime() - starttime.getTime();
    console.log(timeDiff);
  }
  /**
   * @param {Object} countriesData
   * @return {Object} accesstoken
   * @description Save list of countries to DB
   * @memberof CountryStateService
   */


  async saveCountries(countriesData) {
    const countriesArr = [];

    if (countriesData && countriesData.length > 0) {
      for (const i in countriesData) {
        if (countriesData[i]) {
          const countryObj = {
            updateOne: {
              filter: {
                name: countriesData[i].countryName
              },
              update: {
                name: countriesData[i].countryName,
                code: countriesData[i].countryCode,
                geonameId: countriesData[i].geonameId
              },
              upsert: true
            }
          };
          countriesArr.push(countryObj);
        }
      }
    }

    await _models.Country.bulkWrite(countriesArr);
  }
  /**
   * @memberof CountryStateService
   * @description save states to DB
   */


  async saveStates() {
    console.log('these are args received>>>>>>>>>>>>>');
    const projectAggr = {
      $project: {
        _id: 1,
        name: 1,
        geonameId: 1,
        code: 1
      }
    };
    const asyncArr = [];
    asyncArr.push(projectAggr);
    const countriesData = await _models.Country.aggregate(asyncArr);
    const asyncFunc = [];

    if (countriesData && countriesData.length > 0) {
      for (const i in countriesData) {
        if (countriesData[i]) {
          const countryCode = countriesData[i].code;
          const geonameId = countriesData[i].geonameId;
          const countryId = countriesData[i]._id;
          asyncFunc.push(new Promise(async resolve => {
            const statesList = await CountryStateService.prototype.getStatesByCountry(geonameId);
            const stateArr = [];

            if (statesList && statesList.length > 0) {
              for (const j in statesList) {
                if (statesList[j]) {
                  const stateObj = {
                    updateOne: {
                      filter: {
                        name: statesList[j].name,
                        code: countryCode
                      },
                      update: {
                        name: statesList[j].name,
                        country_code: countryCode,
                        country: countryId
                      },
                      upsert: true
                    }
                  };
                  stateArr.push(stateObj);
                }
              }
            }

            await _models.State.bulkWrite(stateArr);
            resolve();
          }));
        }
      }
    }

    await Promise.all(asyncFunc);
  }

}

exports.default = CountryStateService;