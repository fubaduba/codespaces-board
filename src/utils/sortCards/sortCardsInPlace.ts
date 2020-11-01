import { ICardWithIssue } from '../../interfaces/ICardWithIssue';
import { IProjectWithConfig } from '../../interfaces/IProjectWithConfig';
import { sortCardsByLabelPriorityInPlace } from './sortCardsByLabelPriorityInPlace';
import { sortByAssigneesPredicate } from './sortCardsByAssigneesInPlace';

/**
 * The Default way of sorting the cards. !IN PLACE!
 */
export const sortCardsInPlace = (
    cards: ICardWithIssue[],
    projectWithConfig: IProjectWithConfig,
) => {
    sortCardsByLabelPriorityInPlace(
        cards,
        projectWithConfig,
        sortByAssigneesPredicate,
    );

    return cards;
};
