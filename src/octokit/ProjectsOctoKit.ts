import { OctoKitBase } from './OctoKitBase';
import {
  parseCommentUrl,
  parseIssueApiUrl,
  parseIssueUrl,
} from '../utils/parseIssueUrl';
import { parseFileUrl } from '../utils/parseFileUrl';
import { notEmpty } from '../utils/functional/notEmpty';

import { IRepoSourceConfig } from '../interfaces/IRepoSourceConfig';
import { TColumnCard } from '../interfaces/TColumnCard';
import { TRepoIssue } from '../interfaces/TRepoIssue';
import { TColumnTypes } from '../interfaces/TColumnTypes';
import { IWrappedIssue } from '../interfaces/IWrappedIssue';
import { IProject } from '../interfaces/IProject';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { IParsedIssue } from '../interfaces/IParsedIssue';
import { TProjectColumn } from '../interfaces/TProjectColumn';
import { flattenArray } from '../utils/flatternArray';
import { IParsedRepo } from '../interfaces/IParsedRepo';
import { ICardWithIssue } from '../interfaces/ICardWithIssue';
import { IConfig } from '../interfaces/IConfig';
import { isNewCard } from '../utils/isNewCard';
import { measure } from '../utils/measure';

interface IColumnWithCards {
  column: TProjectColumn;
  cards: TColumnCard[];
}

type TColumnsMap = Record<TColumnTypes, TProjectColumn | undefined>;
type TColumnsWithCardsMap = Record<TColumnTypes, IColumnWithCards | undefined>

const findColumn = (
  columns: TProjectColumn[],
  columnName: TColumnTypes,
): TProjectColumn | undefined => {
  const result = columns.find((column) => {
    return column.name.toLowerCase() === columnName.toLowerCase();
  })

  return result;
}

const getProjectId = (project: IProject | number) => {
  return typeof project === 'number' ? project : project.id;
}

export class ProjectsOctoKit extends OctoKitBase {
  getRepoProjects = async (
    repo: IRepoSourceConfig,
  ): Promise<IProjectWithConfig[]> => {
    const { data: projectsResponse } = await this.kit.projects.listForRepo({
      accept: 'application/vnd.github.inertia-preview+json',
      owner: repo.owner,
      repo: repo.repo,
      per_page: 100,
    });

    const fetchedProjects = projectsResponse
      .map((project): IProjectWithConfig | undefined => {
        const { projects } = repo;

        if (!projects) {
          return;
        }

        const proj = projects.find((p) => {
          return project.number === getProjectId(p);
        })

        if (!proj) {
          return;
        }

        return {
          project,
          projectConfig: proj,
          repo,
        };
      })
      .filter(notEmpty);

    return fetchedProjects;
  }

  getAllProjects = async (
    repos: IRepoSourceConfig[],
  ): Promise<{ repo: IRepoSourceConfig; projects: IProjectWithConfig[] }[]> => {
    const result = [];

    for (const repo of repos) {
      const projects = await this.getRepoProjects(repo);
      result.push({
        repo,
        projects,
      });
    }

    return result;
  }

  getColumns = async (
    projectWithLabels: IProjectWithConfig,
  ): Promise<TColumnsMap> => {
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
  }

  getColumnCards = async (column: TProjectColumn): Promise<TColumnCard[]> => {
    const cards = await this.kit.paginate(this.kit.projects.listCards, {
      column_id: column.id,
      archived_state: 'not_archived',
    });

    return cards;
  }

  getCards = async (columns: TColumnsMap): Promise<TColumnsWithCardsMap> => {
    const cardPromises = Object.entries(columns)
      .map(async ([type, column]) => {
        if (!column) {
          return;
        }

        return {
          type,
          column,
          cards: await this.getColumnCards(column),
        }
      })
      .filter(notEmpty);

    const columnCardsWithEmpty = await Promise.all(cardPromises);
    const columnCards = columnCardsWithEmpty.filter(notEmpty);

    const result: any = {};
    for (const columnCard of columnCards) {
      const { type } = columnCard;

      result[type] = {
        cards: columnCard.cards,
        column: columnCard.column,
      };
    }

    return result as TColumnsWithCardsMap;
  }

  getRepoIssues = async (repo: IRepoSourceConfig): Promise<TRepoIssue[]> => {
    const issues = await this.kit.paginate(this.kit.issues.listForRepo, {
      repo: repo.repo,
      owner: repo.owner,
      state: 'all',
    });

    return issues;
  }

  private reposCache: Record<string, TRepoIssue[] | undefined> = {};

