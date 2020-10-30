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
  } = projectWithConfig;

  const blockedIssuesString = renderIssuesBlock(
    `⚠️  ${blockedIssues.length} Blocked`,
    blockedIssues,
    projectWithConfig,
    false,
  );

  const inWorkCount = `${inWorkIssues.length}/${allPlannedIssues.length}`;
  const inWorkIssuesString = renderIssuesBlock(
    `🏃  ${inWorkCount} In work (${rateToPercent(inWorkRate)})`,
    inWorkIssues,
    projectWithConfig,
  );

  const committedIssuesString = renderIssuesBlock(
    `💪 ${committedIssues.length} Committed (${rateToPercent(committedRate)})`,
    committedIssues,
    projectWithConfig,
  );

  const doneCount = `${doneOrDeployIssues.length}/${allPlannedIssues.length}`;
  const doneIssuesString = renderIssuesBlock(
    `🙌 ${doneCount} Done (${rateToPercent(doneRate)})`,
    doneOrDeployIssues,
    projectWithConfig,
  );

  const projectTitle = `## ${project.name} - ${rateToPercent(doneRate)} done`;
  const projectLink = `Link: [${project.name}](${project.html_url})`;
  const backlogIssuesCountString = `\nBacklog: [${backlogIssues.length} issues](${project.html_url})`;

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
