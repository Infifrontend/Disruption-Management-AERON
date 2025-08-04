
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorCount = 0
  private lastErrorTime = 0
  private maxErrorsPerMinute = 10

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  handleError(error: Error, context: string = 'Unknown') {
    const now = Date.now()
    
    // Reset counter if more than a minute has passed
    if (now - this.lastErrorTime > 60000) {
      this.errorCount = 0
    }
    
    this.errorCount++
    this.lastErrorTime = now
    
    // Log error details
    console.error(`Error in ${context}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount
    })
    
    // If too many errors, suggest page refresh
    if (this.errorCount > this.maxErrorsPerMinute) {
      console.warn('Too many errors detected. Consider refreshing the page.')
      return true // Indicates should refresh
    }
    
    return false
  }

  reset() {
    this.errorCount = 0
    this.lastErrorTime = 0
  }
}

export const errorHandler = ErrorHandler.getInstance()
