import { IConfig } from '../interfaces/IConfig';
import { IProjectData } from '../interfaces/IProjectData';
import { IProjectStats } from '../interfaces/IProjectStats';
import { getWorkDays } from '../views/renderDaysLeft';
import { arrayUnique } from './arrayUnique';
import { flattenArray } from './flatternArray';
import { notEmpty } from './functional/notEmpty';
import { pluck } from './functional/pluck';
import { ICardWithIssue } from '../interfaces/ICardWithIssue';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';

const getDevelopers = (
  cardsWithIssue: ICardWithIssue[],
  projectWithConfig: IProjectWithConfig,
): string[] => {
  /**
   * If `developers` list set on the Project config, use the list,
   * otherwise infer the developers list from the assigned issues.
   */
  const { projectConfig } = projectWithConfig;
  if (typeof projectConfig !== 'number' && projectConfig.developers) {
    return projectConfig.developers;
  }

  const developersWithDuplicates = cardsWithIssue
    .map(({ issue }) => {
      if (!issue) {
        return;
      }

      return issue.assignees.map(pluck('login'));
    })
    .filter(notEmpty);

  const developers: string[] = arrayUnique(flattenArray(developersWithDuplicates));

  return developers;
};

// const asigneesToDevelopers = (assignees: TRepoIssue['assignees']) => {
//   return assignees.map((as) => {
//     return as.login;
//   });
// };

// const countAssignedIssues = (
//   developer: string,
//   cardsWithIssue: ICardWithIssue[],
// ) => {
//   const result = cardsWithIssue.reduce((current, { issue }) => {
//     if (!issue) {
//       return current;
//     }

//     const { assignees } = issue;

//     if (!assignees || !assignees.length) {
//       return current;
//     }

//     const developers = asigneesToDevelopers(assignees);
//     return developers.includes(developer) ? current + 1 : current;
//   }, 0);

//   return result;
// };

// const getBusiestDeveloper = (cardsWithIssue: ICardWithIssue[]): IDeveloperWithIssuesCount => {
//   const developers = getDevelopers(cardsWithIssue)
//     .map<IDeveloperWithIssuesCount>((developer) => {
//       return {
//         login: developer,
//         issuesCount: countAssignedIssues(developer, cardsWithIssue),
//         issueType: 'assigned',
//       }
//     })
//     .sort((dev1, dev2) => {
//       return dev2.issuesCount - dev1.issuesCount;
//     });

//   return developers[0];
// };

export const getProjectStats = (
  data: IProjectData,
  config: IConfig,
): IProjectStats => {
  const {
    // combined
    inWorkIssues,
    doneOrDeployIssues,
    allPlannedIssues,
    issuesToSolve: toSolveIssues,
    // plain
    committedIssues,
  } = data;

  const daysLeft = getWorkDays(config);

  const doneRate = doneOrDeployIssues.length / allPlannedIssues.length;
  const inWorkRate = inWorkIssues.length / allPlannedIssues.length;
  const committedRate = committedIssues.length / allPlannedIssues.length;

  const developers = getDevelopers(allPlannedIssues, data.project);

  const issuesDeveloperLeftRatio = toSolveIssues.length / developers.length;
  const issuesDeveloperRatio = toSolveIssues.length / developers.length;

  const issuesDayLeftRatio = daysLeft
    ? toSolveIssues.length / Math.max(daysLeft.businessDaysLeft, 1)
    : undefined;

  const issuesDayRatio = daysLeft
    ? allPlannedIssues.length / daysLeft.totalBusinessDaysInSprint
    : undefined;

  const issuesDeveloperDayLeftRatio = issuesDayLeftRatio
    ? issuesDayLeftRatio / developers.length
    : undefined;

  const issuesDeveloperDayRatio = issuesDayRatio
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
    // devWithMostAssignedIssues: getBusiestDeveloper(toSolveIssues),
  };
};
