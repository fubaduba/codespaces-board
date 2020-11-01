import { ICardWithIssue } from '../../interfaces/ICardWithIssue';
import { IProjectWithConfig } from '../../interfaces/IProjectWithConfig';
import { getCardPriority } from './getCardPriority';
import { TArraySortResult } from '../../interfaces/TArraySortResult';
import { getSortResultByIssuePresence } from './getSortResultByIssuePresence';

type TSortPredicate = (ardWithIssue1: ICardWithIssue, cardWithIssue2: ICardWithIssue) => TArraySortResult | undefined;

// const sortCardsByPriorityLabelsPredicateFactory = (
//   projectWithConfig: IProjectWithConfig,
//   predicate?: TSortPredicate,
// ) => {
//   return
// };

export const sortCardsByLabelPriorityInPlace = (
  cardsWithIssue: ICardWithIssue[],
  projectWithConfig: IProjectWithConfig,
  predicate?: TSortPredicate,
) => {
  const result = cardsWithIssue.sort((cardWithIssue1: ICardWithIssue, cardWithIssue2: ICardWithIssue) => {
    const baseSort = getSortResultByIssuePresence(cardWithIssue1, cardWithIssue2);
    if (baseSort !== null) {
      return baseSort;
    }

    const defaultPriority = (predicate)
      ? null
      : undefined;

    const cardPriority1 = getCardPriority(cardWithIssue1, projectWithConfig, defaultPriority);
    const cardPriority2 = getCardPriority(cardWithIssue2, projectWithConfig, defaultPriority);
    if (cardPriority1 === null && cardPriority2 === null && predicate) {
      return predicate(cardWithIssue1, cardWithIssue2) ?? TArraySortResult.Equal;
    }

    if (cardPriority1 === null) {
      return TArraySortResult.SecondEarlier;
    }

    if (cardPriority2 === null) {
      return TArraySortResult.FirstEarlier;
    }

    if (cardPriority1 > cardPriority2) {
      return TArraySortResult.FirstEarlier;
    }

    if (cardPriority1 < cardPriority2) {
      return TArraySortResult.SecondEarlier;
    }

    return TArraySortResult.Equal;
  });

  return result;
};
