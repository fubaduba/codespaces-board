import { IConfig } from './interfaces/IConfig';

export const getConfigs = (configFilePath: string): IConfig[] => {
    const configs = require(configFilePath);

    return configs;
};
