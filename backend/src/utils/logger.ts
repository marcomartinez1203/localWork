import { env } from '../config/env';

type LogMeta = Record<string, unknown>;

function format(level: string, msg: string, meta?: LogMeta) {
  const ts = new Date().toISOString();
  if (env.isDev) {
    const extra = meta ? ' ' + JSON.stringify(meta) : '';
    return `[${ts}] ${level.toUpperCase()}: ${msg}${extra}`;
  }
  return JSON.stringify({ level, message: msg, timestamp: ts, ...meta });
}

export const logger = {
  info: (msg: string, meta?: LogMeta) => console.log(format('info', msg, meta)),
  error: (msg: string, meta?: LogMeta) => console.error(format('error', msg, meta)),
  warn: (msg: string, meta?: LogMeta) => console.warn(format('warn', msg, meta)),
  debug: (msg: string, meta?: LogMeta) => {
    if (env.isDev) console.debug(format('debug', msg, meta));
  },
};
