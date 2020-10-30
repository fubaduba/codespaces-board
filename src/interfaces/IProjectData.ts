import { ICardWithIssue } from './ICardWithIssue';
import { IProjectWithConfig } from './IProjectWithConfig';

export interface IProjectData {
  project: IProjectWithConfig;
  inWorkIssues: ICardWithIssue[];
  doneOrDeployIssues: ICardWithIssue[];
  allPlannedIssues: ICardWithIssue[];
  issuesToSolve: ICardWithIssue[];
  // raw:
  backlogIssues: ICardWithIssue[];
  committedIssues: ICardWithIssue[];
  progressIssues: ICardWithIssue[];
  inReviewIssues: ICardWithIssue[];
  blockedIssues: ICardWithIssue[];
  waitingToDeployIssues: ICardWithIssue[];
  doneIssues: ICardWithIssue[];
}


