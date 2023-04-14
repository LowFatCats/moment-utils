const s = require('../index');
const moment = require('moment-timezone');

describe('utils', () => {
  beforeAll(() => {
    const today = moment('2018-02-01 10:20:30.400-05:00').toDate();
    jasmine.clock().mockDate(today);
    console.warn = jasmine.createSpy('warn');
    console.log = jasmine.createSpy('log');
  });

  beforeEach(() => {
    s.TZ = 'US/Eastern'; // -5h from UTC
  });

  describe('config', () => {
    it('uses UTC timezone by default', () => {
      delete process.env.TIMEZONE;
      s.config({ timezone: null });

      expect(s.TZ).toEqual('UTC');
    });
  });

  it('uses Eastern timezone', () => {
    expect(s.TZ).toEqual('US/Eastern');
  });

  describe('now', () => {
    it('returns number of millis since epoch', () => {
      expect(s.now()).toEqual(1517498430400);
    });
  });

  describe('convertDate', () => {
    describe('natural language parser', () => {
      it('converts now to current date', () => {
        expect(s.convertDate('now')).toEqualDate('2018-02-01 10:20:30-05:00');
      });

      it('converts today to end of today in TZ', () => {
        expect(s.convertDate('today')).toEqualDate('2018-02-01 23:59:59-05:00');
      });

      it('converts yesterday to end of yesterday in TZ', () => {
        expect(s.convertDate('yesterday')).toEqualDate('2018-01-31 23:59:59-05:00');
      });

      it('converts tomorrow to end of tomorrow in TZ', () => {
        expect(s.convertDate('tomorrow')).toEqualDate('2018-02-02 23:59:59-05:00');
      });

      it('converts start-of-week to start of the week in TZ', () => {
        expect(s.convertDate('start-of-week')).toEqualDate('2018-01-28 00:00:00-05:00');
      });

      it('converts start-of-month to start of the month in TZ', () => {
        expect(s.convertDate('start-of-month')).toEqualDate('2018-02-01 00:00:00-05:00');
      });

      it('converts start-of-year to start of the year in TZ', () => {
        expect(s.convertDate('start-of-year')).toEqualDate('2018-01-01 00:00:00-05:00');
      });

      it('converts end-of-today to end of today in TZ', () => {
        expect(s.convertDate('end-of-today')).toEqualDate('2018-02-01 23:59:59-05:00');
      });

      it('converts end-of-yesterday to end of yesterday in TZ', () => {
        expect(s.convertDate('end-of-yesterday')).toEqualDate('2018-01-31 23:59:59-05:00');
      });

      it('converts end-of-tomorrow to end of tomorrow in TZ', () => {
        expect(s.convertDate('end-of-tomorrow')).toEqualDate('2018-02-02 23:59:59-05:00');
      });

      it('converts end-of-week to end of the week in TZ', () => {
        expect(s.convertDate('end-of-week')).toEqualDate('2018-02-03 23:59:59-05:00');
      });

      it('converts end-of-month to end of the month in TZ', () => {
        expect(s.convertDate('end-of-month')).toEqualDate('2018-02-28 23:59:59-05:00');
      });

      it('converts end-of-year to end of the year in TZ', () => {
        expect(s.convertDate('end-of-year')).toEqualDate('2018-12-31 23:59:59-05:00');
      });
    });

    describe('relative dates', () => {
      it('uses current date as relative date if none is specified', () => {
        expect(s.convertDate('+0d')).toEqualDate('2018-02-01 10:20:30-05:00');
      });

      it('uses provided new Date() as relative date', () => {
        expect(s.convertDate('+0d', new Date('2010-05-02'))).toEqualDate('2010-05-02 00:00:00Z');
      });

      it('uses provided moment() as relative date', () => {
        expect(s.convertDate('+0d', moment('2010-05-02 00:00:00Z'))).toEqualDate(
          '2010-05-02 00:00:00Z'
        );
      });

      it('uses current date as relative date if invalid date is specified', () => {
        expect(s.convertDate('+0d', 'some-object')).toEqualDate('2018-02-01 10:20:30-05:00');
      });

      it('converts start-of-day', () => {
        expect(s.convertDate('~start-of-day')).toEqualDate('2018-02-01 00:00:00-05:00');
      });

      it('converts start-of-week', () => {
        expect(s.convertDate('~start-of-week')).toEqualDate('2018-01-28 00:00:00-05:00');
      });

      it('converts start-of-month', () => {
        expect(s.convertDate('~start-of-month')).toEqualDate('2018-02-01 00:00:00-05:00');
      });

      it('converts start-of-year', () => {
        expect(s.convertDate('~start-of-year')).toEqualDate('2018-01-01 00:00:00-05:00');
      });

      it('converts end-of-day', () => {
        expect(s.convertDate('~end-of-day')).toEqualDate('2018-02-01 23:59:59-05:00');
      });

      it('converts end-of-week', () => {
        expect(s.convertDate('~end-of-week')).toEqualDate('2018-02-03 23:59:59-05:00');
      });

      it('converts end-of-month', () => {
        expect(s.convertDate('~end-of-month')).toEqualDate('2018-02-28 23:59:59-05:00');
      });

      it('converts end-of-year', () => {
        expect(s.convertDate('~end-of-year')).toEqualDate('2018-12-31 23:59:59-05:00');
      });

      it('adds 1month', () => {
        expect(s.convertDate('+1month')).toEqualDate('2018-03-01 10:20:30-05:00');
      });

      it('substracts 1week', () => {
        expect(s.convertDate('-1w')).toEqualDate('2018-01-25 10:20:30-05:00');
      });
    });

    describe('uses date parsing', () => {
      it('converts a date without a timezone attached to working TZ', () => {
        expect(s.convertDate('2018-01-12 00:00:00')).toEqualDate('2018-01-12 00:00:00-05:00');
      });

      it('converts a date with a timezone attached to correct TZ', () => {
        expect(s.convertDate('2018-01-12 05:00:00Z')).toEqualDate('2018-01-12 00:00:00-05:00');
      });
    });

    describe('errors', () => {
      it("can't convert invalid dates", () => {
        expect(s.convertDate('incorrect')).toBeUndefined();
      });

      it("can't convert invalid relative adjustments", () => {
        expect(s.convertDate('+champ')).toBeUndefined();
      });
    });

    describe('date chaining', () => {
      it('picks date from last item if they are not relative', () => {
        expect(s.convertDate('start-of-month, 2003-10-05, start-of-week')).toEqualDate(
          '2018-01-28 00:00:00-05:00'
        );
      });

      it('can chain natural language and relative dates', () => {
        expect(s.convertDate('start-of-month, +6hours')).toEqualDate('2018-02-01 06:00:00-05:00');
      });

      it('can chain two relative dates', () => {
        expect(s.convertDate('-1month,~end-of-month')).toEqualDate('2018-01-31 23:59:59-05:00');
      });

      it('can chain multiple dates', () => {
        expect(s.convertDate('-1month,~start-of-month,+1week,+6h,-5minutes')).toEqualDate(
          '2018-01-08 05:55:00-05:00'
        );
      });

      it('ignores empty dates in a chain', () => {
        expect(s.convertDate(',  -1month ,, , ,~end-of-month ,')).toEqualDate(
          '2018-01-31 23:59:59-05:00'
        );
      });
    });
  });

  describe('minMaxDate', () => {
    it('returns the dates in order if specified in correct order', () => {
      const d1 = moment('2018-02-01');
      const d2 = moment('2018-03-01');

      expect(s.minMaxDate(d1, d2)).toEqual([d1, d2]);
    });

    it('returns the dates in order if specified in inverted order', () => {
      const d1 = moment('2018-02-01');
      const d2 = moment('2018-03-01');

      expect(s.minMaxDate(d2, d1)).toEqual([d1, d2]);
    });

    it('converts falsey end date to undefined', () => {
      const d = moment('2018-02-01');

      expect(s.minMaxDate(d, null)).toEqual([d, undefined]);
    });

    it('converts falsey start date to undefined', () => {
      const d = moment('2018-02-01');

      expect(s.minMaxDate(null, d)).toEqual([undefined, d]);
    });

    it('converts falsey start and end dates to undefined', () => {
      expect(s.minMaxDate(null, null)).toEqual([undefined, undefined]);
    });
  });

  describe('dateToTS', () => {
    it('converts moment to ts', () => {
      const date = moment('2018-02-01 10:20:30.400-05:00');
      const ts = 1517498430400;

      expect(s.dateToTS(date)).toEqual(ts);
    });
  });

  describe('getYearMonthDayTime', () => {
    it('extracts correct values', () => {
      const date = moment('2018-02-01 15:20:30.400Z');
      const details = ['2018', 'February', '01', '10:20 AM'];

      expect(s.getYearMonthDayTime(date)).toEqual(details);
    });
  });

  describe('getYearMonthDay', () => {
    it('extracts correct values', () => {
      const date = moment('2018-02-01 15:20:30.400Z');
      const details = { year: '2018', month: 'February', monthNumber: '2', day: '1' };

      expect(s.getYearMonthDay(date)).toEqual(details);
    });

    it('extracts correct values without hours offset', () => {
      const date = moment('2018-02-01 02:20:30.400-05:00');
      const details = { year: '2018', month: 'February', monthNumber: '2', day: '1' };

      expect(s.getYearMonthDay(date)).toEqual(details);
    });

    it('extracts correct values with hours offset', () => {
      const date = moment('2018-02-01 01:20:30.400-05:00');
      const details = { year: '2018', month: 'January', monthNumber: '1', day: '31' };

      expect(s.getYearMonthDay(date, { hoursOffset: 2 })).toEqual(details);
    });
  });

  describe('getTimeAgo', () => {
    it('extracts time ago for a date in the past', () => {
      const date = moment('2018-01-01 10:20:30.400-05:00');

      expect(s.getTimeAgo(date)).toEqual('a month ago');
    });

    it('extracts time ago for a date in the future', () => {
      const date = moment('2018-02-01 15:20:30.400-05:00');

      expect(s.getTimeAgo(date)).toEqual('in 5 hours');
    });
  });

  describe('getTimeAgoInDays', () => {
    describe('day transition at 12AM', () => {
      it('extracts time ago for now', () => {
        const date = moment('2018-02-01 10:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Today');
      });

      it('extracts time ago for 1h ago', () => {
        const date = moment('2018-02-01 09:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Today');
      });

      it('extracts time ago for same day at 1am', () => {
        const date = moment('2018-02-01 01:59:59.999-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Today');
      });

      it('extracts time ago for same day at 2am', () => {
        const date = moment('2018-02-01 02:00:00.000-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Today');
      });

      it('extracts time ago for same day at 2:91am', () => {
        const date = moment('2018-02-01 02:01:00.000-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Today');
      });

      it('extracts time ago for 1h later', () => {
        const date = moment('2018-02-01 11:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Today');
      });

      it('extracts time ago for yesterday', () => {
        const date = moment('2018-01-31 19:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Yesterday');
      });

      it('extracts time ago for 2d ago', () => {
        const date = moment('2018-01-30 19:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('2 days ago');
      });

      it('extracts time ago for 5d ago', () => {
        const date = moment('2018-01-27 02:00:00.000-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('5 days ago');
      });

      it('extracts time ago for 6d ago', () => {
        const date = moment('2018-01-27 01:59:59.999-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('5 days ago');
      });

      it('extracts time ago for 67d ago', () => {
        const date = moment('2017-11-26 19:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('67 days ago');
      });

      it('extracts time ago for tomorrow', () => {
        const date = moment('2018-02-02 10:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Tomorrow');
      });

      it('extracts time ago for tomorrow ~ almost 2am', () => {
        const date = moment('2018-02-02 01:59:59.999-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Tomorrow');
      });

      it('extracts time ago for tomorrow at almost 2am', () => {
        const date = moment('2018-02-02 02:00:00.000-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('Tomorrow');
      });

      it('extracts time ago for 2d in the future', () => {
        const date = moment('2018-02-03 10:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date)).toEqual('in 2 days');
      });
    });

    describe('day transition at 2AM', () => {
      it('extracts time ago for now', () => {
        const date = moment('2018-02-01 10:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Today');
      });

      it('extracts time ago for 1h ago', () => {
        const date = moment('2018-02-01 09:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Today');
      });

      it('extracts time ago for same day at 1am', () => {
        const date = moment('2018-02-01 01:59:59.999-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Yesterday');
      });

      it('extracts time ago for same day at 2am', () => {
        const date = moment('2018-02-01 02:00:00.000-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Today');
      });

      it('extracts time ago for same day at 2:91am', () => {
        const date = moment('2018-02-01 02:01:00.000-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Today');
      });

      it('extracts time ago for 1h later', () => {
        const date = moment('2018-02-01 11:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Today');
      });

      it('extracts time ago for yesterday', () => {
        const date = moment('2018-01-31 19:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Yesterday');
      });

      it('extracts time ago for 2d ago', () => {
        const date = moment('2018-01-30 19:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('2 days ago');
      });

      it('extracts time ago for 5d ago', () => {
        const date = moment('2018-01-27 02:00:00.000-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('5 days ago');
      });

      it('extracts time ago for 6d ago', () => {
        const date = moment('2018-01-27 01:59:59.999-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('6 days ago');
      });

      it('extracts time ago for 67d ago', () => {
        const date = moment('2017-11-26 19:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('67 days ago');
      });

      it('extracts time ago for tomorrow', () => {
        const date = moment('2018-02-02 10:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Tomorrow');
      });

      it('extracts time ago for today ~ almost 2am', () => {
        const date = moment('2018-02-02 01:59:59.999-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Today');
      });

      it('extracts time ago for tomorrow at almost 2am', () => {
        const date = moment('2018-02-02 02:00:00.000-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('Tomorrow');
      });

      it('extracts time ago for 2d in the future', () => {
        const date = moment('2018-02-03 10:20:30.400-05:00');

        expect(s.getTimeAgoInDays(date, { hoursOffset: 2 })).toEqual('in 2 days');
      });
    });
  });

  describe('getFormattedDate', () => {
    it('extracts date for current year', () => {
      const date = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getFormattedDate(date)).toEqual('February 1');
    });

    it('extracts date for current year with force year', () => {
      const date = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getFormattedDate(date, { year: 'always' })).toEqual('February 1, 2018');
    });

    it('extracts date for other year', () => {
      const date = moment('2017-02-01 15:20:30.400-05:00');
      expect(s.getFormattedDate(date)).toEqual('February 1, 2017');
    });

    it('extracts date for other year with hour offset set', () => {
      const date = moment('2017-02-01 01:59:59.400-05:00');
      expect(s.getFormattedDate(date, { hoursOffset: 2 })).toEqual('January 31, 2017');
    });

    it('extracts date for other year with short month', () => {
      const date = moment('2017-02-01 15:20:30.400-05:00');
      expect(s.getFormattedDate(date, { shortMonth: true })).toEqual('Feb 1, 2017');
    });

    it('extracts date for same year with short month', () => {
      const date = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getFormattedDate(date, { shortMonth: true })).toEqual('Feb 1');
    });

    it('extracts date for other year with no year', () => {
      const date = moment('2017-02-01 15:20:30.400-05:00');
      expect(s.getFormattedDate(date, { year: 'never' })).toEqual('February 1');
    });

    it('extracts date for current year with force year', () => {
      const date = moment('2018-01-15 15:20:30.400-05:00');
      expect(s.getFormattedDate(date, { year: 'always' })).toEqual('January 15, 2018');
    });

    it('show day of the week', () => {
      const date = moment('2018-01-15 15:20:30.400-05:00');
      expect(s.getFormattedDate(date, { year: 'always', dayOfTheWeek: true })).toEqual('Monday, January 15, 2018');
    });

    it('show day of the week with short month', () => {
      const date = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getFormattedDate(date, { shortMonth: true, dayOfTheWeek: true })).toEqual('Thu, Feb 1');
    });
  });

  describe('getDisplayDate', () => {
    it('extracts date for today', () => {
      const date = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getDisplayDate(date)).toEqual('Today');
    });

    it('extracts date for today without hour offset', () => {
      const date = moment('2018-02-01 01:20:30.400-05:00');
      expect(s.getDisplayDate(date)).toEqual('Today');
    });

    it('extracts date for today with hour offset', () => {
      const date = moment('2018-02-01 01:20:30.400-05:00');
      expect(s.getDisplayDate(date, { hoursOffset: 2 })).toEqual('Yesterday');
    });

    it('extracts date for yesterday', () => {
      const date = moment('2018-01-31 15:20:30.400-05:00');
      expect(s.getDisplayDate(date)).toEqual('Yesterday');
    });

    it('extracts date 2 days ago', () => {
      const date = moment('2018-01-30 15:20:30.400-05:00');
      expect(s.getDisplayDate(date)).toEqual('January 30');
    });

    it('extracts date 2 days ago with more relative dates', () => {
      const date = moment('2018-01-30 15:20:30.400-05:00');
      expect(s.getDisplayDate(date, { relativeDays: 3 })).toEqual('2 days ago');
    });

    it('extracts date for current year', () => {
      const date = moment('2018-01-15 15:20:30.400-05:00');
      expect(s.getDisplayDate(date)).toEqual('January 15');
    });

    it('extracts date for current year with force year', () => {
      const date = moment('2018-01-15 15:20:30.400-05:00');
      expect(s.getDisplayDate(date, { year: 'always' })).toEqual('January 15, 2018');
    });

    it('extracts date for other year', () => {
      const date = moment('2017-02-01 15:20:30.400-05:00');
      expect(s.getDisplayDate(date)).toEqual('February 1, 2017');
    });

    it('extracts date for other year with hour offset set', () => {
      const date = moment('2017-02-01 01:20:30.400-05:00');
      expect(s.getDisplayDate(date, { hoursOffset: 2 })).toEqual('January 31, 2017');
    });

    it('extracts date for other year with short month', () => {
      const date = moment('2017-02-01 15:20:30.400-05:00');
      expect(s.getDisplayDate(date, { shortMonth: true })).toEqual('Feb 1, 2017');
    });

    it('extracts date for other year with no year', () => {
      const date = moment('2017-02-01 15:20:30.400-05:00');
      expect(s.getDisplayDate(date, { year: 'never' })).toEqual('February 1');
    });

    it('extracts date for current year with force year', () => {
      const date = moment('2018-01-15 15:20:30.400-05:00');
      expect(s.getDisplayDate(date, { year: 'always' })).toEqual('January 15, 2018');
    });
  });

  describe('getTimeline', () => {
    it('returns empty timeline if no time unit was specified', () => {
      const startDate = moment('2018-02-01 15:20:30.400-05:00');
      const endDate = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, {})).toEqual([]);
    });

    it('returns empty timeline if start date is empty', () => {
      const startDate = null;
      const endDate = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, {})).toEqual([]);
    });

    it('returns empty timeline if start date is empty', () => {
      const startDate = moment('2018-02-01 15:20:30.400-05:00');
      const endDate = null;
      expect(s.getTimeline(startDate, endDate, {})).toEqual([]);
    });

    it('creates a 1-month timeline of months', () => {
      const startDate = moment('2018-02-01 15:20:30.400-05:00');
      const endDate = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { month: true })).toEqual([
        {
          date: 'February 2018',
          ref: '2018-02',
          type: 'month',
          current: true,
        },
      ]);
    });

    it('creates a 2-month timeline of increasing months', () => {
      const startDate = moment('2018-02-01 15:20:30.400-05:00');
      const endDate = moment('2018-03-01 00:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { month: true })).toEqual([
        {
          date: 'February 2018',
          ref: '2018-02',
          type: 'month',
          current: true,
        },
        {
          date: 'March 2018',
          type: 'month',
          ref: '2018-03',
        },
      ]);
    });

    it('creates a 2-month timeline of decreasing months', () => {
      const startDate = moment('2018-03-01 15:20:30.400-05:00');
      const endDate = moment('2018-02-01 00:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { month: true })).toEqual([
        {
          date: 'March 2018',
          ref: '2018-03',
          type: 'month',
        },
        {
          date: 'February 2018',
          ref: '2018-02',
          type: 'month',
          current: true,
        },
      ]);
    });

    it('creates a 1-year timeline of years', () => {
      const startDate = moment('2018-02-01 15:20:30.400-05:00');
      const endDate = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { year: true })).toEqual([
        {
          date: '2018',
          ref: '2018',
          type: 'year',
          current: true,
        },
      ]);
    });

    it('creates a 2-year timeline of increasing years', () => {
      const startDate = moment('2018-02-01 15:20:30.400-05:00');
      const endDate = moment('2019-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { year: true })).toEqual([
        {
          date: '2018',
          ref: '2018',
          type: 'year',
          current: true,
        },
        {
          date: '2019',
          ref: '2019',
          type: 'year',
        },
      ]);
    });

    it('creates a 2-year timeline of decreasing years', () => {
      const startDate = moment('2019-02-01 15:20:30.400-05:00');
      const endDate = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { year: true })).toEqual([
        {
          date: '2019',
          ref: '2019',
          type: 'year',
        },
        {
          date: '2018',
          ref: '2018',
          type: 'year',
          current: true,
        },
      ]);
    });

    it('creates a month and year timeline timeline of 1 months', () => {
      const startDate = moment('2018-02-01 15:20:30.400-05:00');
      const endDate = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { year: true, month: true })).toEqual([
        {
          date: '2018',
          ref: '2018',
          type: 'year',
          current: true,
        },
        {
          date: 'February 2018',
          ref: '2018-02',
          type: 'month',
          current: true,
        },
      ]);
    });

    it('creates a month and year timeline timeline of 2 ascending months', () => {
      const startDate = moment('2018-02-01 15:20:30.400-05:00');
      const endDate = moment('2018-03-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { year: true, month: true })).toEqual([
        {
          date: '2018',
          ref: '2018',
          type: 'year',
          current: true,
        },
        {
          date: 'February 2018',
          ref: '2018-02',
          type: 'month',
          current: true,
        },
        {
          date: 'March 2018',
          ref: '2018-03',
          type: 'month',
        },
      ]);
    });

    it('creates a month and year timeline timeline of 2 descending months', () => {
      const startDate = moment('2018-03-01 15:20:30.400-05:00');
      const endDate = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { year: true, month: true })).toEqual([
        {
          date: '2018',
          ref: '2018',
          type: 'year',
          current: true,
        },
        {
          date: 'March 2018',
          ref: '2018-03',
          type: 'month',
        },
        {
          date: 'February 2018',
          ref: '2018-02',
          type: 'month',
          current: true,
        },
      ]);
    });

    it('creates a month and year timeline timeline of 13 ascending months', () => {
      const startDate = moment('2018-02-01 15:20:30.400-05:00');
      const endDate = moment('2019-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { year: true, month: true })).toEqual([
        {
          date: '2018',
          ref: '2018',
          type: 'year',
          current: true,
        },
        {
          date: 'February 2018',
          ref: '2018-02',
          type: 'month',
          current: true,
        },
        {
          date: 'March 2018',
          ref: '2018-03',
          type: 'month',
        },
        {
          date: 'April 2018',
          ref: '2018-04',
          type: 'month',
        },
        {
          date: 'May 2018',
          ref: '2018-05',
          type: 'month',
        },
        {
          date: 'June 2018',
          ref: '2018-06',
          type: 'month',
        },
        {
          date: 'July 2018',
          ref: '2018-07',
          type: 'month',
        },
        {
          date: 'August 2018',
          ref: '2018-08',
          type: 'month',
        },
        {
          date: 'September 2018',
          ref: '2018-09',
          type: 'month',
        },
        {
          date: 'October 2018',
          ref: '2018-10',
          type: 'month',
        },
        {
          date: 'November 2018',
          ref: '2018-11',
          type: 'month',
        },
        {
          date: 'December 2018',
          ref: '2018-12',
          type: 'month',
        },
        {
          date: '2019',
          ref: '2019',
          type: 'year',
        },
        {
          date: 'January 2019',
          ref: '2019-01',
          type: 'month',
        },
        {
          date: 'February 2019',
          ref: '2019-02',
          type: 'month',
        },
      ]);
    });

    it('creates a month and year timeline timeline of 13 descending months', () => {
      const startDate = moment('2019-02-01 15:20:30.400-05:00');
      const endDate = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { year: true, month: true })).toEqual([
        {
          date: '2019',
          ref: '2019',
          type: 'year',
        },
        {
          date: 'February 2019',
          ref: '2019-02',
          type: 'month',
        },
        {
          date: 'January 2019',
          ref: '2019-01',
          type: 'month',
        },
        {
          date: '2018',
          ref: '2018',
          type: 'year',
          current: true,
        },
        {
          date: 'December 2018',
          ref: '2018-12',
          type: 'month',
        },
        {
          date: 'November 2018',
          ref: '2018-11',
          type: 'month',
        },
        {
          date: 'October 2018',
          ref: '2018-10',
          type: 'month',
        },
        {
          date: 'September 2018',
          ref: '2018-09',
          type: 'month',
        },
        {
          date: 'August 2018',
          ref: '2018-08',
          type: 'month',
        },
        {
          date: 'July 2018',
          ref: '2018-07',
          type: 'month',
        },
        {
          date: 'June 2018',
          ref: '2018-06',
          type: 'month',
        },
        {
          date: 'May 2018',
          ref: '2018-05',
          type: 'month',
        },
        {
          date: 'April 2018',
          ref: '2018-04',
          type: 'month',
        },
        {
          date: 'March 2018',
          ref: '2018-03',
          type: 'month',
        },
        {
          date: 'February 2018',
          ref: '2018-02',
          type: 'month',
          current: true,
        },
      ]);
    });

    it('uses short month names if requested', () => {
      const startDate = moment('2018-03-01 15:20:30.400-05:00');
      const endDate = moment('2018-02-01 15:20:30.400-05:00');
      expect(s.getTimeline(startDate, endDate, { year: true, month: true, shortMonth: true })).toEqual([
        {
          date: '2018',
          ref: '2018',
          type: 'year',
          current: true,
        },
        {
          date: 'Mar 2018',
          ref: '2018-03',
          type: 'month',
        },
        {
          date: 'Feb 2018',
          ref: '2018-02',
          type: 'month',
          current: true,
        },
      ]);
    });
  });
});
