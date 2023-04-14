const moment = require('moment-timezone');

const utils = {
  TZ: process.env.TIMEZONE || 'UTC',
};

// Configure working timezone
// E.g.
//    config({timezone: 'US/Central'})
utils.config = function config(options) {
  utils.TZ = (options && options.timezone) || process.env.TIMEZONE || 'UTC';
};

// Returns the number of milliseconds since epoch
utils.now = function now() {
  return moment.now();
};

// Converts a date, or date-like string to a moment date.
//
// You can combine multiple date operations by providing a comma separated
// list of date-like strings. For instance to specify the start of the
// previous month you can use '-1month,~start-of-month'
//
// E.g.
//    convertDate('now')
//    convertDate('start-of-month')
//    convertDate('start-of-month,+6hours')
//    convertDate('-6days')
//    convertDate('+1month', moment())
//    convertDate('-1month,~end-of-month', moment())
//    convertDate('~end-of-day', moment('2017-08-05'))
//    convertDate('2017-08-05T10:00:00.000Z')
utils.convertDate = function convertDate(date, relativeTo) {
  if (!date) {
    return undefined;
  }
  const cleanDate = date.trim();

  // Chain multiple date operations if necessary
  const multiDate = cleanDate.split(',').map(s => s.trim());
  if (multiDate.length > 1) {
    let result = relativeTo;
    for (const oneDate of multiDate) {
      if (oneDate) {
        result = convertDate(oneDate, result);
      }
    }
    return result;
  }

  // First, recognize some natural language descriptions of dates
  switch (cleanDate.toLowerCase()) {
    case 'now':
      return moment.utc();

    case 'start-of-today':
    case 'start-of-day':
      return moment.tz(utils.TZ).startOf('day').utc();
    case 'start-of-yesterday':
      return moment.tz(utils.TZ).subtract(1, 'day').startOf('day').utc();
    case 'start-of-tomorrow':
      return moment.tz(utils.TZ).add(1, 'day').startOf('day').utc();
    case 'start-of-week':
      return moment.tz(utils.TZ).startOf('week').utc();
    case 'start-of-month':
      return moment.tz(utils.TZ).startOf('month').utc();
    case 'start-of-year':
      return moment.tz(utils.TZ).startOf('year').utc();

    case 'today':
    case 'end-of-today':
    case 'end-of-day':
      return moment.tz(utils.TZ).endOf('day').utc();
    case 'yesterday':
    case 'end-of-yesterday':
      return moment.tz(utils.TZ).subtract(1, 'day').endOf('day').utc();
    case 'tomorrow':
    case 'end-of-tomorrow':
      return moment.tz(utils.TZ).add(1, 'day').endOf('day').utc();
    case 'end-of-week':
      return moment.tz(utils.TZ).endOf('week').utc();
    case 'end-of-month':
      return moment.tz(utils.TZ).endOf('month').utc();
    case 'end-of-year':
      return moment.tz(utils.TZ).endOf('year').utc();

    default:
    // do nothing
  }

  // Second, checks to see if we have a relative date.
  // E.g. +1d, or +2M, +6months, ~end-of-month
  //
  // The following keywords and shorthands are supported for +/-:
  //   year        years        y
  //   month       months       M
  //   week        weeks        w
  //   day         days         d
  //   hour        hours        h
  //   minute      minutes      m
  //   second      seconds      s
  //   millisecond milliseconds ms
  //
  if (date.startsWith('~') || date.startsWith('+') || date.startsWith('-')) {
    let relativeToMoment;

    if (moment.isMoment(relativeTo)) {
      relativeToMoment = relativeTo.clone().tz(utils.TZ);
    } else if (moment.isDate(relativeTo)) {
      relativeToMoment = moment(relativeTo).tz(utils.TZ);
    } else {
      relativeToMoment = moment.tz(utils.TZ);
    }

    if (date.startsWith('~')) {
      // E.g. ~end-of-day
      switch (date.substring(1).toLowerCase()) {
        case 'start-of-day':
          return relativeToMoment.startOf('day').utc();
        case 'start-of-week':
          return relativeToMoment.startOf('week').utc();
        case 'start-of-month':
          return relativeToMoment.startOf('month').utc();
        case 'start-of-year':
          return relativeToMoment.startOf('year').utc();

        case 'end-of-day':
          return relativeToMoment.endOf('day').utc();
        case 'end-of-week':
          return relativeToMoment.endOf('week').utc();
        case 'end-of-month':
          return relativeToMoment.endOf('month').utc();
        case 'end-of-year':
          return relativeToMoment.endOf('year').utc();

        default:
        // do nothing
      }
    } else {
      // E.g. +1month
      const match = date.trim().match(/^([+-])(\d+)([a-zA-Z_-]+)$/);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        const amount = parseInt(match[2], 10);
        const unit = match[3];
        return relativeToMoment.add(amount * sign, unit).utc();
      }
    }
    console.log(`Can't decode relative date: ${date}`);
    return undefined;
  }

  // Last resort is to interpret the date using date parsing
  const mDate = moment.tz(date, utils.TZ);
  if (!mDate || !mDate.isValid()) {
    console.log(`Can't parse date: ${date}`);
    return undefined;
  }
  return mDate.utc();
};

