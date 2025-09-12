
import pino from 'pino';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

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

// Verify directory exists
if (!existsSync(logsDir)) {
  console.error(`Logs directory does not exist: ${logsDir}`);
}

// Create write streams for different log levels with explicit paths
const infoLogPath = join(logsDir, 'info.log');
const errorLogPath = join(logsDir, 'error.log');
const exceptionLogPath = join(logsDir, 'exceptions.log');
const requestLogPath = join(logsDir, 'requests.log');

console.log(`Info log path: ${infoLogPath}`);
console.log(`Error log path: ${errorLogPath}`);
console.log(`Exception log path: ${exceptionLogPath}`);
console.log(`Request log path: ${requestLogPath}`);

// Create logger with multiple destinations using latest Pino transport API
const transport = pino.transport({
  targets: [
    // Info log file
    {
      target: 'pino/file',
      level: 'info',
      options: {
        destination: infoLogPath,
        mkdir: true
      }
    },
    // Error log file  
    {
      target: 'pino/file',
      level: 'error',
      options: {
        destination: errorLogPath,
        mkdir: true
      }
    }
  ]
});

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

// Create separate request logger
const requestTransport = pino.transport({
  target: 'pino/file',
  options: {
    destination: requestLogPath,
    mkdir: true
  }
});

const requestLogger = pino({
  level: 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
}, requestTransport);

// Custom exception logger with dedicated transport
const exceptionTransport = pino.transport({
  target: 'pino/file',
  options: {
    destination: exceptionLogPath,
    mkdir: true
  }
});

const exceptionLogger = pino({
  level: 'error',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
}, exceptionTransport);

// Enhanced logging methods
const logInfo = (message, meta = {}) => {
  // console.log(`[INFO] ${message}`, meta); // Console backup
  logger.info(meta, message);
};

const logError = (message, error = null, meta = {}) => {
  const errorMeta = error ? { error: error.message, stack: error.stack, ...meta } : meta;
  // console.error(`[ERROR] ${message}`, errorMeta); // Console backup
  logger.error(errorMeta, message);
};

const logException = (error, context = 'Unknown') => {
  const exceptionData = {
    context,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  console.error(`[EXCEPTION] Unhandled exception in ${context}`, exceptionData); // Console backup
  exceptionLogger.error(exceptionData, `Unhandled exception in ${context}`);
  logger.error(exceptionData, `Unhandled exception in ${context}`);
};

// Express middleware for request logging
const requestLoggerMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    };
    requestLogger.info(logData, `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
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

// Test logging function
const testLogging = () => {
  console.log('Testing logging functionality...');
  logInfo('Test info message', { test: true, timestamp: new Date().toISOString() });
  logError('Test error message', new Error('Test error'), { test: true, timestamp: new Date().toISOString() });
  console.log('Logging test completed. Check log files in logs/ directory.');
};

export {
  logger,
  logInfo,
  logError,
  logException,
  requestLoggerMiddleware,
  logDatabaseOperation,
  logRecoveryOperation,
  testLogging
};

export default logger;
