import { rateToPercent } from '../utils/rateToPercent';
import { getProjectStats } from '../utils/getProjectStats';
import { renderIssuesBlock } from './renderIssuesBlock';

import { renderProjectOverview } from './renderProjectOverview';

import { IProjectData } from '../interfaces/IProjectData';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { IConfig } from '../interfaces/IConfig';
import { filterPlannedProjectData } from '../utils/filterPlannedProjectData';
import { renderProjectTitle } from './renderProjectTitle';
import { renderNewItemsSuffix } from './renderNewItemsSuffix';
import { addTitle } from './addTitle';

export const renderProject = (
  allData: IProjectData,
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
  } = allData;

  const plannedData = filterPlannedProjectData(allData);

  const {
    allPlannedIssues: plannedAllPlannedIssues,
    doneOrDeployIssues: plannedDoneOrDeployIssues,
  } = plannedData;

  const {
    doneRate,
    inWorkRate,
    committedRate,
  } = getProjectStats(plannedData, config);

  const {
    project,
  } = projectWithConfig;

  const blockedIssuesString = renderIssuesBlock(
    `⚠️  ${blockedIssues.length} Blocked`,
    blockedIssues,
    projectWithConfig,
    false,
  );

  const inWorkCount = `${inWorkIssues.length}`;
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

  const doneCount = `${plannedDoneOrDeployIssues.length}/${plannedAllPlannedIssues.length}`;
  const newItemsDone = renderNewItemsSuffix(plannedAllPlannedIssues, allPlannedIssues);
  const doneIssuesString = renderIssuesBlock(
    `🙌 ${doneCount} Done (${rateToPercent(doneRate)})${addTitle('Items added after sprint start date', newItemsDone)}`,
    doneOrDeployIssues,
    projectWithConfig,
  );

  const projectLink = `Link: [${project.name}](${project.html_url})`;
  const backlogIssuesCountString = `\nBacklog: [${backlogIssues.length} issues](${project.html_url})`;

  const projectWithData = { data: allData, project: projectWithConfig };
  return [
    '',
    renderProjectTitle(project, allData, config),
    projectLink,
    renderProjectOverview(config, projectWithData),
    '',
    blockedIssuesString,
    committedIssuesString,
    inWorkIssuesString,
    doneIssuesString,
    backlogIssuesCountString,
  ].join('\n');
};
