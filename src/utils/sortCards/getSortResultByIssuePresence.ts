import { ICardWithIssue } from '../../interfaces/ICardWithIssue';
import { TArraySortResult } from '../../interfaces/TArraySortResult';

export const getSortResultByIssuePresence = (
  cardWithIssue1: ICardWithIssue,
  cardWithIssue2: ICardWithIssue
): TArraySortResult | null => {
  const { issue: issue1 } = cardWithIssue1;
  const { issue: issue2 } = cardWithIssue2;

  if (!issue1 && !issue2) {
    return null;
  }

  if (!issue1) {
    return TArraySortResult.SecondEarlier;
  }

  if (!issue2) {
    return TArraySortResult.FirstEarlier;
  }

  return null;
};
