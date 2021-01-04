export const addParens = (str?: string) => {
  if (!str) {
    return str;
  }

  return `(${str})`;
}
