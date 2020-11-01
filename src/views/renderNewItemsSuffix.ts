import { ICardWithIssue } from '../interfaces/ICardWithIssue';
import { emojiIcon } from '../utils/emojiIcon';

export const renderNewItemsSuffix = (
  plannedIssues: ICardWithIssue[],
  allIssues: ICardWithIssue[],
) => {
  const addedIssues = allIssues.length - plannedIssues.length;
  const addedIssuesString = (addedIssues > 0)
    ? ` **+${addedIssues} new** ${emojiIcon('💥', 'New')}`
    : '';

  return addedIssuesString;
};
