import {expect, sinon, mongoose} from '../common.test';
import {CustomerController} from '../../src/app/controllers/v1';
import {CustomerService} from '../../src/app/services';
describe('Customer Controller', () => {
  const sandbox = sinon.createSandbox();
  const next = sinon.spy();
  const request = {
    file: {
      path: 'customer.xlsx',
      originalname: 'customer.xlsx',
    },
  };
  const customerController = new CustomerController();
  describe('Excel sheet', () => {
    const result = {message: 'Customer file uploaded successfuly'};
    before(() => {
      sandbox.stub(CustomerService.prototype, 'upload').withArgs(request).resolves(result);
    });
    after(() => {
      sandbox.restore();
    });
    it('upload', async () => {
      const response = {json: sinon.spy()};
      customerController.customerUpload(request, response, next);
      expect(CustomerService.prototype.upload.calledOnce).to.be.true;
      expect(CustomerService.prototype.upload.firstCall.args[0]).to.be.equal(request);
      const customerService = new CustomerService();
      await customerService.upload(request);
      expect(response.json.calledOnce).to.be.true;
      expect(response.json.firstCall.args[0]).to.be.eql({message: 'Customer file uploaded successfuly'});
    });
  });

  describe('Get Customers List Controller', () => {
    const request = {};
    const result = [
      {
        'related_tans': [],
        '_id': '5c49b4efd6bff6003bf86773',
        'customer_id': '100001',
        'name': 'ADFACTORS PR PVT LTD',
        'tan': 'MUMA12044E',
      },
      {
        'related_tans': [],
        '_id': '5c49b4efd6bff6003bf86774',
        'customer_id': '100002',
        'name': 'AMBUJA CEMENTS LIMITED',
        'tan': 'MUMG08572E',
      },
    ];
    before(() => {
      sandbox.stub(CustomerService.prototype, 'customerList').withArgs(request).resolves(result);
    });
    after(() => sandbox.restore());
    it('Customers List', async () => {
      const response = {json: sinon.spy()};
      customerController.customerList(request, response, next);
      expect(CustomerService.prototype.customerList.calledOnce).to.be.true;
      expect(CustomerService.prototype.customerList.firstCall.args[0]).to.be.equal(request);
      const customerService = new CustomerService();
      await customerService.customerList(request);
      expect(response.json.calledOnce).to.be.true;
      expect(response.json.firstCall.args[0]).to.be.eql(result);
    });
  });
});
