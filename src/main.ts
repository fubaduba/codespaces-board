import * as core from '@actions/core';
import { env } from './utils/env';

// add .env file support for dev purposes
require('dotenv').config();

import { AuthorizationError } from './errors/AuthorizationError';
import { ProjectsOctoKit } from './octokit/ProjectsOctoKit';
import { TEST_CONFIG } from './testConfig';
import { TColumnTypes } from './interfaces/TColumnTypes';
import { IWrappedIssue } from './interfaces/IWrappedIssue';
import { renderIssuesBlock } from './views/renderIssuesBlock';
import { TRepoIssue } from './interfaces/TRepoIssue';
import { TProject } from './interfaces/TProject';
import { IRepoSourceConfig } from './interfaces/IRepoSourceConfig';

export const OWNER = 'legomushroom';
export const REPO = 'codespaces-board';
const TOKEN_NAME = 'REPO_GITHUB_PAT';

const renderProject = async (
  projectKit: ProjectsOctoKit,
  repo: IRepoSourceConfig,
  project: TProject,
): Promise<string> => {
  const columns = await projectKit.getColumns(project);
  const issues = await projectKit.getRepoIssues(repo);

  const backlogIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.Backlog,
  );

  const committedIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.Committed,
  );

  const blockedIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.Blocked,
  );

  const progressIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.InProgress,
  );

  const inReviewIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.InReview,
  );

  const waitingToDeployIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.WaitingToDeploy,
  );

  const doneIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.Done,
  );

  const inWorkIssues = [...progressIssues, ...inReviewIssues];
  const doneOrDeployIssues = [...waitingToDeployIssues, ...doneIssues];
  const allPlannedIssues = [...blockedIssues, ...committedIssues, ...inWorkIssues, ...doneOrDeployIssues];

  const doneRate = doneOrDeployIssues.length / allPlannedIssues.length;
  const inWorkRate = inWorkIssues.length / allPlannedIssues.length;
  const committedRate = committedIssues.length / allPlannedIssues.length;

  const donePercent = Math.round(100 * doneRate);
  const inWorkPercent = Math.round(100 * inWorkRate);
  const committedPercent = Math.round(100 * committedRate);

  const blockedIssuesString = renderIssuesBlock(
    `⚠️  ${blockedIssues.length} Blocked`,
    blockedIssues,
    false,
  );

  const inWorkCount = `${inWorkIssues.length}/${allPlannedIssues.length}`;
  const inWorkIssuesString = renderIssuesBlock(
    `🏃  ${inWorkCount} In work (${inWorkPercent}%)`,
    inWorkIssues,
  );

  const committedIssuesString = renderIssuesBlock(
    `💪 ${committedIssues.length} Committed (${committedPercent}%)`,
    committedIssues,
  );

  const doneCount = `${doneOrDeployIssues.length}/${allPlannedIssues.length}`;
  const doneIssuesString = renderIssuesBlock(
    `✅ ${doneCount} Done (${donePercent}%)`,
    doneOrDeployIssues,
  );

  const projectTitle = `## ${project.name} - ${donePercent}% done`;
  const projectLink = `Link: [${project.name}](${project.html_url})`;
  const backlogIssuesCountString = `\n*Backlog: ${backlogIssues.length} issues*`

  return [
    '',
    projectTitle,
    projectLink,
    blockedIssuesString,
    committedIssuesString,
    inWorkIssuesString,
    doneIssuesString,
    backlogIssuesCountString,
  ].join('\n');
};

async function run(): Promise<void> {
  try {
    const token = env(TOKEN_NAME) ?? core.getInput('token');

    if (!token) {
      throw new AuthorizationError('No token found.');
    }

    const projectKit = new ProjectsOctoKit(token);
    const repoProjects = await projectKit.getAllProjects(TEST_CONFIG.repos);

    for (let { repo, projects } of repoProjects) {
      const result = await Promise.all(
        projects.map((project) => {
          return renderProject(projectKit, repo, project);
        }),
      );

      const issueBody = result.join('\n') + '\n';

      let header;
      if (TEST_CONFIG.headerFileUrl) {
        header = await projectKit.getBoardHeaderText(TEST_CONFIG.headerFileUrl);
      }

      let footer;
      if (TEST_CONFIG.footerFileUrl) {
        footer = await projectKit.getBoardHeaderText(TEST_CONFIG.footerFileUrl);
      }

      const issueContents = [header, issueBody, footer].join('\n');

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
