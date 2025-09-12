
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { logInfo, logError } from './logger.js';
import pino from 'pino';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ModelRouter {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
    this.llmLoggers = new Map();
    this.initializeProviders();
    this.initializeLLMLoggers();
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

  initializeLLMLoggers() {
    // Ensure LLM logs directory exists
    const llmLogsDir = join(__dirname, '../logs/llm');
    try {
      mkdirSync(llmLogsDir, { recursive: true });
      logInfo(`LLM logs directory created/verified at: ${llmLogsDir}`);
    } catch (err) {
      logError(`Failed to create LLM logs directory: ${err.message}`);
      return;
    }

    // Create logger for each provider
    const providerNames = ['openai', 'anthropic', 'gemini', 'grok'];
    
    providerNames.forEach(providerName => {
      const logPath = join(llmLogsDir, `${providerName}.log`);
      
      const transport = pino.transport({
        target: 'pino/file',
        options: {
          destination: logPath,
          mkdir: true
        }
      });

      const logger = pino({
        level: 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => ({ level: label })
        }
      }, transport);

      this.llmLoggers.set(providerName, logger);
      logInfo(`LLM logger initialized for ${providerName}`, { logPath });
    });
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

    const providerData = this.providers.get(targetProvider);
    const originalProvider = providerData.instance;
    
    // Wrap the provider with logging middleware
    return this.createLoggingWrapper(originalProvider, targetProvider);
  }

  createLoggingWrapper(provider, providerName) {
    const logger = this.llmLoggers.get(providerName);
    
    return {
      ...provider,
      invoke: async (input, options = {}) => {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        
        // Extract and sanitize input for logging
        const sanitizedInput = this.sanitizeInputForLogging(input);
        
        // Log request start
        logger.info({
          requestId,
          provider: providerName,
          model: this.providers.get(providerName).config.model,
          event: 'request_start',
          timestamp: new Date().toISOString(),
          input: sanitizedInput,
          options: {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            streaming: options.streaming || false
          }
        }, `LLM Request Started - ${providerName}`);

        try {
          // Call the original provider
          const response = await provider.invoke(input, options);
          const endTime = Date.now();
          const duration = endTime - startTime;

          // Extract response metrics
          const responseMetrics = this.extractResponseMetrics(response, providerName);
          
          // Log successful response
          logger.info({
            requestId,
            provider: providerName,
            model: this.providers.get(providerName).config.model,
            event: 'request_success',
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`,
            response: {
              content_length: response.content ? response.content.length : 0,
              content_preview: response.content ? response.content.substring(0, 200) : '',
              has_additional_kwargs: !!response.additional_kwargs,
              response_metadata: response.response_metadata || {}
            },
            metrics: responseMetrics,
            performance: {
              duration_ms: duration,
              tokens_per_second: responseMetrics.total_tokens ? (responseMetrics.total_tokens / (duration / 1000)).toFixed(2) : null,
              cost_estimate: this.estimateCost(responseMetrics, providerName)
            }
          }, `LLM Request Completed - ${providerName} (${duration}ms)`);

          return response;
          
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Log error
          logger.error({
            requestId,
            provider: providerName,
            model: this.providers.get(providerName).config.model,
            event: 'request_error',
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`,
            error: {
              message: error.message,
              type: error.constructor.name,
              code: error.code || null,
              status: error.status || null
            }
          }, `LLM Request Failed - ${providerName}`);

          throw error;
        }
      },
      
      stream: async (input, options = {}) => {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        
        const sanitizedInput = this.sanitizeInputForLogging(input);
        
        logger.info({
          requestId,
          provider: providerName,
          model: this.providers.get(providerName).config.model,
          event: 'stream_start',
          timestamp: new Date().toISOString(),
          input: sanitizedInput,
          streaming: true
        }, `LLM Stream Started - ${providerName}`);

        try {
          const stream = await provider.stream(input, options);
          
          // Wrap the stream to log completion
          const originalStream = stream;
          let tokenCount = 0;
          let contentLength = 0;
          
          const wrappedStream = {
            ...originalStream,
            [Symbol.asyncIterator]: async function* () {
              try {
                for await (const chunk of originalStream) {
                  if (chunk.content) {
                    tokenCount++;
                    contentLength += chunk.content.length;
                  }
                  yield chunk;
                }
                
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                logger.info({
                  requestId,
                  provider: providerName,
                  model: this.providers.get(providerName).config.model,
                  event: 'stream_complete',
                  timestamp: new Date().toISOString(),
                  duration: `${duration}ms`,
                  metrics: {
                    estimated_tokens: tokenCount,
                    content_length: contentLength,
                    chunks_received: tokenCount
                  },
                  performance: {
                    duration_ms: duration,
                    chunks_per_second: (tokenCount / (duration / 1000)).toFixed(2)
                  }
                }, `LLM Stream Completed - ${providerName}`);
                
              } catch (streamError) {
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                logger.error({
                  requestId,
                  provider: providerName,
                  event: 'stream_error',
                  timestamp: new Date().toISOString(),
                  duration: `${duration}ms`,
                  error: {
                    message: streamError.message,
                    type: streamError.constructor.name
                  }
                }, `LLM Stream Failed - ${providerName}`);
                
                throw streamError;
              }
            }.bind(this)
          };
          
          return wrappedStream;
          
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          logger.error({
            requestId,
            provider: providerName,
            event: 'stream_error',
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`,
            error: {
              message: error.message,
              type: error.constructor.name
            }
          }, `LLM Stream Failed - ${providerName}`);

          throw error;
        }
      }
    };
  }

  generateRequestId() {
    return `llm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sanitizeInputForLogging(input) {
    if (Array.isArray(input)) {
      return input.map(msg => ({
        role: msg.role || 'unknown',
        content: msg.content ? msg.content.substring(0, 500) + (msg.content.length > 500 ? '...' : '') : '',
        content_length: msg.content ? msg.content.length : 0
      }));
    }
    
    if (typeof input === 'string') {
      return {
        content: input.substring(0, 500) + (input.length > 500 ? '...' : ''),
        content_length: input.length
      };
    }
    
    return { type: typeof input, preview: String(input).substring(0, 100) };
  }

  extractResponseMetrics(response, providerName) {
    const metadata = response.response_metadata || {};
    
    // Common token usage patterns across providers
    const tokenUsage = metadata.tokenUsage || metadata.token_usage || metadata.usage || {};
    
    return {
      prompt_tokens: tokenUsage.promptTokens || tokenUsage.prompt_tokens || tokenUsage.input_tokens || null,
      completion_tokens: tokenUsage.completionTokens || tokenUsage.completion_tokens || tokenUsage.output_tokens || null,
      total_tokens: tokenUsage.totalTokens || tokenUsage.total_tokens || null,
      model: metadata.model || this.providers.get(providerName).config.model,
      finish_reason: metadata.finish_reason || metadata.stop_reason || null,
      provider_metadata: metadata
    };
  }

  estimateCost(metrics, providerName) {
    // Rough cost estimates (update with current pricing)
    const costPerToken = {
      openai: { input: 0.0000015, output: 0.000002 }, // GPT-3.5-turbo
      anthropic: { input: 0.000003, output: 0.000015 }, // Claude-3 Sonnet
      gemini: { input: 0.00000035, output: 0.00000105 }, // Gemini Pro
      grok: { input: 0.000005, output: 0.000015 } // Estimated
    };

    const pricing = costPerToken[providerName];
    if (!pricing || !metrics.prompt_tokens || !metrics.completion_tokens) {
      return null;
    }

    const inputCost = (metrics.prompt_tokens * pricing.input);
    const outputCost = (metrics.completion_tokens * pricing.output);
    const totalCost = inputCost + outputCost;

    return {
      input_cost_usd: inputCost.toFixed(6),
      output_cost_usd: outputCost.toFixed(6),
      total_cost_usd: totalCost.toFixed(6),
      currency: 'USD'
    };
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

  // Get usage analytics for a specific provider
  async getProviderAnalytics(providerName, timeRange = '24h') {
    const logger = this.llmLoggers.get(providerName);
    if (!logger) {
      return { error: 'Provider not found' };
    }

    // This is a simplified analytics - in production you'd want to parse log files
    // or use a proper analytics service
    return {
      provider: providerName,
      timeRange: timeRange,
      note: 'Analytics available in log files at logs/llm/',
      logPath: `logs/llm/${providerName}.log`
    };
  }

  // Get all LLM loggers for external access
  getLLMLoggers() {
    return Array.from(this.llmLoggers.keys()).map(provider => ({
      provider,
      logPath: `logs/llm/${provider}.log`,
      active: this.providers.has(provider)
    }));
  }
}

// Create singleton instance
const modelRouter = new ModelRouter();

export { modelRouter };
export default modelRouter;
