import { pluck } from './functional/pluck';
import { toLowerCase } from './functional/toLowerCase';

import { ICardWithIssue } from '../interfaces/ICardWithIssue';

export const isBugCard = (card: ICardWithIssue): boolean => {
  const { issue } = card;
  if (!issue) {
    return false;
  }

  const { labels } = issue;
  const isBug = labels.map(pluck('name')).map(toLowerCase).includes('bug');
  return isBug;
};
