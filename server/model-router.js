
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { logInfo, logError } from './logger.js';

class ModelRouter {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
    this.initializeProviders();
  }

  initializeProviders() {
    const config = this.getConfiguration();
    
    logInfo('Initializing model router', {
      defaultProvider: config.defaultProvider,
      enabledProviders: Object.keys(config.providers).filter(p => config.providers[p].enabled)
    });

    // Initialize enabled providers
    Object.entries(config.providers).forEach(([name, providerConfig]) => {
      if (providerConfig.enabled && providerConfig.apiKey) {
        try {
          const provider = this.createProvider(name, providerConfig);
          this.providers.set(name, {
            instance: provider,
            config: providerConfig,
            status: 'ready'
          });
          logInfo(`Provider ${name} initialized`, { provider: name, model: providerConfig.model });
        } catch (error) {
          logError(`Failed to initialize ${name}`, error, { provider: name });
        }
      }
    });

    // Set default provider
    this.setDefaultProvider(config.defaultProvider);
  }

  getConfiguration() {
    return {
      defaultProvider: process.env.LLM_DEFAULT_PROVIDER || 'openai',
      providers: {
        openai: {
          enabled: process.env.OPENAI_API_KEY ? true : false,
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000')
        },
        anthropic: {
          enabled: process.env.ANTHROPIC_API_KEY ? true : false,
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
          temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '32000')
        },
        gemini: {
          enabled: process.env.GEMINI_API_KEY ? true : false,
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-pro',
          temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192')
        },
        grok: {
          enabled: process.env.GROK_API_KEY ? true : false,
          apiKey: process.env.GROK_API_KEY,
          model: process.env.GROK_MODEL || 'grok-beta',
          baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
          temperature: parseFloat(process.env.GROK_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.GROK_MAX_TOKENS || '4000')
        }
      }
    };
  }

  createProvider(providerName, config) {
    const commonConfig = {
      model: config.model,
      temperature: config.temperature,
      apiKey: config.apiKey
    };

    switch (providerName.toLowerCase()) {
      case 'openai':
        return new ChatOpenAI({
          ...commonConfig,
          maxTokens: config.maxTokens
        });

      case 'anthropic':
        return new ChatAnthropic({
          ...commonConfig,
          maxTokens: config.maxTokens
        });

      case 'gemini':
        return new ChatGoogleGenerativeAI({
          ...commonConfig,
          maxOutputTokens: config.maxTokens
        });

      case 'grok':
        return new ChatOpenAI({
          ...commonConfig,
          maxTokens: config.maxTokens,
          baseURL: config.baseURL
        });

      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  setDefaultProvider(providerName) {
    if (this.providers.has(providerName)) {
      this.currentProvider = providerName;
      logInfo(`Default provider set to ${providerName}`);
    } else {
      // Use first available provider
      const available = Array.from(this.providers.keys());
      if (available.length > 0) {
        this.currentProvider = available[0];
        logInfo(`Fallback to first available provider: ${this.currentProvider}`);
      } else {
        this.currentProvider = null;
        logError('No providers available');
      }
    }
  }

  getProvider(providerName = null) {
    const targetProvider = providerName || this.currentProvider;
    
    if (!targetProvider || !this.providers.has(targetProvider)) {
      throw new Error('No valid LLM provider available');
    }

    return this.providers.get(targetProvider).instance;
  }

  getCurrentProviderInfo() {
    if (!this.currentProvider) {
      return { provider: 'none', model: 'none' };
    }

    const config = this.providers.get(this.currentProvider)?.config;
    return {
      provider: this.currentProvider,
      model: config?.model || 'unknown'
    };
  }

  switchProvider(providerName) {
    if (!this.providers.has(providerName)) {
      throw new Error(`Provider ${providerName} not available`);
    }
    
    const oldProvider = this.currentProvider;
    this.currentProvider = providerName;
    
    logInfo(`Switched provider from ${oldProvider} to ${providerName}`);
    return { old: oldProvider, new: providerName };
  }

  listProviders() {
    return {
      current: this.currentProvider,
      available: Array.from(this.providers.keys()).map(name => ({
        name,
        model: this.providers.get(name).config.model,
        status: this.providers.get(name).status
      }))
    };
  }

  async healthCheck() {
    if (!this.currentProvider) {
      return { status: 'error', error: 'No provider available' };
    }

    try {
      const provider = this.getProvider();
      await provider.invoke([{ role: 'user', content: 'Hello' }]);
      
      return {
        status: 'healthy',
        provider: this.currentProvider,
        model: this.getCurrentProviderInfo().model
      };
    } catch (error) {
      logError(`Health check failed for ${this.currentProvider}`, error);
      return {
        status: 'error',
        provider: this.currentProvider,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const modelRouter = new ModelRouter();

export { modelRouter };
export default modelRouter;
