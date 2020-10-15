
export interface IRepoSourceConfig {
  owner: string;
  repo: string;
  projects?: number[]; // if not set, assume all projects
}
