// yyyy-mm-dd format
export const parseDate = (dateStr: string) => {
    let parts = dateStr.split('-') as any[];

    // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[0], parts[1]-1, parts[2]); // Note: months are 0-based
};