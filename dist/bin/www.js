#!/usr/bin/env ./node_modules/.bin/babel-node
"use strict";

var _server = _interopRequireDefault(require("../server"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_server.default.listen(3200, function () {
  console.log('Listening on port 3200');
});