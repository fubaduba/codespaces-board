import { renderIssuesBlock } from './renderIssuesBlock';
import { TProject } from '../interfaces/TProject';
import { IProjectData } from '../interfaces/IProjectData';
import { rateToPercent } from '../utils/rateToPercent';
import { getProjectStats } from '../utils/getProjectStats';

export const renderProject = (
  data: IProjectData,
  project: TProject,
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

  const { doneRate, inWorkRate, committedRate } = getProjectStats(data);

  const blockedIssuesString = renderIssuesBlock(
    `⚠️  ${blockedIssues.length} Blocked`,
    blockedIssues,
    false,
  );

  const inWorkCount = `${inWorkIssues.length}/${allPlannedIssues.length}`;
  const inWorkIssuesString = renderIssuesBlock(
    `🏃  ${inWorkCount} In work (${rateToPercent(inWorkRate)})`,
    inWorkIssues
  );

  const committedIssuesString = renderIssuesBlock(
    `💪 ${committedIssues.length} Committed (${rateToPercent(committedRate)})`,
    committedIssues
  );

  const doneCount = `${doneOrDeployIssues.length}/${allPlannedIssues.length}`;
  const doneIssuesString = renderIssuesBlock(
    `🙌 ${doneCount} Done (${rateToPercent(doneRate)})`,
    doneOrDeployIssues
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
