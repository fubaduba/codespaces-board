import { ICardWithIssue } from '../interfaces/ICardWithIssue';
import { IConfig } from '../interfaces/IConfig';
import { TColumnCard } from '../interfaces/TColumnCard';

/**
 * Check if card is a new - was created after
 * the sprint start date.
 */
export const isNewCard = (
  card: TColumnCard,
  config: IConfig
): boolean => {
  const { sprintStartDate: sprintStartDateString } = config;

  if (!sprintStartDateString) {
    return false;
  }

  const cardCreationDate = new Date(card.created_at);
  const sprintStartDate = new Date(sprintStartDateString);

  return cardCreationDate.getTime() >= sprintStartDate.getTime();
};
