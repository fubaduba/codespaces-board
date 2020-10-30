import { ICardWithIssue } from '../interfaces/ICardWithIssue';
import { IIssueState } from '../interfaces/IIssueState';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { TColumnTypes } from '../interfaces/TColumnTypes';
import { TProjectConfig } from '../interfaces/TProjetConfig';
import { pluck } from '../utils/pluck';
import { ident } from './ident';
import { cardLink } from '../utils/cardLink';


const isDoneColumn = (column: TColumnTypes) => {
  switch (column) {
    case TColumnTypes.WaitingToDeploy:
    case TColumnTypes.Done: {
      return true;
    }

    default: {
      return false;
    }
  }
}

const emojiIcon = (icon: string, title?: string) => {
  const iconString = `${icon}${ident(1)}`;
  if (!title) {
    return iconString;
  }

  return `<i title="${title}">${iconString}</i>`;
};

const mapColumnToEmoji = (column: TColumnTypes) => {
  switch (column) {
    case TColumnTypes.Committed: {
      return '';
    }

    case TColumnTypes.InProgress: {
      return '';
    }

    case TColumnTypes.InReview: {
      return emojiIcon('👀', column);
    }

    case TColumnTypes.WaitingToDeploy: {
      return emojiIcon('🏗️', column);
    }

    case TColumnTypes.Blocked: {
      return '';
    }

    case TColumnTypes.Done: {
      return emojiIcon('✅', column);
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

const mapIssueTypeToEmoji = (cardWithIssue: ICardWithIssue) => {
  const { issue } = cardWithIssue;
  if (!issue) {
    return emojiIcon('🃏', 'Card');;
  }

  const { labels } = issue;

  const isBug = labels.map(pluck('name')).map(toLowerCase).includes('bug');

  if (isBug) {
    return emojiIcon('🐛', 'Bug');
  }

  return '';
};

const renderAssignees = (cardWithIssue: ICardWithIssue) => {
  const { issue, card } = cardWithIssue;

  // if no issue linked - use creator of the card instead
  if (!issue) {
    return `@${card.creator.login}`;
  }

  const { assignees } = issue;
  if (!assignees.length) {
    return `🙋**free issue**`;
  }

  const users = assignees.map((user) => {
    return `@${user.login}`;
  });

  return users.join(' ');
};

const renderItemIssueStatus = (
  cardWithIssue: ICardWithIssue,
  column: TColumnTypes,
  asCheckList: boolean,
) => {
  if (!asCheckList) {
    return '';
  }

  const { issue } = cardWithIssue;

  if (!issue) {
    return !isDoneColumn(column) ? '[ ] ' : '[x] ';
  }

  return issue.state === IIssueState.Open ? '[ ] ' : '[x] ';
};

export const renderIssue = (
  cardWithIssue: ICardWithIssue,
  projectWithConfig: IProjectWithConfig,
  asCheckList = false,
) => {
  const { column, issue, card } = cardWithIssue;

  const title = (!issue)
    ? card.note
    : issue.title;

  const url = (!issue)
    ? `[#card-${card.id}](${cardLink(card, projectWithConfig)})`
    : issue.html_url;

  const assignees = renderAssignees(cardWithIssue);
  const stateEmoji = mapColumnToEmoji(column);
  const bugEmoji = mapIssueTypeToEmoji(cardWithIssue);
  const issueStatus = renderItemIssueStatus(cardWithIssue, column, asCheckList);

  return `- ${issueStatus}${stateEmoji}${bugEmoji}${title} ${url} ${assignees}`;
};
