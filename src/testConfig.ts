import { IConfig } from './interfaces/IConfig';

export const TEST_CONFIG: IConfig = {
  boardIssue: 'https://github.com/legomushroom/codespaces-board/issues/12',
  repos: [
    {
      owner: 'legomushroom',
      repo: 'codespaces-board',
      projects: [1, 2],
    },
    // {
    //   owner: 'legomushroom',
    //   repo: 'codespaces-board',
    //   projects: [3],
    // }
  ]
};
