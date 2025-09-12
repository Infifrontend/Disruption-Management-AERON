import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { generateRecoveryOptionsForDisruption } from './recovery-generator.js';
import logger, { logInfo, logError, logException } from './logger.js';
import { modelRouter } from './model-router.js';
import { appendFile } from "fs/promises";

class PromptTemplateManager {
  constructor() {
    this.baseTemplate = this.createBaseTemplate();
    this.templates = {
      batch: this.createBatchTemplate(),
      single: this.createSingleTemplate(),
      streaming: this.createStreamingTemplate()
    };
  }

  createBaseTemplate() {
    return `You are an expert flight operations recovery specialist. Given the following flight disruption details, generate comprehensive recovery options.

Flight Disruption Information:
- Flight Number: {flightNumber}
- Route: {route}
- Aircraft: {aircraft}
- Scheduled Departure: {scheduledDeparture}
- Estimated Departure: {estimatedDeparture}
- Delay: {delayMinutes} minutes
- Passengers: {passengers}
- Crew: {crew}
- Disruption Type: {disruptionType}
- Disruption Reason: {disruptionReason}
- Severity: {severity}
- Category: {categoryName}

Generate recovery options in JSON format with the following structure:
{{
  "title": "Brief descriptive title",
  "description": "Detailed description of the recovery approach",
  "cost": "Estimated cost (e.g., 'AED 25,000')",
  "timeline": "Time to implement (e.g., '2-3 hours')",
  "confidence": number (1-100),
  "impact": "Low/Medium/High",
  "status": "recommended/caution/warning",
  "priority": number,
  "advantages": ["advantage 1", "advantage 2", "advantage 3"],
  "considerations": ["consideration 1", "consideration 2", "consideration 3"],
  "impact_area": ["crew", "passenger", "aircraft"],
  "impact_summary": "Brief summary of the recovery approach and its impact",
  "resource_requirements": [{{
    "title": "Resource Name",
    "subtitle": "Resource Description", 
    "availability": "Status",
    "status": "Current State",
    "location": "Where it's located",
    "eta": "Time to availability",
    "details": "Additional details"
  }}],
  "cost_breakdown": {{
    "breakdown": [{{
      "amount": "AED X,XXX",
      "category": "Category Name",
      "percentage": number,
      "description": "Description of cost component"
    }}],
    "total": {{
      "amount": "AED X,XXX",
      "title": "Total Estimated Cost",
      "description": "Brief cost description"
    }}
  }},
  "timeline_details": [{{
    "step": "Step Name",
    "status": "completed/in-progress/pending",
    "details": "Step description",
    "startTime": "HH:MM",
    "endTime": "HH:MM", 
    "duration": "X min"
  }}],
  "risk_assessment": [{{
    "risk": "Risk description",
    "risk_impact": "Low/Medium/High",
    "mitigation_impact": "Low/Medium/High", 
    "score": number (1-9),
    "mitigation": "Mitigation strategy"
  }}],
  "technical_specs": {{
    "implementation": {{
      "title": "Implementation",
      "details": "Implementation details"
    }},
    "systems_required": {{
      "title": "Systems required", 
      "details": ["System 1", "System 2"]
    }},
    "certifications": {{
      "title": "Certifications",
      "details": ["Cert 1", "Cert 2"]
    }}
  }},
  "metrics": {{
    "costEfficiency": number (1-100),
    "timeEfficiency": number (1-100), 
    "passengerSatisfaction": number (1-100),
    "crewViolations": number,
    "aircraftSwaps": number,
    "networkImpact": "None/Low/Medium/High"
  }}
}}

Also generate recovery steps:
{{
  "steps": [{{
    "step": number,
    "title": "Step title",
    "status": "completed/in-progress/pending", 
    "timestamp": "ISO timestamp",
    "system": "System name",
    "details": "Step details"
  }}]
}}`;
  }

  createBatchTemplate() {
    return this.baseTemplate + `

Generate exactly {requestedCount} recovery options for batch {batchIndex} of {totalBatches}.
Return only valid JSON with both "options" and "steps" arrays.`;
  }

