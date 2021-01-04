import * as core from '@actions/core';

// add .env file support for dev purposes
require('dotenv').config();

import { AuthorizationError } from './errors/AuthorizationError';
import { ProjectsOctoKit } from './octokit/ProjectsOctoKit';
import { renderProject } from './views/renderProject';
import { getProjectData } from './utils/getProjectData';
import { env } from './utils/env';
import { getConfigs, validateConfig } from './config';
// import { renderOverview } from './views/renderOverview';

import { IConfig } from './interfaces/IConfig';

const TOKEN_READ_NAME = 'REPO_GITHUB_READ_PAT';
const TOKEN_WRITE_NAME = 'REPO_GITHUB_READ_PAT';
const CONFIG_PATH = 'CONFIG_PATH';

// const overwriteBoardIssue = async (
//   issueContents: string,
//   config: IConfig,
//   projectKit: ProjectsOctoKit,
// ) => {
//   const { status } = await projectKit.updateBoardIssue(
//     config.boardIssue,
//     issueContents,
//   );

//   if (status !== 200) {
//     throw new Error(`Failed to update the issue ${config.boardIssue}`);
//   }

//   console.log(`Successfully updated the board issue ${config.boardIssue}`);
// };

// const getRegex = (projectId?: number) => {
//   const regex = /<!--\s*codespaces-board:start\s*-->([\W\w]*)<!--\s*codespaces-board:end\s*-->/gim;
//   return regex;
// };

const wrapIssueText = (text: string, projectId?: number) => {
  return [
    `<!-- codespaces-board:start -->`,
    `<!-- ⚠️ AUTO GENERATED GITHUB ACTION, DON'T EDIT BY HAND ⚠️ -->`,
    `<!-- updated on: ${new Date().toISOString()} -->`,
    text,
    `<!-- codespaces-board:end -->`,
  ].join('\n');
};

// const updateBoardIssue = async (
//   issueContents: string,
//   config: IConfig,
//   projectKit: ProjectsOctoKit,
// ) => {
//   if (!config.isReplaceProjectMarkers) {
//     return await overwriteBoardIssue(issueContents, config, projectKit);
//   }

//   const issue = await projectKit.getBoardIssue(config.boardIssue);

//   const { body } = issue;
//   const newBody = body.replace(getRegex(), wrapIssueText(issueContents));

//   await overwriteBoardIssue(newBody, config, projectKit);
// };

// const processConfigRecord = async (
//   config: IConfig,
//   projectKit: ProjectsOctoKit,
// ) => {
//   console.log('Processing config: \n', JSON.stringify(config, null, 2));

//   const validationErrors = validateConfig(config);
//   if (validationErrors.length) {
//     console.error(
//       `\n\nNot valid config for the issue ${config.boardIssue}, skipping.. \n`,
//       validationErrors,
//       '\n\n',
//     );
//     return;
//   }

//   console.log(`- Config schema validation passed.`);

//   const repoProjects = await projectKit.getAllProjects(config.repos);

//   const projectsWithData = [];
//   for (let { repo, projects } of repoProjects) {
//     for (let project of projects) {
//         console.log(`- Getting Project data for ${project.project.name}.`);
//         projectsWithData.push({
//           project,
//           data: await getProjectData(projectKit, config, project),
//         });
//     }

//     const result = projectsWithData.map(({ project, data }) => {
//       return renderProject(data, project, config);
//     });

//     const issueBody = result.join('\n') + '\n';
//     let header;
//     if (config.headerFileUrl) {
//       header = await projectKit.getBoardHeaderText(config.headerFileUrl);
//     }

//     let footer;
//     if (config.footerFileUrl) {
//       footer = await projectKit.getBoardHeaderText(config.footerFileUrl);
//     }

//     const issueContents = [
//       header,
//       // render all projects overview
//       // renderOverview(config, projectsWithData),
//       issueBody,
//       footer,
//     ].join('\n');

//     await updateBoardIssue(issueContents, config, projectKit);
//   }
// };

const updateBoardComment = async (
  commentUrl: string,
  issueContents: string,
  projectKit: ProjectsOctoKit,
) => {
  // if (!config.isReplaceProjectMarkers) {
  //   return await overwriteBoardIssue(issueContents, config, projectKit);
  // }

  console.log(`>> updating the comment ${commentUrl} with contents length: ${issueContents.length}`);

  return await projectKit.updateBoardComment(commentUrl, issueContents);
};

const processConfigRecordComment = async (
  config: IConfig,
  readProjectKit: ProjectsOctoKit,
  writeProjectKit: ProjectsOctoKit,
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

  console.log('\n- Config schema validation passed.\n');

  const repoProjects = await readProjectKit.getAllProjects(config.repos);

  const projectsWithData = [];
  for (let { repo, projects } of repoProjects) {
    for (let project of projects) {
        console.log(`- Getting Project data for ${project.project.name}.`);
        projectsWithData.push({
          project,
          data: await getProjectData(readProjectKit, config, project),
        });
    }

    for (let { project, data } of projectsWithData) {
      const comment = renderProject(data, project, config);
      const { projectConfig } = project;
      if (typeof projectConfig === 'number') {
        continue;
      }

      const { boardComment } = projectConfig;
      if (!boardComment) {
        continue;
      }

      await updateBoardComment(boardComment, comment, writeProjectKit);
    }
  }
};

async function run(): Promise<void> {
  try {
    const token = core.getInput('token');
    const readToken = env(TOKEN_READ_NAME) ?? core.getInput('readToken') ?? token;
    const writeToken = env(TOKEN_READ_NAME) ?? core.getInput('writeToken') ?? token;

    if (!readToken) {
      throw new AuthorizationError('No read token found.');
    }

    if (!writeToken) {
      throw new AuthorizationError('No write token found.');
    }

    const readProjectKit = new ProjectsOctoKit(readToken);
    const writeProjectKit = new ProjectsOctoKit(writeToken);

    const configsFilePath = env(CONFIG_PATH) ?? core.getInput('config');
    for (let config of getConfigs(configsFilePath)) {
      await processConfigRecordComment(config, readProjectKit, writeProjectKit);
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

run();
