import { IConfig } from '../interfaces/IConfig';
import { IProjectData } from '../interfaces/IProjectData';
import { IProjectStats } from '../interfaces/IProjectStats';
import { IWrappedIssue } from '../interfaces/IWrappedIssue';
import { TRepoIssue } from '../interfaces/TRepoIssue';
import { getWorkDays } from '../views/renderDaysLeft';
import { arrayUnique } from './arrayUnique';
import { flattenArray } from './flatternArray';
import { IDeveloperWithIssuesCount } from '../interfaces/IDeveloperWithIssuesCount';
import { notEmpty } from './notEmpty';
import { pluck } from './pluck';

const getDevelopers = (issues: IWrappedIssue[]): string[] => {
  const developersWithDuplicates = issues
    .map(({ issue }) => {
      return issue.assignees.map(pluck('login'));
    })
    .filter(notEmpty);

  const developers = arrayUnique(flattenArray(developersWithDuplicates));

  return developers as string[];
};

const asigneesToDevelopers = (assignees: TRepoIssue['assignees']) => {
  return assignees.map((as) => {
    return as.login;
  });
}

const countAssignedIssues = (developer: string, issues: IWrappedIssue[]) => {
  const result = issues.reduce((current, { issue }) => {
    const { assignees } = issue;

    if (!assignees || !assignees.length) {
      return current;
    }

    const developers = asigneesToDevelopers(assignees);
    return (developers.includes(developer))
      ? current + 1
      : current;
  }, 0);

  return result;
}

const getBusiestDeveloper = (issues: IWrappedIssue[]): IDeveloperWithIssuesCount => {
  const developers = getDevelopers(issues)
    .map<IDeveloperWithIssuesCount>((developer) => {
      return {
        login: developer,
        issuesCount: countAssignedIssues(developer, issues),
        issueType: 'assigned',
      }
    })
    .sort((dev1, dev2) => {
      return dev2.issuesCount - dev1.issuesCount;
    });

  return developers[0];
};

export const getProjectStats = (data: IProjectData, config: IConfig): IProjectStats => {
  const {
    // combined
    inWorkIssues,
    doneOrDeployIssues,
    allPlannedIssues,
    toSolveIssues,
    // plain
    committedIssues,
  } = data;

  const daysLeft = getWorkDays(config);

  const doneRate = doneOrDeployIssues.length / allPlannedIssues.length;
  const inWorkRate = inWorkIssues.length / allPlannedIssues.length;
  const committedRate = committedIssues.length / allPlannedIssues.length;

  const developers = getDevelopers(allPlannedIssues);

  const issuesDeveloperLeftRatio = toSolveIssues.length / developers.length;
  const issuesDeveloperRatio = allPlannedIssues.length / developers.length;

  const issuesDayLeftRatio = (daysLeft)
    ? toSolveIssues.length / Math.max(daysLeft.businessDaysLeft, 1)
    : undefined;

  const issuesDayRatio = (daysLeft)
    ? allPlannedIssues.length / daysLeft.totalBusinessDays
    : undefined;

  const issuesDeveloperDayLeftRatio = (issuesDayLeftRatio)
    ? issuesDayLeftRatio / developers.length
    : undefined;

  const issuesDeveloperDayRatio = (issuesDayRatio)
    ? issuesDayRatio / developers.length
    : undefined;

  return {
    doneRate,
    inWorkRate,
    committedRate,
    // number of developers on the board
    developers,
    // inital issues per developer load
    issuesDeveloperRatio,
    // how many issues per developer left to solve
    issuesDeveloperLeftRatio,
    // inital issues per day load
    issuesDayRatio,
    // how many issues per day left to solve
    issuesDayLeftRatio,
    // inital per day per developer ratio
    issuesDeveloperDayRatio,
    // how many issues per day per developer left to solve
    issuesDeveloperDayLeftRatio,
    // developer with most assigned issues
    devWithMostAssignedIssues: getBusiestDeveloper(toSolveIssues),
  };
};
