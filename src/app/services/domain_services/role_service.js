import {
  Role,
  Feature,
  User,
} from '../../models/index';
import mongoose from 'mongoose';
import _ from 'lodash';
import {
  resolve,
} from 'q';


export default class RoleService {
  addDefaultRole(tenanId, userId) {
    return new Promise((resolve, reject) => {
      Role.find({
        userType: 'Commercial',
      }).sort([
        ['createdAt', 1],
      ]).then((data) => {
        data.forEach((i) => {
          const newRole = new Role();
          newRole.name = i.name;
          newRole.access_list = i.access_list;
          newRole.status = i.status;
          newRole.type = i.type;
          newRole.description = i.description;
          newRole.tenant_id = mongoose.Types.ObjectId(tenanId);
          newRole.save(newRole).then((roleData) => {
            // Assign deafault admin role to tenant
            if (i.name == 'Admin') {
              User.updateOne({
                _id: mongoose.Types.ObjectId(userId),
              }, {
                $set: {
                  role: mongoose.Types.ObjectId(roleData._id),
                },
              }).then((data) => {
                resolve('Successfully Migrated Roles');
              }).catch((err) => {});
            }
          }).catch((error) => {
            reject(error.message);
          });
        });
      }).catch((error) => {
        reject(error.message);
      });
    });
  }


  // Get Tenant defined roles

  getTenentRoles(tenantId) {
    return new Promise((resolve, reject) => {
      const getDefaultRoles = () => {
        return new Promise((resolve, reject) => {
          Role.find({
            userType: 'Commercial',
          }, 'name description').sort([
            ['createdAt', 1],
          ])
              .then((data) => {
                resolve(data);
              }).catch((error) => reject(error));
        });
      };
      const rolesByTenantId = () => {
        return new Promise((resolve, reject) => {
          const matchAggr = {
            $match: {
              tenant_id: mongoose.Types.ObjectId(tenantId),
            },
          };
          const lookupAggr = {
            $lookup: {
              from: 'features',
              let: {
                access_list: '$access_list',
              },
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
                  _id: 1,
                  name: 1,
                  type: 1,
                  category: 1,
                },
              },
              ],
              as: 'featureDocs',
            },
          };
          const projectAggr = {
            $project: {
              _id: 1,
              access_list: '$featureDocs',
              name: 1,
              description: 1,
            },
          };
          const sort = {
            $sort: {
              createdAt: 1,
            },
          };
          const asyncArr = [];
          asyncArr.push(matchAggr);
          asyncArr.push(lookupAggr);
          asyncArr.push(sort);
          asyncArr.push(projectAggr);
          Role.aggregate(asyncArr)
              .then((data) => {
                if (data != null && data.length > 0) {
                  resolve(data);
                } else resolve(null);
              }).catch((error) => reject(error));
        });
      };
      const countAvailableFeatures = () => {
        return new Promise((resolve, reject) => {
          Feature.find({
            userType: 'Commercial',
          }).count()
              .then((count) => {
                resolve(count);
              });
        });
      };

