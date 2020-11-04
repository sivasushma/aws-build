import {PasswordService} from '../../src/app/services';
import {Session, User} from '../../src/app/models';


export default class UsersFactory {
  async createUserAndSession() {
    return new Promise(async (resolve, reject) => {
      const userObj = {
        'name': 'Sandeep Mokkarala',
        'email': 'sandeepm@wavelabs.in',
        'role': 'admin',
        'password': 'P@ssword1',
      };


      const insertUser = await User.create(userObj);
      const sessionObj = {
        'client_id': null,
        'user_id': insertUser._id,
        'token': '5eebfb00271357d911051b285907db464e258971',
        'createdAt': Date('2019-02-22T05:59:48.388Z'),
        'updatedAt': Date('2019-02-22T05:59:48.388Z'),
      };
      const insertSession = await Session.create(sessionObj);
      resolve(insertSession);
    });
  }

  async getLatestuser() {
    return new Promise(async (resolve, reject) => {
      User.findOne({}, {}, {sort: {createdBy: -1}}, (error, doc) => {
        if (error) reject(error);
        else resolve(doc);
      });
    });
  }
}
