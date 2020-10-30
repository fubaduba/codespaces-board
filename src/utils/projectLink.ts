import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { repoUrl } from './repoUrl';

export const projectLink = (projectWithConfig: IProjectWithConfig) => {
  const { project, repo } = projectWithConfig;
  return `${repoUrl(repo)}/projects/${project.number}`;
};
