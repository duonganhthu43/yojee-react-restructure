export function parseDate(target) {
  return target && isNaN(target) ? new Date(target) : null;
}

export function parseISO8601Date(target) {
  if (!target) { return null; }

  const date = new Date();
  const _match = target.toString().match(new RegExp(/(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/));

  if (_match) {
      date.setUTCDate(1);
      date.setUTCFullYear(parseInt(_match[1], 10));
      date.setUTCMonth(parseInt(_match[3], 10) - 1);
      date.setUTCDate(parseInt(_match[5], 10));
      date.setUTCHours(parseInt(_match[7], 10));
      date.setUTCMinutes(parseInt(_match[9], 10));
      date.setUTCSeconds(parseInt(_match[11], 10));

      if (_match[12]) {
          date.setUTCMilliseconds(parseFloat(_match[12]) * 1000);
      } else {
          date.setUTCMilliseconds(0);
      }

      if (_match[13] !== 'Z') {
          let offset = (_match[15] * 60) + parseInt(_match[17], 10);
          offset *= ((_match[14] === '-') ? -1 : 1);
          date.setTime(date.getTime() - offset * 60 * 1000);
      }
  } else {
      date.setTime(Date.parse(target));
  }

  return date;
}

export function toISO8601String(target) {
  if (!target) { return null; }

  const _timezone = -(target.getTimezoneOffset());
  const _diff = _timezone >= 0 ? '+' : '-';
  const _pad = (value) => {
      const _norm = Math.floor(Math.abs(value));
      return (_norm < 10 ? '0' : '') + _norm;
  };

  return target.getFullYear() +
      '-' + _pad(target.getMonth() + 1) +
      '-' + _pad(target.getDate()) +
      'T' + _pad(target.getHours()) +
      ':' + _pad(target.getMinutes()) +
      ':' + _pad(target.getSeconds()) +
      _diff + _pad(_timezone / 60) +
      ':' + _pad(_timezone % 60);
}
// unit: 'milisecond' | 'second'
export function toTimestamp(date, unit = 'second') {
  return date.getTime() / (unit && unit === 'second' ? 1000 : 1);
}

export function toWithoutTime(target) {
  const result = parseDate(target);

  if (result) {
    result.setHours(0, 0, 0, 0);
  }

  return result;
}

export function getFirstDateOfWeek(target) {
  /* First day of week is the day of the month - the day of the week */
  return addDay(target, -target.getDay());
}

export function getLastDateOfWeek(target) {
  return addDay(getFirstDateOfWeek(target), 6);
}

// firstDayOfWeek Which Sunday or Monday or another you want to be the first day of week.
export function getFirstDateOfMonth(date, firstDayOfWeek) {
  const _currentMonth = date.getMonth();
  let result = new Date(date);
  let _yesterday = addDay(result, -1);

  const _firstDayOfCurrentMonthIsAlsoFirstDayOfWeek = () => {
      return result.getMonth() !== _yesterday.getMonth() && firstDayOfWeek === result.getDay();
  };

  const _reachedTheFirstDayOfTheLastWeekOfPreviousMonth = () => {
      return result.getMonth() !== _currentMonth && firstDayOfWeek === result.getDay();
  };

  while (!_reachedTheFirstDayOfTheLastWeekOfPreviousMonth() && !_firstDayOfCurrentMonthIsAlsoFirstDayOfWeek()) {
      result = new Date(_yesterday);
      _yesterday = addDay(_yesterday, -1);
  }

  return result;
}

export function getLastDateOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

export function addHours(target, hours) {
  const _date = new Date(target);
  return new Date(_date.setHours(_date.getHours() + hours));
}

export function addMinutes(target, minutes) {
  const _date = new Date(target);
  return new Date(_date.setMinutes(_date.getMinutes() + minutes));
}

export function addDay(target, days) {
  const _date = new Date(target);
  return new Date(_date.setDate(_date.getDate() + days));
}

export function addWeek(target, weeks) {
  const _date = new Date(target);
  return new Date(_date.setDate(getFirstDateOfWeek(_date).getDate() + (6 * weeks) + (weeks > 0 ? 1 : -1)));
}

export function addMonth(target, months, dayOfMonth) {
  const _date = new Date(target);
  return new Date(_date.setMonth(_date.getMonth() + months, dayOfMonth));
}

export function addYear(target, years, monthOfYear, dayOfMonth) {
  const _date = new Date(target);
  return new Date(_date.setFullYear(_date.getFullYear() + years, monthOfYear, dayOfMonth));
}

export function differentDays(date1, date2) {
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / (24 * 60 * 60 * 1000)));
}
