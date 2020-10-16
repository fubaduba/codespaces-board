import { TColumnTypes } from '../interfaces/TColumnTypes';
import { TRepoIssue } from '../interfaces/TRepoIssue';

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

// const mapIssueStateToListItemState = (issue: TRepoIssue) => {
//   switch (issue.state) {
//     case 'open': {
//       return '';
//     }
//     default: {
//       return '✅';
//     }
//   }
// };

const renderAssignees = (issue: TRepoIssue) => {
  const { assignees } = issue;

  if (!assignees.length) {
      return `❗**unassigned**`
  }

  const users = assignees.map((user) => {
    return `@${user.login}`;
  });

  return users.join(' ');
};

export const renderIssue = (column: TColumnTypes, issue: TRepoIssue) => {
  const { title, html_url } = issue;
  // const issueState = mapIssueStateToListItemState(issue);
  const assignees = renderAssignees(issue);

  return `- ${mapColumnToEmoji(
    column,
  )}${title} ${html_url} ${assignees}`;
};
