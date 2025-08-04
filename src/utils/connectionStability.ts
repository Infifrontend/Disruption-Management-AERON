
export class ConnectionStabilityManager {
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 2000
  private isReconnecting = false

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
    
    console.log(`Retrying ${operationName} (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay))
    
    try {
      const result = await operation()
      this.resetConnection()
      return result
    } catch (error) {
      this.isReconnecting = false
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
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
}

export const connectionManager = new ConnectionStabilityManager()
