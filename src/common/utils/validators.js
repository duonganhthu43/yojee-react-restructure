export function isString (target) {
  return target && typeof (target) === 'string';
}

export function isNumber (target) {
  return isNotEmpty(target, true) && !isNaN(target);
}

export function isObject (target) {
  return target && typeof (target) === 'object';
}

export function isDate (target) {
  return target && Object.prototype.toString.call(target) === '[object Date]';
}

export function isArray (target) {
  return target && Object.prototype.toString.call(target) === '[object Array]';
}

export function isFunction (target) {
  return target && typeof (target) === 'function';
}

export function isNull (target) {
  return target === undefined || target === null;
}

export function isNotNull (target) {
  return !isNull(target);
}

export function isEmpty (
  target,
  noWhiteSpace = false,
  noZero = false
) {
  return isNull(target) || target === ''
  || (noWhiteSpace ? (isString(target) && target.trim().length === 0) : false)
  || (noZero ? target === 0 : false);
}

export function isNotEmpty (
  target,
  noWhiteSpace = false,
  noZero = false,
) {
  return !isEmpty(target, noWhiteSpace, noZero);
}

export function isValidEmail (email) {
  const _EMAIL_REGEX = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  return _EMAIL_REGEX.test(email);
}

export function isValidUrl (url) {
  const _URL_REGEX = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

  return _URL_REGEX.test(url);
}

export function isStrongPassword (target) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/i.test(target);
}
