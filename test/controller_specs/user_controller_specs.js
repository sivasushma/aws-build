import {
  expect,
  sinon,
  mongoose,
} from '../common.test';

import {UsersService, OTPService, SessionsService} from '../../src/app/services';
import {UsersController} from '../../src/app/controllers/v1';


describe('User controller', () => {
  const sandbox = sinon.createSandbox();
  const next = sinon.spy();
  // request.body.name, request.body.email, null, request.body.role,null,adminUser
  const request = {
    body: {
      name: 'Srinivas',
      email: 'mnssandeep@gmail.com',
      role: 'admin',
    },
    current_user: {
      name: 'sandeep',
    },
    query: {
      limit: '10',
      page: '1',
    },
  };
  const usersController = new UsersController();

  describe('create new user', () => {
    const newUser = {
      'name': 'Srinivas',
      'email': 'sandeepm@wavelabs.in',
      'role': 'admin',
    };


    before(() => {
      sandbox.stub(UsersService, 'creatNewUser').withArgs(request.body.name, request.body.email, null, request.body.role, null, request.current_user.name).resolves(newUser);
    });
    after(() => {
      sandbox.restore();
    });
    it('create user', () => {
      const response = {
        json: sinon.spy(),
      };
      UsersController.prototype.create(request, response, next);

      expect(UsersService.creatNewUser.calledOnce).to.be.true;
      expect(UsersService.creatNewUser.firstCall.args[0]).to.be.equal(request.body.name);

      UsersService.creatNewUser(request.body.name, request.body.email, null, request.body.role, null, request.current_user.name).then((data)=>{
        expect(response.json.calledOnce).to.be.true;
        expect(response.json.firstCall.args[0]).to.be.eql(data);
      });
    });
  });

  describe('Get users list controller', () => {
    const request = {
      query: {
        role: 'admin',
        limit: 10,
        page: 1,
      },
    };
    const result = [{
      'name': 'sandeep',
      'email': 'sandeepm@wavelabs.in',
      'role': 'admin',
      '_id': '5c73c5186b25a911bec49513',
    }];

    before(() => {
      sandbox.stub(UsersService.prototype, 'getUsers').withArgs(null, request.query).resolves(result);
    });
    after(() => sandbox.restore());
    it('Users List', async () => {
      const response = {
        json: sinon.spy(),
      };
      UsersController.prototype.list(request, response, next);
      expect(UsersService.prototype.getUsers.calledOnce).to.be.true;
      UsersService.prototype.getUsers(null, request.query).then((listData) => {
        expect(response.json.calledOnce).to.be.true;
        expect(response.json.firstCall.args[0]).to.be.eql(listData);
      });
    });
  });

  describe('Login User', () => {
    const request = {
      body: {
        email: 'mnssandeep@gmail.com',
        otp: '3456',
      },
    };

    const userData = {
      'email': 'mnssandeep@gmail.com',
      'name': 'sandeep',
      'role': 'admin',
    };
    before(() => {
      sandbox.stub(OTPService.prototype, 'validateOTP').withArgs(request.body.email, request.body.otp).resolves(userData);
    });
    after(() => {
      sandbox.restore();
    });
    it('Login user', async () => {
      const response = {
        json: sinon.spy(),
      };
      UsersController.prototype.login(request, response, next);
      expect(OTPService.prototype.validateOTP.calledOnce).to.be.true;
      expect(OTPService.prototype.validateOTP.firstCall.args[0]).to.be.equal(request.body.email);

      OTPService.prototype.validateOTP(request.body.email, request.body.otp).then((users) => {
        expect(response.json.calledOnce).to.be.true;
        expect(response.json.firstCall.args[0]).to.be.eql(users);
      });
    });
  });

  describe('Logout users', () => {
    const request = {
      token: 'dsdbdfb3133434i34384348',
    };

    const userData = {
      'message': 'logout out successfully',
    };
    before(() => {
      sandbox.stub(SessionsService.prototype, 'deleteUserSession').withArgs(request.token).resolves(userData);
    });
    after(() => {
      sandbox.restore();
    });
    it('Logout user', async () => {
      const response = {
        json: sinon.spy(),
      };
      UsersController.prototype.logout(request, response, next);
      expect(SessionsService.prototype.deleteUserSession.calledOnce).to.be.true;
      expect(SessionsService.prototype.deleteUserSession.firstCall.args[0]).to.be.equal(request.token);

      SessionsService.prototype.deleteUserSession(request.token).then((users) => {
        expect(response.json.calledOnce).to.be.true;
        expect(response.json.firstCall.args[0]).to.be.eql(users);
      });
    });
  });

  describe('Users update', () => {
    const request = {
      params: {
        user_id: '5c74c9ea999a940065c2953f',
      },
      body: {
        'role': 'Research Analyst',
        'name': 'sandeep Mokkarala',
        'email': 'mnssandeep@gmail.com',
      },

    };

    const userData = {
      'message': 'Successfully updated user details',
    };

    before(() => {
      sandbox.stub(UsersService.prototype, 'updateUser').withArgs(request.params.user_id, request.body).resolves(userData);
    });
    after(() => {
      sandbox.restore();
    });
    it('user list', async () => {
      const response = {
        json: sinon.spy(),
      };
      UsersController.prototype.update(request, response, next);
      expect(UsersService.prototype.updateUser.calledOnce).to.be.true;
      expect(UsersService.prototype.updateUser.firstCall.args[0]).to.be.equal(request.params.user_id);

      UsersService.prototype.updateUser(request.params.user_id, request.body).then((user)=>{
        expect(response.json.calledOnce).to.be.true;
        expect(response.json.firstCall.args[0]).to.be.eql(user);
      });
    });
  });

  describe('Delete user', () => {
    const request = {
      params: {
        user_id: '5c74c9ea999a940065c2953f',
      },

    };

    const userData = {
      'message': 'User deleted successfully',
    };

    before(() => {
      sandbox.stub(UsersService.prototype, 'deleteUser').withArgs(request.params.user_id).resolves(userData);
    });
    after(() => {
      sandbox.restore();
    });
    it('Delete user', async () => {
      const response = {
        json: sinon.spy(),
      };
      UsersController.prototype.delete(request, response, next);
      expect(UsersService.prototype.deleteUser.calledOnce).to.be.true;
      expect(UsersService.prototype.deleteUser.firstCall.args[0]).to.be.equal(request.params.user_id);

      UsersService.prototype.deleteUser(request.params.user_id).then((user)=>{
        expect(response.json.calledOnce).to.be.true;
        expect(response.json.firstCall.args[0]).to.be.eql(userData);
      });
    });
  });
});
