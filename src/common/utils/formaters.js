export function padNumber (value, length = 2) {
  let _prefix = '0';
  let _max = 10;

  for (let i = 1; i < length - 1; i++) {
    _prefix += _prefix;
    _max *= _max;
  }

  return value < _max ? `${_prefix}${value}` : `${value}`;
}

/*
  formatNumber(12345678.9) =>  "12.345.678,90"
*/
export function formatNumber (
  value,
  sectionLength = 3,
  decimalLength = 2,
  sectionDelimiter = ',',
  decimalDelimeter = '.',
) {
  const _regex = `\\d(?=(\\d{${sectionLength}})+(${decimalLength > 0 ? '\\D' : '$'}))`;
  const _number = value.toFixed(Math.max(0, ~~decimalLength));

  return (decimalDelimeter !== '.' ? _number.replace('.', decimalDelimeter) : _number)
    .replace(new RegExp(_regex, 'g'), `$&${sectionDelimiter}`);
}

export function toCapitalize (target) {
  return target.charAt(0).toUpperCase() + target.slice(1);
}

export function camelToSnakeCase (target, dilimeter) {
  const _upperChars = target.match(/([A-Z])/g);
  if (!_upperChars || !dilimeter) { return target; }

  let result = target;
  for (let i = 0; i < _upperChars.length; i++) {
    result = result.replace(new RegExp(_upperChars[i]), `${dilimeter}${_upperChars[i].toLowerCase()}`);
  }

  if (result.slice(0, 1) === dilimeter) {
    result = result.slice(1);
  }

  return result;
}

export function lineBreakToBr (target) {
  return target ? target.replace(/(?:\r\n|\r|\n)/g, '<br/>') : target;
}
