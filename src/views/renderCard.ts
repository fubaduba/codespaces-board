import { ICardWithIssue } from '../interfaces/ICardWithIssue';
import { IIssueState } from '../interfaces/IIssueState';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { TColumnTypes } from '../interfaces/TColumnTypes';
import { cardLink } from '../utils/cardLink';
import { TRepoIssue } from '../interfaces/TRepoIssue';
import { notEmpty } from '../utils/functional/notEmpty';
import { isBugCard } from '../utils/isBugCard';
import { isDoneColumn } from '../utils/isDoneColumn';
import { emojiIcon } from '../utils/emojiIcon';
import { IConfig } from '../interfaces/IConfig';

const mapColumnToEmoji = (
  column: TColumnTypes,
  { projectConfig }: IProjectWithConfig,
) => {
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
      // if list items not rendered as list items,
      // show the check emoji
      if (
        typeof projectConfig === 'number' ||
        !projectConfig.isCheckListItems
      ) {
        return emojiIcon('✅', column);
      }

      return '';
    }

    default:
    case TColumnTypes.Backlog: {
      throw new Error("Don't render the Backlog items.");
    }
  }
};

const mapIssueTypeToEmoji = (cardWithIssue: ICardWithIssue) => {
  const { issue } = cardWithIssue;
  if (!issue) {
    return emojiIcon('🃏', 'Card');;
  }


  if (isBugCard(cardWithIssue)) {
    return emojiIcon('🐛', 'Bug');
  }

  return '';
};

const newToEmpoji = (
  { isNew }: ICardWithIssue,
) => {
  if (isNew) {
    return emojiIcon('🆕', 'New');
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

type TIssueLabel = TRepoIssue['labels'][0];

const renderLabelImage = (label: TIssueLabel): string => {
  const { name, color } = label;
  const cleanColor = color.replace('#', '');
  const encodedName = encodeURIComponent(name);

  return `<img src="https://img.shields.io/badge/-${encodedName}-${cleanColor}" height="15" alt="label: ${name}" />`;
};

const renderIssueLabel = (label: TIssueLabel): string => {
  const { url, description } = label;

  const uri = new URL(url);
  uri.hostname = uri.hostname.replace('api.', '');
  uri.pathname = uri.pathname.replace(/^\/repos/, '');

  return `<a href="${uri}" title="${description}">${renderLabelImage(label)}</a>`;
};

const renderPriorityLabels = (
  cardWithIssue: ICardWithIssue,
  projectWithConfig: IProjectWithConfig,
): string => {
  const { projectConfig } = projectWithConfig;
  if (typeof projectConfig === 'number') {
    return '';
  }

  const { priorityLabels } = projectConfig;
  if (!priorityLabels) {
    return '';
  }

  const { issue } = cardWithIssue;
  if (!issue) {
    return '';
  }

  const cardLabels = priorityLabels
    .map((label) => {
      const issueLabel = issue.labels.find((issueLabel) => {
        return issueLabel.name === label;
      });

      return issueLabel;
    })
    .filter(notEmpty)
    .map(renderIssueLabel);

  const result = cardLabels.join('');

  return (result)
    ? `${result} `
    : '';
};

export const renderCard = (
  cardWithIssue: ICardWithIssue,
  projectWithConfig: IProjectWithConfig,
  asCheckList = false,
) => {
  const { column, issue, card } = cardWithIssue;

  const title = (!issue)
    ? card.note
    : issue.title;

  /**
   * If no associated issue found, item `url` it the URL to the
   * card itself, otherwise `url` is the link to the issue.
   */
  const url = (!issue)
    ? `[#card-${card.id}](${cardLink(card, projectWithConfig)})`
    : issue.html_url;

  const assignees = renderAssignees(cardWithIssue);
  const labels = renderPriorityLabels(cardWithIssue, projectWithConfig);
  const stateEmoji = mapColumnToEmoji(column, projectWithConfig);
  const typeEmoji = mapIssueTypeToEmoji(cardWithIssue);
  const newEmoji = newToEmpoji(cardWithIssue);
  const issueStatus = renderItemIssueStatus(cardWithIssue, column, asCheckList);

  return `- ${issueStatus}${labels}${newEmoji}${stateEmoji}${typeEmoji}${title} ${url} ${assignees}`;
};
