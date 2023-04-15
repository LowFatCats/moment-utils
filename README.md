# LFC Moment Utils

This module provides various date utility functions built using [moment.js](https://momentjs.com/).

## Installation

```bash
npm install @lowfatcats/moment-utils
```

## Quick Start

```js
const utils = require("@lowfatcats/moment-utils");
utils.convertDate('start-of-month,~end-of-day');

=> Moment<2023-04-01T23:59:59Z>
```

## Documentation

### `config(options)`

Configures working timezone.

E.g.
```js
config({timezone: 'US/Central'})
```

You can also use TIMEZONE environment variable to set your working
timezone. Default timezone is UTC.

E.g.
```bash
export TIMEZONE="US/Central"
```

### `now()`

Returns the number of milliseconds since epoch.

### `convertDate(date, relativeTo)`

Converts a date, date-like string, or date specification to a moment date. The second parameter (`relativeTo`) is optional, and defaults to the current time if not provided.

The date specification contains one base date, that can be combined with zero or more date operations that modify the base date in some way.

You can combine multiple date operations by providing a comma separated
list of date-like strings. For instance, to specify the start of the
previous month you can use '-1month,~start-of-month'.

Note that the definition of "Today" is based on the timezone configured. A start-of-day definition in US/Central timezone will become Midnight / 00:00:00.000 US/Central which will be correspond to a 5AM or 6AM in UTC time, depending whether the Daylight Saving Time is active in the US or not for the date.

This function can be used to encode complex date specifications into actual  times. For example, `"the last Saturday of 2020 at 5:25PM"` can be encoded as `convertDate("2020,~end-of-year,~start-of-week,-1day,+17h,+25m")`.

Other examples:
```js
convertDate('now')
convertDate('start-of-month')
convertDate('start-of-month,+6hours')
convertDate('-6days')
convertDate('+1month', moment())
convertDate('-1month,~end-of-month', moment())
convertDate('~end-of-day', moment('2017-08-05'))
convertDate('2017-08-05T10:00:00.000Z')
```

Available base date specifications:
- `now`
- `start-of-today`
- `start-of-day`
- `start-of-yesterday`
- `start-of-tomorrow`
- `start-of-week`
- `start-of-month`
- `start-of-year`
- `today`
- `end-of-today`
- `end-of-day`
- `yesterday`
- `end-of-yesterday`
- `tomorrow`
- `end-of-tomorrow`
- `end-of-week`
- `end-of-month`
- `end-of-year`
- `<date-like-string>` recognized by `moment.tz()`
  - `2020`
  - `2020-01-01`
  - `2017-08-05T10:00:00.000Z`

Available relative date operations prefixed with `~`:
- `~start-of-day`
- `~start-of-week`
- `~start-of-month`
- `~start-of-year`
- `~end-of-day`
- `~end-of-week`
- `~end-of-month`
- `~end-of-year`

Units of time can be added or substracted using `+` or `-`. The following keywords and shorthands are supported for +/-:

```
year        years        y
month       months       M
week        weeks        w
day         days         d
hour        hours        h
minute      minutes      m
second      seconds      s
millisecond milliseconds ms
```

E.g. `+1d`, or `+2M`, `+6months`

### `minMaxDate(startDate, endDate)`

Returns and array of two dates, in chronological order.
The arguments must be moment dates.

### `dateToTS(date)`

Converts date to number of milliseconds since epoch.

### `getYearMonthDayTime(date)`

Converts a date representation to formatted `Year`, `Month`, `Day`, `Time` values, in the configured timezone.

E.g.
```
  "2017-10-03T16:00:00.000Z"
=>
  ["2017", "October", "03", "11:00 AM"]
```

-or-

```
  1507046400000
=>
  ["2017", "October", "03", "11:00 AM"]
```

If the conversion fails then `null` is returned.

### `getYearMonthDay(date, options)`

Converts a date representation to formatted `Year`, `Month`, `Day` values,
in the configured timezone. The day transition is at 12AM + hoursOffset.

E.g.
```
  "2017-10-03T16:00:00.000Z"
=>
  { "year": "2017", "month": "October", monthNumber: '10', "day": "3" }
```

-or-

```
  1507046400000
=>
  { "year": "2017", "month": "October", monthNumber: '10', "day": "3" }
```

If the conversion fails then `null` is returned.

Default options:
```js
{
    hoursOffset: 0
}
```

### `getTimeAgo(date)`

Converts a date representation to `Time Ago` value.

E.g.
```
  "2017-10-03T16:00:00.000Z"
=>
  "an hour ago"
```

-or-

```
  1507046400000
=>
  "5 days ago"
```

If the conversion fails then `null` is returned.

### `getTimeAgoInDays(date, options)`

Converts a date representation to `Time Ago` value. The time ago is rounded at days level. The day transition is at 12AM + hoursOffset.

E.g.
```
  "2017-10-03T16:00:00.000Z"
=>
  "Today"
```

-or-

```
  1507046400000
=>
  "5 days ago"
```

If the conversion fails then `null` is returned.

Default options:
```js
{
    hoursOffset: 0
}
```

### `getFormattedDate(date, options)`

Converts a date representation to formatted date in the configured timezone.

E.g.
```
  "2017-10-03T16:00:00.000Z", { year: 'always' }
=>
  "October 3, 2017"
```

-or-

```
  "2017-10-03T16:00:00.000Z", { dayOfTheWeek: true }
=>
  "Tuesday, October 3, 2017"
```

-or-

```
  "2017-10-03T16:00:00.000Z", { shortMonth: true }
=>
  "Oct 3
```

-or-

```
  1507046400000
=>
  "October 3"
```

If the conversion fails then `null` is returned.

Default options:
```js
{
    hoursOffset: 0,
    year: 'default', // default, always, never
    shortMonth: false,
    dayOfTheWeek: false
}
```

### `getDisplayDate(date, options)`

Converts a date representation to formatted date or relative date in the configured timezone.

E.g.
```
  "2017-10-03T16:00:00.000Z", { year: 'always' }
=>
  "October 3, 2017"
```

-or-

```
  "2018-10-03T16:00:00.000Z", { year: 'always' }
=>
  "Today"
```

-or-

```
  1507046400000
=>
  "October 3"
```

If the conversion fails then `null` is returned.

Default options:
```js
{
    hoursOffset: 0,
    relativeDays: 2,
    year: 'default', // default, always, never
    shortMonth: false
}
```

### `getTimeline(start, end, options)`

Creates a timeline of formatted dates in the configured timezone.

E.g.
```
getTimeline("2019-12-01", "2020-01-01", { year: true, month: true })

=>

[
  {
    "date": "2019",
    "type": "year"
  },
  {
    "date": "December 2019",
    "ref": "2019-12",
    "type": "month"
  },
  {
    "date": "2020",
    "type": "year",
    "current": true
  },
  {
    "date": "January 2020",
    "ref": "2020-01",
    "type": "month"
  }
]
```

You can also specify a `start` date after `end` date if you want the timeline to be returned in reverse order.

E.g.
```
getTimeline("2022-12", "2022-07", { month: true })

=>

[
  { date: 'December 2022', ref: '2022-12', type: 'month' },
  { date: 'November 2022', ref: '2022-11', type: 'month' },
  { date: 'October 2022', ref: '2022-10', type: 'month' },
  { date: 'September 2022', ref: '2022-09', type: 'month' },
  { date: 'August 2022', ref: '2022-08', type: 'month' },
  { date: 'July 2022', ref: '2022-07', type: 'month' }
]
```
If some date conversions fail then an empty array is returned.

Default options:
```js
{
    year: false,
    month: false,
    shortMonth: false
}
```
