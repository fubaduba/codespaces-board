import { IParsedFileUrl } from '../interfaces/IParsedFileUrl';

export const parseFileUrl = (fileUrl: string): IParsedFileUrl => {
  const uri = new URL(fileUrl);
  const { pathname } = uri;

  const split = pathname.split('/');

  console.log(split);

  const path = decodeURIComponent(split.slice(4).join('/'));

  console.log(path);

  return {
    owner: split[1],
    repo: split[2],
    path: `/${path}`,
  };
};
