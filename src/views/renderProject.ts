import { rateToPercent } from '../utils/rateToPercent';
import { getProjectStats } from '../utils/getProjectStats';

import { renderIssuesBlock } from './renderIssuesBlock';
import { IProjectData } from '../interfaces/IProjectData';
import { IProjectWithTrackedLabels } from '../interfaces/IProjectWithTrackedLabels';

export const renderProject = (
  data: IProjectData,
  projectWithLabels: IProjectWithTrackedLabels,
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
  } = getProjectStats(data);

  const {
    project,
    labels,
  } = projectWithLabels;

  const blockedIssuesString = renderIssuesBlock(
    `⚠️  ${blockedIssues.length} Blocked`,
    blockedIssues,
    labels,
    false,
  );

  const inWorkCount = `${inWorkIssues.length}/${allPlannedIssues.length}`;
  const inWorkIssuesString = renderIssuesBlock(
    `🏃  ${inWorkCount} In work (${rateToPercent(inWorkRate)})`,
    inWorkIssues,
    labels,
  );

  const committedIssuesString = renderIssuesBlock(
    `💪 ${committedIssues.length} Committed (${rateToPercent(committedRate)})`,
    committedIssues,
    labels,
  );

  const doneCount = `${doneOrDeployIssues.length}/${allPlannedIssues.length}`;
  const doneIssuesString = renderIssuesBlock(
    `🙌 ${doneCount} Done (${rateToPercent(doneRate)})`,
    doneOrDeployIssues,
    labels,
  );

  const projectTitle = `## ${project.name} - ${rateToPercent(doneRate)} done`;
  const projectLink = `Link: [${project.name}](${project.html_url})`;
  const backlogIssuesCountString = `\n*Backlog: ${backlogIssues.length} issues*`;

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
