import { ident } from '../views/ident';

export const emojiIcon = (icon: string, title?: string) => {
  const iconString = `${icon}${ident(1)}`;
  if (!title) {
    return iconString;
  }

  return `<i title="${title}">${iconString}</i>`;
}
