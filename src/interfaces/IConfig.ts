import { IRepoSourceConfig } from './IRepoSourceConfig';

export interface IConfig {
  // issue that is used as board
  boardIssue: string;
  // yyyy/mm/dd => 2020/10/15
  sprintStartDate?: string;
  // number in days with weekends, e.g. 3 weeks => 21
  sprintDuration?: number;
  // number of holidays, default: 0
  sprintNumberHolidays?: number;
  // file that will be added as the issue header
  headerFileUrl?: string;
  // file that will be added as the issue footer
  footerFileUrl?: string;
  // list of the repos to track
  repos: IRepoSourceConfig[];
}
