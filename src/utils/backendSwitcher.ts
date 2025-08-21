
import { backendConfig } from '../services/backendConfig'
import { databaseService } from '../services/databaseService'
import { recoveryApiService } from '../services/recoveryApiService'

export const switchBackend = (type: 'express' | 'python') => {
  try {
    // Switch the backend configuration
    backendConfig.switchBackend(type)
    
    // Reinitialize services with new configuration
    // Note: This requires the services to support reinitialization
    console.log(`✅ Backend switched to ${type.toUpperCase()}`)
    
    // You might want to reload the page or reinitialize services here
    // window.location.reload() // Uncomment if you want to reload the page
    
    return true
  } catch (error) {
    console.error('❌ Failed to switch backend:', error)
    return false
  }
}

export const getCurrentBackend = () => {
  return backendConfig.getConfig()
import { backendConfig } from '../services/backendConfig'
import { databaseService } from '../services/databaseService'
import { recoveryApiService } from '../services/recoveryApiService'

export const getBackendStatus = async () => {
  const config = backendConfig.getConfig()
  
  try {
    // Test database service health
    const dbHealth = await databaseService.healthCheck()
    
    // Test recovery API health (if using Express)
    let recoveryHealth = true
    if (config.isExpress) {
      recoveryHealth = await recoveryApiService.healthCheck()
    }
    
    return {
      backend: config.type,
      apiUrl: config.apiUrl,
      databaseHealthy: dbHealth,
      recoveryHealthy: recoveryHealth,
      overall: dbHealth && recoveryHealth
    }
  } catch (error) {
    console.error('Error checking backend status:', error)
    return {
      backend: config.type,
      apiUrl: config.apiUrl,
      databaseHealthy: false,
      recoveryHealthy: false,
      overall: false
    }
  }
}
  }
}
