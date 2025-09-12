
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { logInfo, logError } from './logger.js';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ModelRouter {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
    this.initializeProviders();
    this.initializeLogging();
  }

  initializeLogging() {
    // Create logs/llm directory if it doesn't exist
    this.logsDir = join(__dirname, '../logs/llm');
    try {
      mkdirSync(this.logsDir, { recursive: true });
      logInfo('LLM logs directory created/verified', { logsDir: this.logsDir });
    } catch (error) {
      logError('Failed to create LLM logs directory', error, { logsDir: this.logsDir });
    }
  }

  getLogFilePath(providerName) {
    return join(this.logsDir, `${providerName}.log`);
  }

  logLLMRequest(providerName, requestData, responseData, metrics) {
    const logFilePath = this.getLogFilePath(providerName);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      provider: providerName,
      model: this.providers.get(providerName)?.config?.model || 'unknown',
      request: {
        messages: requestData.messages || requestData,
        messageCount: Array.isArray(requestData.messages) ? requestData.messages.length : Array.isArray(requestData) ? requestData.length : 1,
        inputTokensEstimate: this.estimateTokens(JSON.stringify(requestData))
      },
      response: {
        content: responseData?.content || responseData?.text || 'unknown',
        contentLength: responseData?.content?.length || responseData?.text?.length || 0,
        outputTokensEstimate: this.estimateTokens(responseData?.content || responseData?.text || '')
      },
      metrics: {
        duration: metrics.duration,
        success: metrics.success,
        error: metrics.error || null
      },
      usage: {
        totalTokensEstimate: this.estimateTokens(JSON.stringify(requestData)) + this.estimateTokens(responseData?.content || responseData?.text || ''),
        estimatedCost: this.estimateCost(providerName, requestData, responseData)
      }
    };

    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      appendFileSync(logFilePath, logLine);
    } catch (error) {
      logError(`Failed to write to LLM log file for ${providerName}`, error, { logFilePath });
    }
  }

  estimateTokens(text) {
    if (!text || typeof text !== 'string') return 0;
    // Rough estimation: ~4 characters per token for most models
    return Math.ceil(text.length / 4);
  }

  estimateCost(providerName, requestData, responseData) {
    const inputTokens = this.estimateTokens(JSON.stringify(requestData));
    const outputTokens = this.estimateTokens(responseData?.content || responseData?.text || '');
    
    // Rough cost estimates per 1K tokens (as of 2024)
    const costPer1KTokens = {
      openai: { input: 0.0015, output: 0.002 },
      anthropic: { input: 0.008, output: 0.024 },
      gemini: { input: 0.00075, output: 0.002 },
      grok: { input: 0.0015, output: 0.002 } // Assuming similar to OpenAI
    };

    const costs = costPer1KTokens[providerName.toLowerCase()] || costPer1KTokens.openai;
    const inputCost = (inputTokens / 1000) * costs.input;
    const outputCost = (outputTokens / 1000) * costs.output;
    
    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: parseFloat(inputCost.toFixed(6)),
      outputCost: parseFloat(outputCost.toFixed(6)),
      totalCost: parseFloat((inputCost + outputCost).toFixed(6)),
      currency: 'USD'
    };
  }

  wrapProviderWithLogging(provider, providerName) {
    const originalInvoke = provider.invoke.bind(provider);
    
    provider.invoke = async (input, options = {}) => {
      const startTime = Date.now();
      let responseData = null;
      let error = null;
      let success = false;

      try {
        logInfo(`LLM request started`, { 
          provider: providerName,
          model: this.providers.get(providerName)?.config?.model,
          inputPreview: typeof input === 'string' ? input.substring(0, 100) : JSON.stringify(input).substring(0, 100)
        });

        responseData = await originalInvoke(input, options);
        success = true;

        logInfo(`LLM request completed`, { 
          provider: providerName,
          duration: Date.now() - startTime,
          responseLength: responseData?.content?.length || 0
        });

        return responseData;
      } catch (err) {
        error = err.message;
        success = false;
        
        logError(`LLM request failed`, err, { 
          provider: providerName,
          duration: Date.now() - startTime
        });
        
        throw err;
      } finally {
        const metrics = {
          duration: Date.now() - startTime,
          success,
          error
        };

        // Log the request/response data
        this.logLLMRequest(providerName, input, responseData, metrics);
      }
    };

    return provider;
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

    let provider;
    switch (providerName.toLowerCase()) {
      case 'openai':
        provider = new ChatOpenAI({
          ...commonConfig,
          maxTokens: config.maxTokens
        });
        break;

      case 'anthropic':
        provider = new ChatAnthropic({
          ...commonConfig,
          maxTokens: config.maxTokens
        });
        break;

      case 'gemini':
        provider = new ChatGoogleGenerativeAI({
          ...commonConfig,
          maxOutputTokens: config.maxTokens
        });
        break;

      case 'grok':
        provider = new ChatOpenAI({
          ...commonConfig,
          maxTokens: config.maxTokens,
          baseURL: config.baseURL
        });
        break;

      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }

    // Wrap provider with logging middleware
    return this.wrapProviderWithLogging(provider, providerName);
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

  getProviderLogs(providerName, limit = 50) {
    const logFilePath = this.getLogFilePath(providerName);
    
    if (!existsSync(logFilePath)) {
      return { logs: [], totalCount: 0 };
    }

    try {
      const fs = require('fs');
      const content = fs.readFileSync(logFilePath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      const logs = lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(log => log !== null)
        .reverse();

      return {
        logs,
        totalCount: lines.length,
        provider: providerName
      };
    } catch (error) {
      logError(`Failed to read logs for ${providerName}`, error);
      return { logs: [], totalCount: 0, error: error.message };
    }
  }

  getAllProviderStats() {
    const stats = {};
    
    for (const providerName of this.providers.keys()) {
      const logs = this.getProviderLogs(providerName, 1000);
      
      if (logs.logs.length > 0) {
        const successfulRequests = logs.logs.filter(log => log.metrics.success);
        const totalCost = logs.logs.reduce((sum, log) => sum + (log.usage?.totalCost || 0), 0);
        const totalTokens = logs.logs.reduce((sum, log) => sum + (log.usage?.totalTokensEstimate || 0), 0);
        const avgDuration = logs.logs.reduce((sum, log) => sum + log.metrics.duration, 0) / logs.logs.length;

        stats[providerName] = {
          totalRequests: logs.totalCount,
          successfulRequests: successfulRequests.length,
          successRate: (successfulRequests.length / logs.logs.length * 100).toFixed(2) + '%',
          totalCost: parseFloat(totalCost.toFixed(4)),
          totalTokens,
          avgDuration: Math.round(avgDuration),
          model: this.providers.get(providerName)?.config?.model || 'unknown'
        };
      }
    }

    return stats;
  }
}

// Create singleton instance
const modelRouter = new ModelRouter();

export { modelRouter };
export default modelRouter;
