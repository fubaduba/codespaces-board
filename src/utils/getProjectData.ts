import { ProjectsOctoKit } from '../octokit/ProjectsOctoKit';
import { TColumnTypes } from '../interfaces/TColumnTypes';
// import { TProject } from '../interfaces/TProject';
import { IRepoSourceConfig } from '../interfaces/IRepoSourceConfig';
import { IProjectData } from '../interfaces/IProjectData';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';

export const getProjectData = async (
  projectKit: ProjectsOctoKit,
  repo: IRepoSourceConfig,
  project: IProjectWithConfig,
): Promise<IProjectData> => {
  const columns = await projectKit.getColumns(project);
  const cards = await projectKit.getCards(columns);
  const repos = await projectKit.getCardRepos(cards);

  console.log('>>> repos:');
  console.log(repos);
  console.log('>>>');

  const issues = await projectKit.getReposIssues(repos);
  const issues2 = await projectKit.getRepoIssues(repo);

  console.log('>>> issues.length:');
  console.log(issues.length);
  console.log('>>>');

  console.log('>>> issues2.length:');
  console.log(issues2.length);
  console.log('>>>');

  const backlogIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.Backlog
  );

  const committedIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.Committed
  );

  const blockedIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.Blocked
  );

  const progressIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.InProgress
  );

  const inReviewIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.InReview
  );

  const waitingToDeployIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.WaitingToDeploy
  );

  const doneIssues = await projectKit.filterIssuesForColumnCards(
    issues,
    columns,
    TColumnTypes.Done
  );

  const inWorkIssues = [...progressIssues, ...inReviewIssues];
  const doneOrDeployIssues = [...waitingToDeployIssues, ...doneIssues];
  const allPlannedIssues = [...blockedIssues, ...committedIssues, ...inWorkIssues, ...doneOrDeployIssues];
  const toSolveIssues = [...inWorkIssues, ...blockedIssues, ...committedIssues];

  return {
    // combined
    inWorkIssues,
    doneOrDeployIssues,
    allPlannedIssues,
    issuesToSolve: toSolveIssues,
    // plain
    backlogIssues,
    committedIssues,
    progressIssues,
    inReviewIssues,
    blockedIssues,
    waitingToDeployIssues,
    doneIssues,
  };
};
