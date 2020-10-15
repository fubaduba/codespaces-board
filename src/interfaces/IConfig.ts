import { IRepoSourceConfig } from './IRepoSourceConfig';

export interface IConfig {
  boardIssue: string;
  repos: IRepoSourceConfig[];
}
