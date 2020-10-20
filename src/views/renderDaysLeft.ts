import { IConfig } from '../interfaces/IConfig';

const getBusinessDatesCount = (startDate: Date, endDate: Date) => {
  var count = 0;
  var curDate = startDate;

  while (curDate <= endDate) {
    var dayOfWeek = curDate.getDay();
    if (!(dayOfWeek == 6 || dayOfWeek == 0)) count++;
    curDate.setDate(curDate.getDate() + 1);
  }

  return count;
};

const daysLeftToEmoj = (daysLeft: number, totalDays: number) => {
  const ratio = daysLeft / totalDays;

  if (ratio < 0.2) {
    return '🔥🔥🔥';
  }

  if (ratio < 0.3) {
    return '🔥🔥';
  }

  if (ratio < 0.4) {
    return '🔥';
  }

  return '';
};

export const getWorkDays = (config: IConfig) => {
  const {
    sprintStartDate: sprintStartDateString,
    sprintDuration,
    sprintNumberHolidays = 0,
  } = config;

  if (!sprintStartDateString || !sprintDuration) {
    return;
  }

  const sprintStartDate = new Date(sprintStartDateString);
  const sprintEndDate = new Date(
    new Date().setDate(sprintStartDate.getDate() + sprintDuration),
  );

  const totalBusinessDays =
    getBusinessDatesCount(sprintStartDate, sprintEndDate) -
    sprintNumberHolidays;

  const businessDaysLeft =
    getBusinessDatesCount(new Date(), sprintEndDate) - 1 - sprintNumberHolidays;

  return {
    businessDaysLeft,
    totalBusinessDays,
  };
}

export const renderDaysLeft = (config: IConfig) => {
  const days = getWorkDays(config);
  if (!days) {
    return;
  }

  const { businessDaysLeft, totalBusinessDays } = days;
  const daysLeft = Math.max(businessDaysLeft, 0);

  return `${daysLeftToEmoj(
    daysLeft,
    totalBusinessDays,
  )} **${daysLeft}** work days left`;
};
