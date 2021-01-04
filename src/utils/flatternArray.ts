export const flattenArray = <T>(input: any[], output: T[] = []): T[] => {
  for (const value of input) {
    Array.isArray(value) ? flattenArray(value, output) : output.push(value);
  }
  return output;
}
