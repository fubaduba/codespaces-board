import { IParsedFileUrl } from '../interfaces/IParsedFileUrl';

export const parseFileUrl = (fileUrl: string): IParsedFileUrl => {
  const uri = new URL(fileUrl);
  const { pathname } = uri;

  const split = pathname.split('/');
  const path = decodeURIComponent(split.slice(4).join('/'));

  return {
    owner: split[1],
    repo: split[2],
    path: `/${path}`,
  };
}
