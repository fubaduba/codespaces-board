import { IProjectData } from '../interfaces/IProjectData';
import { IProjectStats } from '../interfaces/IProjectStats';

export const getProjectStats = (data: IProjectData): IProjectStats => {
  const {
    // combined
    inWorkIssues,
    doneOrDeployIssues,
    allPlannedIssues,
    // plain
    committedIssues,
  } = data;

  const doneRate = doneOrDeployIssues.length / allPlannedIssues.length;
  const inWorkRate = inWorkIssues.length / allPlannedIssues.length;
  const committedRate = committedIssues.length / allPlannedIssues.length;

  return {
    doneRate,
    inWorkRate,
    committedRate,
  };
};
