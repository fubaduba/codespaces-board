import { IParsedIssue } from '../interfaces/IParsedIssue';

export const parseIssueUrl = (issueUrl: string): IParsedIssue => {
  const uri = new URL(issueUrl);
  const { pathname } = uri;

  const split = pathname.split('/');

  return {
    owner: split[1],
    repo: split[2],
    issueNumber: parseInt(split[4], 10),
  };
};
