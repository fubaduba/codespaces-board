import { Schema, Validator } from 'jsonschema';
import * as path from 'path';

import * as core from '@actions/core';

import { PROJECT_ROOT } from './constants';

import { IConfig } from './interfaces/IConfig';

const getWorkspacePath = (configFilePath: string) => {
  const rootPath = core.getInput('workspace');
  if (!rootPath) {
    return;
  }

  return path.join(rootPath, configFilePath);
}

export const getConfigs = (configFilePath: string): IConfig[] => {
  const rootPath = getWorkspacePath(configFilePath) ?? path.join(PROJECT_ROOT, configFilePath);
  const configs = require(rootPath);

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
