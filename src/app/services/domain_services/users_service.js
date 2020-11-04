import _ from 'underscore';
import {
  User,
  Role,
  Country,
  Floor,
  State,
  City,
  Site,

} from '../../models/index';

import mongoose from 'mongoose';
import Utils from '../../utilities/utils';
import {
  DateValidator,
} from '../../validators';
import SessionsService from './sessions_service.js';
/**
 * @export
 * @class UsersService
 */
export default class UsersService {
/**
* @param {req} req
* @param {res} res
* @return {object} user creation response
* @description create new user
*/
  creatNewUser(req, res) {
    return new Promise((resolve, reject) => {
      const parseReq = () => {
        return new Promise((resolve, reject) => {
          Utils.prototype.uploadUserProfilePics(req, res)
              .then(() => resolve()).catch((error) => reject(error));
        });
      };
      const checkDuplicateEntry = () => {
        return new Promise((resolve, reject) => {
          User.findOne({tenant_id: mongoose.Types.ObjectId(req.session.tenant_id), empId: req.body.empId}).lean()
              .then((data) => {
                if (data != null) {
                  reject({
                    code: 422,
                    name: 'unprocessable_entity',
                    message: 'Duplicate Employee Id',
                  });
                } else {
                  resolve();
                }
              });
        });
      };
      const createUserProfilePic = () => {
        return new Promise((resolve, reject) => {
          try {
            if (req.file) {
              const imagePath = req.protocol + '://' + req.headers.host + '/tenants/' + req.session.tenant_id + '/Users/' + req.file.filename;
              return resolve(imagePath);
            } else {
              return resolve();
            }
          } catch (error) {
            return reject(error);
          }
        });
      };

      const createUser = (img) => {
        return new Promise((resolve, reject) => {
          const args = req.body;
          args.tenant_id = req.session.tenant_id;
          User
              .findOne({
                email: args.email,
              })
              .exec()
              .then(async (result) => {
                if (result) {
                  reject({
                    code: 422,
                    name: 'unprocessable_entity',
                    message: 'User already exists',
                  });
                } else {
                  const newUser = new User();
                  newUser.firstName = args.firstName;
                  newUser.lastName = args.lastName;
                  newUser.middleName = args.middleName;
                  newUser.email = args.email;
                  newUser.role = mongoose.Types.ObjectId(args.role);
                  newUser.tenant_id = mongoose.Types.ObjectId(args.tenant_id);
                  newUser.password = args.password || 'Test@123456';
                  newUser.phone_no = args.phone_no;
                  newUser.dob = (args.dob) ? new Date(args.dob) : undefined;
                  newUser.empId = args.empId;
                  newUser.address = args.address;
                  newUser.city = args.city;
                  newUser.country = (args.country) ? args.country : undefined;
                  newUser.zipcode = args.zipcode;
                  newUser.state = (args.state) ? args.state : undefined;
                  newUser.profile_pic = img;
                  // if (args.building_id) newUser.building_id = mongoose.Types.ObjectId(args.building_id);
                  if (args.building_id.length) {
                    const buildings = JSON.parse(args.building_id).map((b) => mongoose.Types.ObjectId(b));
                    newUser.building_id = buildings;
                  } else {
                    newUser.building_id = undefined;
                  }
                  newUser.reporting_manager = (JSON.parse(args.reporting_manager).length) ? JSON.parse(args.reporting_manager) : undefined;
                  // if (args.stations_assigned) {
                  //	args.stations_assigned = JSON.parse(args.stations_assigned);
                  //	_.forEach(args.stations_assigned, (stationId) => {
                  //		if (newUser.stations_assigned == undefined) {
                  //			newUser.stations_assigned = [];
                  //		}
                  //		newUser.stations_assigned.push(mongoose.Types.ObjectId(stationId));
                  //	});
                  // }
                  if (args.stations_assigned.length) {
                    const stations = JSON.parse(args.stations_assigned).map((s) => mongoose.Types.ObjectId(s));
                    newUser.stations_assigned = stations;
                  } else {
                    newUser.stations_assigned = undefined;
                  }

                  newUser.active = true;
                  this.updateStationsWithUsers(newUser._id, newUser.stations_assigned, true, args.tenant_id)
                      .then(() => {
                        newUser.save((error, user) => {
                          if (error) {
                            reject({
                              code: 422,
                              name: 'unprocessable_entity',
                              message: error.message,
                            });
                          } else {
                            // NotificationsService.prototype.sendWelcomeEmail(user, password);
                            const userObj = user.toObject();
                            delete userObj.__v;
                            delete userObj.createdAt;
                            delete userObj.updatedAt;
                            delete userObj.password_history;
                            resolve();
                          }
                        });
                      })
                      .catch((error) => reject(error));
                }
              }).catch((error) => reject(error));
        });
      };
      parseReq()
          .then(checkDuplicateEntry)
          .then(createUserProfilePic)
          .then(createUser)
          .then(() => {
            resolve({
              status: 'Success',
              code: 200,
              message: 'User created successfully',
            });
          })
          .catch((error) => reject(error));
    });
  }

