const moment = require('moment-timezone');

beforeEach(() => {
  jasmine.addMatchers({
    toEqualDate() {
      return {
        compare(actual, expected) {
          return {
            pass: actual.format() === moment(expected).utc().format(),
            message: `Expected '${actual.format()}' to equal '${moment(expected).utc().format()}'`,
          };
        },
      };
    },
  });
});
