
export class ConnectionStabilityManager {
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private baseReconnectDelay = 1000
  private isReconnecting = false
  private lastSuccessTime = Date.now()

  async handleConnectionError<T>(
    operation: () => Promise<T>,
    fallback: () => T,
    operationName: string = 'operation'
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      console.warn(`${operationName} failed:`, error.message)
      
      if (!this.isReconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
        return await this.retryWithBackoff(operation, fallback, operationName)
      }
      
      console.log(`Using fallback for ${operationName}`)
      return fallback()
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    fallback: () => T,
    operationName: string
  ): Promise<T> {
    this.isReconnecting = true
    this.reconnectAttempts++
    
    // Exponential backoff with jitter
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1) + 
      Math.random() * 1000,
      10000
    )
    
    console.log(`Retrying ${operationName} (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`)
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    try {
      const result = await operation()
      this.resetConnection()
      this.lastSuccessTime = Date.now()
      return result
    } catch (error) {
      this.isReconnecting = false
      
      // Check if it's a network error that might recover
      const isNetworkError = error.message.includes('fetch') || 
                            error.message.includes('timeout') ||
                            error.message.includes('502') ||
                            error.message.includes('503')
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts || !isNetworkError) {
        console.error(`${operationName} failed after ${this.maxReconnectAttempts} attempts`)
        this.resetConnection()
        return fallback()
      }
      
      return await this.retryWithBackoff(operation, fallback, operationName)
    }
  }

  private resetConnection() {
    this.reconnectAttempts = 0
    this.isReconnecting = false
  }

  public forceReset() {
    this.resetConnection()
  }

  public isHealthy(): boolean {
    const timeSinceLastSuccess = Date.now() - this.lastSuccessTime
    return timeSinceLastSuccess < 30000 && !this.isReconnecting
  }

  public getStatus() {
    return {
      reconnectAttempts: this.reconnectAttempts,
      isReconnecting: this.isReconnecting,
      lastSuccessTime: this.lastSuccessTime,
      isHealthy: this.isHealthy()
    }
  }
}

export const connectionManager = new ConnectionStabilityManager()
