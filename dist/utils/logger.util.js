export const createLogEventRecord = ({ event, fields, level }) => {
    const { operationId, ...details } = fields;
    const logMessage = [
        event,
        `timestamp=${new Date().toISOString()}`,
        `level=${level}`,
        ...Object.entries(details).map(([key, value]) => `${key}=${JSON.stringify(value)}`),
        ...(operationId != null ? [`operationId=${operationId}`] : []),
    ].join(' | ');
    switch (level) {
        case 'error':
            console.error(logMessage);
            break;
        case 'warn':
            console.warn(logMessage);
            break;
        default:
            console.log(logMessage);
    }
};
