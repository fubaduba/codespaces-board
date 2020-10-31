import { ICardWithIssue } from '../../interfaces/ICardWithIssue';
import { TArraySortResult } from '../../interfaces/TArraySortResult';

export const sortByAssigneesPredicate = (
  cardWithIssue1: ICardWithIssue,
  cardWithIssue2: ICardWithIssue,
): TArraySortResult | undefined => {
  const { issue: issue1 } = cardWithIssue1;
  const { issue: issue2 } = cardWithIssue2;

  if (!issue1 && !issue2) {
    return;
  }

  if (!issue1 || !issue1.assignees.length) {
    return TArraySortResult.SecondEarlier;
  }

  if (!issue2 || !issue2.assignees.length) {
    return TArraySortResult.FirstEarlier;
  }

  if (issue1.assignees[0].login < issue2.assignees[0].login) {
    return TArraySortResult.FirstEarlier;
  }
  if (issue1.assignees[0].login > issue2.assignees[0].login) {
    return TArraySortResult.SecondEarlier;
  }

  return TArraySortResult.Equal;
}

export const sortCardsByAssigneesInPlace = (cardsWithIssue: ICardWithIssue[]) => {
  const result = cardsWithIssue.sort((card1: ICardWithIssue, card2: ICardWithIssue) => {
    return sortByAssigneesPredicate(card1, card2) ?? TArraySortResult.Equal;
  });

  return result;
};
