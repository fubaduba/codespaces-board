import { IRepoSourceConfig } from '../interfaces/IRepoSourceConfig';
import { OctoKitBase } from './OctoKitBase';

export class ProjectsOctoKit extends OctoKitBase {
  public getRepoProjects = async (repo: IRepoSourceConfig) => {
    const { data: projectsResponse } = await this.kit.projects.listForRepo({
      accept: 'application/vnd.github.inertia-preview+json',
      owner: repo.owner,
      repo: repo.repo,
      per_page: 100,
    });

    const result = projectsResponse.filter((project) => {
      if (!repo.projects) {
        return true;
      }

      return repo.projects.includes(project.number);
    });

    return result;
  };

  public getAllProjects = async (repos: IRepoSourceConfig[]) => {
    const result = [];

    for (let repo of repos) {
      const projects = await this.getRepoProjects(repo);
      result.push(...projects);
    }

    return result;
  };
}
