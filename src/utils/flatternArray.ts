export const flattenArray = <T>(
  input: Array<any>,
  output: Array<T> = [],
): Array<T> => {
  for (const value of input) {
    Array.isArray(value) ? flattenArray(value, output) : output.push(value);
  }
  return output;
};
