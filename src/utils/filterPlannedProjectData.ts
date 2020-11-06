import { IProjectData } from '../interfaces/IProjectData';
import { ICardWithIssue } from '../interfaces/ICardWithIssue';

// const filterUnplannedCards = (cardsWithIssue: ICardWithIssue[]): ICardWithIssue[] => {
//   const cards = filterNewCards(cardsWithIssue);
//   return filterUnassignedIssues(cards);
// };

export const filterUnassignedIssues = (cardsWithIssue: ICardWithIssue[]): ICardWithIssue[] => {
  const cards = cardsWithIssue.filter(({ issue }) => {
    if (!issue) {
      return true;
    }

    return (issue.assignees.length > 0);
  });

  return cards;
};

const filterNewCards = (cardsWithIssue: ICardWithIssue[]): ICardWithIssue[] => {
  const cards = cardsWithIssue.filter((card) => {
    return !card.isNew;
  });

  return cards;
};

export const filterPlannedProjectData = (data: IProjectData): IProjectData => {

  return {
    ...data,
    // combined
    inWorkIssues: filterNewCards(data.inWorkIssues),
    doneOrDeployIssues: filterNewCards(data.doneOrDeployIssues),
    allPlannedIssues: filterNewCards(data.allPlannedIssues),
    issuesToSolve: filterNewCards(data.issuesToSolve),
    // plain
    backlogIssues: filterNewCards(data.backlogIssues),
    committedIssues: filterNewCards(data.committedIssues),
    progressIssues: filterNewCards(data.progressIssues),
    inReviewIssues: filterNewCards(data.inReviewIssues),
    blockedIssues: filterNewCards(data.blockedIssues),
    waitingToDeployIssues: filterNewCards(data.waitingToDeployIssues),
    doneIssues: filterNewCards(data.doneIssues),
  };
};
