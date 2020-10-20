import { IProjectData } from '../interfaces/IProjectData';
import { IProjectWithConfig } from '../interfaces/IProjectWithConfig';


export interface IProjectWithData {
  project: IProjectWithConfig;
  data: IProjectData;
}
