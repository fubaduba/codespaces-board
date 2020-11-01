import { ICardWithIssue } from '../../interfaces/ICardWithIssue';
import { IProjectWithConfig } from '../../interfaces/IProjectWithConfig';

/**
 * Find out card priority by the `priorityLabels` setting,
 * larger the number, more priority the card has.
 */
export const getCardPriority = (
  cardWithIssue: ICardWithIssue,
  { projectConfig }: IProjectWithConfig,
  // if actual priority not set, use this value (0 is the least priority)
  notDefinedValue: number | null = 0,
) => {
  const { issue } = cardWithIssue;

  if (!issue || typeof projectConfig === 'number') {
    return notDefinedValue;
  }

  const { priorityLabels } = projectConfig;
  if (!priorityLabels) {
    return notDefinedValue;
  }

  const cardPrioritylabel = priorityLabels.find((priorityLabel: string) => {
    const foundLabel = issue.labels.find((issueLabel) => {
      return issueLabel.name === priorityLabel;
    });

    return !!foundLabel;
  });

  if (!cardPrioritylabel) {
    return notDefinedValue;
  }

  return Number.MAX_SAFE_INTEGER - priorityLabels.indexOf(cardPrioritylabel);
};
