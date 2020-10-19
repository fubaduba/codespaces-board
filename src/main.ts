import * as core from '@actions/core';
import { env } from './utils/env';

// add .env file support for dev purposes
require('dotenv').config();

import { AuthorizationError } from './errors/AuthorizationError';
import { ProjectsOctoKit } from './octokit/ProjectsOctoKit';
import { renderProject } from './views/renderProject';
import { renderOverview } from './views/renderOverview';
import { getProjectData } from './utils/getProjectData';
import { getConfigs } from './config';
import { IConfig } from './interfaces/IConfig';

const TOKEN_NAME = 'REPO_GITHUB_PAT';
const CONFIG_PATH = 'CONFIG_PATH';

const processConfigRecord = async (config: IConfig, projectKit: ProjectsOctoKit) => {
  console.log(`Processing config for issue ${config.boardIssue}`);

  const repoProjects = await projectKit.getAllProjects(config.repos);

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
    if (config.headerFileUrl) {
      header = await projectKit.getBoardHeaderText(config.headerFileUrl);
    }

    let footer;
    if (config.footerFileUrl) {
      footer = await projectKit.getBoardHeaderText(config.footerFileUrl);
    }

    const projectsData = projectsWithData.map((x) => {
      return x.data;
    });

    const issueContents = [
      header,
      renderOverview(config, projectsWithData),
      issueBody,
      footer
    ].join('\n');

    const { status } = await projectKit.updateBoardIssue(
      config.boardIssue,
      issueContents,
    );

    if (status !== 200) {
      throw new Error(
        `Failed to update the issue ${config.boardIssue}`,
      );
    }

    console.log(`Successfully updated the board issue ${config.boardIssue}`);
  }
}

async function run(): Promise<void> {
  try {
    const token = env(TOKEN_NAME) ?? core.getInput('token');

    if (!token) {
      throw new AuthorizationError('No token found.');
    }

    const projectKit = new ProjectsOctoKit(token);
    const configsFilePath = env(CONFIG_PATH) ?? core.getInput('config');
    for (let config of getConfigs(configsFilePath)) {
      await processConfigRecord(config, projectKit);
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

run();
