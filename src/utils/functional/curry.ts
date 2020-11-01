type TFunction<K extends any[]> = (...args: K) => any;


// type VariadicCurry<T, R> =
//     T extends [any, any, any, any] ? Curry4<T[0], T[1], T[2], T[3], R> :
//     T extends [any, any, any] ? Curry3<T[0], T[1], T[2], R> :
//     T extends [any, any] ? Curry2<T[0], T[1], R> :
//     T extends [any] ? Curry1<T[0], R> :
//     unknown
// ;

// declare function curry<T extends any[], R>
//     (fn: (...args: T) => R): VariadicCurry<T, R>;

// export const curry = <T extends any[], R>(fun: TFunction<T>, ...args: R) => {
//     return <P extends any[]>(...args2: P): ReturnType<TFunction<T>> => {
//         return fun(...args, ...args2);
//     }
// };
