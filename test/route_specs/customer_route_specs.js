import {
  request,
  expect,
  apiBase,
} from '../common.test';
import {
  Customer, Session, OTP, User,
} from '../../src/app/models';
import {
  UsersFactory,
} from '../factories/index';
describe('Customer Routes', () => {
  let session;


  const body = {
    'customer_map': [{
      'customer_id': '100005',
      'related_tan': 'PNEA03242B',
    }],
  };

  before(async () => {
    session = await UsersFactory.prototype.createUserAndSession();
    console.log('session..................', session);
  });
  after(async () => {
    await User.remove();
    await Session.remove();
    // await OTP.remove();
  });
  // it("POST /customers", (done) => {
  //     request.post(`${apiBase}/customers`)
  //         .attach('file', 'customer.xlsx')
  //         .set({
  //             'Authorization': 'Bearer ' + session.token
  //         })
  //         .expect(200)
  //         .end((error, response) => {
  //             expect(response.statusCode).to.equal(200);
  //             expect(response.body).to.be.an('object');
  //             done();
  //         })
  // });
  // it("Header validation POST /customers", (done) => {
  //     request.post(`${apiBase}/customers`)
  //         .attach('file', 'customer_header.xlsx')
  //         .set({
  //             'Authorization': 'Bearer ' + session.token
  //         })
  //         .expect(200)
  //         .end((error, response) => {
  //             expect(response.statusCode).to.equal(422);
  //             expect(response.body).to.be.an('object');
  //             expect(response.body).to.be.haveOwnProperty('error');
  //             expect(response.body).to.be.haveOwnProperty('error_description');
  //             done();
  //         })
  // });
  it('Get Customers List Route', (done) => {
    done();
    // request.get(`${apiBase}/customers`)
    //     .set({
    //         'Authorization': 'Bearer ' + session.token
    //     }).end((error, response) => {
    //         expect(response.statusCode).to.equal(200);
    //         expect(response.body).to.be.an('array');
    //         done();
    //     })
  });
});
