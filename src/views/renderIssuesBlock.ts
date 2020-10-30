import { ident } from './ident';
import { renderIssue } from './renderIssue';

import { IWrappedIssue } from '../interfaces/IWrappedIssue';
import { notEmpty } from '../utils/notEmpty';
import { capitalize } from '../utils/capitalize';
import { TProjectConfig } from '../interfaces/TProjetConfig';
import { ICardWithIssue } from '../interfaces/ICardWithIssue';

type TLabeledIssues = Record<string, ICardWithIssue[]>;

const NONE_LABEL = 'codespaces-board-undefined-label';

const sortIssuesListByUsername = (cardsWithIssue: ICardWithIssue[]) => {
  const result = cardsWithIssue.sort((cardWithIssue1, cardWithIssue2) => {
    const { issue: issue1 } = cardWithIssue1;
    const { issue: issue2 } = cardWithIssue2;

    if (!issue1 || !issue1.assignees.length) {
      return 1;
    }

    if (!issue2 || !issue2.assignees.length) {
      return -1;
    }

    if (issue1.assignees[0].login < issue2.assignees[0].login) {
      return -1;
    }
    if (issue1.assignees[0].login > issue2.assignees[0].login) {
      return 1;
    }

    return 0;
  });

  return result;
};

const getIssuesForLabel = (
  label: string,
  cardsWithIssue: ICardWithIssue[],
): ICardWithIssue[] => {
  const result = cardsWithIssue.filter(({ issue }) => {
    if (!issue) {
      return false;
    }

    const foundLabel = issue.labels.find((issueLabel) => {
      return issueLabel.name === label;
    });

    return !!foundLabel;
  });

  return result;
};

const groupIssuesByLabels = (
  issues: ICardWithIssue[],
  projectConfig: TProjectConfig,
): TLabeledIssues => {
  const result: TLabeledIssues = {};

  const labels =
    typeof projectConfig === 'number' ? [] : projectConfig.trackLabels ?? [];

  const includedIssues = new Set<ICardWithIssue>();
  for (let label of labels) {
    const issuesForLabel = sortIssuesListByUsername(
      getIssuesForLabel(label, issues),
    );

    result[label] = issuesForLabel;

    for (let issueForLabel of issuesForLabel) {
      includedIssues.add(issueForLabel);
    }
  }

  // get all issues that have no label
  const notIncludedIssues = issues.filter((issue) => {
    return !includedIssues.has(issue);
  });

  result[NONE_LABEL] = notIncludedIssues;

  return result;
};

const renderTitle = (title: string) => {
  return `### **${title}**`;
};

const renderIssuesSection = (
  cardsWithIssues: ICardWithIssue[],
  projectConfig: TProjectConfig,
  title?: string,
) => {
  const issueItems = [title];

  const isCheckList =
    typeof projectConfig === 'number'
      ? undefined
      : projectConfig.isCheckListItems;

  for (let cardWithIssue of cardsWithIssues) {
    const { column } = cardWithIssue;
    const item = renderIssue(column, cardWithIssue, isCheckList);
    issueItems.push(`${ident(0)}${item}`);
  }

  return issueItems.filter(notEmpty).join('\n');
};

const renderIssuesList = (
  issues: ICardWithIssue[],
  projectConfig: TProjectConfig,
) => {
  const issueGroups = groupIssuesByLabels(issues, projectConfig);

  const items = Object.entries(issueGroups)
    // make the general section to be first in the lsit
    .sort(([labelName1], [labelName2]) => {
      if (labelName1 === NONE_LABEL) {
        return -1;
      }

      if (labelName2 === NONE_LABEL) {
        return 1;
      }

      return 0;
    })
    .map(([labelName, issues]) => {
      if (!issues.length) {
        return;
      }

      const title = (labelName === NONE_LABEL)
        ? undefined
        : `\n**${capitalize(labelName)}**`;

      return renderIssuesSection(issues, projectConfig, title);
    });

  return items.filter(notEmpty).join('\n');
};

export const renderIssuesBlock = (
  title: string,
  issues: ICardWithIssue[],
  projectConfig: TProjectConfig,
  /**
   * if there is no issues in the list, should we render the title?
   * For some of the blocks, for instance the `In work`, it makes
   * sense to render the title without the list since we want to
   * highlight that there is no issues that currently in the progress.
   */
  isRenderEmptyBlock = true,
) => {
  if (!isRenderEmptyBlock && !issues.length) {
    return undefined;
  }

  return [renderTitle(title), renderIssuesList(issues, projectConfig)].join(
    '\n',
  );
};
