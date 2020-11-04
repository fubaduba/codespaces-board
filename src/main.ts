import * as core from '@actions/core';

// add .env file support for dev purposes
require('dotenv').config();

import { AuthorizationError } from './errors/AuthorizationError';
import { ProjectsOctoKit } from './octokit/ProjectsOctoKit';
import { renderProject } from './views/renderProject';
import { getProjectData } from './utils/getProjectData';
import { env } from './utils/env';
import { getConfigs, validateConfig } from './config';

import { IConfig } from './interfaces/IConfig';

const TOKEN_NAME = 'REPO_GITHUB_PAT';
const CONFIG_PATH = 'CONFIG_PATH';

const overwriteBoardIssue = async (
  issueContents: string,
  config: IConfig,
  projectKit: ProjectsOctoKit,
) => {
  const { status } = await projectKit.updateBoardIssue(
    config.boardIssue,
    issueContents,
  );

  if (status !== 200) {
    throw new Error(`Failed to update the issue ${config.boardIssue}`);
  }

  console.log(`Successfully updated the board issue ${config.boardIssue}`);
};

const getRegex = (projectId?: number) => {
  const regex = /<!--\s*codespaces-board:start\s*-->([\W\w]*)<!--\s*codespaces-board:end\s*-->/gim;
  return regex;
};

const wrapIssueText = (text: string, projectId?: number) => {
  return [
    `<!-- codespaces-board:start -->`,
    `<!-- ⚠️ AUTO GENERATED GITHUB ACTION, DON'T EDIT BY HAND ⚠️ -->`,
    `<!-- updated on: ${new Date().toISOString()} -->`,
    text,
    `<!-- codespaces-board:end -->`,
  ].join('\n');
};

const updateBoardIssue = async (
  issueContents: string,
  config: IConfig,
  projectKit: ProjectsOctoKit,
) => {
  if (!config.isReplaceProjectMarkers) {
    return await overwriteBoardIssue(issueContents, config, projectKit);
  }

  const issue = await projectKit.getBoardIssue(config.boardIssue);

  const { body } = issue;
  const newBody = body.replace(getRegex(), wrapIssueText(issueContents));

  await overwriteBoardIssue(newBody, config, projectKit);
};

const processConfigRecord = async (
  config: IConfig,
  projectKit: ProjectsOctoKit,
) => {
  console.log('Processing config: \n', JSON.stringify(config, null, 2));

  const validationErrors = validateConfig(config);
  if (validationErrors.length) {
    console.error(
      `\n\nNot valid config for the issue ${config.boardIssue}, skipping.. \n`,
      validationErrors,
      '\n\n',
    );
    return;
  }

  console.log(`Config schema validation passed.`);

  const repoProjects = await projectKit.getAllProjects(config.repos);

  for (let { repo, projects } of repoProjects) {
    const projectsWithData = await Promise.all(
      projects.map(async (project) => {
        const data = await getProjectData(projectKit, config, project);
        return {
          project,
          data,
        };
      }),
    );

    const result = projectsWithData.map(({ project, data }) => {
      return renderProject(data, project, config);
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

    const issueContents = [
      header,
      // render projects overview
      // renderOverview(config, projectsWithData),
      issueBody,
      footer,
    ].join('\n');

    await updateBoardIssue(issueContents, config, projectKit);
  }
};

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
