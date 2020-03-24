export function flatDeep(arr, depth = 1) {
    return depth > 0
        ? arr.reduce(
              (acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, depth - 1) : val),
              []
          )
        : arr.slice();
}
