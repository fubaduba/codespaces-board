import { IConfig } from '../interfaces/IConfig';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { TColumnCard } from '../interfaces/TColumnCard';

const dateAddDays = (startDate: Date, days: number) => {
  const date = new Date();
  date.setDate(startDate.getDate() + days);

  return date;
}

/**
 * Check if card is a new - was created after
 * the sprint start date.
 */
export const isNewCard = (
  card: TColumnCard,
  config: IConfig,
  projectWithConfig: IProjectWithConfig,
): boolean => {
  const { sprintStartDate: sprintStartDateString } = config;

  if (!sprintStartDateString) {
    return false;
  }

  const cardCreationDate = new Date(card.created_at);
  const sprintStartDate = new Date(sprintStartDateString);

  const { projectConfig } = projectWithConfig;

  const newCardsCutoffDays =
    typeof projectConfig === 'number' || !projectConfig.newCardsCutoffDays
      ? 0
      : projectConfig.newCardsCutoffDays;

  return (
    cardCreationDate.getTime() >=
    dateAddDays(sprintStartDate, newCardsCutoffDays).getTime()
  )
}
