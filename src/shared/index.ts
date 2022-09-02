export * from './toDisplayString'

export const extend = Object.assign;

export const EMPTY_OBJ = {};

export const isObject = (value) => value != null && typeof value === 'object';

export const isString = (value) => typeof value === 'string'

export const hasChanged = (value, newValue) => !Object.is(value, newValue);

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

/**
 * @name 转驼峰方法
 * @param {String} str 
 * @returns {String} res
 */
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * @name 处理on函数
 * @param str 
 * @returns {String} res
 */
export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};

export const clog = (...arg) => console.log('--------', ...arg, '--------')