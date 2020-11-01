import { IProjectData } from '../interfaces/IProjectData';
import { ICardWithIssue } from '../interfaces/ICardWithIssue';

const filterNewCards = (cardsWithIssue: ICardWithIssue[]): ICardWithIssue[] => {
  return cardsWithIssue.filter((card) => {
    return !card.isNew;
  });
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
