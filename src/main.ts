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

export const OWNER = 'legomushroom';
export const REPO = 'codespaces-board';
const TOKEN_NAME = 'REPO_GITHUB_PAT';

async function run(): Promise<void> {
  try {
    const token = env(TOKEN_NAME) ?? core.getInput('token');

    if (!token) {
      throw new AuthorizationError('No token found.');
    }

    const projectKit = new ProjectsOctoKit(token);
    const projects = await projectKit.getAllProjects(TEST_CONFIG.repos);
    const columns = await projectKit.getColumns(projects[0]);
    const issues = await projectKit.getRepoIssues(TEST_CONFIG.repos[0]);
    const columnIssues = await projectKit.filterIssuesForColumnCards(issues, columns[TColumnTypes.Committed]);

    const wrappedIssues: IWrappedIssue[] = columnIssues.map((issue) => {
      return {
        column: TColumnTypes.InProgress,
        issue,
      };
    });

    console.log(renderIssuesBlock(projects[0].name, wrappedIssues));
  } catch (error) {
    console.error(error);
    core.setFailed(error.message)
  }
}

run();
