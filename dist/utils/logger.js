export const createLogEventRecord = ({ event, fields, level }) => {
    const logMessage = JSON.stringify({
        ...fields,
        event,
        timestamp: new Date().toISOString(),
        level
    });
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
