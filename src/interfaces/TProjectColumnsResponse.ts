import { ThenArg } from './ThenArg';
import { TGitHub } from './TGitHub';

export type TProjectColumnsResponse = ThenArg<ReturnType<TGitHub['projects']['listColumns']>>;
