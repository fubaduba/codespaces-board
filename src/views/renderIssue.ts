import { IIssueState } from '../interfaces/IIssueState';
import { TColumnTypes } from '../interfaces/TColumnTypes';
import { TRepoIssue } from '../interfaces/TRepoIssue';
import { pluck } from '../utils/pluck';

const mapColumnToEmoji = (column: TColumnTypes) => {
  switch (column) {
    case TColumnTypes.Committed: {
      return '';
    }

    case TColumnTypes.InProgress: {
      return '';
    }

    case TColumnTypes.InReview: {
      return '👀  ';
    }

    case TColumnTypes.WaitingToDeploy: {
      return '🏗️  ';
    }

    case TColumnTypes.Blocked: {
      return '';
    }

    case TColumnTypes.Done: {
      return '✅  ';
    }

    default:
    case TColumnTypes.Backlog: {
      throw new Error("Don't render the Backlog items.");
    }
  }
};

const toLowerCase = (str: string) => {
  return str.toLowerCase();
};

const mapIssueTypeToEmoji = (issue: TRepoIssue) => {
  const { labels } = issue;

  const isBug = labels.map(pluck('name')).map(toLowerCase).includes('bug');

  if (isBug) {
    return '🐛  ';
  }

  return '';
};

const renderAssignees = (issue: TRepoIssue) => {
  const { assignees } = issue;

  if (!assignees.length) {
    return `🙋**free issue**`;
  }

  const users = assignees.map((user) => {
    return `@${user.login}`;
  });

  return users.join(' ');
};

const renderItemIssueStatus = (issue: TRepoIssue, asCheckList: boolean) => {
  if (!asCheckList) {
    return '';
  }

  return issue.state === IIssueState.Open ? '[ ] ' : '[x] ';
};

export const renderIssue = (
  column: TColumnTypes,
  issue: TRepoIssue,
  asCheckList = false,
) => {
  const { title, html_url } = issue;
  const assignees = renderAssignees(issue);
  const stateEmoji = mapColumnToEmoji(column);
  const bugEmoji = mapIssueTypeToEmoji(issue);
  const issueStatus = renderItemIssueStatus(issue, asCheckList);

  return `- ${issueStatus}${stateEmoji}${bugEmoji}${title} ${html_url} ${assignees}`;
};
