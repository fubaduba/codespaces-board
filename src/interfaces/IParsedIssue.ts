import { IParsedRepo } from './IParsedRepo';
export interface IParsedIssue extends IParsedRepo {
  issueNumber: number;
}
