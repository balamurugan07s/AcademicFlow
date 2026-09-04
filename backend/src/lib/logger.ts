export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  [key: string]: any;
}

export const logger = {
  info(message: string, meta: Record<string, any> = {}) {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.log(JSON.stringify(entry));
  },

  warn(message: string, meta: Record<string, any> = {}) {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.warn(JSON.stringify(entry));
  },

  error(message: string, meta: Record<string, any> = {}) {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.error(JSON.stringify(entry));
  },

  debug(message: string, meta: Record<string, any> = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const entry: LogEntry = {
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      };
      console.debug(JSON.stringify(entry));
    }
  },
};
