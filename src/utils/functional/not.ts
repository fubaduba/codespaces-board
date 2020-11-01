
type TFunction<K extends any[]> = (...args: K) => any;
type TWrappedFunction<K extends any[]> = (...args: K) => boolean;

export const not = <T extends any[]>(fun: TFunction<T>): TWrappedFunction<T> => {
    return (...args: T): boolean => {
        return !fun(...args);
    }
};
