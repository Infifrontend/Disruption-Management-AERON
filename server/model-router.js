
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { logInfo, logError } from './logger.js';

class ModelRouter {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = null;
    this.initializeProviders();
  }

  initializeProviders() {
    const modelConfig = this.getModelConfiguration();
    
    logInfo('Initializing model router with configuration', {
      availableProviders: Object.keys(modelConfig.providers),
      defaultProvider: modelConfig.default,
      status: 'initializing'
    });

    // Initialize each configured provider
    Object.entries(modelConfig.providers).forEach(([providerName, config]) => {
      try {
        if (config.enabled && config.apiKey) {
          const provider = this.createProvider(providerName, config);
          if (provider) {
            this.providers.set(providerName, {
              instance: provider,
              config: config,
              status: 'healthy'
            });
            
            logInfo(`Provider ${providerName} initialized successfully`, {
              provider: providerName,
              model: config.model,
              status: 'initialized'
            });
          }
        } else {
          logInfo(`Provider ${providerName} skipped - disabled or missing API key`, {
            provider: providerName,
            enabled: config.enabled,
            hasApiKey: !!config.apiKey
          });
        }
      } catch (error) {
        logError(`Failed to initialize provider ${providerName}`, error, {
          provider: providerName,
          model: config.model,
          status: 'initialization_failed'
        });
      }
    });

    // Set default provider
    this.setDefaultProvider(modelConfig.default);
  }

  getModelConfiguration() {
    // Default configuration that can be overridden by environment variables
    const defaultConfig = {
      default: process.env.LLM_DEFAULT_PROVIDER || 'openai',
      providers: {
        openai: {
          enabled: process.env.OPENAI_ENABLED !== 'false',
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 4000,
          timeout: parseInt(process.env.OPENAI_TIMEOUT) || 60000
        },
        anthropic: {
          enabled: process.env.ANTHROPIC_ENABLED !== 'false',
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
          temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE) || 0.7,
          maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 32000,
          timeout: parseInt(process.env.ANTHROPIC_TIMEOUT) || 60000
        },
        gemini: {
          enabled: process.env.GEMINI_ENABLED === 'true',
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-pro',
          temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
          maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 8192,
          timeout: parseInt(process.env.GEMINI_TIMEOUT) || 60000
        },
        grok: {
          enabled: process.env.GROK_ENABLED === 'true',
          apiKey: process.env.GROK_API_KEY,
          model: process.env.GROK_MODEL || 'grok-beta',
          baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
          temperature: parseFloat(process.env.GROK_TEMPERATURE) || 0.7,
          maxTokens: parseInt(process.env.GROK_MAX_TOKENS) || 4000,
          timeout: parseInt(process.env.GROK_TIMEOUT) || 60000
        }
      }
    };

    return defaultConfig;
  }

  createProvider(providerName, config) {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return new ChatOpenAI({
          model: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          timeout: config.timeout,
          apiKey: config.apiKey,
        });

      case 'anthropic':
        return new ChatAnthropic({
          model: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          timeout: config.timeout,
          apiKey: config.apiKey,
        });

      case 'gemini':
        return new ChatGoogleGenerativeAI({
          model: config.model,
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
          apiKey: config.apiKey,
        });

      case 'grok':
        // Grok uses OpenAI-compatible API
        return new ChatOpenAI({
          model: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          timeout: config.timeout,
          apiKey: config.apiKey,
          baseURL: config.baseURL,
        });

      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  setDefaultProvider(providerName) {
    if (this.providers.has(providerName)) {
      this.defaultProvider = providerName;
      logInfo(`Default provider set to ${providerName}`, {
        provider: providerName,
        status: 'default_set'
      });
    } else {
      // Fallback to first available provider
      const availableProviders = Array.from(this.providers.keys());
      if (availableProviders.length > 0) {
        this.defaultProvider = availableProviders[0];
        logInfo(`Default provider ${providerName} not available, using ${this.defaultProvider}`, {
          requestedProvider: providerName,
          actualProvider: this.defaultProvider,
          availableProviders,
          status: 'fallback_used'
        });
      } else {
        this.defaultProvider = null;
        logError('No providers available', null, {
          requestedProvider: providerName,
          availableProviders: [],
          status: 'no_providers'
        });
      }
    }
  }

  getProvider(providerName = null) {
    const targetProvider = providerName || this.defaultProvider;
    
    if (!targetProvider) {
      throw new Error('No provider specified and no default provider available');
    }

    const provider = this.providers.get(targetProvider);
    if (!provider) {
      throw new Error(`Provider ${targetProvider} not found or not initialized`);
    }

    if (provider.status !== 'healthy') {
      logError(`Provider ${targetProvider} is not healthy`, null, {
        provider: targetProvider,
        status: provider.status
      });
    }

    return provider.instance;
  }

  getProviderConfig(providerName = null) {
    const targetProvider = providerName || this.defaultProvider;
    const provider = this.providers.get(targetProvider);
    return provider ? provider.config : null;
  }

  async healthCheck(providerName = null) {
    const targetProvider = providerName || this.defaultProvider;
    
    if (!targetProvider) {
      return {
        status: 'error',
        error: 'No provider specified and no default provider available',
        providers: []
      };
    }

    try {
      const provider = this.getProvider(targetProvider);
      const testMessage = [{ role: 'user', content: 'Hello' }];
      
      // Test the provider with a simple message
      await provider.invoke(testMessage);
      
      // Update provider status
      this.providers.get(targetProvider).status = 'healthy';
      
      return {
        status: 'healthy',
        provider: targetProvider,
        model: this.getProviderConfig(targetProvider)?.model
      };
    } catch (error) {
      // Update provider status
      if (this.providers.has(targetProvider)) {
        this.providers.get(targetProvider).status = 'unhealthy';
      }
      
      logError(`Health check failed for provider ${targetProvider}`, error, {
        provider: targetProvider,
        status: 'health_check_failed'
      });
      
      return {
        status: 'error',
        provider: targetProvider,
        error: error.message
      };
    }
  }

  async healthCheckAll() {
    const results = {};
    const providers = Array.from(this.providers.keys());
    
    for (const providerName of providers) {
      results[providerName] = await this.healthCheck(providerName);
    }
    
    return {
      defaultProvider: this.defaultProvider,
      providers: results,
      summary: {
        total: providers.length,
        healthy: Object.values(results).filter(r => r.status === 'healthy').length,
        unhealthy: Object.values(results).filter(r => r.status === 'error').length
      }
    };
  }

  listProviders() {
    return {
      default: this.defaultProvider,
      available: Array.from(this.providers.keys()).map(name => ({
        name,
        status: this.providers.get(name).status,
        model: this.providers.get(name).config.model
      }))
    };
  }

  switchProvider(providerName) {
    if (!this.providers.has(providerName)) {
      throw new Error(`Provider ${providerName} not available`);
    }
    
    const oldProvider = this.defaultProvider;
    this.defaultProvider = providerName;
    
    logInfo(`Switched default provider from ${oldProvider} to ${providerName}`, {
      oldProvider,
      newProvider: providerName,
      status: 'provider_switched'
    });
    
    return {
      old: oldProvider,
      new: providerName,
      status: 'switched'
    };
  }
}

// Create singleton instance
const modelRouter = new ModelRouter();

export { modelRouter, ModelRouter };
export default modelRouter;
