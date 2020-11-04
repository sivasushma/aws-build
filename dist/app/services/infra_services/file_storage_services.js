"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _multer = _interopRequireDefault(require("multer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  public_folder: (0, _multer.default)({
    dest: 'public/uploads'
  }),
  tmp_folder: (0, _multer.default)({
    dest: 'tmp/'
  }),
  disk: (0, _multer.default)({
    storage: _multer.default.diskStorage({
      destination: (request, file, cb) => {
        cb(null, 'public/uploads');
      },
      fileName: (request, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    })
  })
};
exports.default = _default;