import { createLogger as _createLogger, type Logger } from "./shared/logger.js";

export const VERSION = "0.1.0" as const;

export { YunShouError } from "./shared/errors.js";
export { type Logger, type LogLevel } from "./shared/logger.js";
export { readYaml, writeYaml } from "./shared/yaml.js";
export { appendEvent, readEvents, type StateEvent } from "./core/state/store.js";
export { StateStore } from "./core/state/store.js";

export function createLogger(opts?: Parameters<typeof _createLogger>[0]): Logger {
  return _createLogger(opts);
}
