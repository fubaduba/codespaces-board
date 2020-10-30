import { IDeveloperWithIssuesCount } from "./IDeveloperWithIssuesCount";

export interface IProjectStats {
  doneRate: number;
  inWorkRate: number;
  committedRate: number;

  issuesDeveloperRatio: number;
  issuesDeveloperLeftRatio: number;

  issuesDayRatio?: number;
  issuesDayLeftRatio?: number;

  issuesDeveloperDayRatio?: number;
  issuesDeveloperDayLeftRatio?: number;

  // devWithMostAssignedIssues: IDeveloperWithIssuesCount;

  developers: string[];
}
