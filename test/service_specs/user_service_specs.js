import {
  UsersService,
} from '../../src/app/services';
import {
  expect,
  mongoose,
  mongoXlsx,
  sinon,
} from '../common.test';
import {
  User,
} from '../../src/app/models';
import {
  request,
} from 'https';


describe('User Service', () => {
  const sandbox = sinon.createSandbox();
  const userCreate = [{
    'name': 'sandeep Mokkarala',
    'email': 'sandeepm@wavelabs.in',
    'role': 'admin',
    '_id': '5c73c5186b25a911bec49513',

  }];
  const request = {
    body: {
      name: 'sandeep Mokkarala',
      email: 'naveenp@wavelabs.in',
      role: 'admin',
    },
    query: {
      role: 'admin',
      limit: 10,
      page: 1,
    },


  };
  before(() => {
    sandbox.stub(User, 'create').withArgs(request.body).yields(null, userCreate);
  });

  after(() => {
    sandbox.restore();
  });
  it('create user', (done) => {
    expect(UsersService.creatNewUser(request)).to.eventually.equal(userCreate);
    done();
  });
  it('user list', (done)=>{
    expect(UsersService.prototype.getUsers(null, request.query)).to.eventually.equal(userCreate);
    done();
  });
});

describe('Update User details', ()=>{
  const sandbox = sinon.createSandbox();
  const request={
    params: {
      user_id: '5c74c9ea999a940065c2953f',

    },
    body: {
      name: 'sandeep Mokkarala',
      email: 'naveenp@wavelabs.in',
      role: 'admin',
    },
  };

  const userList={
    'client_id': null,
    'name': 'sandeep Mokkarala',
    'email': 'mnssandeep@gmail.com',
    'role': 'Admin',
    'phone_no': null,
    'createdAt': '2019-02-26T05:08:58.941Z',
    'updatedAt': '2019-03-01T10:51:22.521Z',
    '__v': 0,
  };
  const updateUserDetails={
    'message': 'Successfull update',
  };

  const Updatemessage={
    n: 1, nModified: 1, ok: 1,
  };
  before(() => {
    sandbox.stub(User, 'findOne').withArgs({_id: request.params.user_id}, {name: 1, email: 1, role: 1}).yields(null, userList);
    sandbox.stub(User, 'updateOne').withArgs({_id: request.params.user_id}, {$set: request.body}).yields(null, Updatemessage);
  });

  after(() => {
    sandbox.restore();
  });

  it('user update', (done)=>{
    expect(UsersService.prototype.updateUser(request.params.user_id, request.body)).to.eventually.equal(updateUserDetails);
    done();
  });
});


describe('Delete User details', ()=>{
  const sandbox = sinon.createSandbox();
  const request={
    params: {
      userId: '5c74c9ea999a940065c2953f',
    },
  };

  const userList={
    'client_id': null,
    'name': 'sandeep Mokkarala',
    'email': 'mnssandeep@gmail.com',
    'role': 'Admin',
    'phone_no': null,
    'createdAt': '2019-02-26T05:08:58.941Z',
    'updatedAt': '2019-03-01T10:51:22.521Z',
    '__v': 0,
  };
  const deleteUserDetails={
    'message': 'User deleted successfully',
  };

  const deleteMessage ={
    n: 1, ok: 1};
  before(() => {
    sandbox.stub(User, 'remove').withArgs({_id: request.params.userId}).yields(null, deleteMessage);
  });

  after(() => {
    sandbox.restore();
  });

  it('user delete', (done)=>{
    expect(UsersService.prototype.deleteUser(request.params.userId)).to.eventually.equal(deleteUserDetails);
    done();
  });
});
