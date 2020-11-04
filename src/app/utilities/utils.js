import multer from 'multer';
import pify from 'pify';
import fs from 'fs';
const rs = require('randomstring');


export default class Utils {
  uploadUserProfilePics(req, res) {
    return new Promise((resolve, reject) => {
      try {
        const storage = multer.diskStorage({
          destination: (req, file, cb) => {
            const destinationPath = 'public/uploads/tenants/' + req.session.tenant_id + '/Users/';
            fs.mkdir(destinationPath, {recursive: true}, (err) => {
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
          },
        });

        const upload = pify(multer({storage: storage}).single('userimg'));
        upload(req, res).then(() => {
          return resolve();
        }).catch((error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }

  // Method for generating UUID
  getReqId() {
    return new Promise((resolve, reject) => {
      // Generate an unique id
      try {
        const id = rs.generate({
          length: 32,
          charset: 'alphanumeric',
        }); ;
        resolve(id);
      } catch (err) {
        reject(err);
      }
    });
  }
}
