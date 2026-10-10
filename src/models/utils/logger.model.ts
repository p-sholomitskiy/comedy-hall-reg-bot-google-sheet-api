export type LogEventLevel = 'info' | 'warn' | 'error';

export type LogEventFields = Record<string, string | number | boolean | null>;

export type LogEventParams = {
  event: string,
  fields: LogEventFields,
  level: LogEventLevel
};