  createSingleTemplate() {
    return this.baseTemplate + `

Generate exactly 1 comprehensive recovery option (option {optionNumber} of {totalOptions}). 
Focus on making this option unique and well-suited to the specific disruption context.
Return JSON format with exactly one option in "options" array and related steps in "steps" array.`;
  }

  createStreamingTemplate() {
    return this.baseTemplate + `

Generate {requestedCount} recovery options with streaming support.
Return only valid JSON with both "options" and "steps" arrays.`;
  }

  getTemplate(type) {
    return ChatPromptTemplate.fromTemplate(this.templates[type] || this.baseTemplate);
  }
}

class ResponseProcessor {
  constructor() {
    this.logFile = "./logs/llm-generated-options.log";
  }

  async processResponse(content, context = {}) {
    await this.logResponse(content, context);
    return this.parseAndValidate(content, context);
  }

  async logResponse(content, context) {
    try {
      const logEntry = `\n[${new Date().toISOString()}] ${context.provider || 'Unknown'} Response:\n${content}\n---\n`;
      await appendFile(this.logFile, logEntry);
      logInfo("LLM Response processed", {
        provider: context.provider,
        contentLength: content?.length || 0,
        flightNumber: context.flightNumber
      });
    } catch (error) {
      logError('Failed to log LLM response', error);
    }
  }

  parseAndValidate(content, context = {}) {
    try {
      const cleanedContent = this.cleanContent(content);
      const parsed = JSON.parse(cleanedContent);

      this.validateStructure(parsed);
      return this.normalizeResponse(parsed);

    } catch (error) {
      logError('Error parsing LLM response', error, {
        provider: context.provider,
        contentPreview: content ? content.substring(0, 200) + '...' : 'empty',
        contentLength: content ? content.length : 0,
        errorType: error.constructor.name,
        flightNumber: context.flightNumber
      });
      throw error;
    }
  }

  cleanContent(content) {
    let cleaned = content.trim();

    // Remove markdown code blocks
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    // Remove any leading/trailing non-JSON content
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    return cleaned;
  }

  validateStructure(parsed) {
    if (!parsed.options || !Array.isArray(parsed.options)) {
      throw new Error('Invalid options array in LLM response');
    }

    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error('Invalid steps array in LLM response');
    }

    // Validate each option has required fields
    parsed.options.forEach((option, index) => {
      if (!option.title || !option.description) {
        throw new Error(`Option ${index + 1} missing required fields`);
      }
    });
  }

  normalizeResponse(parsed) {
    return {
      options: parsed.options.map((option, index) => ({
        ...option,
        priority: option.priority || (index + 1),
        confidence: option.confidence || 80,
        impact: option.impact || 'Medium',
        status: option.status || 'recommended'
      })),
      steps: parsed.steps.map((step, index) => ({
        ...step,
        step: step.step || (index + 1),
        status: step.status || 'pending',
        timestamp: step.timestamp || new Date().toISOString()
      }))
    };
  }
}

