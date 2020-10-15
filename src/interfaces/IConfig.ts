import { IRepoSourceConfig } from './IRepoSourceConfig';

export interface IConfig {
  boardIssue: string;
  headerFileUrl?: string;
  footerFileUrl?: string;
  repos: IRepoSourceConfig[];
}
