"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.slug_to_text = void 0;

const slug_to_text = slug => {
  return slug.split('_').map(part => {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(' ');
};

exports.slug_to_text = slug_to_text;