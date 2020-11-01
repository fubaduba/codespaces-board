import { ident } from './ident';
import { renderCard } from './renderCard';

import { notEmpty } from '../utils/functional/notEmpty';
import { capitalize } from '../utils/functional/capitalize';
import { ICardWithIssue } from '../interfaces/ICardWithIssue';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { sortCardsInPlace } from '../utils/sortCards/sortCardsInPlace';
import { TArraySortResult } from '../interfaces/TArraySortResult';

type TLabeledIssues = Record<string, ICardWithIssue[]>;

const NONE_LABEL = 'codespaces-board-undefined-label';

const findLabel = (labelName: string, found = true) => {
  return ({ issue }: ICardWithIssue) => {
    if (!issue) {
      return false;
    }

    const foundLabel = issue.labels.find((issueLabel) => {
      return issueLabel.name === labelName;
    });

    return !!foundLabel === found;
  };
};

const getIssuesForLabel = (
  label: string,
  cardsWithIssue: ICardWithIssue[],
): [ICardWithIssue[], ICardWithIssue[]] => {
  const originalCards = [...cardsWithIssue];
  const result = originalCards.filter(findLabel(label));
  const rest = originalCards.filter(findLabel(label, false));

  return [result, rest];
};

const groupIssuesByLabels = (
  cardsWithIssues: ICardWithIssue[],
  projectWithConfig: IProjectWithConfig,
): TLabeledIssues => {
  const result: TLabeledIssues = {};
  const { projectConfig } = projectWithConfig;

  const labels =
    typeof projectConfig === 'number' ? [] : projectConfig.trackLabels ?? [];

  const includedIssues = new Set<ICardWithIssue>();
  for (let label of labels) {
    const [cardsForLabel, restCards] = getIssuesForLabel(
      label,
      cardsWithIssues,
    );
    /**
     * !! We return the `restCards` above - the list of cards that does not hold
     * the label, and reassign the "rest" list to the original one, so we don't
     * match the same card against other labels. This enforces descending priority
     * of the `trackLabels` labels list defined in the project config.
     * e.g. with the ["port-forwarding", "workbench", "performance", "serverless"]
     * list in the config, the issues with both "port-forwarding" and "performance"
     * labels, will show up only in the` Port-forwarding` section since it has the
     * higher precedence over the "performance" label.
     */
    cardsWithIssues = restCards;

    const sortedIssuesForLabel = sortCardsInPlace(cardsForLabel, projectWithConfig);
    result[label] = sortedIssuesForLabel;

    for (let issueForLabel of sortedIssuesForLabel) {
      includedIssues.add(issueForLabel);
    }
  }

  // get all issues that have no label
  const notIncludedIssues = cardsWithIssues.filter((issue) => {
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
    const item = renderCard(cardWithIssue, projectWithConfig, isCheckList);
    issueItems.push(`${ident(0)}${item}`);
  }

  return issueItems.filter(notEmpty).join('\n');
};

const renderIssuesList = (
  issues: ICardWithIssue[],
  projectWithConfig: IProjectWithConfig,
) => {
  const issueGroups = groupIssuesByLabels(issues, projectWithConfig);

  console.log(``)

  const items = Object.entries(issueGroups)
    // make the general section to be first in the list
    .sort(([labelName1], [labelName2]) => {
      if (labelName1 === labelName2) {
        return TArraySortResult.Equal;
      }

      if (labelName1 === NONE_LABEL) {
        return TArraySortResult.FirstEarlier;
      }

      if (labelName2 === NONE_LABEL) {
        return TArraySortResult.SecondEarlier;
      }

      return TArraySortResult.Equal;
    })
    .map(([labelName, issues]) => {
      if (!issues.length) {
        return;
      }

      const title =
        labelName === NONE_LABEL ? undefined : `\n**${capitalize(labelName)}**`;

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
