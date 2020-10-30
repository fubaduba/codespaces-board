import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { TColumnCard } from '../interfaces/TColumnCard';
import { projectLink } from './projectLink';

export const cardLink = (card: TColumnCard, projectWithConfig: IProjectWithConfig) => {
  return `${projectLink(projectWithConfig)}#card-${card.id}`;
};
