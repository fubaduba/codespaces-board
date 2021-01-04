import { ThenArg } from './ThenArg';
import { TGitHub } from './TGitHub';

export type TRepoIssuesResponse = ThenArg<
  ReturnType<TGitHub['issues']['listForRepo']>
>
export type TRepoIssuesPaginatedResponse = TRepoIssuesResponse['data'];
export type TRepoIssue = TRepoIssuesPaginatedResponse[0];
