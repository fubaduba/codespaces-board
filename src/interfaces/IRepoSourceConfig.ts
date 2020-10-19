import { IProject } from './IProject';

export interface IRepoSourceConfig {
  /**
   * Repo owner username.
   */
  owner: string;

  /**
   * Repo name.
   */
  repo: string;

  /**
   * Project to track, if not set assuming all projects on the repo.
   */
  projects?: (IProject | number)[];
}
