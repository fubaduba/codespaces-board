import { GitHub } from '@actions/github/lib/utils';
import * as github from '@actions/github';

export class OctoKitBase {
  protected readonly kit: InstanceType<typeof GitHub>;

  constructor(token: string) {
    this.kit = github.getOctokit(token);
  }
}
