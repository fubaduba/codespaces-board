import { rateToPercent } from '../utils/rateToPercent';
import { getProjectStats } from '../utils/getProjectStats';
import { IProjectData } from '../interfaces/IProjectData';
import { IConfig } from '../interfaces/IConfig';
import { filterPlannedProjectData } from '../utils/filterPlannedProjectData';
import { TProject } from '../interfaces/TProject';
import { addTitle } from './addTitle';

export const renderProjectTitle = (
  project: TProject,
  allData: IProjectData,
  config: IConfig,
) => {
  const plannedData = filterPlannedProjectData(allData);
  const { doneRate } = getProjectStats(plannedData, config);

  const { allPlannedIssues } = allData;
  const { allPlannedIssues: plannedAllPlannedIssues } = plannedData;

  const surgeRate =
    (allPlannedIssues.length - plannedAllPlannedIssues.length) /
    plannedAllPlannedIssues.length;
  const surgeEmoji = surgeRate >= 0.1 ? '💥' : '';

  const surgeString =
    surgeRate > 0
      ? ` (**+${rateToPercent(surgeRate)} flood**${surgeEmoji})`
      : '';

  const suffix = addTitle('Items added after sprint start date', surgeString);

  const projectTitle = `## ${project.name} - ${rateToPercent(
    doneRate,
  )} done${suffix}`;
  return projectTitle;
}
