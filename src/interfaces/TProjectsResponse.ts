import { ThenArg } from './ThenArg';
import { TGitHub } from './TGitHub';

export type TProjectResponse = ThenArg<
  ReturnType<TGitHub['projects']['listForRepo']>
>
