import { IParsedRepo } from '../interfaces/IParsedRepo';

export const repoUrl = (repo: IParsedRepo) => {
  return `https://github.com/${repo.owner}/${repo.repo}`;
};
