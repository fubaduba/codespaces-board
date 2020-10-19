import { OctoKitBase } from './OctoKitBase';
import { parseIssueUrl } from '../utils/parseIssueUrl';
import { parseFileUrl } from '../utils/parseFileUrl';
import { notEmpty } from '../utils/notEmpty';

import { IRepoSourceConfig } from '../interfaces/IRepoSourceConfig';
import { TColumnCard } from '../interfaces/TColumnCard';
import { TProject } from '../interfaces/TProject';
import { TProjectColumn } from '../interfaces/TProjectColumn';
import { TProjectColumns } from '../interfaces/TProjectColumns';
import { TRepoIssue } from '../interfaces/TRepoIssue';
import { TColumnTypes } from '../interfaces/TColumnTypes';
import { IWrappedIssue } from '../interfaces/IWrappedIssue';
import { IProject } from '../interfaces/IProject';
import { IProjectWithTrackedLabels } from '../interfaces/IProjectWithTrackedLabels';

type TColumnsMap = Record<TColumnTypes, TProjectColumn | undefined>;

const findColumn = (columns: TProjectColumns, columnName: TColumnTypes) => {
  const result = columns.find((column) => {
    return column.name.toLowerCase() === columnName.toLowerCase();
  });

  return result;
};

const wrapIssue = (column: TColumnTypes) => {
  return (issue: TRepoIssue) => {
    return {
      column,
      issue,
    };
  };
};

const findColumnThrows = (
  projectName: string,
  columns: TProjectColumns,
  columnName: TColumnTypes,
) => {
  const result = findColumn(columns, columnName);

  if (!result) {
    throw new Error(
      `No column "${columnName}" found in project "projectName".`,
    );
  }

  return result;
};

const getProjectId = (project: IProject | number) => {
  return typeof project === 'number' ? project : project.id;
};

export class ProjectsOctoKit extends OctoKitBase {
  public getRepoProjects = async (
    repo: IRepoSourceConfig,
  ): Promise<IProjectWithTrackedLabels[]> => {
    const { data: projectsResponse } = await this.kit.projects.listForRepo({
      accept: 'application/vnd.github.inertia-preview+json',
      owner: repo.owner,
      repo: repo.repo,
      per_page: 100,
    });

    const fetchedProjects = projectsResponse.map((project):
      | IProjectWithTrackedLabels
      | undefined => {
      const { projects } = repo;

      if (!projects) {
        return;
      }

      const proj = projects.find((p) => {
        return project.number === getProjectId(p);
      });

      if (!proj) {
        return;
      }

      const labels = (typeof proj === 'number')
        ? []
        : proj.trackLabels ?? [];

      return {
        project,
        labels,
      };
    })
    .filter(notEmpty);

    return fetchedProjects;
  };

  public getAllProjects = async (
    repos: IRepoSourceConfig[],
  ): Promise<{ repo: IRepoSourceConfig; projects: IProjectWithTrackedLabels[] }[]> => {
    const result = [];

    for (let repo of repos) {
      const projects = await this.getRepoProjects(repo);
      result.push({
        repo,
        projects,
      });
    }

    return result;
  };

  public getColumns = async (projectWithLabels: IProjectWithTrackedLabels): Promise<TColumnsMap> => {
    const { project } = projectWithLabels;

    const { data: columns } = await this.kit.projects.listColumns({
      project_id: project.id,
    });

    const map: TColumnsMap = {
      [TColumnTypes.Backlog]: findColumn(columns, TColumnTypes.Backlog),
      [TColumnTypes.Committed]: findColumn(columns, TColumnTypes.Committed),
      [TColumnTypes.Blocked]: findColumn(columns, TColumnTypes.Blocked),
      [TColumnTypes.InProgress]: findColumn(columns, TColumnTypes.InProgress),
      [TColumnTypes.InReview]: findColumn(columns, TColumnTypes.InReview),
      [TColumnTypes.WaitingToDeploy]: findColumn(
        columns,
        TColumnTypes.WaitingToDeploy,
      ),
      [TColumnTypes.Done]: findColumn(columns, TColumnTypes.Done),
    };

    return map;
  };

  public getColumnCards = async (
    column: TProjectColumn,
  ): Promise<TColumnCard[]> => {
    const { data: cards } = await this.kit.projects.listCards({
      column_id: column.id,
      per_page: 100,
      archived_state: 'not_archived',
    });

    return cards;
  };

  public getRepoIssues = async (
    repo: IRepoSourceConfig,
  ): Promise<TRepoIssue[]> => {
    const issues = await this.kit.paginate(this.kit.issues.listForRepo, {
      repo: repo.repo,
      owner: repo.owner,
      state: 'all',
    });

    return issues;
  };

  public getIssuesForColumnCards = async (
    repo: IRepoSourceConfig,
    column: TProjectColumn,
  ): Promise<TRepoIssue[]> => {
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
  };

  public filterIssuesForColumnCards = async (
    issues: TRepoIssue[],
    columns: TColumnsMap,
    columnType: TColumnTypes,
  ): Promise<IWrappedIssue[]> => {
    // get the column
    const column = columns[columnType];
    // no column - no issues
    if (!column) {
      return [];
    }

    const cards = await this.getColumnCards(column);

    const cardIssues = issues
      .filter((issue) => {
        const cardIssue = cards.find((card) => {
          return card.content_url === issue.url;
        });

        return !!cardIssue;
      })
      .map(wrapIssue(columnType));

    return cardIssues;
  };

  public updateBoardIssue = async (issueUrl: string, body: string) => {
    const { owner, repo, issueNumber } = parseIssueUrl(issueUrl);

    return await this.kit.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
  };

  public getBoardHeaderText = async (fileUrl: string): Promise<string> => {
    const fileRef = parseFileUrl(fileUrl);

    const { data } = await this.kit.repos.getContent({
      accept: 'application/vnd.github.VERSION.raw',
      ...fileRef,
    });

    const { content } = data;

    const buff = Buffer.from(content, 'base64');
    const text = buff.toString('ascii');

    return text;
  };
}
