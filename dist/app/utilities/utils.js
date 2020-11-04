"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _multer = _interopRequireDefault(require("multer"));

var _pify = _interopRequireDefault(require("pify"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rs = require('randomstring');

class Utils {
  uploadUserProfilePics(req, res) {
    return new Promise((resolve, reject) => {
      try {
        const storage = _multer.default.diskStorage({
          destination: (req, file, cb) => {
            const destinationPath = 'public/uploads/tenants/' + req.session.tenant_id + '/Users/';

            _fs.default.mkdir(destinationPath, {
              recursive: true
            }, err => {
              if (err && err.code == 'EEXIST') {
                cb(null, destinationPath);
              } else {
                cb(null, destinationPath);
              }
            });
          },
          filename: (req, file, cb) => {
            const extArray = file.mimetype.split('/');
            const extension = extArray[extArray.length - 1];
            cb(null, `${Date.now()}.${extension}`);
          }
        });

        const upload = (0, _pify.default)((0, _multer.default)({
          storage: storage
        }).single('userimg'));
        upload(req, res).then(() => {
          return resolve();
        }).catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  } // Method for generating UUID


  getReqId() {
    return new Promise((resolve, reject) => {
      // Generate an unique id
      try {
        const id = rs.generate({
          length: 32,
          charset: 'alphanumeric'
        });
        ;
        resolve(id);
      } catch (err) {
        reject(err);
      }
    });
  }

}

exports.default = Utils;