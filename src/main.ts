import * as core from '@actions/core';
import { env } from './utils/env';

// add .env file support for dev purposes
require('dotenv').config();

import { AuthorizationError } from './errors/AuthorizationError';
import { ProjectsOctoKit } from './octokit/ProjectsOctoKit';
import { TEST_CONFIG } from './testConfig';
import { IWrappedIssue } from './interfaces/IWrappedIssue';
import { TRepoIssue } from './interfaces/TRepoIssue';
import { renderProject } from './views/renderProject';
import { renderDaysLeft } from './views/renderDaysLeft';
import { renderOverview } from './views/renderOverview';
import { getProjectData } from './utils/getProjectData';

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
    const repoProjects = await projectKit.getAllProjects(TEST_CONFIG.repos);

    for (let { repo, projects } of repoProjects) {
      const projectsWithData = await Promise.all(
        projects.map(async (project) => {
          const data = await getProjectData(projectKit, repo, project);
          return {
            project,
            data
          };
        }),
      );

      const result =
        projectsWithData.map(({ project, data }) => {
          return renderProject(data, project);
        });

      const issueBody = result.join('\n') + '\n';
      let header;
      if (TEST_CONFIG.headerFileUrl) {
        header = await projectKit.getBoardHeaderText(TEST_CONFIG.headerFileUrl);
      }

      let footer;
      if (TEST_CONFIG.footerFileUrl) {
        footer = await projectKit.getBoardHeaderText(TEST_CONFIG.footerFileUrl);
      }

      const projectsData = projectsWithData.map((x) => {
        return x.data;
      });

      const issueContents = [
        header,
        renderOverview(TEST_CONFIG, projectsWithData),
        issueBody,
        footer
      ].join('\n');

      const { status } = await projectKit.updateBoardIssue(
        TEST_CONFIG.boardIssue,
        issueContents,
      );

      if (status !== 200) {
        throw new Error(
          `Failed to update the issue ${TEST_CONFIG.boardIssue}`,
        );
      }

      console.log(`Successfully updated the board issue ${TEST_CONFIG.boardIssue}`);
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

run();
