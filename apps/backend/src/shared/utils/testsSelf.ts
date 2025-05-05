import _ from 'lodash';

function toUpperCaseRecursive(value) {
  if (_.isString(value)) {
    return value.toUpperCase();
  } else if (_.isArray(value)) {
    return _.map(value, toUpperCaseRecursive);
  } else if (_.isObject(value)) {
    return _.mapValues(value, toUpperCaseRecursive);
  }
  return value;
}

// Exemplo de uso
const data = {
  name: 'John',
  details: {
    hobbies: ['reading', 'gaming'],
    address: {
      city: 'New York',
      zip: '10001',
    },
  },
};

const result = toUpperCaseRecursive(data);
console.log(result);
