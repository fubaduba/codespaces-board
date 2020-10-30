import { IParsedRepo } from './IParsedRepo';
import { TProject } from './TProject';
import { TProjectConfig } from './TProjetConfig';

export interface IProjectWithConfig {
  project: TProject;
  projectConfig: TProjectConfig;
  repo: IParsedRepo;
}
