/** Taken from my previous work in CPSC 310 - Ryan Oldford * */

/**
 * Schema for course section data in zip files that can be used to produce a Dataset
 */

/**
 * Type predicate to check if a given value is an array
 *
 * @param value  value to check
 *
 * @return boolean  true if value is an array
 */
function isArray(value: unknown): value is unknown[] {
  return value instanceof Array;
}

/**
 * Checks if a value is an object
 *
 * @param value  value to check
 *
 * @return boolean  true if value is an object
 */
function isObject(value: unknown): value is object {
  return typeof value === 'object';
}

function isObjectEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
}

/**
 * Check if data object has expected keys
 *
 * @param data  data object to check
 * @param expectedKeys  keys expected to be in data object
 *
 * @return boolean  true if data object has expected keys
 */
function hasCorrectKeys(data: object, expectedKeys: string[]): data is Record<string, unknown> {
  return expectedKeys.every((key) => key in data);
}

// Inspired by https://fettblog.eu/typescript-hasownproperty/
function hasKey<
  X extends object,
  Y extends PropertyKey
  >(
  obj: X,
  key: Y,
): obj is X & Record<Y, unknown> {
  return key in obj;
}

export type atCallbackType = (
  typeMismatchedData: Record<string, unknown>, key: string, valType: string
) => boolean;
export type ntCallbackType = (
  nestedValue: object, key: string
) => boolean

/**
 * Checks if data object has expected value types for each object key,
 * or if the value types can be properly converted.
 *
 * Expects that each key already exists in the given data object.
 *
 * @param data  data object to check
 * @param expected  list of [expected key, expected value type for key],
 *   or instance of expected object type
 * @param typeConversionCallback  callback to determine if data types can be converted
 * @param nestedTypeCallback  callback to check a nested value's type
 *
 * @return boolean  true if data object has expected or convertable types for each key
 */
function hasCorrectKeysAndValueTypes(
  data: Record<string, unknown>,
  expected: string[][] | Record<string, unknown>,
  typeConversionCallback: atCallbackType,
  nestedTypeCallback: ntCallbackType,
): boolean {
  if (isArray(expected)) {
    return expected.every((exp) => {
      const [key, valType] = exp;
      const value = data[key];
      if (typeof value === 'object') {
        if (value == null) {
          return false;
        }
        return nestedTypeCallback(value, key);
      }
      return (
      // eslint-disable-next-line valid-typeof
        typeof value === valType || typeConversionCallback(data, key, valType)
      );
    });
  }
  const expectedKVTypes = Object.keys(expected).map(
    (key) => [key, typeof expected[key as keyof typeof expected]],
  );
  return hasCorrectKeysAndValueTypes(
    data,
    expectedKVTypes,
    typeConversionCallback,
    nestedTypeCallback,
  );
}

/**
 * Checks that an array of values are all of the expected type, or that a single
 * value is of the expected type.
 *
 * @param values An array of values to validate, or a single value
 * @param type The string name of the expected type, e.g. "number" or "string".
 */
function isExpectedType(values: unknown[] | unknown, type: string): boolean {
  let valid = true;
  if (Array.isArray(values)) {
    values.forEach((val: unknown) => {
      // eslint-disable-next-line valid-typeof
      if (typeof val !== type) {
        valid = false;
      }
    });
  } else {
    // eslint-disable-next-line valid-typeof
    valid = typeof values === type;
  }
  return valid;
}

function hasCorrectSchema(
  data: unknown,
  schemaExample: Record<string, unknown>,
  typeConversionCallback?: atCallbackType,
  nestedTypeCallback?: ntCallbackType,
): boolean {
  const expectedKeys = Object.keys(schemaExample);
  if (!(isObject(data) && hasCorrectKeys(data, expectedKeys))) {
    return false;
  }
  const tcCallback = typeConversionCallback || (() => false);
  const ntCallback = nestedTypeCallback || (() => false);
  return hasCorrectKeysAndValueTypes(data, schemaExample, tcCallback, ntCallback);
}

function isArrayOfType<T>(data: unknown, typeChecker: (element: unknown) => element is T): boolean {
  if (!isArray(data)) {
    return false;
  }
  return data.every(typeChecker);
}

export {
  hasCorrectKeys,
  hasKey,
  hasCorrectKeysAndValueTypes,
  isArray,
  isObject,
  isObjectEmpty,
  isExpectedType,
  hasCorrectSchema,
  isArrayOfType,
};
