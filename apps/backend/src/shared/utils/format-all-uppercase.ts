// Need to fix this

import _ from 'lodash';

export function toUpperCaseRecursive(value) {
  if (_.isString(value)) {
    return value.toUpperCase();
  } else if (_.isArray(value)) {
    return _.map(value, toUpperCaseRecursive);
  } else if (_.isObject(value)) {
    return _.mapValues(value, toUpperCaseRecursive);
  }
  return value;
}
