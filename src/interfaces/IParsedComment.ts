import { IParsedIssue } from './IParsedIssue';

export interface IParsedComment extends IParsedIssue {
  commentId: number;
}
