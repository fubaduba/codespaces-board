import { IRepoSourceConfig } from '../interfaces/IRepoSourceConfig';
import { TColumnCard } from '../interfaces/TColumnCard';
import { TProject } from '../interfaces/TProject';
import { TProjectColumn } from '../interfaces/TProjectColumn';
import { TProjectColumns } from '../interfaces/TProjectColumns';
import { TRepoIssue } from '../interfaces/TRepoIssue';
import { OctoKitBase } from './OctoKitBase';
import { TColumnTypes } from '../interfaces/TColumnTypes';

type TColumnsMap = Record<TColumnTypes, TProjectColumn>;

const findColumnThrows = (projectName: string, columns: TProjectColumns, columnName: TColumnTypes) => {
  const result = columns.find((column) => {
    return column.name.toLowerCase() === columnName.toLowerCase();
  });

  if (!result) {
    throw new Error(`No column "${columnName}" found in project "projectName".`);
  }

  return result;
}

export class ProjectsOctoKit extends OctoKitBase {
  public getRepoProjects = async (repo: IRepoSourceConfig) => {
    const { data: projectsResponse } = await this.kit.projects.listForRepo({
      accept: 'application/vnd.github.inertia-preview+json',
      owner: repo.owner,
      repo: repo.repo,
      per_page: 100
    })

    const result = projectsResponse.filter(project => {
      if (!repo.projects) {
        return true
      }

      return repo.projects.includes(project.number)
    })

    return result
  }

  public getAllProjects = async (
    repos: IRepoSourceConfig[]
  ): Promise<{ repo: IRepoSourceConfig, projects: TProject[] }[]> => {
    const result = []

    for (let repo of repos) {
      const projects = await this.getRepoProjects(repo)
      result.push({
        repo,
        projects
      })
    }

    return result;
  }

  public getColumns = async (project: TProject): Promise<TColumnsMap> => {
    const { data: columns } = await this.kit.projects.listColumns({
      project_id: project.id
    });

    const map: TColumnsMap = {
      [TColumnTypes.Backlog]: findColumnThrows(project.name, columns, TColumnTypes.Backlog),
      [TColumnTypes.Committed]: findColumnThrows(project.name, columns, TColumnTypes.Committed),
      [TColumnTypes.InProgress]: findColumnThrows(project.name, columns, TColumnTypes.InProgress),
      [TColumnTypes.Done]: findColumnThrows(project.name, columns, TColumnTypes.Done),
    };

    return map;
  }

  public getColumnCards = async (column: TProjectColumn): Promise<TColumnCard[]> => {
    const { data: cards } = await this.kit.projects.listCards({
      column_id: column.id,
      per_page: 100,
    });

    return cards;
  }

  public getRepoIssues = async (repo: IRepoSourceConfig): Promise<TRepoIssue[]> => {
    const issues = await this.kit.paginate(this.kit.issues.listForRepo, {
      repo: repo.repo,
      owner: repo.owner,
      state: 'all',
    });

    return issues;
  }

  public getIssuesForColumnCards = async (repo: IRepoSourceConfig, column: TProjectColumn): Promise<TRepoIssue[]> => {
    const issues = await this.kit.paginate(this.kit.issues.listForRepo, {
      repo: repo.repo,
      owner: repo.owner,
    });

    const cards = await this.getColumnCards(column);

    const cardIssues = issues.filter((issue) => {
      const cardIssue = cards.find((card) => {
        return card.content_url === issue.url;
      });

      return !!cardIssue;
    });

    return cardIssues;
  }

  public filterIssuesForColumnCards = async (issues: TRepoIssue[], column: TProjectColumn): Promise<TRepoIssue[]> => {
    const cards = await this.getColumnCards(column);

    const cardIssues = issues.filter((issue) => {
      const cardIssue = cards.find((card) => {
        return card.content_url === issue.url;
      });

      return !!cardIssue;
    });

    return cardIssues;
  }
}
