import { IConfig } from '../interfaces/IConfig';
import { IDeveloperWithIssuesCount } from '../interfaces/IDeveloperWithIssuesCount';
import { IProjectStats } from '../interfaces/IProjectStats';
import { IProjectWithData } from '../interfaces/IProjectWithData';
import { filterPlannedProjectData } from '../utils/filterPlannedProjectData';
import { getProjectStats } from '../utils/getProjectStats';
import { addParens } from './addParens';
import { ident } from './ident';
import { getWorkDays, renderDaysLeft } from './renderDaysLeft';
import { renderNewItemsSuffix } from './renderNewItemsSuffix';

const renderPerLine = (
  unit: string,
  leftRatio?: number,
  totalRatio?: number,
  identation = 0,
) => {
  if (!leftRatio || !totalRatio) {
    return;
  }

  const left = leftRatio.toFixed(1);
  const was = totalRatio.toFixed(1);
  return `${ident(identation)}- ${unit}: **${left}** left / **${was}** total`;
}

// const renderDeveloper = (
//   developer: IDeveloperWithIssuesCount,
//   config: IConfig,
//   identation = 0,
// ) => {
//   const { login, issuesCount } = developer

//   const daysLeft = getWorkDays(config);
//   const suffix = (daysLeft)
//     ? ` / **${(issuesCount / Math.max(1, daysLeft.businessDaysLeft)).toFixed(1)} per day left**`
//     : '';

//   return `${ident(identation)}- 🥵 @${login}: **${issuesCount} issues**${suffix}`;
// };

const renderDeveloper = (
  developer: string,
  config: IConfig,
  identation = 0,
) => {
  return `${ident(identation)}- @${developer}`;
}

const renderDevelopers = (
  developers: string[],
  config: IConfig,
  identation = 0,
) => {
  const title = `${ident(identation)}- 🧑‍💻 **${
    developers.length
  }** developers`;

  // const devs = developers
  //   .sort()
  //   .map((developer) => {
  //     return renderDeveloper(developer, config, identation + 1);
  //   })
  //   .join('\n');

  return [
    title,
    // devs,
  ].join('\n');
}

const renderIssuesLoadSection = (stats: IProjectStats, identation = 0) => {
  const {
    issuesDeveloperLeftRatio,
    issuesDeveloperRatio,
    issuesDayLeftRatio,
    issuesDayRatio,
    issuesDeveloperDayRatio,
    issuesDeveloperDayLeftRatio,
    // devWithMostAssignedIssues,
  } = stats;

  // Load - 🔥 <b>high</b>

  return [
    renderPerLine(
      'issues per day',
      issuesDayLeftRatio,
      issuesDayRatio,
      identation,
    ),
    renderPerLine(
      'issues per developer',
      issuesDeveloperLeftRatio,
      issuesDeveloperRatio,
      identation,
    ),
    renderPerLine(
      'issues per developer/day',
      issuesDeveloperDayLeftRatio,
      issuesDeveloperDayRatio,
      identation,
    ),
  ].join('\n');
}

const renderIssuesLoad = (
  allStats: IProjectStats,
  plannedStats: IProjectStats,
  config: IConfig,
  identation = 0,
) => {
  return [
    '<details>',
    '<summary>🌡️ <b>Load</b></summary>',
    '',
    `- **Planned:**`,
    renderIssuesLoadSection(plannedStats, identation + 1),
    `- **Including new issues:**`,
    renderIssuesLoadSection(allStats, identation + 1),
    '</details>',
  ].join('\n');
}

/**
 * Render the `🔭 Overview` section with project stats.
 */
export const renderProjectOverview = (
  config: IConfig,
  projectWithData: IProjectWithData,
): string => {
  const { data: allData } = projectWithData;
  const plannedData = filterPlannedProjectData(allData);

  const { allPlannedIssues: allPlannedIssuesAdded } = allData;

  const { issuesToSolve, allPlannedIssues } = plannedData;

  const allStats = getProjectStats(allData, config);
  const plannedStats = getProjectStats(plannedData, config);

  const { developers } = allStats;

  const addedIssues = renderNewItemsSuffix(
    allPlannedIssuesAdded,
    allPlannedIssues,
  )
  return [
    `- 📅 ${renderDaysLeft(config)}`,
    `- 🗒️ **${issuesToSolve.length}** issues left / **${
      allPlannedIssues.length
    }** total${addParens(addedIssues)}`,
    renderDevelopers(developers, config),
    renderIssuesLoad(allStats, plannedStats, config),
  ].join('\n');
}
