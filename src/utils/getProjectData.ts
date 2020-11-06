import { ProjectsOctoKit } from '../octokit/ProjectsOctoKit';
import { measure } from './measure';

import { TColumnTypes } from '../interfaces/TColumnTypes';
import { IProjectData } from '../interfaces/IProjectData';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';
import { IConfig } from '../interfaces/IConfig';
import { filterUnassignedIssues } from './filterPlannedProjectData';

export const getProjectData = async (
  projectKit: ProjectsOctoKit,
  config: IConfig,
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

    console.log('- Repos: ', repos);

    const issues = await measure('Fetching Issues', async () => {
      return await projectKit.getReposIssues(repos);
    });

    const backlogIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.Backlog,
      config,
    );
    console.log(`BacklogIssues: ${backlogIssues.length} items`);

    const committedIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.Committed,
      config,
    );
    console.log(`CommittedIssues: ${committedIssues.length} items`);

    const blockedIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.Blocked,
      config,
    );
    console.log(`BlockedIssues: ${blockedIssues.length} items`);

    const progressIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.InProgress,
      config,
    );
    console.log(`ProgressIssues: ${progressIssues.length} items`);

    const inReviewIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.InReview,
      config,
    );
    console.log(`InReviewIssues: ${inReviewIssues.length} items`);

    const waitingToDeployIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.WaitingToDeploy,
      config,
    );
    console.log(`WaitingToDeployIssues: ${waitingToDeployIssues.length} items`);

    const doneIssues = await projectKit.mergeCardsWithIssuesForColumn(
      issues,
      cards,
      TColumnTypes.Done,
      config,
    );
    console.log(`doneIssues: ${doneIssues.length} items`);

    const inWorkIssues = [...progressIssues, ...inReviewIssues];
    const doneOrDeployIssues = [...waitingToDeployIssues, ...doneIssues];
    const allPlannedIssues = [...blockedIssues, ...committedIssues, ...inWorkIssues, ...doneOrDeployIssues];
    const backlogUnassignedIssues = filterUnassignedIssues([...blockedIssues, ...committedIssues]);
    const toSolveIssues = [...inWorkIssues, ...blockedIssues, ...committedIssues];

    return {
      project,
      // combined
      inWorkIssues,
      doneOrDeployIssues,
      allPlannedIssues,
      issuesToSolve: toSolveIssues,
      backlogUnassignedIssues,
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

