import { IRepoSourceConfig } from './IRepoSourceConfig';

export interface IConfig {
  /**
   * The issue that is used as aggregated board.
   */
  boardIssue?: string;

  /**
   * List of the repositories/projects to track.
   */
  repos: IRepoSourceConfig[];

  /**
   * The sprint start date in the `yyyy/mm/dd` format.
   * Example: "2020/10/15"
   */
  sprintStartDate?: string;

  /**
   * Sprint duration in days including weekends.
   * Must be specified if the `sprintStartDate` set.
   * Example: "21" (3 weeks)
   *
   * @minimum 7
   * @TJS-type integer
   */
  sprintDuration?: number;

  /**
   * Number of holidays during the sprint.
   * Example: "2"
   *
   * @minimum 0
   * @TJS-type integer
   */
  sprintNumberHolidays?: number;

  /**
   * File that will be added as the issue header.
   * Example: "https://raw.githubusercontent.com/legomushroom/codespaces-board/main/sprints/sprint%2012/header.md"
   */
  headerFileUrl?: string;

  /**
   * File that will be added as the issue footer.
   * Example: "https://raw.githubusercontent.com/legomushroom/codespaces-board/main/sprints/sprint%2012/footer.md"
   */
  footerFileUrl?: string;

  /**
   * If replace the <!-- codespaces-board:project_{id}:start -->
   * markers instead of replacing entire issue body.
   *
   * default: false.
   */
  isReplaceProjectMarkers?: boolean;

  /**
   * Used by `vscode` in JSON files.
   */
  ['$schema']?: string,
}
