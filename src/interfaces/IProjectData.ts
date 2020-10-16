import { IWrappedIssue } from './IWrappedIssue';

export interface IProjectData {
  inWorkIssues: IWrappedIssue[];
  doneOrDeployIssues: IWrappedIssue[];
  allPlannedIssues: IWrappedIssue[];
  // raw:
  backlogIssues: IWrappedIssue[];
  committedIssues: IWrappedIssue[];
  progressIssues: IWrappedIssue[];
  inReviewIssues: IWrappedIssue[];
  blockedIssues: IWrappedIssue[];
  waitingToDeployIssues: IWrappedIssue[];
  doneIssues: IWrappedIssue[];
}


