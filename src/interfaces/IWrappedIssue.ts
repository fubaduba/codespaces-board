import { TColumnTypes } from './TColumnTypes';
import { TRepoIssue } from './TRepoIssue';

export interface IWrappedIssue {
    column: TColumnTypes;
    issue: TRepoIssue;
}
