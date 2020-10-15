import * as core from '@actions/core'
import { env } from './utils/env';

// add .env file support
require('dotenv').config();

import { AuthorizationError } from './errors/AuthorizationError';
import { ProjectsOctoKit } from './octokit/ProjectsOctoKit';
import { TEST_CONFIG } from './testConfig';

export const OWNER = 'legomushroom';
export const REPO = 'codespaces-board';
const TOKEN_NAME = 'REPO_GITHUB_PAT';

async function run(): Promise<void> {
  try {
    const token = env(TOKEN_NAME) ?? core.getInput('token');

    if (!token) {
      throw new AuthorizationError('No token found.');
    }

    const projectsOctoKit = new ProjectsOctoKit(token);
    const projects = await projectsOctoKit.getAllProjects(TEST_CONFIG.repos);

    console.log(projects);
  } catch (error) {
    core.setFailed(error.message)
  }
}

run();