// Returns and array of two dates, in chronological order.
// The arguments must be moment dates.
utils.minMaxDate = function minMaxDate(startDate, endDate) {
  let minDate;
  let maxDate;
  if (startDate) {
    if (endDate) {
      if (startDate.isAfter(endDate)) {
        minDate = endDate;
        maxDate = startDate;
      } else {
        minDate = startDate;
        maxDate = endDate;
      }
    } else {
      minDate = startDate;
    }
  }
  if (!maxDate && endDate) {
    maxDate = endDate;
  }
  return [minDate, maxDate];
};

// Converts date to number of milliseconds since epoch
utils.dateToTS = function dateToTS(date) {
  if (moment.isMoment(date) || moment.isDate(date)) {
    return date.valueOf();
  }
  return undefined;
};

// Converts a date representation to formatted Year, Month, Day, Time values,
// in the configured timezone.
//
// E.g.
//   "2017-10-03T16:00:00.000Z"
// =>
//   ["2017", "October", "03", "11:00 AM"]
//
// -or-
//
//   1507046400000
// =>
//   ["2017", "October", "03", "11:00 AM"]
//
// If the conversion fails then null is returned
utils.getYearMonthDayTime = function getYearMonthDayTime(date) {
  const mDate = moment(date);
  if (mDate && mDate.isValid()) {
    mDate.tz(utils.TZ);
    return [mDate.format('Y'), mDate.format('MMMM'), mDate.format('DD'), mDate.format('h:mm A')];
  }
  console.log(`Can't parse date: ${date}`);
  return null;
};

// Converts a date representation to formatted Year, Month, Day values,
// in the configured timezone. The day transition is at 12AM + hoursOffset.
//
// E.g.
//   "2017-10-03T16:00:00.000Z"
// =>
//   { "year": "2017", "month": "October", monthNumber: '10', "day": "3" }
//
// -or-
//
//   1507046400000
// =>
//   { "year": "2017", "month": "October", monthNumber: '10', "day": "3" }
//
// If the conversion fails then null is returned
utils.getYearMonthDay = function getYearMonthDay(date, options) {
  const opts = {
    hoursOffset: 0,
    ...options,
  };
  const mDate = moment.tz(date, utils.TZ);
  const offset = parseFloat(opts.hoursOffset, 10) || 0;
  if (mDate && mDate.isValid()) {
    mDate.subtract(offset, 'hours');
    return {
      year: mDate.format('Y'),
      month: mDate.format('MMMM'),
      monthNumber: mDate.format('M'),
      day: mDate.format('D'),
    };
  }
  console.log(`Can't parse date: ${date}`);
  return null;
};

// Converts a date representation to Time Ago value.
//
// E.g.
//   "2017-10-03T16:00:00.000Z"
// =>
//   "an hour ago"
//
// -or-
//
//   1507046400000
// =>
//   "5 days ago"
//
// If the conversion fails then null is returned
utils.getTimeAgo = function getTimeAgo(date) {
  const mDate = moment(date);
  if (mDate && mDate.isValid()) {
    return mDate.fromNow();
  }
  console.log(`Can't parse date: ${date}`);
  return null;
};

