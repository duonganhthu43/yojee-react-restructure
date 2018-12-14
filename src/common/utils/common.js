import {
  isNull,
  isString,
  isDate,
} from './validators';

export function unsubscribe (subscriptions, doSetNull) {
  if (!subscriptions) { return; }

  subscriptions.forEach((item) => {
      if (item) {
          item.unsubscribe();

          if (doSetNull) { item = null; }
      }
  });
}

export function newGUID () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
    const _random = Math.random() * 16 | 0;
    return (char === 'x' ? _random : (_random & 0x3 | 0x8)).toString(16);
  });
}

export function getPropertyValue (target, props) {
  let result = null;
  let _prop;

  for (let i = 0; i < props.length; i++) {
    _prop = i === 0 ? target[props[i]] : _prop[props[i]];

    if (isNull(_prop)) {
      break;
    }
  }

  result = _prop;

  return result;
}
// sortType: 'asc' | 'desc'
export function sortArray (target, sortBy, sortType) {
  return target.sort((item1, item2) => {
    const _order = sortType === 'desc' ? -1 : 1;
    const _item1Value = getPropertyValue(item1, sortBy.split('.'));
    const _item2Value = getPropertyValue(item2, sortBy.split('.'));

    if (isNull(_item1Value)) {
      return 1 * _order;
    }
    if (isNull(_item2Value)) {
      return -1 * _order;
    }
    if (isString(_item1Value)) {
      return _item1Value.localeCompare(_item2Value) * _order;
    }
    if (isDate(_item1Value)) {
      return (_item1Value.getTime() - _item2Value.getTime()) * _order;
    }

    return (_item1Value - _item2Value) * _order;
  });
}
