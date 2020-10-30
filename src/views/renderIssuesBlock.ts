import { ident } from './ident';
import { renderIssue } from './renderIssue';

import { IWrappedIssue } from '../interfaces/IWrappedIssue';
import { notEmpty } from '../utils/notEmpty';
import { capitalize } from '../utils/capitalize';
import { TProjectConfig } from '../interfaces/TProjetConfig';
import { ICardWithIssue } from '../interfaces/ICardWithIssue';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';

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
  labels: string[],
  cardsWithIssue: ICardWithIssue[],
): ICardWithIssue[] => {
  const result = cardsWithIssue.filter(({ issue }) => {
    if (!issue) {
      return false;
    }

    const firstLabelFromTheList = issue.labels.find((issueLabel) => {
      return labels.includes(issueLabel.name);
    });

    const foundLabel = issue.labels.find((issueLabel) => {
      return issueLabel.name === label;
    });

    /**
     * The `labels` array has the descending priority for the defined labels,
     * hence if the found label is not the first in the list, dont use it
     */
    if (firstLabelFromTheList !== foundLabel) {
      return false;
    }

    return !!foundLabel;
  });

  return result;
};

const groupIssuesByLabels = (
  issues: ICardWithIssue[],
  projectWithConfig: IProjectWithConfig,
): TLabeledIssues => {
  const result: TLabeledIssues = {};
  const { projectConfig } = projectWithConfig;

  const labels = typeof projectConfig === 'number'
    ? []
    : projectConfig.trackLabels ?? [];

  const includedIssues = new Set<ICardWithIssue>();
  for (let label of labels) {
    const issuesForLabel = sortIssuesListByUsername(
      getIssuesForLabel(label, labels, issues),
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
  projectWithConfig: IProjectWithConfig,
  title?: string,
) => {
  const { projectConfig } = projectWithConfig;
  const issueItems = [title];

  const isCheckList =
    typeof projectConfig === 'number'
      ? undefined
      : projectConfig.isCheckListItems;

  for (let cardWithIssue of cardsWithIssues) {
    const item = renderIssue(cardWithIssue, projectWithConfig, isCheckList);
    issueItems.push(`${ident(0)}${item}`);
  }

  return issueItems.filter(notEmpty).join('\n');
};

const renderIssuesList = (
  issues: ICardWithIssue[],
  projectWithConfig: IProjectWithConfig,
) => {
  const { projectConfig } = projectWithConfig;
  const issueGroups = groupIssuesByLabels(issues, projectWithConfig);

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

      return renderIssuesSection(issues, projectWithConfig, title);
    });

  return items.filter(notEmpty).join('\n');
};

export const renderIssuesBlock = (
  title: string,
  issues: ICardWithIssue[],
  projectConfig: IProjectWithConfig,
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