// Converts a date representation to Time Ago value.
// The time ago is rounded at days level. The day transition is at 12AM + hoursOffset.
//
// E.g.
//   "2017-10-03T16:00:00.000Z"
// =>
//   "Today"
//
// -or-
//
//   1507046400000
// =>
//   "5 days ago"
//
// If the conversion fails then null is returned
utils.getTimeAgoInDays = function getTimeAgoInDays(date, options) {
  const opts = {
    hoursOffset: 0,
    ...options,
  };
  const mDate = moment.tz(date, utils.TZ);
  const offset = parseFloat(opts.hoursOffset, 10) || 0;

  if (mDate && mDate.isValid()) {
    const now = moment.tz(utils.TZ);
    const startOfToday = now.clone().subtract(offset, 'hours').startOf('day');
    const startOfDate = mDate.clone().subtract(offset, 'hours').startOf('day');
    const daysDiff = startOfDate.diff(startOfToday, 'days');

    if (daysDiff === 0) {
      format = 'Today';
    } else if (daysDiff === -1) {
      format = 'Yesterday';
    } else if (daysDiff === 1) {
      format = 'Tomorrow';
    } else if (daysDiff < 0) {
      format = `${-daysDiff} days ago`;
    } else {
      format = `in ${daysDiff} days`;
    }

    return format;
  }
  console.log(`Can't parse date: ${date}`);
  return null;
};

// Converts a date representation to formatted date in the configured timezone.
//
// E.g.
//   "2017-10-03T16:00:00.000Z", { year: 'always' }
// =>
//   "October 3, 2017"
//
// -or-
//
//   "2017-10-03T16:00:00.000Z", { dayOfTheWeek: true }
// =>
//   "Tuesday, October 3, 2017"
//
// -or-
//
//   "2017-10-03T16:00:00.000Z", { shortMonth: true }
// =>
//   "Oct 3
//
// -or-
//
//   1507046400000
// =>
//   "October 3"
//
// If the conversion fails then null is returned
utils.getFormattedDate = function getFormattedDate(date, options) {
  const opts = {
    hoursOffset: 0,
    year: 'default', // default, always, never
    shortMonth: false,
    dayOfTheWeek: false,
    ...options,
  };
  const offset = parseFloat(opts.hoursOffset, 10) || 0;
  const showYear = opts.year === 'always' ? true : opts.year === 'never' ? false : null;
  const shortMonth =
    opts.shortMonth === true || opts.shortMonth === 'true' || opts.shortMonth === '1';
  const dayOfTheWeek =
    opts.dayOfTheWeek === true || opts.dayOfTheWeek === 'true' || opts.dayOfTheWeek === '1';
  const currentYear = moment.tz(utils.TZ).year();
  const mDate = moment.tz(date, utils.TZ).subtract(offset, 'hour');
  if (mDate && mDate.isValid()) {
    let format;
    if (shortMonth === true) {
      format = 'MMM D';
    } else {
      format = 'MMMM D';
    }
    if (showYear !== false && (showYear === true || currentYear !== mDate.year())) {
      format = format + ', Y';
    }
    if (dayOfTheWeek === true) {
      if (shortMonth === true) {
        format = 'ddd, ' + format;
      } else {
        format = 'dddd, ' + format;
      }
    }
    return mDate.format(format);
  }
  console.log(`Can't parse date: ${date}`);
  return null;
};

