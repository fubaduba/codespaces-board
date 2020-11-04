import { Schema, Validator } from 'jsonschema';
import * as path from 'path';

import { env } from './utils/env';

import { PROJECT_ROOT } from './constants';

import { IConfig } from './interfaces/IConfig';

const getWorkspacePath = (configFilePath: string) => {
  const rootPath = env('GITHUB_WORKSPACE');
  console.log(`rootPath variable: ${rootPath}`);
  if (!rootPath) {
    return;
  }

  console.log(`join the workspace path`);

  return path.join(rootPath, configFilePath);
}

export const getConfigs = (configFilePath: string): IConfig[] => {
  const configPath = getWorkspacePath(configFilePath) ?? path.join(PROJECT_ROOT, configFilePath);

  console.log(`config path: "${configPath}"`);

  const configs = require(configPath);

  return configs;
};

export const getConfigSchema = (): Schema => {
  const schema = require(path.join(PROJECT_ROOT, `./schemas/IConfig.json`));

  return schema;
};

export const validateConfig = (config: unknown) => {
  const validator = new Validator();

  const validationResult = validator.validate(config, getConfigSchema());
  const { errors } = validationResult;

  return errors;
};
