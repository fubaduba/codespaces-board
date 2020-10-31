import { generate as shortId } from 'shortid';

export type TMeasureCallbackAsync<T> = (...args: any[]) => Promise<T>;
export type TMeasureCallbackSync<T> = (...args: any[]) => T;
export type TMeasureCallback<T> = TMeasureCallbackSync<T> | TMeasureCallbackAsync<T>;

export const measure = async <T>(blockName: string, callback: TMeasureCallback<T>) => {
  // const labelSuffix = `__${shortId().substr(0, 4).toLowerCase()}`;
  const label = `${blockName}`

  console.log(`> ${label}`);

  const timingLabel = `- ${label}`;
  console.time(timingLabel);
  const result = await callback();
  console.timeEnd(timingLabel);

  const suffix = (Array.isArray(result))
    ? ` [${result.length} items]`
    : '';

  console.log(`< ${label}${suffix}`);

  return result;
};