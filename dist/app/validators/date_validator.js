"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class DateValidator {
  validateDateFormat(v) {
    if (v != null && v == '') {
      return false;
    }

    return /^[0-9]{4}[-][0-9]{2}[-][0-9]{2}$/g.test(v);
  }

  validateFromToDates(from, to, timezone) {
    let fromDate;
    let toDate;
    let currentDate;
    const now = new Date();
    const combineTime = now.getTime() - timezone * 60000;
    currentDate = new Date(combineTime);
    currentDate.setHours(23, 59, 59, 999);
    console.log(currentDate.getUTCMilliseconds());

    if (from && this.validateDateFormat(from)) {
      fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
    }

    if (fromDate && currentDate - fromDate < 0) {
      return {
        status: 'Fail',
        message: 'From date should be less than or equal to current Date' + (currentDate - fromDate)
      };
    }

    if (to && fromDate == undefined) {
      return {
        status: 'Fail',
        message: 'From date is required'
      };
    }

    if (to && this.validateDateFormat(to)) {
      toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
    }

    if (toDate && currentDate - toDate < 0) {
      return {
        status: 'Fail',
        message: 'To date should be less than or equal to current date'
      };
    }

    if (fromDate && toDate && toDate - fromDate < 0) {
      return {
        status: 'Fail',
        message: 'From date should not be greater than To date'
      };
    }

    return {
      status: 'Success',
      fromDate,
      toDate
    };
  }

}

exports.default = DateValidator;