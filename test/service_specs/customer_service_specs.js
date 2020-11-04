import {expect, mongoose, mongoXlsx, sinon} from '../common.test';
import {CustomerService} from '../../src/app/services';
import {Customer, UnIdentifiedCustomer} from '../../src/app/models';
import customerModel from '../../config/customerModel.json';
describe('Customer Service', () => {
  const sandbox = sinon.createSandbox();
  const request ={
    file: {
      path: 'customer.xlsx',
    },
  };
  describe('upload', () => {
    const customerData = [{
      'Customer ID': '100001',
      'Customer Name': 'ADFACTORS PR PVT LTD',
      'Customer PAN': 'ABCCD4774C',
      'Customer TAN': 'MUMA12044E',
      'Customer Address Line 1': 'First Floor, Runwal Excelus,',
      'Customer Address Line 2': 'Lower Parel',
      'Customer Address Line 3': 'Hyderabad',
      'Customer City': 'Mumbai',
      'Customer Country': 'India',
      'Customer Pincode': '400011',
      'Customer State': 'Maharashtra',
      'Customer Status': 'Resident',
    }];
    const customerMongoData = [{
      '_id': mongoose.Types.ObjectId('5c345954a0163500affda382'),
      'pan': 'ABCCD4774C',
      'address_line_3': null,
      'customer_id': '100001',
      'status': 'Resident',
      'name': 'ADFACTORS PR PVT LTD',
      'tan': 'MUMA12044E',
      'address_line_1': 'First Floor, Runwal Excelus,',
      'address_line_2': 'Lower Parel',
      'city': 'Mumbai',
      'pincode': '400011',
      'state': 'Maharashtra',
      'country': 'India',
      '__v': 0,
      'createdAt': Date('2019-01-08T08:03:32.488Z'),
      'updatedAt': Date('2019-01-08T08:03:32.488Z'),
    }];
    before(() => {
      sandbox.stub(mongoXlsx, 'xlsx2MongoData').withArgs(request.file.path, customerModel).yields(null, customerData);
      sandbox.stub(Customer, 'insertMany').withArgs(customerData).yields(null, customerMongoData);
    });
    after(() => {
      sandbox.restore();
    });
    it('it will insert the customer information into mongodb ', (done) => {
      expect(CustomerService.prototype.upload(request)).to.eventually.equal(customerMongoData);
      done();
    });
  });
  describe('Header Validation', () => {
    const rawHeaderData = [{
      'Customer ID': '100001',
      'Customer Name': 'ADFACTORS PR PVT LTD',
      'Customer PAN': 'ABCCD4774C',
      'Customer TAN': 'MUMA12044E',
      'Customer Address Line 1': 'First Floor, Runwal Excelus,',
      'Customer Address Line 2': 'Lower Parel',
      'Customer Address Line 3': 'Hyderabad',
      'Customer City': 'Mumbai',
      'Customer Country': 'India',
      'Customer Pincode': '400011',
      'Customer State': 'Maharashtra',
      'Customer Status': 'Resident',
    }];
    const outHeaders = [{
      displayName: 'Customer ID',
      access: 'Customer ID',
      type: 'string',
    },
    {
      displayName: 'Customer Name',
      access: 'Customer Name',
      type: 'string',
    },
    {
      displayName: 'Customer PAN',
      access: 'Customer PAN',
      type: 'string',
    },
    {
      displayName: 'Customer TAN',
      access: 'Customer TAN',
      type: 'string',
    },
    {
      displayName: 'Customer Address Line 1',
      access: 'Customer Address Line 1',
      type: 'string',
    },
    {
      displayName: 'Customer Address Line 2',
      access: 'Customer Address Line 2',
      type: 'string',
    },
    {
      displayName: 'Customer Address Line 3',
      access: 'Customer Address Line 3',
      type: 'string',
    },
    {
      displayName: 'Customer City',
      access: 'Customer City',
      type: 'string',
    },
    {
      displayName: 'Customer Country',
      access: 'Customer Country',
      type: 'string',
    }, {
      'displayName': 'Customer Pincode',
      'access': 'Customer Pincode',
      'type': 'string',
    },
    {
      'displayName': 'Customer State',
      'access': 'Customer State',
      'type': 'string',
    },
    {
      'displayName': 'Customer Status',
      'access': 'Customer Status',
      'type': 'string',
    }];
    before(()=>{
      sandbox.stub(mongoXlsx, 'xlsx2MongoData').withArgs(request.file.path, null).yields(null, rawHeaderData);
      sandbox.stub(mongoXlsx, 'buildDynamicModel').withArgs(rawHeaderData).returns(outHeaders);
    });
    after(()=>{
      sandbox.restore();
    });
    it('it will validate excel headers', (done)=>{
      expect(CustomerService.prototype.headerValidation(request)).to.eventually.equal(true);
      done();
    });
  });
  describe('Get Customers Service', ()=> {
    const request = {};
    const customerList = [
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
    before(()=> {
      sandbox.stub(Customer, 'find').withArgs({}, {customer_id: 1, tan: 1, name: 1, related_tans: 1}, {$sort: {name: 1}}).yields(null, customerList);
    });
    after(()=>{
      sandbox.restore();
    });
    it('Customers List', (done)=>{
      expect(CustomerService.prototype.customerList(request)).to.eventually.equal(customerList);
      done();
    });
  });
});
