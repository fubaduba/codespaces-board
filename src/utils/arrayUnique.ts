export const arrayUnique = <T>(array: T[]): T[] => {
    const set = new Set<T>(array);

    return [...set];
};
