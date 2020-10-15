import * as core from '@actions/core'
import { env } from './utils/env';

// add .env file support
require('dotenv').config();

import { AuthorizationError } from './errors/AuthorizationError';
import { ProjectsOctoKit } from './octokit/ProjectsOctoKit';
import { TEST_CONFIG } from './testConfig';
import { TColumnTypes } from './interfaces/TColumnTypes';
import { IWrappedIssue } from './interfaces/IWrappedIssue';
import { renderIssuesBlock } from './views/renderIssuesBlock';
import { TRepoIssue } from './interfaces/TRepoIssue';
import { TProject } from './interfaces/TProject';

export const OWNER = 'legomushroom';
export const REPO = 'codespaces-board';
const TOKEN_NAME = 'REPO_GITHUB_PAT';

const renderProject = async (projectKit: ProjectsOctoKit, project: TProject): Promise<string> => {
  const columns = await projectKit.getColumns(project);
  const issues = await projectKit.getRepoIssues(TEST_CONFIG.repos[0]);
  const progressIssues = await projectKit.filterIssuesForColumnCards(issues, columns[TColumnTypes.InProgress]);
  const doneIssues = await projectKit.filterIssuesForColumnCards(issues, columns[TColumnTypes.Done]);
  const backlogIssues = await projectKit.filterIssuesForColumnCards(issues, columns[TColumnTypes.Committed]);

  const wrappedProgressIssues: IWrappedIssue[] = progressIssues.map(wrapIssue(TColumnTypes.InProgress));
  const wrappedDoneIssues: IWrappedIssue[] = doneIssues.map(wrapIssue(TColumnTypes.Done));
  const wrappedIssues = [...wrappedProgressIssues, ...wrappedDoneIssues];

  const projectTitle = `### ${project.name}`;
  const inWorkIssuesString = renderIssuesBlock(`🏗️  In work (${doneIssues.length}/${progressIssues.length + doneIssues.length})`, wrappedIssues);

  const wrappedBacklogIssues: IWrappedIssue[] = backlogIssues.map(wrapIssue(TColumnTypes.Committed));

  const backlogIssuesString = renderIssuesBlock(`📅  Backlog (${wrappedBacklogIssues.length})`, wrappedBacklogIssues);

  return [
    '',
    projectTitle,
    inWorkIssuesString,
    backlogIssuesString,
  ].join('\n');
}

const wrapIssue = (column: TColumnTypes) => {
  return (issue: TRepoIssue) => {
    return {
      column,
      issue,
    };
  };
}

async function run(): Promise<void> {
  try {
    const token = env(TOKEN_NAME) ?? core.getInput('token');

    if (!token) {
      throw new AuthorizationError('No token found.');
    }

    const projectKit = new ProjectsOctoKit(token);
    const projects = await projectKit.getAllProjects(TEST_CONFIG.repos);

    const result = await Promise.all(projects.map((project) => {
      return renderProject(projectKit, project);
    }));

    console.log(result.join('\n') + '\n');

  } catch (error) {
    console.error(error);
    core.setFailed(error.message)
  }
}

run();
