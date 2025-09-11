
import pino from 'pino';
import { createWriteStream } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure logs directory exists
const logsDir = join(__dirname, '../logs');
try {
  mkdirSync(logsDir, { recursive: true });
  console.log(`Logs directory created/verified at: ${logsDir}`);
} catch (err) {
  console.error(`Failed to create logs directory: ${err.message}`);
}

// Create write streams for different log levels
const infoStream = createWriteStream(join(logsDir, 'info.log'), { flags: 'a' });
const errorStream = createWriteStream(join(logsDir, 'error.log'), { flags: 'a' });
const exceptionStream = createWriteStream(join(logsDir, 'exceptions.log'), { flags: 'a' });

// Custom transport configuration
const transport = pino.transport({
  targets: [
    // Console output for development
    {
      target: 'pino-pretty',
      level: 'info',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    },
    // Info level logs to file
    {
      target: 'pino/file',
      level: 'info',
      options: {
        destination: join(logsDir, 'info.log'),
        append: true
      }
    },
    // Error level logs to separate file
    {
      target: 'pino/file',
      level: 'error',
      options: {
        destination: join(logsDir, 'error.log'),
        append: true
      }
    }
  ]
});

// Create logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err
  }
}, transport);

// Custom exception logger
const exceptionLogger = pino({
  level: 'error',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
}, exceptionStream);

// Enhanced logging methods
const logInfo = (message, meta = {}) => {
  logger.info(meta, message);
};

const logError = (message, error = null, meta = {}) => {
  const errorMeta = error ? { error: error.message, stack: error.stack, ...meta } : meta;
  logger.error(errorMeta, message);
};

const logException = (error, context = 'Unknown') => {
  const exceptionData = {
    context,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };
  
  exceptionLogger.error(exceptionData, `Unhandled exception in ${context}`);
  logger.error(exceptionData, `Unhandled exception in ${context}`);
};

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };
    
    if (res.statusCode >= 400) {
      logError(`${req.method} ${req.url} - ${res.statusCode}`, null, logData);
    } else {
      logInfo(`${req.method} ${req.url} - ${res.statusCode}`, logData);
    }
  });
  
  next();
};

// Database operation logger
const logDatabaseOperation = (operation, table, duration, success = true, error = null) => {
  const logData = {
    operation,
    table,
    duration: `${duration}ms`,
    success
  };
  
  if (success) {
    logInfo(`Database ${operation} on ${table}`, logData);
  } else {
    logError(`Database ${operation} failed on ${table}`, error, logData);
  }
};

// Recovery operation logger
const logRecoveryOperation = (operation, disruptionId, details = {}) => {
  const logData = {
    operation,
    disruptionId,
    ...details
  };
  
  logInfo(`Recovery operation: ${operation}`, logData);
};

export {
  logger,
  logInfo,
  logError,
  logException,
  requestLogger,
  logDatabaseOperation,
  logRecoveryOperation
};

export default logger;
