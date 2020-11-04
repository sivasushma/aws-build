"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.passwordValidator = void 0;

const passwordValidator = v => {
  return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(v);
};

exports.passwordValidator = passwordValidator;