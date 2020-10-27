import { IParsedIssue } from '../interfaces/IParsedIssue';

export const serializeIssuePath = (issue: IParsedIssue): string => {
    const { owner, repo, issueNumber } = issue;

    return `/${owner}/${repo}/${issueNumber}`;
};