  /**
* @param {args} args
* @return {object} get user data response
* @description get user
*/
  getUsers(args) {
    return new Promise((resolve, reject) => {
      const rolesList = () => {
        return new Promise((resolve, reject) => {
          try {
            Role.find({
              tenant_id: mongoose.Types.ObjectId(args.tenant_id),
              status: true,
            }, 'name _id').lean().exec()
                .then((roleData) => {
                  resolve(roleData);
                }).catch((error) => {
                  reject({
                    status: 'Fail',
                    code: 422,
                    message: error.message,
                  });
                });
          } catch (error) {
            reject({
              status: 'Fail',
              code: 422,
              message: error.message,
            });
          }
        });
      };
      const getStationsData = () => {
        return new Promise((resolve, reject) => {
          try {
            const asyncArr = [];
            const unwindAggr = {
              $unwind: '$stations',
            };
            const matchAggr = {
              $match: {
                tenant_id: mongoose.Types.ObjectId(args.tenant_id),
                active: true,
              },
            };
            const projectAggr = {
              $project: {
                '_id': 0,
                'station_id': '$stations._id',
                'stationId': '$stations.stationId',
                'stationName': '$stations.name',
              },
            };
            asyncArr.push(matchAggr);
            asyncArr.push(unwindAggr);
            asyncArr.push(projectAggr);
            Floor.aggregate(asyncArr).exec()
                .then((stationData) => {
                  resolve(stationData);
                }).catch((error) => {
                  reject({
                    status: 'Fail',
                    code: 422,
                    message: error.message,
                  });
                });
          } catch (error) {
            reject({
              status: 'Fail',
              code: 422,
              message: error.message,
            });
          }
        });
      };
      const users = () => {
        return new Promise((resolve, reject) => {
          const matchAggr = {$match: {}};
          const match = {
            $match: {
              tenant_id: mongoose.Types.ObjectId(args.tenant_id),
            },
          };
          if (args.name) {
            let split = args.name.split(' ');
            matchAggr['$match']['$and'] = [{
              firstName: split[0],
            }, {
              lastName: split[split.length - 1],
            }];
          }
          if (args.role) {
            matchAggr['$match']['role'] = args.role;
          }
          if (args.station_id) {
            matchAggr['$match']['stations_assigned'] = {
              $elemMatch: {
                $eq: mongoose.Types.ObjectId(args.station_id),
              },
            };
          }
          if (args.active) {
            matchAggr['$match']['active'] = JSON.parse(args.active);
          }
          if (args.fromDate) {
            matchAggr['$match']['createdAt'] = {};
            matchAggr['$match']['createdAt']['$gte'] = new Date(args.fromDate);
            
            //const status = DateValidator.prototype.validateFromToDates(args.fromDate, args.toDate, args.timezone);
            //if (status.status == 'Fail') {
            //  return reject(status);
            //} else {
            //  if (status.fromDate || status.toDate) {
            //    matchAggr['$match']['createdAt'] = {};
            //  }
            //  if (status.fromDate) matchAggr['$match']['createdAt']['$gte'] = status.fromDate;
            //  if (status.toDate) matchAggr['$match']['createdAt']['$lte'] = status.toDate;
            //}
          }

          if(args.toDate){
            const date = new Date(args.toDate);
            matchAggr['$match']['createdAt']['$lte'] = new Date(date.setDate(date.getDate() + 1));
          }

          if (args.siteName) {
            matchAggr['$match']['siteNames'] = {
              $elemMatch: {
                $eq: args.siteName,
              },
            };
          };

          if (args.buildingNames) {
            matchAggr['$match']['buildingNames'] = {
              $elemMatch: {
                $eq: args.buildingNames,
              },
            };
          }
          const lookupAggr = {
            $lookup: {
              from: 'roles',
              let: {
                role: '$role',
                tenant_id: mongoose.Types.ObjectId(args.tenant_id),
              },
              pipeline: [{
                $match: {
                  $expr: {
                    $and: [{
                      $eq: ['$$role', '$_id'],
                    }, {
                      $eq: ['$$tenant_id', '$tenant_id'],
                    }],
                  },
                },
              },
              {
                $project: {
                  name: 1,
                  _id: 0,
                },
              },
              ],
              as: 'roleDocs',
            },
          };
          const unwindAggr = {
            $unwind: '$roleDocs',
          };
          const unwindStationsAggr = {
            $unwind: {
              path: '$stations_assigned',
              preserveNullAndEmptyArrays: true,
            },
          };
          const lookupStationAggr = {
            $lookup: {
              from: 'floors',
              let: {
                stationId: '$stations_assigned',
                tenant_id: mongoose.Types.ObjectId(args.tenant_id),
              },
              pipeline: [{
                $unwind: '$stations',
              },
              {
                $match: {
                  $expr: {
                    $and: [{
                      $eq: ['$$stationId', '$stations._id'],
                    }, {
                      $eq: ['$$tenant_id', '$tenant_id'],
                    }],
                  },
                },
              },
              {
                $project: {
                  station_id: '$stations._id',
                  stationId: '$stations.stationId',
                  _id: 0,
                },
              },
              ],
              as: 'stationDocs',
            },
          };
          const stationsUnwindAggr = {
            $unwind: {
              path: '$stationDocs',
              preserveNullAndEmptyArrays: true,
            },
          };

          const unwindBuilding = {
            $unwind: {
              path: '$building_id',
              preserveNullAndEmptyArrays: true,
            },
          };

          const siteLookUp = {
            $lookup: {
              from: 'sites',
              let: {buildingId: {$convert: {input: '$building_id', to: 'objectId'}}},
              pipeline: [{
                $unwind: {
                  path: '$buildings',
                  preserveNullAndEmptyArrays: true,
                },
              }, {$match: {'$expr': {'$eq': ['$buildings._id', '$$buildingId']}}},
              {
                $project: {
                  siteId: '$_id',
                  siteName: '$siteName',
                  builidingId: '$buildings._id',
                  buildingName: '$buildings.name',
                },
              },
              ],
              as: 'buildings',
            },
          };

          const unwindSite = {
            $unwind: {
              path: '$buildings',
              preserveNullAndEmptyArrays: true,
            },
          };
          const groupByAggr = {
            $group: {
              _id: {
                _id: '$_id',
                //_id : '$stationDocs.station_id',
                // siteID : '$buildings.siteId',
                // buildingId : '$buildings.builidingId',
                //station_id: '$stationDocs.station_id',

              },
              profile_pic: {
                $first: '$profile_pic',
              },
              firstName: {
                $first: '$firstName',
              },
              lastName: {
                $first: '$lastName',
              },
              middleName: {
                $first: '$middleName',
              },
              empId: {
                $first: '$empId',
              },
              createdAt: {
                $first: '$createdAt',
              },
              role: {
                $first: '$roleDocs.name',
              },
              phone_no: {
                $first: '$phone_no',
              },
              stations_assigned: {
                $addToSet: {
                  $cond: [{ $gt: ['$stationDocs.station_id', null] }, { station_id: '$stationDocs.station_id', stationId: '$stationDocs.stationId' }, '$$REMOVE'],
                },
              },
              siteNames: {
                $addToSet: {
                  $cond: [{ $gt: ['$buildings.siteId', null] }, { siteId: '$buildings.siteId', siteName: '$buildings.siteName' }, '$$REMOVE'],
                },
              },
              buildingNames: {
                $addToSet: {
                  $cond: [{ $gt: ['$buildings.builidingId', null] }, { builidingId: '$buildings.builidingId', buildingName: '$buildings.buildingName' }, '$$REMOVE'],
                },
              },
              active: {
                $first: '$active',
              }
            },
          };
          const sortOder = {
            $sort: {
              createdAt: -1,
            },
          };
          const projectAggr = {
            $project: {
              profile_pic: 1,
              firstName: 1,
              lastName: 1,
              fullName: {
                $concat: ['$firstName', ' ', '$lastName'],
              },
              middleName: 1,
              empId: 1,
              role: 1,
              phone_no: 1,
              stations_assigned: 1,
              siteNames: 1,
              buildingNames: 1,
              _id: '$_id._id',
              active: 1,
              createdAt: 1,
            },
          };

          console.log(JSON.stringify(matchAggr));
          const asyncArr = [];
          asyncArr.push(match);
          asyncArr.push(lookupAggr);
          asyncArr.push(unwindAggr);
          asyncArr.push(unwindStationsAggr);
          asyncArr.push(lookupStationAggr);
          asyncArr.push(stationsUnwindAggr);
          asyncArr.push(unwindBuilding);
          asyncArr.push(siteLookUp);
          asyncArr.push(unwindSite);
          asyncArr.push(groupByAggr);
          asyncArr.push(sortOder);
          asyncArr.push(projectAggr);
          asyncArr.push(matchAggr);
          User.aggregate(asyncArr).exec()
              .then((userlist) => {
                // console.log(userlist);
                // console.log(userlist.length);
                resolve(userlist);
              }).catch((error) => reject({
                status: 'Fail',
                code: 422,
                message: error.message,
              }));
        });
      };
      Promise.all([rolesList(), getStationsData(), users()])
          .then((results) => {
            resolve({
              rolesData: results[0],
              stationsData: results[1],
              userData: results[2],
            });
          }).catch((error) => reject({
            status: 'Fail',
            code: 422,
            message: error.message,
          }));
    });
  }
  /**
* @param {req} req
* @param {res} res
* @return {object} update use response
* @description update user
*/
  updateUser(req, res) {
    let user;
    return new Promise((resolve, reject) => {
      const getUser = () => {
        return new Promise((resolve, reject) => {
          try {
            User.findOne({
              _id: mongoose.Types.ObjectId(req.params.user_id),
            })
                .then((data) => {
                  if (data == null) {
                    reject({
                      status: 'Fail',
                      code: 422,
                      message: 'No User found',
                    });
                  } else {
                    user = data;
                    resolve();
                  }
                }).catch((error) => reject({
                  status: 'Fail',
                  code: 422,
                  message: error.message,
                }));
          } catch (error) {
            reject({
              status: 'Fail',
              code: 422,
              message: error.message,
            });
          }
        });
      };
      const parseReq = () => {
        return new Promise((resolve, reject) => {
          Utils.prototype.uploadUserProfilePics(req, res)
              .then(() => resolve()).catch((error) => reject({
                status: 'Fail',
                code: 422,
                message: error.message,
              }));
        });
      };

      const createUserProfilePic = () => {
        return new Promise((resolve, reject) => {
          try {
            if (req.file) {
              const imagePath = req.protocol + '://' + req.headers.host + '/tenants/' + req.session.tenant_id + '/Users/' + req.file.filename;
              return resolve(imagePath);
            } else {
              return resolve();
            }
          } catch (error) {
            return reject({
              status: 'Fail',
              code: 422,
              message: error.message,
            });
          }
        });
      };

      const updateUser = (img) => {
        return new Promise((resolve, reject) => {
          try {
            const args = req.body;
            const userId = req.params.user_id;
            const tenantId = req.session.tenant_id;

            if (args.firstName && args.firstName != '') user.firstName = args.firstName;
            if (args.lastName && args.lastName != '') user.lastName = args.lastName;
            if (args.middleName && args.middleName != '') user.middleName = args.middleName;
            if (args.role && args.role != '') user.role = mongoose.Types.ObjectId(args.role);
            if (args.phone_no && args.phone_no != '') user.phone_no = args.phone_no;
            if (args.dob && args.dob != '') user.dob = new Date(args.dob);
            if (args.empId && args.empId != '') user.empId = args.empId;
            if (args.address && args.address != '') user.address = args.address;
            if (args.city && args.city != '') user.city = args.city;
            if (args.state && args.state != '') user.state = mongoose.Types.ObjectId(args.state);
            if (args.country && args.country != '') user.country = mongoose.Types.ObjectId(args.country);
            if (args.zipcode && args.zipcode != '') user.zipcode = args.zipcode;
            if (img) user.profile_pic = img;
            if (args.active) user.active = args.active;

            if (args.reporting_manager && JSON.parse(args.reporting_manager).length) {
              user.reporting_manager = JSON.parse(args.reporting_manager);
            }

            if (args.building_id && JSON.parse(args.building_id).length) {
              user.building_id =JSON.parse(args.building_id);
            }

            if (args.stations_assigned && JSON.parse(args.stations_assigned).length) {
              user.stations_assigned = JSON.parse(args.stations_assigned);
              this.updateStationsWithUsers(userId, args.stations_assigned, true, tenantId);
            }

            // updateStationsWithUsers(user_id, stations, active, tenant_id)
            // if (args.stations_assigned && args.stations_assigned != '') {
            //  args.stations_assigned = JSON.parse(args.stations_assigned);
            //  user.stations_assigned = [];
            // }

            // if (args.building_id) user.building_id = mongoose.Types.ObjectId(args.building_id);
            // if (Array.isArray(args.stations_assigned)) {
            //  _.forEach(args.stations_assigned, (stationId) => {
            //    if (user.stations_assigned == undefined) {
            //      user.stations_assigned = [];
            //    }
            //    user.stations_assigned.push(mongoose.Types.ObjectId(stationId));
            //  });
            // }
            if (user.active == false) {
              user.stations_assigned = [];
            }
            user.save((err, result) => {
              if (err) {
                reject({
                  status: 'Fail',
                  code: 422,
                  message: err.message,
                });
              } else {
                const userObj = user.toObject();
                delete userObj.__v;
                delete userObj.createdAt;
                delete userObj.updatedAt;
                delete userObj.password_history;
                this.updateStationsWithUsers(userObj._id, userObj.stations_assigned, userObj.active, userObj.tenant_id)
                    .then(() => resolve())
                    .catch((error) => {
                      console.log(error); reject(error);
                    });
              }
            });
          } catch (error) {
            console.log(error);
            reject({
              status: 'Fail',
              code: 422,
              message: error.message,
            });
          }
        });
      };
      getUser()
          .then(parseReq)
          .then(createUserProfilePic)
          .then(updateUser)
          .then(() => {
            resolve({
              status: 'Success',
              code: 200,
              message: 'User has been updated',
            });
          }).catch((error) => {
            console.log(error); reject({
              status: 'Fail',
              code: 422,
              message: error.message,
            });
          });
    });
  }
  /**
* @param {userId} userId
* @return {object} delete user
* @description delete user
*/
  deleteUser(userId) {
    return new Promise((resolve, reject) => {
      User.remove({
        _id: userId,
      }).exec().then((deletedUser) => {
        resolve({
          message: 'User deleted successfully',
        });
      });
    });
  }
  /**
* @param {email} email
* @return {object} get user by email
* @description get user by email
*/
  getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      User.findOne({
        email,
      }).exec().then((result) => {
        resolve(result);
      }).catch((error) => reject(error));
    });
  }

  /**
* @param {args} args
* @return {object} get user data
* @description get user data
*/
  getCurrentUserEntities(args) {
    return new Promise((resolve, reject) => {
      const matchAggr = {
        $match: {
          _id: mongoose.Types.ObjectId(args.user_id),
        },
      };
      const lookupAggr = {
        $lookup: {
          from: 'users',
          localField: 'reporting_manager',
          foreignField: '_id',
          as: 'reportingManager',
        },
      };
      const unwindBuildings = {
        $unwind: {
          path: '$building_id',
          preserveNullAndEmptyArrays: true,
        },
      };
      const buildingAggr = {
        // $lookup: {
        //  from: 'sites',
        //  localField: 'building_id',
        //  foreignField: '_id',
        //  as: 'buildingDocs',
        // },

        $lookup: {
          from: 'sites',

          let: {buildingId: {$convert: {input: '$building_id', to: 'objectId'}}},

          pipeline: [{$unwind: {path: '$buildings', preserveNullAndEmptyArrays: true}}, {$match: {'$expr': {'$eq': ['$buildings._id', '$$buildingId']}}}, {$project: {buildingId: '$buildings._id', buildingName: '$buildings.name', siteName: 1, siteId: '$_id'}}],
          as: 'buildingDocs',
        },
      };
      const unwindBuildingAggr = {
        $unwind: {
          path: '$buildingDocs',
          preserveNullAndEmptyArrays: true,
        },
      };
      const unwindRMAggr = {
        $unwind: {
          path: '$reportingManager',
          preserveNullAndEmptyArrays: true,
        },
      };
      const lookupRoleAggr = {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleDocs',
        },
      };
      const unwindRoleAggr = {
        $unwind: {
          path: '$roleDocs',
          preserveNullAndEmptyArrays: true,
        },
      };
      const lookupCountryAggr = {
        $lookup: {
          from: 'countries',
          localField: 'country',
          foreignField: '_id',
          as: 'countryDoc',
        },
      };
      const unwindCountryAggr = {
        $unwind: {
          path: '$countryDoc',
          preserveNullAndEmptyArrays: true,
        },
      };
      /*  let lookupCityAggr = {
					   $lookup: {
						   from: "cities",
						   localField: "city",
						   foreignField: "_id",
						   as: "cityDocs"
					   }
				   }
				   let unwindCityAggr = {
					   $unwind: {
						   path: "$cityDocs",
						   preserveNullAndEmptyArrays: true
					   }
				   } */
      const lookupStateAggr = {
        $lookup: {
          from: 'states',
          localField: 'state',
          foreignField: '_id',
          as: 'stateDocs',
        },
      };
      const unwindStateAggr = {
        $unwind: {
          path: '$stateDocs',
          preserveNullAndEmptyArrays: true,
        },
      };
      const unwindAggr = {
        $unwind: {
          path: '$stations_assigned',
          preserveNullAndEmptyArrays: true,
        },
      };
      const lookupStationAggr = {
        $lookup: {
          from: 'floors',
          let: {
            stationId: '$stations_assigned',
            tenant_id: mongoose.Types.ObjectId(args.tenant_id),
          },
          pipeline: [{
            $match: {
              $expr: {
                $and: [{
                  $eq: ['$tenant_id', '$$tenant_id'],
                }],
              },
            },
          },
          {
            $unwind: '$stations',
          },
          {
            $match: {
              $expr: {
                $and: [{
                  $eq: ['$stations._id', '$$stationId'],
                }],
              },
            },
          },
          {
            $project: {
              station_id: '$stations._id',
              stationName: '$stations.name',
              stationId: '$stations.stationId',
              _id: 0,
            },
          },
          ],
          as: 'stationsDoc',
        },
      };
       const unwindStationAggr = {
        $unwind: {
          path: '$stationsDoc',
          preserveNullAndEmptyArrays: true,
        },
       };
      const groupByAggr = {
        $group: {
          _id: '$_id',
          firstName: {
            $first: '$firstName',
          },
          lastName: {
            $first: '$lastName',
          },
          middleName: {
            $first: '$middleName',
          },
          email: {
            $first: '$email',
          },
          phone_no: {
            $first: '$phone_no',
          },
          dob: {
            $first: '$dob',
          },
          empId: {
            $first: '$empId',
          },
          address: {
            $first: '$address',
          },
          country: {
            $first: '$countryDoc.name',
          },
          country_id: {
            $first: '$countryDoc._id',
          },
          /* city: {
								  $first: "$cityDocs.name"
							  },
							  city_id: {
								  $first: "$cityDocs._id"
							  }, */
          city: {$first: '$city'},
          state: {
            $first: '$stateDocs.name',
          },
          state_id: {
            $first: '$stateDocs._id',
          },
          zipcode: {
            $first: '$zipcode',
          },
          role: {
            $first: '$roleDocs.name',
          },
          reporting_manager: {
            $first: '$reportingManager',
          },
          profile_pic: {
            $first: '$profile_pic',
          },
          stations_assigned: {$addToSet: '$stationsDoc'},
          //stations_assigned: {
          //  $push: {
          //    $cond: [{$gt: ['$stationsDoc', null]}, '$stationsDoc', '$$REMOVE'],
          //  },
          //},
          site_name: {
            $addToSet: {
              $cond: [{$gt: ['$buildingDocs._id', null]}, {siteId: '$buildingDocs._id', siteName: '$buildingDocs.siteName'}, '$$REMOVE'],
            },
          },
          building_name: {
            $addToSet: {
              $cond: [{$gt: ['$buildingDocs.buildingId', null]}, {
                buildingId: '$buildingDocs.buildingId',
                buildingName: '$buildingDocs.buildingName',
              }, '$$REMOVE'],
            },
          },
        },
      };
      const projectAggr = {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          middleName: 1,
          fullName: {
            $concat: ['$firstName', ' ', '$lastName'],
          },
          email: 1,
          phone_no: 1,
          dob: 1,
          empId: 1,
          address: 1,
          country: 1,
          country_id: 1,
          city: 1,
          city_id: 1,
          state: 1,
          state_id: 1,
          role: 1,
          reporting_manager: {
            $concat: ['$reporting_manager.firstName', ' ', '$reporting_manager.lastName'],
          },
          reporting_manager_pic: '$reporting_manager.profile_pic',
          profile_pic: 1,
          stations_assigned: 1,
          zipcode: 1,
          site_name: 1,
          building_name: 1,
        },
      };
      const asyncArr = [];
      asyncArr.push(matchAggr);
      asyncArr.push(lookupAggr);
      asyncArr.push(unwindBuildings);
      asyncArr.push(buildingAggr);
      asyncArr.push(unwindBuildingAggr);
      asyncArr.push(unwindRMAggr);
      asyncArr.push(lookupRoleAggr);
      asyncArr.push(unwindRoleAggr);
      asyncArr.push(lookupCountryAggr);
      asyncArr.push(unwindCountryAggr);
      /*  asyncArr.push(lookupCityAggr) //already commented
				   asyncArr.push(unwindCityAggr) */ // Already commented
      asyncArr.push(lookupStateAggr);
      asyncArr.push(unwindStateAggr);
      asyncArr.push(unwindAggr);
      asyncArr.push(lookupStationAggr);
      asyncArr.push(unwindStationAggr);
      asyncArr.push(groupByAggr);
      asyncArr.push(projectAggr);

      User.aggregate(asyncArr).exec()
          .then((userData) => {
            resolve(userData[0]);
          }).catch((error) => reject({
            status: 'Fail',
            code: 422,
            message: error.message,
          }));
    });
  }
  /**
* @param {args} args
* @return {object} add user
* @description add user
*/
  async addUser(args) {
    return new Promise((resolve, reject) => {
      const userObj = new Promise((resolve, reject) => {
        try {
          if (args.id) {
            const aggrStages = [];

            const match = {$match: {_id: mongoose.Types.ObjectId(args.id)}};

            const unwindBuilding = {
              $unwind: {
                path: '$building_id',
                preserveNullAndEmptyArrays: true,
              },
            };

            const siteLookUp = {
              $lookup: {
                from: 'sites',
                let: {buildingId: {$convert: {input: '$building_id', to: 'objectId'}}},
                pipeline: [{
                  $unwind: {
                    path: '$buildings',
                    preserveNullAndEmptyArrays: true,
                  },
                }, {$match: {'$expr': {'$eq': ['$buildings._id', '$$buildingId']}}},
                {
                  $project: {
                    siteId: '$_id',
                    siteName: '$siteName',
                    builidingId: '$buildings._id',
                    buildingName: '$buildings.name',
                  },
                },
                ],
                as: 'buildings',
              },
            };

            const unwindSite = {
              $unwind: {
                path: '$buildings',
                preserveNullAndEmptyArrays: true,
              },
            };

            const unwindStationsAggr = {
              $unwind: {
                path: '$stations_assigned',
                preserveNullAndEmptyArrays: true,
              },
            };
            const lookupStationAggr = {
              $lookup: {
                from: 'floors',
                let: {
                  stationId: '$stations_assigned',
                  tenant_id: mongoose.Types.ObjectId(args.tenant_id),
                },
                pipeline: [{
                  $unwind: '$stations',
                },
                {
                  $match: {
                    $expr: {
                      $and: [{
                        $eq: ['$$stationId', '$stations._id'],
                      }, {
                        $eq: ['$$tenant_id', '$tenant_id'],
                      }],
                    },
                  },
                },
                {
                  $project: {
                    station_id: '$stations._id',
                    stationId: '$stations.stationId',
                    stationName: '$stations.name',
                    _id: 0,
                  },
                },
                ],
                as: 'stationDocs',
              },
            };
            const stationsUnwindAggr = {
              $unwind: {
                path: '$stationDocs',
                preserveNullAndEmptyArrays: true,
              },
            };

            const lookupAggr = {
              $lookup: {
                from: 'roles',
                let: {
                  role: '$role',
                  tenant_id: mongoose.Types.ObjectId(args.tenant_id),
                },
                pipeline: [{
                  $match: {
                    $expr: {
                      $and: [{
                        $eq: ['$$role', '$_id'],
                      }, {
                        $eq: ['$$tenant_id', '$tenant_id'],
                      }],
                    },
                  },
                },
                {
                  $project: {
                    name: 1,
                    _id: 1,
                  },
                },
                ],
                as: 'roleDocs',
              },
            };
            const unwindAggr = {
              $unwind: '$roleDocs',
            };

            const countryLookup = {
              $lookup: {
                from: 'countries',
                let: {countryId: {$convert: {input: '$country', to: 'objectId'}}},
                pipeline: [{$match: {'$expr': {'$eq': ['$_id', '$$countryId']}}},
                  {$project: {name: 1}},
                ],
                as: 'countryObj',
              },
            };

            const unwindCountry = {
              $unwind: {
                path: '$countryObj',
                preserveNullAndEmptyArrays: true,
              },
            };

            const stateLookup = {
              $lookup: {
                from: 'states',
                let: {stateId: {$convert: {input: '$state', to: 'objectId'}}},
                pipeline: [{$match: {'$expr': {'$eq': ['$_id', '$$stateId']}}},
                  {$project: {name: 1}},
                ],
                as: 'stateObj',
              },
            };

            const unwindState = {
              $unwind: {
                path: '$stateObj',
                preserveNullAndEmptyArrays: true,
              },
            };

            const groupByAggr = {
              $group: {
                _id: {
                  _id: '$_id',
                },
                firstName: {
                  $first: '$firstName',
                },
                lastName: {
                  $first: '$lastName',
                },
                middleName: {
                  $first: '$middleName',
                },
                email: {
                  $first: '$email',
                },
                phone_no: {
                  $first: '$phone_no',
                },
                dob: {
                  $first: '$dob',
                },
                empId: {
                  $first: '$empId',
                },
                address: {$first: '$address'},
                country: {$first: '$countryObj.name'},
                country_id: {$first: '$countryObj._id'},
                state: {$first: '$stateObj.name'},
                state_id: {$first: '$stateObj._id'},
                city: {$first: '$city'},
                zipcode: {$first: '$zipcode'},
                profile_pic: {
                  $first: '$profile_pic',
                },
                createdAt: {
                  $first: '$createdAt',
                },
                role: {
                  $first: '$roleDocs._id',
                },
                reporting_manager: {$first: '$reporting_manager'},

                stations_assigned: {
                  // $addToSet: {
                  //  station_id: '$stationDocs._id',
                  //  stationId: '$stationDocs.stationId',
                  //  stationName: '$stationDocs.stationName',
                  // },
                  $push: {
                    $cond: [{$gt: ['$stationDocs._id', null]}, {
                      station_id: '$stationDocs._id',
                      stationId: '$stationDocs.stationId',
                      stationName: '$stationDocs.stationName',
                    }, '$$REMOVE'],
                  },
                },
                site_name: {
                  // $addToSet: {siteId: '$buildings.siteId', siteName: '$buildings.siteName'},
                  $push: {
                    $cond: [{$gt: ['$buildings.siteId', null]}, {siteId: '$buildings.siteId', siteName: '$buildings.siteName'}, '$$REMOVE'],
                  },
                },


                building_name: {
                  // $addToSet: {buildingId: '$buildings.builidingId', buildingName: '$buildings.buildingName'}
                  $push: {
                    $cond: [{$gt: ['$buildings.builidingId', null]}, {buildingId: '$buildings.builidingId', buildingName: '$buildings.buildingName'}, '$$REMOVE'],
                  },


                },


                active: {
                  $first: '$active',
                },
                createdDate: {
                  $first: '$createdAt',
                },
              },
            };
            const sortOder = {
              $sort: {
                createdAt: -1,
              },
            };
            const projectAggr = {
              $project: {
                _id: '$_id._id',
                profile_pic: 1,
                firstName: 1,
                lastName: 1,
                middleName: 1,
                fullName: {
                  $concat: ['$firstName', ' ', '$lastName'],
                },
                email: 1,
                empId: 1,
                role: 1,
                phone_no: 1,
                dob: 1,
                address: 1,
                country: 1,
                country_id: 1,
                state: 1,
                state_id: 1,
                city: 1,
                zipcode: 1,
                stations_assigned: 1,
                site_name: 1,
                building_name: 1,
                active: 1,
                reporting_manager: 1,
                createdDate: 1,
              },
            };


            aggrStages.push(match);
            aggrStages.push(unwindBuilding);
            aggrStages.push(lookupAggr);
            aggrStages.push(unwindAggr);
            aggrStages.push(siteLookUp);
            aggrStages.push(unwindSite);
            aggrStages.push(unwindStationsAggr);
            aggrStages.push(lookupStationAggr);
            aggrStages.push(stationsUnwindAggr);
            aggrStages.push(countryLookup);
            aggrStages.push(unwindCountry);
            aggrStages.push(stateLookup);
            aggrStages.push(unwindState);
            aggrStages.push(groupByAggr);
            aggrStages.push(sortOder);
            aggrStages.push(projectAggr);


            User.aggregate(aggrStages)
                .then((result) => {
                  if (result == null) {
                    reject({
                      status: 'Fail',
                      code: 422,
                      message: 'No record found',
                    });
                  } else {
                    console.log(result[0]);
                    resolve(result[0]);
                  }
                }).catch((error) => {
                  reject({
                    status: 'Fail',
                    code: 422,
                    message: 'No record found',
                  });
                });
          } else {
            resolve({});
          }
        } catch (error) {
          reject({
            status: 'Fail',
            code: 422,
            message: error.message,
          });
        }
      });

      const rolesList = new Promise((resolve, reject) => {
        try {
          Role.find({
            tenant_id: mongoose.Types.ObjectId(args.tenant_id),
            status: true,
          }, 'name _id').lean().exec()
              .then((roleData) => {
                resolve(roleData);
              }).catch((error) => {
                reject({
                  status: 'Fail',
                  code: 422,
                  message: error.message,
                });
              });
        } catch (error) {
          reject({
            status: 'Fail',
            code: 422,
            message: error.message,
          });
        }
      });
      const countriesList = new Promise((resolve, reject) => {
        try {
          Country.find({}, 'name _id').sort({'name': 1}).lean().exec()
              .then((countryData) => {
                resolve(countryData);
              });
        } catch (error) {
          reject({
            status: 'Fail',
            code: 422,
            message: error.message,
          });
        }
      });

      /* let stationsList = new Promise((resolve, reject) => {
					  try {
						  let asyncArr = []
						  let unwindAggr = { $unwind: "$stations" }
						  let matchAggr = { $match: { tenant_id: mongoose.Types.ObjectId(args.tenant_id), active: true } }
						  let projectAggr = {
							  $project: {
								  _id: 0,
								  "stationName": "$stations.name",
								  "station_id": "$stations._id",
								  "stationId": "$stations.stationId"
							  }
						  }
						  asyncArr.push(matchAggr)
						  asyncArr.push(unwindAggr)
						  asyncArr.push(projectAggr)
						  Floor.aggregate(asyncArr).exec()
							  .then(stationData => {
								  resolve(stationData)
							  }).catch(error => {
								  reject({ status: "Fail", code: 422, message: error.message })
							  })
					  } catch (error) {
						  reject({ status: "Fail", code: 422, message: error.message })
					  }
				  }) */

      const buildingList = new Promise((resolve, reject) => {
        const aggrStages = [];
        const matchAggr = {
          $match: {
            tenant_id: mongoose.Types.ObjectId(args.tenant_id),
          },
        };

        const siteUnwind = {$unwind: {path: '$buildings'}};
        const stationAggr = {
          $lookup: {
            from: 'floors',
            let: {
              'main_building_id': '$buildings._id',
            },
            pipeline: [{
              $match: {
                $expr: {
                  $eq: ['$$main_building_id', '$building_id'],
                },
              },
            },
            {
              $project: {
                stations_count: {
                  $size: '$stations',
                },
              },
            },
            {
              $match: {
                stations_count: {
                  $gt: 0,
                },
              },
            },
            ],
            as: 'floorStations',
          },
        };
        const unwindFloor = {
          $unwind: '$floorStations',
        };
        const projectAggr = {
          $project: {
            building_id: '$_id',
            _id: 0,
            building_name: '$name',
          },
        };

        aggrStages.push(matchAggr);
        aggrStages.push(siteUnwind);
        aggrStages.push(stationAggr);
        aggrStages.push(unwindFloor);
        aggrStages.push(projectAggr);
        Site.aggregate(aggrStages).then((data) => {
          resolve(data);
        }).catch((error) => reject({
          status: 'Fail',
          code: 422,
          message: error.message,
        }));
      });

      Promise.all([userObj, rolesList, countriesList, buildingList]).then((results) => {
        if (args.id && results[0] && results[0].building_id != undefined) {
          this.getStationsByBuildingId({
            tenant_id: args.tenant_id,
            building_id: results[0].building_id,
          })
              .then((status) => {
                resolve({
                  userData: results[0],
                  rolesList: results[1],
                  countries: results[2],
                  buildings: results[3],
                  stationData: status.stationData,
                });
              }).catch((error) => {
                resolve({
                  userData: results[0],
                  rolesList: results[1],
                  countries: results[2],
                  buildings: results[3],
                });
              });
        } else {
          resolve({
            userData: results[0],
            rolesList: results[1],
            countries: results[2],
            buildings: results[3],
          });
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }
  /**
* @param {args} args
* @return {object} get states data
* @description get states data
*/
  async getStates(args) {
    return new Promise((resolve, reject) => {
      try {
        if (args.country) {
          State.find({
            country: mongoose.Types.ObjectId(args.country),
          }, 'name code _id').sort({name: 1}).exec()
              .then((stateData) => {
                if (stateData != null && stateData.length == 0) {
                  reject({
                    status: 'Fail',
                    code: 422,
                    message: 'No data found',
                  });
                } else {
                  resolve(stateData);
                }
              }).catch((error) => reject({
                status: 'Fail',
                code: 422,
                message: error.message,
              }));
        } else {
          reject({
            status: 'Fail',
            code: 422,
            message: 'Country id required',
          });
        }
      } catch (error) {
        reject({
          status: 'Fail',
          code: 422,
          message: error.message,
        });
      }
    });
  }
  /**
* @param {args} args
* @return {object} get citi data
* @description get city data
*/
  async getCities(args) {
    return new Promise((resolve, reject) => {
      try {
        if (args.country && args.state) {
          City.find({
            country: mongoose.Types.ObjectId(args.country),
            state: mongoose.Types.ObjectId(args.state),
          }, 'name _id zipcodes').sort({name: 1}).exec()
              .then((citiesData) => {
                if (citiesData != null && citiesData.length == 0) {
                  reject({
                    status: 'Fail',
                    code: 422,
                    message: 'No data found',
                  });
                } else {
                  resolve(citiesData);
                }
              }).catch((error) => reject({
                status: 'Fail',
                code: 422,
                message: error.message,
              }));
        } else {
          reject({
            status: 'Fail',
            code: 422,
            message: 'Country or State id missing',
          });
        }
      } catch (error) {
        reject({
          status: 'Fail',
          code: 422,
          message: error.message,
        });
      }
    });
  }

  // Method for getting country list
  /**
* @return {object} get country data
* @description get country data
*/
  getCountry() {
    return new Promise((resolve, reject) => {
      const match = {$match: {}};
      const sort = {$sort: {name: 1}};
      Country.aggregate([match, sort]).then((country) => {
        resolve({
          status: 'success',
          message: 'Country List',
          countryList: country,
        });
      }).catch((error) => {
        reject({
          status: 'Fail',
          code: 422,
          message: error.message,
        });
      });
    });
  }
  /**
* @param {args} args
* @return {object} get suoervisor data
* @description  get suoervisor data
*/
  getSupervisorList(args) {
    return new Promise((resolve, reject) => {
      const matchAggr = {
        $match: {
          tenant_id: mongoose.Types.ObjectId(args.tenant_id),
          active: true,
        },
      };
      if (args.user_id) {
        matchAggr['$match']['_id'] = {
          $ne: mongoose.Types.ObjectId(args.user_id),
        };
      }
      const lookupAggr = {
        $lookup: {
          from: 'roles',
          let: {
            role: '$role',
            tenant_id: mongoose.Types.ObjectId(args.tenant_id),
          },
          pipeline: [{
            $match: {
              $expr: {
                $and: [{
                  $eq: ['$$role', '$_id'],
                }, {
                  $eq: ['$$tenant_id', '$tenant_id'],
                }, {
                  $eq: ['$name', 'Supervisor'],
                }],
              },
            },
          },
          {
            $project: {
              name: 1,
              _id: 0,
            },
          },
          ],
          as: 'roleDocs',
        },
      };
      const unwindAggr = {
        $unwind: '$roleDocs',
      };
      const projectAggr = {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          middleName: 1,
          profile_pic: 1,
        },
      };
      const asyncArr = [];
      asyncArr.push(matchAggr);
      asyncArr.push(lookupAggr);
      asyncArr.push(unwindAggr);
      asyncArr.push(projectAggr);
      User.aggregate(asyncArr).exec()
          .then((rmList) => {
            console.log(rmList);
            resolve(rmList);
          }).catch((error) => reject(error));
    });
  }
  /**
* @param {user_id} user_id
* @param {stations} stations
* @param {active} active
* @param {tenant_id} tenant_id
* @return {object} update stations data
* @description update stations data
*/
  updateStationsWithUsers(user_id, stations, active, tenant_id) {
    console.log(user_id, stations, active);
    // To DO
    // We have to store guard and supervisor in diff array in stations.
    return new Promise((resolve, reject) => {
      const removeUserFromStations = () => {
        return new Promise((resolve, reject) => {
          Floor.updateMany({
            tenant_id: mongoose.Types.ObjectId(tenant_id),
          }, {
            $pull: {
              'stations.$[element].guard_id': mongoose.Types.ObjectId(user_id),
            },
          }, {
            arrayFilters: [{
              'element.guard_id': user_id,
            }],
            multi: true,
          })
              .then((result) => {
                resolve();
              }).catch((error) => reject({
                status: 'Fail',
                code: 422,
                message: error.message,
              }));
        });
      };
      const mapUsersToStations = () => {
        return new Promise((resolve, reject) => {
          Floor.updateMany({
            tenant_id: mongoose.Types.ObjectId(tenant_id),
          }, {
            $push: {
              'stations.$[elem].guard_id': mongoose.Types.ObjectId(user_id),
            },
          }, {
            arrayFilters: [{
              'elem._id': {
                $in: stations,
              },
            }],
            multi: true,
          }).then((result) => {
            resolve();
          }).catch((error) => reject({
            status: 'Fail',
            code: 422,
            message: error.message,
          }));
        });
      };
      removeUserFromStations()
          .then(() => {
            if (active == true) {
              mapUsersToStations().then(() => {
                resolve();
              })
                  .catch((error) => reject(error));
              //  resolve()
            } else {
              resolve();
            }
          }).catch((error) => reject(error));
    });
  }
  /**
* @param {args} args
* @return {object} get stations data
* @description  get stations data
*/
  getStationsByBuildingId(args) {
    return new Promise((resolve, reject) => {
      try {
        const asyncArr = [];
        const matchAggr = {
          $match: {
            tenant_id: mongoose.Types.ObjectId(args.tenant_id),
            active: true,
            building_id: mongoose.Types.ObjectId(args.building_id),
          },
        };
        const unwindAggr = {
          $unwind: '$stations',
        };
        const projectAggr = {
          $project: {
            '_id': 0,
            'stationName': '$stations.name',
            'station_id': '$stations._id',
            'stationId': '$stations.stationId',
          },
        };
        asyncArr.push(matchAggr);
        asyncArr.push(unwindAggr);
        asyncArr.push(projectAggr);
        Floor.aggregate(asyncArr).exec()
            .then((stationData) => {
              resolve({
                status: 'Success',
                code: 200,
                stationData: stationData,
              });
            }).catch((error) => {
              reject({
                status: 'Fail',
                code: 422,
                message: error.message,
              });
            });
      } catch (error) {
        reject({
          status: 'Fail',
          code: 422,
          message: error.message,
        });
      }
    });
  }

  // Method for saving family mambers
  /**
* @param {req} req
* @param {res} res
* @return {object} add family member
* @description   add family member
*/
  saveFamilyMember(req, res) {
    return new Promise((resolve, reject) => {
      const parseReq = () => {
        return new Promise((resolve, reject) => {
          Utils.prototype.uploadUserProfilePics(req, res)
              .then(() => resolve()).catch((error) => reject(error));
        });
      };

      const createUserProfilePic = () => {
        return new Promise((resolve, reject) => {
          try {
            if (req.file) {
              const imagePath = req.protocol + '://' + req.headers.host + '/tenants/' + req.session.tenant_id + '/Users/' + req.file.filename;
              return resolve(imagePath);
            } else {
              return resolve();
            }
          } catch (error) {
            return reject(error);
          }
        });
      };

      const checkExistingUser = () => {
        return new Promise((resolve, reject) => {
          // console.log(req.body.email);
          User.findOne({email: req.body.email}).lean().then((user) => {
            if (user) {
              reject({
                code: 422,
                name: 'unprocessable_entity',
                message: 'Email already exists in application.',
              });
            } else {
              resolve();
            }
          }).catch((error) => {
            reject(error);
          });
        });
      };

      const getFamilyMemberRole = {$match: {$and: [{name: 'Family Member'}, {tenant_id: {$exists: false}}]}};
      const familiyMemberRoleProjection = {$project: {_id: 1}};

      const createUser = (img) => {
        return new Promise((resolve, reject) => {
          const args = req.body;
          args.tenant_id = req.session.tenant_id;
          Role.aggregate([getFamilyMemberRole, familiyMemberRoleProjection]).then((roleId) => {
            const checkFamilyMeber = {
              $match: {
                $and: [{
                  tenant_id: mongoose.Types.ObjectId(args.tenant_id),
                }, {
                  email: args.email,
                }],
              },
            };
            User
                .aggregate([checkFamilyMeber])
                .then(async (result) => {
                  if (result.length) {
                    reject({
                      code: 422,
                      name: 'unprocessable_entity',
                      message: 'Family member already added by Home Owner.',
                    });
                  } else {
                    const newUser = new User();
                    newUser.firstName = args.firstName;
                    newUser.lastName = args.lastName;
                    newUser.middleName = args.middleName;
                    newUser.email = args.email;
                    newUser.role = mongoose.Types.ObjectId(roleId[0]._id); // DEfault family member role make it dynamic
                    newUser.tenant_id = mongoose.Types.ObjectId(args.tenant_id);
                    newUser.password = args.password || 'Test@123456';
                    newUser.phone_no = args.phone_no || '';
                    newUser.dob = (args.dob) ? new Date(args.dob) : undefined;
                    newUser.address = args.address;
                    newUser.empId = 'eid' + Math.floor(Math.random() * 10000);
                    newUser.city = args.city || undefined;
                    newUser.country = args.country || undefined;
                    newUser.zipcode = args.zipcode || undefined;
                    newUser.state = args.state || undefined;
                    newUser.profile_pic = img || '';
                    newUser.active = true;

                    newUser.save((error, user) => {
                      if (error) {
                        reject({
                          code: 422,
                          name: 'unprocessable_entity',
                          message: error.message,
                        });
                      } else {
                        // NotificationsService.prototype.sendWelcomeEmail(user, password);
                        const userObj = user.toObject();
                        delete userObj.__v;
                        delete userObj.createdAt;
                        delete userObj.updatedAt;
                        delete userObj.password_history;
                        resolve();
                      }
                    });
                  }
                }).catch((error) => reject(error));
          }).catch((error) => reject(error));
        });
      };

      parseReq()
          .then(checkExistingUser)
          .then(createUserProfilePic)
          .then(createUser)
          .then(() => {
            resolve({
              status: 'Success',
              code: 200,
              message: 'Family member added successfully',
            });
          })
          .catch((error) => reject(error));
    });
  }
  // Method for getting family member list
  /**
* @param {tenantId} tenantId
* @return {object} get family member
* @description   get family member
*/
  getFamilyMember(tenantId) {
    return new Promise((resolve, reject) => {
      const userMatch = {$match: {tenant_id: mongoose.Types.ObjectId(tenantId)}};
      const sort = {$sort: {createdAt: -1}};
      const month = {
        $set: {
          month: {
            $let: {
              vars: {
                monthsInString: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              },
              in: {
                $arrayElemAt: ['$$monthsInString', {'$month': '$dob'}],
              },
            },
          },
        },
      };
      const project = {
        $project: {
          _id: 1,
          fullName: {$concat: ['$firstName', ' ', '$lastName']},
          email: 1,
          dob: {
            $concat: [{'$toLower': {'$dayOfMonth': '$dob'}}, ' ', '$month', ' ', {'$toLower': {'$year': '$dob'}}],
          },
          mobile: '$phone_no',
          profile_pic: 1,
          active: 1,

        },
      };
      User.aggregate([userMatch, sort, month, project]).then((userArray) => {
        if (userArray.length) {
          resolve({
            status: 'success',
            message: 'Family Members',
            usersList: userArray,
          });
        } else {
          reject({
            status: 'fail',
            message: 'No Family Members found',
          });
        }
      }).catch((error) => reject(error));
    });
  }


  // Method for deactivating a family member
  /**
* @param {userId} userId
* @param {action} action
* @return {object} get family member
* @description   get family member
*/
  deactivateFamilyMember(userId, action) {
    return new Promise((resolve, reject) => {
      User.update({
        _id: mongoose.Types.ObjectId(userId),
      }, {
        $set: {
          active: action,
        },
      }).then((data) => {
        if (action == false) {
          resolve({
            status: 'Success',
            status: 200,
            message: 'Family member deactivated',
          });
        } else {
          resolve({
            status: 'Success',
            status: 200,
            message: 'Family member activated',
          });
        }
      }).catch((error) => reject(error));
    });
  }

  // Method for updating family member data
  /**
* @param {req} req
* @param {res} res
* @return {object} update family member
* @description   update family member
*/
  updateFamilyMember(req, res) {
    return new Promise((resolve, reject) => {
      const parseReq = () => {
        return new Promise((resolve, reject) => {
          Utils.prototype.uploadUserProfilePics(req, res)
              .then(() => resolve()).catch((error) => reject(error));
        });
      };

      const createUserProfilePic = () => {
        return new Promise((resolve, reject) => {
          try {
            if (req.file) {
              const imagePath = req.protocol + '://' + req.headers.host + '/tenants/' + req.session.tenant_id + '/Users/' + req.file.filename;
              return resolve(imagePath);
            } else {
              return resolve();
            }
          } catch (error) {
            return reject(error);
          }
        });
      };

      const updateUser = (img) => {
        return new Promise((resolve, reject) => {
          const args = req.body;
          args.tenant_id = req.session.tenant_id;
          const userId = req.params.userid;
          User
              .update({
                $and: [{
                  _id: mongoose.Types.ObjectId(userId),
                }],
              }, {
                $set: {
                  firstName: args.firstName,
                  middleName: args.middleName,
                  lastName: args.lastName,
                  dob: new Date(args.dob),
                  phone_no: args.phone_no,
                  address: args.address,
                  country: args.country,
                  city: args.city,
                  state: args.state,
                  zipcode: args.zipcode,
                  profile_pic: img,

                },
              })
              .exec()
              .then(async (result) => {
                if (result) {
                  resolve({
                    status: 'Success',
                    code: 200,
                    message: 'Family member updated successfully',
                  });
                } else {
                  reject({
                    status: 'Fail',
                    code: 422,
                    message: 'Check wheather user exists and is active.',
                  });
                }
              });
        }).catch((error) => reject(error));
      };

      parseReq()
          .then(createUserProfilePic)
          .then(updateUser)
          .then((data) => {
            resolve(data);
          })
          .catch((error) => reject(error));
    });
  }

  // method for searching family member
  /**
* @param {filter} filter
* @param {tenantId} tenantId
* @return {object} search family member
* @description  search family member
*/
  searchFamilyMember(filter, tenantId) {
    return new Promise((resolve, reject) => {
      // Add tenant id to condition
      const searchArr = [];
      searchArr.push({
        tenant_id: mongoose.Types.ObjectId(tenantId),
      });
      // If name is there add condition
      if (filter.name) {
        const name = filter.name.split(' ');
        searchArr.push({
          $text: {
            $search: name[0],
          },
        });
      }

      // If fromdate is there add to condition
      if (filter.fromDate) {
        searchArr.push({
          createdAt: {
            $gte: new Date(filter.fromDate),
          },
          // $gte : {createdAt : new Date(filter.fromDate)}
        });
      }

      // If fromdate is there add to condition
      if (filter.toDate) {
        const date = new Date(filter.toDate);
        searchArr.push({
          createdAt: {
            $lt: date.setDate(date.getDate() + 1),
          },
        });
      }

      if (filter.active) {
        searchArr.push({
          active: filter.active,
        });
      }

      const match = {$match: {$and: searchArr}};
      const sort = {$sort: {createdAt: -1}};
      const month = {
        $set: {
          month: {
            $let: {
              vars: {
                monthsInString: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              },
              in: {
                $arrayElemAt: ['$$monthsInString', {'$month': '$dob'}],
              },
            },
          },
        },
      };
      const project = {
        $project: {
          _id: 1,
          fullName: {$concat: ['$firstName', ' ', '$lastName']},
          email: 1,
          dob: {
            $concat: [{'$toLower': {'$dayOfMonth': '$dob'}}, ' ', '$month', ' ', {'$toLower': {'$year': '$dob'}}],
          },
          mobile: '$phone_no',
          profile_pic: 1,
          active: 1,

        },
      };
      User.aggregate([match, sort, month, project])
          .then((data) => {
            if (data.length) {
              resolve(data);
            } else {
              resolve([]);
            }
          }).catch((error) => {
            reject(error);
          });
    });
  }

  // login code has been moved here
  /**
* @param {reqBody} reqBody
* @return {object} login response
* @description login response
*/
  login(reqBody) {
    let user; let role;
    return new Promise((resolve, reject) => {
      const findUser = () => {
        return new Promise((resolve, reject) => {
          User.findOne({email: reqBody.email}, {password_history: 0, password: 0}).populate('tenant_id').lean()
              .then((userData) => {
                user = userData;
                if (user.active == false) {
                  reject('Your account has been de-activated. Please contact your admin.');
                } else resolve();
              }).catch((error) => reject(error));
        });
      };
      // Method to check the user asccounts payment status
      const checkAccountExpiry = () => {
        return new Promise((resolve, reject) => {
          const match = {$match: {email: reqBody.email}};
          const tenantLookup = {
            $lookup: {
              from: 'tenants',
              let: {tenantId: {$convert: {input: '$tenant_id', to: 'objectId'}}},
              pipeline: [{$match: {'$expr': {'$eq': ['$_id', '$$tenantId']}}}, {$project: {_id: 0, expiry_date: 1}}],
              as: 'tenantObj',
            },
          };
          const unwindTenant = {
            $unwind: {
              path: '$tenantObj',
              preserveNullAndEmptyArrays: true,
            },
          };
          const project = {
            $project: {
              _id: 0,
              tenantObj: 1,
            },
          };

          const asyncArry = [];
          asyncArry.push(match);
          asyncArry.push(tenantLookup);
          asyncArry.push(unwindTenant);
          asyncArry.push(project);
          User.aggregate(asyncArry).then((data) => {
            if (data.length) {
              const currentDate = new Date();
              const expDate = new Date(data[0].tenantObj.expiry_date);
              let isExpired = true;
              if (currentDate > expDate) {
                resolve(isExpired);
              } else {
                isExpired = false;
                resolve(isExpired);
              }
            }
            // We have to reject login if we dont find expiry date. But for time being we are managing.
            resolve(false);
          });
        });
      };
      const roleDataFunc = () => {
        return new Promise((resolve, reject) => {
          const matchAggr = {$match: {}};
          if (user.role != undefined) {
            matchAggr['$match']['_id'] = user.role;
          } else {
            matchAggr['$match']['tenant_id'] = {'$exists': false};
            if (user.tenant_id.type == 'Commercial') {
              matchAggr['$match']['name'] = 'Admin';
            } else {
              matchAggr['$match']['name'] = 'Home Owner';
            }
          }
          const lookupAggr = {
            $lookup: {
              from: 'features',
              let: {access_list: '$access_list'},
              pipeline: [{
                $match: {
                  $expr: {
                    $in: ['$_id', '$$access_list'],
                  },
                },
              }, {
                $sort: {
                  createdAt: 1,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
              ],
              as: 'access_list',
            },
          };
          const projectAggr = {$project: {_id: 1, name: 1, access_list: 1, description: 1, type: 1}};
          const asyncArr = [];
          asyncArr.push(matchAggr);
          asyncArr.push(lookupAggr);
          asyncArr.push(projectAggr);
          Role.aggregate(asyncArr)
              .then((roleData) => {
                role = roleData[0];
                if (role != undefined) {
                  role.features = [];
                  for (const i in role.access_list) {// eslint-disable-line
                    role.features.push(role.access_list[i].name);// eslint-disable-line
                  }
                  resolve();
                } else {
                  reject('User assigned role does not exist anymore.');
                }
              }).catch((error) => reject(error));
        });
      };
      const updateHomeUser = () => {
        return new Promise((resolve, reject) => {
          if (user.role == undefined && user.tenant_id.type == 'Residential') {
            User.updateOne({_id: mongoose.Types.ObjectId(user._id)},
                {
                  $set: {role: role._id},
                })
                .then((result) => resolve())
                .catch((error) => reject(error));
          } else {
            resolve();
          }
        });
      };

      const createSessionFunc = (isExpired) => {
        return new Promise((resolve, reject) => {
          const args = {
            user_id: user._id,
            token: reqBody.token,
            timezone: reqBody.timezone,
            tenant_id: user.tenant_id._id,
            role: role,
            firstName: user.firstName,
            license_type: user.tenant_id.type,
            lastName: user.lastName,
            fcm_token: reqBody.fcm_token,
          };
          SessionsService
              .prototype
              .createUserSession(args)
              .then((session) => {
                const loginResp = _.extend(user, {
                  token: session.token,
                  tenant_id: user.tenant_id._id,
                  role: role.name,
                  role_type: role.type,
                  access_list: role.access_list,
                  isFirstLogin: (user.role) ? false : true,
                  isCommercialUser: (user.tenant_id.type == 'Commercial') ? true : false,
                  isAccountExpired: isExpired,
                });
                resolve(loginResp);
              }).catch((error) => reject(error));
        });
      };
      findUser()
          .then(roleDataFunc)
          .then(updateHomeUser)
          .then(checkAccountExpiry)
          .then(createSessionFunc)
          .then((session) => resolve(session),
          )
          .catch((error) => reject(error));
    });
  }
}