      Promise.all([rolesByTenantId(), countAvailableFeatures()])
          .then((results) => {
            if (results && results[0] != null && results[0].length > 0) {
              _.forEach(results[0], (roleObj) => {
                roleObj.total_assigned_features = roleObj.access_list.length;
                roleObj.total_availabe_features = results[1];
              });
              resolve({
                status: 'Success',
                code: 200,
                roleList: results[0],
              });
            } else {
              getDefaultRoles()
                  .then((data) => {
                    resolve({
                      status: 'Success',
                      code: 200,
                      roleList: data,
                    });
                  }).catch((error) => reject(error));
            }
          }).catch((error) => reject(error));
    });
  }

  // Method for getting perticular role details
  getPerticularRoleDetail(tenantId, roleId) {
    return new Promise((resolve, reject) => {
      Role.aggregate([{
        $match: {
          $and: [{
            _id: mongoose.Types.ObjectId(roleId),
          }, {
            tenant_id: mongoose.Types.ObjectId(tenantId),
          }],
        },
      },
      {
        $lookup: {
          from: 'features',
          let: {
            access_list: '$access_list',
          },
          pipeline: [{
            $match: {
              $expr: {
                $in: ['$_id', '$$access_list'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              category: 1,
              type: 1,
            },
          },
          ],
          as: 'featureDocs',
        },
      }, {
        $project: {
          _id: 1,
          access_list: '$featureDocs',
          name: 1,
          description: 1,
        },
      },
      ]).then((role) => {
        if (role.length > 0) {
          resolve(role);
        } else {
          Role.aggregate([{
            $match: {
              _id: mongoose.Types.ObjectId(roleId),
            },
          }, {
            $lookup: {
              from: 'features',
              let: {
                access_list: '$access_list',
              },
              pipeline: [{
                $match: {
                  $expr: {
                    $in: ['$_id', '$$access_list'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  category: 1,
                  type: 1,
                },
              },
              ],
              as: 'featureDocs',
            },
          },
          {
            $project: {
              _id: 1,
              access_list: '$featureDocs',
              name: 1,
              description: 1,
            },
          },
          ]).then((role) => {
            if (role.length) {
              resolve(role);
            } else {
              resolve('Role does not exist in the system. Please check the role id');
            }
          });
        }
      }).catch((error) => reject(error));
    });
  }

  addCustomRole(tenantId, role, userId) {
    return new Promise((resolve, reject) => {
      // TO DO check wheather tenant has already this role.
      Role.aggregate([{
        $match: {
          $and: [{
            tenant_id: mongoose.Types.ObjectId(tenantId),
          }, {
            name: role.name,
          }],
        },
      }]).then((data) => {
        if (data.length == 0) {
          const newRole = new Role();
          newRole.name = role.name;
          newRole.access_list = role.access_list;
          newRole.type = 'Custom';
          newRole.description = role.description;
          newRole.tenant_id = mongoose.Types.ObjectId(tenantId);
          newRole.save(newRole).then((roleData) => {
            // If tennet does not has any role ssign the same custom role to the tenant.

            User.findById({
              _id: userId,
            }).then((user) => {
              if (user.role) {
                resolve('Custom role added successfully.');
              } else {
                User.updateOne({
                  _id: mongoose.Types.ObjectId(userId),
                }, {
                  $set: {
                    role: mongoose.Types.ObjectId(roleData._id),
                  },
                }).then((data) => {
                  resolve('Custom role added successfully.');
                }).catch((err) => {
                  reject(err.message);
                });
              }
            });
          }).catch((error) => {
            reject(error.message);
          });
        } else {
          reject('Custom role already exists for the tenant.');
        }
      });
    });
  }

  updateRole(tenantId, role) {
    return new Promise((resolve, reject) => {
      _.forEach(role.access_list, (featureObj, idx) => {
        role.access_list[idx] = mongoose.Types.ObjectId(featureObj);
      });

      Role.findOneAndUpdate({
        _id: mongoose.Types.ObjectId(role._id),
      }, {
        $set: {
          access_list: role.access_list,
          description: role.description,
        },
      }).then((data) => {
        resolve('Role updated successfully.');
      }).catch((error) => {
        reject(error.message);
      });
    });
  }

  // Method for getting list of access of particular role
  getRoleFeatures(roleId) {
    return new Promise((resolve, reject) => {
      Role.aggregate([{
        $match: {
          _id: mongoose.Types.ObjectId(roleId),
        },
      },
      {
        $lookup: {
          from: 'features',
          let: {
            access_list: '$access_list',
          },
          pipeline: [{
            $match: {
              $expr: {
                $in: ['$_id', '$$access_list'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              type: 1,
              category: 1,
            },
          },
          ],
          as: 'featureDocs',
        },
      }, {
        $sort: {
          name: 1,
        },
      },
      {
        $project: {
          _id: 1,
          assigned_list: '$featureDocs',
          name: 1,
          description: 1,
        },
      },

      ]).then((assignedList) => {
        const arr = assignedList[0].assigned_list.map((i) => {
          return i.name;
        });
        Feature.aggregate([{
          $match: {
            $and: [{
              'name': {
                $nin: arr,
              },
            }, {
              userType: 'Commercial',
            }],

          },
        }, {
          $sort: {
            name: 1,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            type: 1,
            category: 1,
          },
        },
        ]).then((availabeList) => {
          assignedList[0].availabe_list = availabeList;
          resolve(assignedList);
        }).catch((error) => {
          reject(error.message);
        });
      });
    });
  }
  // To write methods for common code functionalities. Such as Role.find();


  // Method for getting residential default roles
  getResDeafaultRole() {
    return new Promise((resolve, reject) => {
      Role.aggregate([{
        $match: {
          $and: [{
            $or: [{
              name: 'Home Owner',
            }, {
              name: 'Family Member',
            }],
          }, {
            tenant_id: {
              $exists: false,
            },
          }],
        },
      },
      // {
      //     $lookup: {
      //         from: "features",
      //         let: {
      //             access_list: "$access_list"
      //         },
      //         pipeline: [{
      //                 $match: {
      //                     $expr: {
      //                         $in: ["$_id", "$$access_list"]
      //                     }
      //                 }
      //             },
      //             {
      //                 $project: {
      //                     _id: 1,
      //                     name: 1,
      //                     category: 1,
      //                     type: 1
      //                 }
      //             }
      //         ],
      //         as: "featureDocs"
      //     }
      // },
      {
        $project: {
          _id: 1,
          // access_list: "$featureDocs",
          name: 1,
          description: 1,
        },
      },
      ]).then((role) => {
        if (role.length) {
          resolve(role);
        } else {
          reject('error occured while fetching residential default role.');
        }
      }).catch((error) => {
        reject(error.message);
      });
    });
  }
}
