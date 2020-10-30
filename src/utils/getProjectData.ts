import { ProjectsOctoKit } from '../octokit/ProjectsOctoKit';
import { measure } from './measure';

import { TColumnTypes } from '../interfaces/TColumnTypes';
import { IRepoSourceConfig } from '../interfaces/IRepoSourceConfig';
import { IProjectData } from '../interfaces/IProjectData';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';

export const getProjectData = async (
  projectKit: ProjectsOctoKit,
  repo: IRepoSourceConfig,
  project: IProjectWithConfig,
): Promise<IProjectData> => {
  return await measure(`Get data for the "${project.project.name}" project`, async () => {
    const columns = await measure('Fetching columns', async () => {
      return await projectKit.getColumns(project);
    });

    const cards = await measure('Fetching cards', async () => {
      return await projectKit.getCards(columns);
    });

    const repos = await measure('Fetching Repos', async () => {
      return await projectKit.getCardRepos(cards);
    });
    console.log('Repos: ', repos);

    const issues = await measure('Fetching Issues', async () => {
      return await projectKit.getReposIssues(repos);
    });

    const backlogIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.Backlog,
    );
    console.log(`BacklogIssues: ${backlogIssues.length} items`);

    const committedIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.Committed,
    );
    console.log(`CommittedIssues: ${committedIssues.length} items`);

    const blockedIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.Blocked
    );
    console.log(`BlockedIssues: ${blockedIssues.length} items`);

    const progressIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.InProgress
    );
    console.log(`ProgressIssues: ${progressIssues.length} items`);

    const inReviewIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.InReview
    );
    console.log(`InReviewIssues: ${inReviewIssues.length} items`);

    const waitingToDeployIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.WaitingToDeploy
    );
    console.log(`WaitingToDeployIssues: ${waitingToDeployIssues.length} items`);

    const doneIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.Done
    );
    console.log(`doneIssues: ${doneIssues.length} items`);

    const inWorkIssues = [...progressIssues, ...inReviewIssues];
    const doneOrDeployIssues = [...waitingToDeployIssues, ...doneIssues];
    const allPlannedIssues = [...blockedIssues, ...committedIssues, ...inWorkIssues, ...doneOrDeployIssues];
    const toSolveIssues = [...inWorkIssues, ...blockedIssues, ...committedIssues];

    return {
      project,
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
  });
};
