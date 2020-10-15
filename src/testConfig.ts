import { IConfig } from './interfaces/IConfig';

export const TEST_CONFIG: IConfig = {
  boardIssue: 'https://github.com/legomushroom/codespaces-board/issues/12',
  headerFileUrl: 'https://raw.githubusercontent.com/legomushroom/codespaces-board/main/sprints/sprint%2012/header.md',
  footerFileUrl: 'https://raw.githubusercontent.com/legomushroom/codespaces-board/main/sprints/sprint%2012/footer.md',
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
