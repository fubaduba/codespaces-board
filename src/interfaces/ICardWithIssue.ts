import { TColumnCard } from './TColumnCard';
import { TColumnTypes } from './TColumnTypes';
import { TRepoIssue } from './TRepoIssue';

export interface ICardWithIssue {
  column: TColumnTypes;
  issue?: TRepoIssue;
  card: TColumnCard;
  isNew: boolean;
}