// Converts a date representation to formatted date or relative date in the configured timezone.
//
// E.g.
//   "2017-10-03T16:00:00.000Z", { year: 'always' }
// =>
//   "October 3, 2017"
//
// -or-
//
//   "2018-10-03T16:00:00.000Z", { year: 'always' }
// =>
//   "Today"
//
// -or-
//
//   1507046400000
// =>
//   "October 3"
//
// If the conversion fails then null is returned
utils.getDisplayDate = function getDisplayDate(date, options) {
  const opts = {
    hoursOffset: 0,
    relativeDays: 2,
    year: 'default',
    shortMonth: false,
    ...options,
  };
  const offset = parseFloat(opts.hoursOffset, 10) || 0;
  const relativeDays = parseInt(opts.relativeDays, 10) || 2;
  const mDate = moment.tz(date, utils.TZ);
  if (mDate && mDate.isValid()) {
    const now = moment.tz(utils.TZ);
    const startOfToday = now.clone().subtract(offset, 'hours').startOf('day');
    const startOfDate = mDate.clone().subtract(offset, 'hours').startOf('day');
    const daysDiff = startOfToday.diff(startOfDate, 'days');

    if (daysDiff < relativeDays) {
      return utils.getTimeAgoInDays(date, opts);
    }
    return utils.getFormattedDate(date, opts);
  }
  console.log(`Can't parse date: ${date}`);
  return null;
};

// Creates a timeline of formatted dates in the configured timezone.
//
// E.g. startDate=2019-12-01, endDate=2020-01-01, { year: true, month: true }
//
// =>
//
// [
//   {
//     "date": "2019",
//     "type": "year"
//   },
//   {
//     "date": "December 2019",
//     "ref": "2019-12",
//     "type": "month"
//   },
//   {
//     "date": "2020",
//     "type": "year",
//     "current": true
//   },
//   {
//     "date": "January 2020",
//     "ref": "2020-01",
//     "type": "month"
//   }
// ]
//
// If some date conversions fail then an empty array is returned.
utils.getTimeline = function getTimeline(start, end, options) {
  const opts = {
    year: false,
    month: false,
    shortMonth: false,
    ...options,
  };

  const includeYears = opts.year === true || opts.year === 'true' || opts.year === '1';
  const includeMonths = opts.month === true || opts.month === 'true' || opts.month === '1';
  const useShortMonth =
    opts.shortMonth === true || opts.shortMonth === 'true' || opts.shortMonth === '1';

  let startDate = moment.tz(start, utils.TZ);
  if (!startDate || !startDate.isValid()) {
    console.log(`Can't parse date: ${start}`);
    return [];
  }

  let endDate = moment.tz(end, utils.TZ);
  if (!endDate || !endDate.isValid()) {
    console.log(`Can't parse date: ${end}`);
    return [];
  }

  const yearDisplayFormat = 'Y';
  const yearRefFormat = 'Y';

  const monthDisplayFormat = useShortMonth ? 'MMM Y' : 'MMMM Y';
  const monthRefFormat = 'Y-MM';

  const ascending = startDate.isSameOrBefore(endDate);
  const amount = ascending ? 1 : -1;

  let timeUnit = null;
  if (includeMonths) {
    timeUnit = 'month';
  } else if (includeYears) {
    timeUnit = 'year';
  }

  if (!timeUnit) {
    return [];
  }

  if (ascending) {
    startDate = startDate.startOf(timeUnit);
    endDate = endDate.endOf(timeUnit);
  } else {
    startDate = startDate.endOf(timeUnit);
    endDate = endDate.startOf(timeUnit);
  }

  const now = moment.tz(utils.TZ);
  const currentYear = now.year();
  const currentMonth = now.month();

  const result = [];
  let cursor = startDate.clone();
  let lastYear;
  let lastMonth;

  while (
    (ascending && cursor.isSameOrBefore(endDate)) ||
    (!ascending && cursor.isSameOrAfter(endDate))
  ) {
    if (includeYears && cursor.year() !== lastYear) {
      const entry = {
        date: cursor.format(yearDisplayFormat),
        ref: cursor.format(yearRefFormat),
        type: 'year',
      };
      if (cursor.year() === currentYear) {
        entry.current = true;
      }
      lastYear = cursor.year();
      result.push(entry);
    }
    if (includeMonths && cursor.month() !== lastYear) {
      const entry = {
        date: cursor.format(monthDisplayFormat),
        ref: cursor.format(monthRefFormat),
        type: 'month',
      };
      if (cursor.year() === currentYear && cursor.month() === currentMonth) {
        entry.current = true;
      }
      lastMonth = cursor.month();
      result.push(entry);
    }
    cursor = cursor.add(amount, timeUnit);
  }

  return result;
};

module.exports = utils;
