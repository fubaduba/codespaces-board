import { IConfig } from '../interfaces/IConfig';
import { IDeveloperWithIssuesCount } from '../interfaces/IDeveloperWithIssuesCount';
import { IProjectWithData } from '../interfaces/IProjectWithData';
import { getProjectStats } from '../utils/getProjectStats';
import { ident } from './ident';
import { getWorkDays, renderDaysLeft } from './renderDaysLeft';

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
  return `${ident(identation)}- ${unit}: **${left} left** / **${was} started**`;
};

const renderDeveloper = (
  developer: IDeveloperWithIssuesCount,
  config: IConfig,
  identation = 0,
) => {
  const { login, issuesCount } = developer

  const daysLeft = getWorkDays(config);
  const suffix = (daysLeft)
    ? ` / ${(issuesCount / Math.max(1, daysLeft.businessDaysLeft)).toFixed(1)} per day left`
    : '';

  return `${ident(identation)}- 🥵 @${login}: **${issuesCount}** issues${suffix}`;
};

/**
 * Render the `🔭 Overview` section with project stats.
 */
export const renderProjectOverview = (
  config: IConfig,
  projectWithData: IProjectWithData,
): string => {
  const { data } = projectWithData;
  const {
    developers,
    issuesDeveloperLeftRatio,
    issuesDeveloperRatio,
    issuesDayLeftRatio,
    issuesDayRatio,
    issuesDeveloperDayRatio,
    issuesDeveloperDayLeftRatio,
    devWithMostAssignedIssues,
  } = getProjectStats(data, config);

  return [
    `- 📅 ${renderDaysLeft(config)}`,
    `- 🧑‍💻 **${developers.length}** developers`,
    `- 🌡️ Issues load per:`,
    renderPerLine('day', issuesDayLeftRatio, issuesDayRatio, 1),
    renderPerLine(
      'developer',
      issuesDeveloperLeftRatio,
      issuesDeveloperRatio,
      1,
    ),
    renderPerLine(
      'developer/day',
      issuesDeveloperDayLeftRatio,
      issuesDeveloperDayRatio,
      1,
    ),
    renderDeveloper(devWithMostAssignedIssues, config),
  ].join('\n');
};
