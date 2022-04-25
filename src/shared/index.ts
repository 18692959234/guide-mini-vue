export const extend = Object.assign;

export const isObject = (value) => value != null && typeof value === 'object';

export const isString = (value) => typeof value === 'string'

export const hasChanged = (value, newValue) => !Object.is(value, newValue);

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);