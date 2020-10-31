import { TColumnTypes } from '../interfaces/TColumnTypes';

export const isDoneColumn = (column: TColumnTypes) => {
  switch (column) {
    case TColumnTypes.WaitingToDeploy:
    case TColumnTypes.Done: {
      return true;
    }

    default: {
      return false;
    }
  }
};
