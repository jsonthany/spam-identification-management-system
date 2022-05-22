import { hasKey, isObject } from './typeAssertionHelpers';

// given obj and ['foo','bar','baz'], tries to get value of obj.foo.bar.baz recursively
// returns value if all those keys exist
// returns undefined if any don't (i.e. not an object, or doesn't have that key)
export default function getValueForKeysRecursively(
  obj: unknown,
  props: string[],
): unknown | undefined {
  if (props.length > 0) {
    if (isObject(obj)) {
      const [first, ...rest] = props;
      if (hasKey(obj, first)) {
        return getValueForKeysRecursively(obj[first], rest); // recursive case: has key
      }
    }
    return undefined; // base case: not an object or doesn't have key, return undefined
  }
  return obj; // base case: props is empty, return obj
}