class RetryManager {
  constructor(maxRetries = 2, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async executeWithRetry(operation, context = {}) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        logError(`Attempt ${attempt + 1} failed`, error, {
          ...context,
          attempt: attempt + 1,
          maxRetries: this.maxRetries
        });

        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

class LLMRecoveryService {
  constructor() {
    this.modelRouter = modelRouter;
    this.promptManager = new PromptTemplateManager();
    this.responseProcessor = new ResponseProcessor();
    this.retryManager = new RetryManager();
    this.initializeLLM();
  }

  initializeLLM() {
    try {
      // Get current provider info from model router
      const providers = this.modelRouter.listProviders();
      
      logInfo('LLM Recovery Service initialized with model router', {
        defaultProvider: providers.default,
        availableProviders: providers.available.map(p => `${p.name} (${p.model})`),
        status: 'initialized'
      });
    } catch (error) {
      logError('Failed to initialize LLM Recovery Service with model router', error, {
        status: 'initialization_failed'
      });
    }
  }

  get llm() {
    try {
      return this.modelRouter.getProvider();
    } catch (error) {
      logError('Failed to get LLM provider from model router', error);
      return null;
    }
  }

  get llmProvider() {
    const providers = this.modelRouter.listProviders();
    return providers.default || 'unknown';
  }

  get model() {
    const config = this.modelRouter.getProviderConfig();
    return config ? config.model : 'unknown';
  }

  buildPromptVariables(disruptionData, categoryInfo = {}) {
    return {
      flightNumber: disruptionData.flight_number || 'Unknown',
      route: disruptionData.route || `${disruptionData.origin} → ${disruptionData.destination}`,
      aircraft: disruptionData.aircraft || 'Unknown',
      scheduledDeparture: disruptionData.scheduled_departure || 'Unknown',
      estimatedDeparture: disruptionData.estimated_departure || 'Unknown', 
      delayMinutes: disruptionData.delay_minutes || 0,
      passengers: disruptionData.passengers || 0,
      crew: disruptionData.crew || 0,
      disruptionType: disruptionData.disruption_type || 'Unknown',
      disruptionReason: disruptionData.disruption_reason || 'Unknown',
      severity: disruptionData.severity || 'Medium',
      categoryName: categoryInfo.category_name || disruptionData.categorization || 'General'
    };
  }

  async generateRecoveryOptions(disruptionData, categoryInfo = {}, optionsConfig = {}) {
    const config = {
      count: optionsConfig.count || 3,
      stream: optionsConfig.stream || false,
      batchSize: optionsConfig.batchSize || 1,
      maxRetries: optionsConfig.maxRetries || 2,
      ...optionsConfig
    };

    if (!this.llm) {
      logError('LLM chain not available, falling back to default recovery generator', null, {
        provider: this.llmProvider,
        flight_number: disruptionData.flight_number,
        fallback: true
      });
      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }

    try {
      logInfo(`Generating ${config.count} LLM recovery options for flight ${disruptionData.flight_number}`, {
        flight_number: disruptionData.flight_number,
        provider: this.llmProvider,
        model: this.model,
        disruption_type: disruptionData.disruption_type,
        severity: disruptionData.severity,
        category: categoryInfo.category_name,
        options_count: config.count,
        streaming: config.stream
      });

      const strategy = this.selectGenerationStrategy(config);
      return await strategy.execute(disruptionData, categoryInfo, config);

    } catch (error) {
      logError('Error calling LLM', error, {
        flight_number: disruptionData.flight_number,
        provider: this.llmProvider,
        model: this.model,
        error_type: error.constructor.name,
        fallback: true
      });
      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }
  }

  selectGenerationStrategy(config) {
    if (config.stream) {
      return new StreamingGenerationStrategy(this);
    } else if (config.count > 1) {
      return new BatchGenerationStrategy(this);
    } else {
      return new SingleGenerationStrategy(this);
    }
  }

  async executeGeneration(templateType, variables, context = {}) {
    const operation = async () => {
      const prompt = this.promptManager.getTemplate(templateType);
      const chain = prompt.pipe(this.llm).pipe((response) => 
        this.responseProcessor.processResponse(response.content, {
          provider: this.llmProvider,
          flightNumber: variables.flightNumber,
          ...context
        })
      );

      return await chain.invoke(variables);
    };

    return await this.retryManager.executeWithRetry(operation, {
      provider: this.llmProvider,
      flightNumber: variables.flightNumber,
      templateType,
      ...context
    });
  }

  fallbackToDefaultGenerator(disruptionData, categoryInfo) {
    logInfo('Using fallback default recovery generator', {
      flight_number: disruptionData.flight_number,
      disruption_type: disruptionData.disruption_type,
      reason: 'LLM unavailable or failed',
      category: categoryInfo.category_name
    });
    return generateRecoveryOptionsForDisruption(disruptionData, categoryInfo);
  }

  async healthCheck() {
    try {
      return await this.modelRouter.healthCheck();
    } catch (error) {
      logError('Health check failed', error, {
        status: 'health_check_error'
      });
      return {
        status: 'error',
        error: error.message,
        provider: this.llmProvider
      };
    }
  }

  async healthCheckAll() {
    return await this.modelRouter.healthCheckAll();
  }

  listProviders() {
    return this.modelRouter.listProviders();
  }

  switchProvider(providerName) {
    try {
      const result = this.modelRouter.switchProvider(providerName);
      logInfo(`LLM provider switched successfully`, {
        oldProvider: result.old,
        newProvider: result.new,
        status: 'provider_switched'
      });
      return result;
    } catch (error) {
      logError(`Failed to switch provider to ${providerName}`, error, {
        targetProvider: providerName,
        status: 'provider_switch_failed'
      });
      throw error;
    }
  }
}

class BatchGenerationStrategy {
  constructor(service) {
    this.service = service;
  }

  async execute(disruptionData, categoryInfo, config) {
    const basePromptVariables = this.service.buildPromptVariables(disruptionData, categoryInfo);
    const allOptions = [];
    const allSteps = [];
    const batchCount = Math.ceil(config.count / config.batchSize);

    for (let batch = 0; batch < batchCount; batch++) {
      const startIndex = batch * config.batchSize;
      const endIndex = Math.min(startIndex + config.batchSize, config.count);
      const batchSize = endIndex - startIndex;

      const batchPromptVariables = {
        ...basePromptVariables,
        requestedCount: batchSize,
        batchIndex: batch + 1,
        totalBatches: batchCount
      };

      try {
        const batchResult = await this.service.executeGeneration('batch', batchPromptVariables, {
          batch: batch + 1,
          totalBatches: batchCount
        });

        if (batchResult && batchResult.options && batchResult.steps) {
          batchResult.options.forEach((option, index) => {
            option.priority = startIndex + index + 1;
            option.batch = batch + 1;
          });

          allOptions.push(...batchResult.options);
          allSteps.push(...batchResult.steps);

          logInfo(`Batch ${batch + 1}/${batchCount} completed successfully`, {
            flight_number: disruptionData.flight_number,
            batch_options: batchResult.options.length,
            batch_steps: batchResult.steps.length
          });
        }
      } catch (error) {
        logError(`Batch ${batch + 1} failed after retries, skipping`, error, {
          flight_number: disruptionData.flight_number,
          batch: batch + 1
        });
      }
    }

    if (allOptions.length === 0) {
      throw new Error('No recovery options generated from any batch');
    }

    return { options: allOptions, steps: allSteps };
  }
}

class SingleGenerationStrategy {
  constructor(service) {
    this.service = service;
  }

  async execute(disruptionData, categoryInfo, config) {
    const promptVariables = {
      ...this.service.buildPromptVariables(disruptionData, categoryInfo),
      optionNumber: 1,
      totalOptions: 1
    };

    const result = await this.service.executeGeneration('single', promptVariables);
    return result;
  }
}

class StreamingGenerationStrategy {
  constructor(service) {
    this.service = service;
  }

  async execute(disruptionData, categoryInfo, config) {
    const basePromptVariables = this.service.buildPromptVariables(disruptionData, categoryInfo);
    const allOptions = [];
    const allSteps = [];

    for (let i = 0; i < config.count; i++) {
      try {
        const optionPromptVariables = {
          ...basePromptVariables,
          optionNumber: i + 1,
          totalOptions: config.count
        };

        const result = await this.service.executeGeneration('single', optionPromptVariables, {
          streaming: true,
          optionIndex: i + 1
        });

        if (result && result.options && result.options.length > 0) {
          const option = result.options[0];
          option.priority = i + 1;
          allOptions.push(option);

          if (result.steps && result.steps.length > 0) {
            allSteps.push(...result.steps);
          }

          logInfo(`Streaming option ${i + 1}/${config.count} generated`, {
            flight_number: disruptionData.flight_number,
            option_title: option.title,
            streaming: true
          });

          if (config.onOptionGenerated) {
            await config.onOptionGenerated({
              option,
              index: i,
              total: config.count
            });
          }
        }
      } catch (error) {
        logError(`Error generating streaming option ${i + 1}`, error, {
          flight_number: disruptionData.flight_number,
          option_index: i + 1
        });
      }
    }

    return { options: allOptions, steps: allSteps };
  }
}

// Create singleton instance
const llmRecoveryService = new LLMRecoveryService();

export { llmRecoveryService };
export default LLMRecoveryService;