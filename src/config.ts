import { Schema, Validator } from 'jsonschema';
import * as path from 'path';

import { PROJECT_ROOT } from './constants';

import { IConfig } from './interfaces/IConfig';

export const getConfigs = (configFilePath: string): IConfig[] => {
  const configs = require(path.join(PROJECT_ROOT, configFilePath));

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
