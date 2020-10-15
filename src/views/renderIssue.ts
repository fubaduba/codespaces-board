import { TColumnTypes } from '../interfaces/TColumnTypes';
import { TRepoIssue } from '../interfaces/TRepoIssue';

const mapColumnToEmoji = (column: TColumnTypes) => {
    switch (column) {
        case TColumnTypes.InProgress: {
            return '🏃  ';
        }

        case TColumnTypes.Done: {
            return '';
        }

        case TColumnTypes.Committed: {
            return '';
        }

        default:
        case TColumnTypes.Backlog: {
            throw new Error('Don\'t render the Backlog items.');
        }
    }
};

const mapIssueStateToListItemState = (issue: TRepoIssue) => {
    switch (issue.state) {
        case 'open': {
            return ' ';
        }
        default: {
            return 'x';
        }
    }
};

const renderAssignees = (issue: TRepoIssue) => {
    const { assignees } = issue;

    const users = assignees.map((user) => {
        return `@${user.login}`;
    });

    return users.join(' ');
};

export const renderIssue = (column: TColumnTypes, issue: TRepoIssue) => {
    const { title, html_url } = issue;
        const issueState = mapIssueStateToListItemState(issue);
        const assignees = renderAssignees(issue);

        return `- [${issueState}] ${mapColumnToEmoji(column)}${title} ${html_url} ${assignees}`;
}
