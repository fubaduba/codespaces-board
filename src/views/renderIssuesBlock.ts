import { ident } from './ident';
import { renderIssue } from './renderIssue';

import { IWrappedIssue } from '../interfaces/IWrappedIssue';
import { notEmpty } from '../utils/notEmpty';
import { capitalize } from '../utils/capitalize';
import { TProjectConfig } from '../interfaces/TProjetConfig';

type TLabeledIssues = Record<string, IWrappedIssue[]>;

const getIssuesForLabel = (label: string, wrappedIssues: IWrappedIssue[]) => {
  const result = wrappedIssues.filter(({ issue }) => {
    const foundLabel = issue.labels.find((issueLabel) => {
      return issueLabel.name === label;
    });

    return !!foundLabel;
  });

  return result;
};

const NONE_LABEL = 'codespaces-board-undefined-label';

const groupIssuesByLabels = (
  issues: IWrappedIssue[],
  projectConfig: TProjectConfig,
): TLabeledIssues => {
  const result: TLabeledIssues = {};

  const labels = (typeof projectConfig === 'number')
    ? []
    : projectConfig.trackLabels ?? [];

  const includedIssues = new Set<IWrappedIssue>();
  for (let label of labels) {
    const issuesForLabel = getIssuesForLabel(label, issues);
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
  issues: IWrappedIssue[],
  projectConfig: TProjectConfig,
  title?: string,
) => {
  const issueItems = [title];

  const isCheckList = (typeof projectConfig === 'number')
    ? undefined
    : projectConfig.isCheckListItems;

  for (let wrappedIssue of issues) {
    const { column, issue } = wrappedIssue;
    const item = renderIssue(column, issue, isCheckList);
    issueItems.push(`${ident(1)}${item}`);
  }

  return issueItems.filter(notEmpty).join('\n');
};

const renderIssuesList = (
  issues: IWrappedIssue[],
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

      const title =
        labelName === NONE_LABEL ? undefined : `- **${capitalize(labelName)}**`;

      return renderIssuesSection(issues, projectConfig, title);
    });

  return items.filter(notEmpty).join('\n');
};

export const renderIssuesBlock = (
  title: string,
  issues: IWrappedIssue[],
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

  return [
    renderTitle(title),
    renderIssuesList(issues, projectConfig),
  ].join('\n');
};
