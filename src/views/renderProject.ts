import { rateToPercent } from '../utils/rateToPercent';
import { getProjectStats } from '../utils/getProjectStats';
import { renderIssuesBlock } from './renderIssuesBlock';

import { renderProjectOverview } from './renderProjectOverview';

import { IProjectData } from '../interfaces/IProjectData';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { IConfig } from '../interfaces/IConfig';

export const renderProject = (
  data: IProjectData,
  projectWithConfig: IProjectWithConfig,
  config: IConfig,
): string => {
  const {
    // combined
    inWorkIssues,
    doneOrDeployIssues,
    allPlannedIssues,
    // plain
    backlogIssues,
    committedIssues,
    blockedIssues,
  } = data;

  const {
    doneRate,
    inWorkRate,
    committedRate,
  } = getProjectStats(data, config);

  const {
    project,
    projectConfig,
  } = projectWithConfig;

  const blockedIssuesString = renderIssuesBlock(
    `⚠️  ${blockedIssues.length} Blocked`,
    blockedIssues,
    projectConfig,
    false,
  );

  const inWorkCount = `${inWorkIssues.length}/${allPlannedIssues.length}`;
  const inWorkIssuesString = renderIssuesBlock(
    `🏃  ${inWorkCount} In work (${rateToPercent(inWorkRate)})`,
    inWorkIssues,
    projectConfig,
  );

  const committedIssuesString = renderIssuesBlock(
    `💪 ${committedIssues.length} Committed (${rateToPercent(committedRate)})`,
    committedIssues,
    projectConfig,
  );

  const doneCount = `${doneOrDeployIssues.length}/${allPlannedIssues.length}`;
  const doneIssuesString = renderIssuesBlock(
    `🙌 ${doneCount} Done (${rateToPercent(doneRate)})`,
    doneOrDeployIssues,
    projectConfig,
  );

  const projectTitle = `## ${project.name} - ${rateToPercent(doneRate)} done`;
  const projectLink = `Link: [${project.name}](${project.html_url})`;
  const backlogIssuesCountString = `\n*Backlog: ${backlogIssues.length} issues*`;

  return [
    '',
    projectTitle,
    projectLink,
    renderProjectOverview(config, { data, project: projectWithConfig }),
    blockedIssuesString,
    committedIssuesString,
    inWorkIssuesString,
    doneIssuesString,
    backlogIssuesCountString,
  ].join('\n');
};