  getReposIssues = async (repos: IParsedRepo[]): Promise<TRepoIssue[]> => {
    const resultPromises: Promise<TRepoIssue[]>[] = repos.map(async (repo) => {
      const repoKey = `${repo.owner}/${repo.repo}`;

      return await measure(`Getting new isues for "${repoKey}"`, async () => {
        const cachedIssues = this.reposCache[repoKey];
        if (cachedIssues) {
          return cachedIssues;
        }

        const result = await this.getRepoIssues(repo);
        this.reposCache[repoKey] = result;

        return result;
      })
    });

    return flattenArray(await Promise.all(resultPromises));
  }

  private isCardIssue = (card: TColumnCard, issue: TRepoIssue): boolean => {
    return card.content_url === issue.url || card.note === issue.html_url
  }

  private getCardIssueFromNote = (card: TColumnCard): IParsedIssue | null => {
    try {
      const issue = parseIssueUrl(card.note);
      return issue;
    } catch {
      return null;
    }
  };

  private getCardIssueFromContentUrl = (
    card: TColumnCard,
  ): IParsedIssue | null => {
    try {
      const issue = parseIssueApiUrl(card.content_url);
      return issue;
    } catch {
      return null;
    }
  };

  private getAllCards = (columns: TColumnsWithCardsMap): TColumnCard[] => {
    const cards = Object.entries(columns).map(([type, columnWithCards]) => {
      if (!columnWithCards) {
        return [];
      }
      const { cards } = columnWithCards;
      return cards ?? [];
    })

    return flattenArray(cards);
  }

  getCardRepos = (columns: TColumnsWithCardsMap): IParsedRepo[] => {
    const cards = this.getAllCards(columns);

    const repos: Record<string, IParsedRepo> = {};

    for (const card of cards) {
      const issueFromNote = this.getCardIssueFromNote(card);
      const issueFromContent = this.getCardIssueFromContentUrl(card);
      const issue = issueFromNote ?? issueFromContent;

      if (issue && issue.owner && issue.repo) {
        repos[`/${issue.owner}/${issue.repo}`] = {
          owner: issue.owner,
          repo: issue.repo,
        };
      }
    }

    return Object.values(repos);
  }

  mergeCardsWithIssuesForColumn = (
    issues: TRepoIssue[],
    columns: TColumnsWithCardsMap,
    columnType: TColumnTypes,
    config: IConfig,
    project: IProjectWithConfig,
  ): ICardWithIssue[] => {
    // get the column
    const column = columns[columnType];
    // no column - no issue
    if (!column) {
      return [];
    }

    const { cards } = column;
    const cardIssues: ICardWithIssue[] = cards.map((card) => {
      const cardIssue = issues.find((issue) => {
        return this.isCardIssue(card, issue);
      })

      return {
        card,
        issue: cardIssue,
        column: columnType,
        isNew: isNewCard(card, config, project),
      }
    });

    return cardIssues;
  }

  updateBoardIssue = async (issueUrl: string, body: string) => {
    const issue = parseIssueUrl(issueUrl);

    if (!issue) {
      throw new Error(`cannot parse the issue ${issueUrl}`);
    }

    const { owner, repo, issueNumber } = issue;
    return await this.kit.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
  }

  getBoardIssue = async (issueUrl: string) => {
    const issue = parseIssueUrl(issueUrl);

    if (!issue) {
      throw new Error(`cannot parse the issue ${issueUrl}`);
    }

    const { owner, repo, issueNumber } = issue;

    const { status, data } = await this.kit.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    if (status !== 200) {
      throw new Error(`Failed to get the issue ${issueUrl}`);
    }

    return data;
  }

  updateBoardComment = async (commentUrl: string, body: string) => {
    const comment = parseCommentUrl(commentUrl);
    if (!comment) {
      throw new Error(`cannot parse the comment ${commentUrl}`);
    }

    const { owner, repo, issueNumber, commentId } = comment;
    const { status } = await this.kit.issues.updateComment({
      owner,
      repo,
      issue_number: issueNumber,
      comment_id: commentId,
      body,
    });

    if (status !== 200) {
      throw new Error(`Failed to update the comment ${commentUrl}`);
    }
  };

  getBoardHeaderText = async (fileUrl: string): Promise<string> => {
    const fileRef = parseFileUrl(fileUrl);

    const { data } = await this.kit.repos.getContent({
      accept: 'application/vnd.github.VERSION.raw',
      ...fileRef,
    });

    const { content } = data;

    const buff = Buffer.from(content, 'base64');
    const text = buff.toString('ascii');

    return text;
  }
}
