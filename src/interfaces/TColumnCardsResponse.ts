import { ThenArg } from './ThenArg';
import { TGitHub } from './TGitHub';

export type TColumnCardsResponse = ThenArg<ReturnType<TGitHub['projects']['listCards']>>;
