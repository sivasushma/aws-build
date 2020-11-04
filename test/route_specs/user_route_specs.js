import {
  request,
  expect,
  apiBase,
  sinon,
} from '../common.test';
import {UsersFactory} from '../factories';
import {OTPService} from '../../src/app/services';
import {User, Session, OTP} from '../../src/app/models';


describe('User routes /users', () => {
  let session; let user;
  const sandbox = sinon.createSandbox();


  before(() => {
    return new Promise(async (resolve) => {
      session = await UsersFactory.prototype.createUserAndSession();
      user = await UsersFactory.prototype.getLatestuser();
      sandbox.stub(OTPService.prototype, 'validateOTP').resolves(user);

      resolve();
    });
  });

  after(() => {
    sandbox.restore();

    return new Promise(async (resolve, reject) => {
      await User.remove();
      await Session.remove();
      await OTP.remove();
      resolve();
    });
  });
  it('Post /users', (done) => {
    const body = {
      'name': 'Sandeep Mokkarala',
      'email': 'mnssandeep@gmail.com',
      'role': 'admin',
    };
    request.post(`${apiBase}/users`)
        .expect(200)
        .send(body)
        .set({
          'Authorization': 'Bearer ' + session.token,
        })
        .end((error, response) => {
          console.log(response);
          expect(response.statusCode).to.equal(200);
          expect(response.body).to.be.an('object');
          done();
        });
  });

  it('GET /users', (done) => {
    request.get(`${apiBase}/users`)
        .query({role: 'admin', page: 1, limit: 10})
        .expect(200)
        .set({
          'Authorization': 'Bearer ' + session.token,
        })
        .end((error, response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.body).to.be.an('array');
          done();
        });
  });

  // it("Post /otps", (done) => {
  //     User.findOne({"email":"sandeepm@wavelabs.ai"}).then(async(data)=>{
  //         const body = {
  //             email:"sandeepm@wavelabs.ai",
  //             password:data.password
  //         }
  //         request.post(`${apiBase}/otps`)
  //              .expect(200)
  //              .send(body)
  //              .set({
  //                  'Authorization': 'Bearer ' + session.token
  //              })
  //              .end((error, response) => {
  //
  //                  expect(response.statusCode).to.equal(200);
  //                  expect(response.body).to.be.an('object');
  //                  done();
  //              })
  //
  //
  //     })
  //
  // })

  it('Post /login', () => {
    return new Promise(async (resolve, result) => {
      await Session.remove();
      request.post(`${apiBase}/users/login`)
          .expect(200)
          .send({
            email: user.email,
            otp: '12345',
          })
          .set({
            'Authorization': 'Bearer ' + session.token,
          })
          .end((error, response) => {
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.be.an('object');
            resolve();
          });
    });
  });
  it('Put /:user_id', (done) => {
    const bodyuser = {
      role: 'admin',
    };
    request.put(`${apiBase}/users/${user._id}`)
        .send(bodyuser)
        .set({
          'Authorization': 'Bearer ' + session.token,
        })
        .expect(200)
        .end((error, response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.body).to.be.an('object');
          done();
        });
  });


  it('delete /:userId', (done) => {
    request.delete(`${apiBase}/users/${user._id}`)
        .set({
          'Authorization': 'Bearer ' + session.token,
        })
        .expect(200)
        .end((error, response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.body).to.be.an('object');
          done();
        });
  });
});

describe('User routes /users', () => {
  let session; let user;
  before(() => {
    return new Promise(async (resolve) => {
      session = await UsersFactory.prototype.createUserAndSession();
      user = await UsersFactory.prototype.getLatestuser();
      resolve();
    });
  });

  after(() => {
    return new Promise(async (resolve, reject) => {
      await User.remove();
      await Session.remove();
      await OTP.remove();
      resolve();
    });
  });


  it('Post /logout', (done) => {
    request.delete(`${apiBase}/users/logout`)
        .expect(200)
        .set({
          'Authorization': 'Bearer ' + session.token,
        })
        .end((error, response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.body).to.be.an('object');
          done();
        });
  });
});
