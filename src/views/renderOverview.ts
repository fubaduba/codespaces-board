import { getProjectStats } from '../utils/getProjectStats';
import { rateToPercent } from '../utils/rateToPercent';
import { renderDaysLeft } from './renderDaysLeft';

import { IConfig } from '../interfaces/IConfig';
import { IProjectStats } from '../interfaces/IProjectStats';
import { IProjectData } from '../interfaces/IProjectData';
import { TProject } from '../interfaces/TProject';

const sum = (a: number, b: number): number => {
  return a + b;
};

const getTotalRate = (
  projectsData: IProjectData[],
  statName: keyof IProjectStats,
): number => {
  const allStats = projectsData.map(getProjectStats);

  const stats = allStats.map((stat) => {
    return stat[statName];
  });

  const totalStats = stats.reduce(sum, 0);
  const rate = totalStats / stats.length;

  return rate;
};

const getTotalPercent = (
  projectsData: IProjectData[],
  statName: keyof IProjectStats,
): string => {
  const rate = getTotalRate(projectsData, statName);
  return rateToPercent(rate);
};

interface IProjectWithStats {
  project: TProject;
  stats: IProjectStats;
}

const renderPowerEngines = (
  projectsWithStats: IProjectWithStats[],
): string | undefined => {
  let maxProject = projectsWithStats[0];
  for (let projectWithStats of projectsWithStats) {
    const { stats } = projectWithStats;
    if (stats.doneRate > maxProject.stats.doneRate) {
      maxProject = projectWithStats;
    }
  }

  if (maxProject.stats.doneRate === 0) {
    return undefined;
  }

  const projects = projectsWithStats.filter(({ project, stats }) => {
    return maxProject.stats.doneRate === stats.doneRate;
  });

  const projectsString = projects
    .map(({ project }) => {
      return `**[${project.name}](${project.html_url})**`;
    })
    .join(', ');

  return `- 🚂 ${projectsString} **${rateToPercent(projects[0].stats.doneRate)}**`;
};

interface IProjectsWithData {
  project: TProject;
  data: IProjectData;
}

export const renderOverview = (
  config: IConfig,
  projectsWithData: IProjectsWithData[],
): string => {
  const projectsData = projectsWithData.map(({ data }) => {
    return data;
  });

  const projectsWithStats = projectsWithData.map(({ project, data }) => {
    const stats = getProjectStats(data);

    return {
      project,
      stats,
    };
  });

  return [
    `## 🔭 Overview - ${projectsData.length} projects`,
    renderDaysLeft(config),
    `- **${getTotalPercent(projectsData, 'doneRate')}** done across projects`,
    `- **${getTotalPercent(projectsData, 'inWorkRate')}** in work`,
    renderPowerEngines(projectsWithStats),
  ].join('\n');
};
