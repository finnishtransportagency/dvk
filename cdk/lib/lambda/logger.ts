import pino from 'pino';

const level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

function getLogger(tag: string) {
  // noinspection JSUnusedGlobalSymbols
  return pino({
    level,
    base: undefined,
    mixin: () => {
      return {
        tag,
      };
    },
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  });
}

export const log = getLogger('BACKEND');
export const auditLog = getLogger('AUDIT');
