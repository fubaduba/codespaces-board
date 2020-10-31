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

    // const { issue: issue1 } = cardWithIssue1;
    // const { issue: issue2 } = cardWithIssue1;

    // if (issue1 && issue2) {
    //   if (issue1.number === )
    // }



    // const defaultPriority = (predicate)
    //   ? null
    //   : undefined;

    const cardPriority1 = getCardPriority(cardWithIssue1, projectWithConfig);
    const cardPriority2 = getCardPriority(cardWithIssue2, projectWithConfig);
    // if (cardPriority1 === null && cardPriority2 === null && predicate) {
    //   return predicate(cardWithIssue1, cardWithIssue2) ?? TArraySortResult.Equal;
    // }

    // if (cardPriority1 === null) {
    //   return TArraySortResult.SecondEarlier;
    // }

    // if (cardPriority2 === null) {
    //   return TArraySortResult.FirstEarlier;
    // }

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
