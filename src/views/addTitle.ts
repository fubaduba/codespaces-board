export const addTitle = (title: string, str?: string) => {
  if (!str) {
    return str;
  }

  return `<i title="${title}">${str}</i>`;
}
