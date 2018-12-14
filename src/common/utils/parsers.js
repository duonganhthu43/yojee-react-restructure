import {
  isNotNull,
  isNumber,
} from './validators';


export function parseString(target) {
  return isNotNull(target) ? target : '';
}

export function parseNumber(target) {
  return isNumber(target) ? Number(target) : 0;
}

export function parseBoolean(target) {
  if (isNotNull(target)) {
    switch (target.toString().trim()) {
      case '1':
      case 'true':
        return true;
      case '0':
      case 'false':
        return false;
      default:
    }
  }

  return false;
}
