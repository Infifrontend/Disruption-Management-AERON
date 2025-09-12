
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { generateRecoveryOptionsForDisruption } from './recovery-generator.js';
import logger, { logInfo, logError, logException } from './logger.js';
import { appendFile } from "fs/promises";

class LLMRecoveryService {
  constructor() {
    this.llmProvider = process.env.LLM_PROVIDER || 'openai';
    this.model = process.env.LLM_MODEL || 'gpt-3.5-turbo';
    this.llm = null;
    this.promptTemplate = null;
    this.chain = null;
    this.initializeLLM();
  }

  initializeLLM() {
    try {
      // Initialize LLM based on provider
      switch (this.llmProvider.toLowerCase()) {
        case 'openai':
          if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider');
          }
          this.llm = new ChatOpenAI({
            model: this.model,
            temperature: 0.7,
            apiKey: process.env.OPENAI_API_KEY,
          });
          break;

        case 'anthropic':
          if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY environment variable is required for Anthropic provider');
          }
          this.llm = new ChatAnthropic({
            model: this.model || 'claude-3-sonnet-20240229',
            temperature: 0.7,
            apiKey: process.env.ANTHROPIC_API_KEY,
            maxTokens: 32000
          });
          break;

        default:
          throw new Error(`Unsupported LLM provider: ${this.llmProvider}`);
      }

      // Initialize prompt template
      this.promptTemplate = this.createPromptTemplate();
      
      // Create runnable chain
      this.chain = RunnableSequence.from([
        this.promptTemplate,
        this.llm,
        (response) => this.parseResponse(response.content)
      ]);

      logInfo(`LLM Recovery Service initialized with ${this.llmProvider} provider`, {
        provider: this.llmProvider,
        model: this.model,
        status: 'initialized'
      });
    } catch (error) {
      logError(`Failed to initialize LLM: ${error.message}`, error, {
        provider: this.llmProvider,
        model: this.model,
        status: 'initialization_failed'
      });
      this.llm = null;
      this.chain = null;
    }
  }

  createPromptTemplate() {
    const template = `You are an expert flight operations recovery specialist. Given the following flight disruption details, generate comprehensive recovery options.

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

Please generate 3 recovery options in JSON format with the following structure for each option:
{{
  "title": "Brief descriptive title",
  "description": "Detailed description of the recovery approach",
  "cost": "Estimated cost (e.g., 'AED 25,000')",
  "timeline": "Time to implement (e.g., '2-3 hours')",
  "confidence": number (1-100),
  "impact": "Low/Medium/High",
  "status": "recommended/caution/warning",
  "priority": number (1-3),
  "advantages": ["advantage 1", "advantage 2", "advantage 3"],
  "considerations": ["consideration 1", "consideration 2", "consideration 3"],
  "impact_area": ["crew", "passenger", "aircraft"] (select applicable),
  "impact_summary": "Brief summary of the recovery approach and its impact",
  "resource_requirements": [
    {{
      "title": "Resource Name",
      "subtitle": "Resource Description", 
      "availability": "Status",
      "status": "Current State",
      "location": "Where it's located",
      "eta": "Time to availability",
      "details": "Additional details"
    }}
  ],
  "cost_breakdown": {{
    "breakdown": [
      {{
        "amount": "AED X,XXX",
        "category": "Category Name",
        "percentage": number,
        "description": "Description of cost component"
      }}
    ],
    "total": {{
      "amount": "AED X,XXX",
      "title": "Total Estimated Cost",
      "description": "Brief cost description"
    }}
  }},
  "timeline_details": [
    {{
      "step": "Step Name",
      "status": "completed/in-progress/pending",
      "details": "Step description",
      "startTime": "HH:MM",
      "endTime": "HH:MM", 
      "duration": "X min"
    }}
  ],
  "risk_assessment": [
    {{
      "risk": "Risk description",
      "risk_impact": "Low/Medium/High",
      "mitigation_impact": "Low/Medium/High", 
      "score": number (1-9),
      "mitigation": "Mitigation strategy"
    }}
  ],
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

Also generate recovery steps in this format:
{{
  "steps": [
    {{
      "step": number,
      "title": "Step title",
      "status": "completed/in-progress/pending", 
      "timestamp": "ISO timestamp",
      "system": "System name",
      "details": "Step details"
    }}
  ]
}}

Return only valid JSON with both "options" and "steps" arrays.`;

    return ChatPromptTemplate.fromTemplate(template);
  }

  createBatchPromptTemplate(batchSize) {
    const template = `You are an expert flight operations recovery specialist. Generate {requestedCount} recovery options for this flight disruption (batch {batchIndex} of {totalBatches}).

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

Generate exactly {requestedCount} recovery options in JSON format. Each option should have this structure:
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
  "impact_area": ["crew", "passenger", "aircraft"] (select applicable),
  "impact_summary": "Brief summary of the recovery approach and its impact",
  "resource_requirements": [
    {{
      "title": "Resource Name",
      "subtitle": "Resource Description", 
      "availability": "Status",
      "status": "Current State",
      "location": "Where it's located",
      "eta": "Time to availability",
      "details": "Additional details"
    }}
  ],
  "cost_breakdown": {{
    "breakdown": [
      {{
        "amount": "AED X,XXX",
        "category": "Category Name",
        "percentage": number,
        "description": "Description of cost component"
      }}
    ],
    "total": {{
      "amount": "AED X,XXX",
      "title": "Total Estimated Cost",
      "description": "Brief cost description"
    }}
  }},
  "timeline_details": [
    {{
      "step": "Step Name",
      "status": "completed/in-progress/pending",
      "details": "Step description",
      "startTime": "HH:MM",
      "endTime": "HH:MM", 
      "duration": "X min"
    }}
  ],
  "risk_assessment": [
    {{
      "risk": "Risk description",
      "risk_impact": "Low/Medium/High",
      "mitigation_impact": "Low/Medium/High", 
      "score": number (1-9),
      "mitigation": "Mitigation strategy"
    }}
  ],
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
  "steps": [
    {{
      "step": number,
      "title": "Step title",
      "status": "completed/in-progress/pending", 
      "timestamp": "ISO timestamp",
      "system": "System name",
      "details": "Step details"
    }}
  ]
}}

Return only valid JSON with both "options" and "steps" arrays.`;

    return ChatPromptTemplate.fromTemplate(template);
  }

  createSingleOptionPromptTemplate() {
    const template = `You are an expert flight operations recovery specialist. Generate recovery option {optionNumber} of {totalOptions} for this flight disruption.

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

Generate exactly 1 comprehensive recovery option with detailed analysis. Focus on making this option unique and well-suited to the specific disruption context.

Return JSON format with exactly one option in "options" array and related steps in "steps" array:
{{
  "options": [{{
    "title": "Brief descriptive title for option {optionNumber}",
    "description": "Detailed description of the recovery approach",
    "cost": "Estimated cost (e.g., 'AED 25,000')",
    "timeline": "Time to implement (e.g., '2-3 hours')",
    "confidence": number (1-100),
    "impact": "Low/Medium/High",
    "status": "recommended/caution/warning",
    "priority": {optionNumber},
    "advantages": ["advantage 1", "advantage 2", "advantage 3"],
    "considerations": ["consideration 1", "consideration 2", "consideration 3"],
    "impact_area": ["crew", "passenger", "aircraft"],
    "impact_summary": "Brief summary of the recovery approach and its impact",
    "resource_requirements": [
    {{
      "title": "Resource Name",
      "subtitle": "Resource Description", 
      "availability": "Status",
      "status": "Current State",
      "location": "Where it's located",
      "eta": "Time to availability",
      "details": "Additional details"
    }}
  ],
  "cost_breakdown": {{
    "breakdown": [
      {{
        "amount": "AED X,XXX",
        "category": "Category Name",
        "percentage": number,
        "description": "Description of cost component"
      }}
    ],
    "total": {{
      "amount": "AED X,XXX",
      "title": "Total Estimated Cost",
      "description": "Brief cost description"
    }}
  }},
  "timeline_details": [
    {{
      "step": "Step Name",
      "status": "completed/in-progress/pending",
      "details": "Step description",
      "startTime": "HH:MM",
      "endTime": "HH:MM", 
      "duration": "X min"
    }}
  ],
  "risk_assessment": [
    {{
      "risk": "Risk description",
      "risk_impact": "Low/Medium/High",
      "mitigation_impact": "Low/Medium/High", 
      "score": number (1-9),
      "mitigation": "Mitigation strategy"
    }}
  ],
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
  }}],
  "steps": [
    {{
      "step": {optionNumber},
      "title": "Step title for option {optionNumber}",
      "status": "pending", 
      "timestamp": "ISO timestamp",
      "system": "System name",
      "details": "Step details"
    }}
  ]
}}`;

    return ChatPromptTemplate.fromTemplate(template);
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
    // Default options config
    const config = {
      count: optionsConfig.count || 3,
      stream: optionsConfig.stream || false,
      batchSize: optionsConfig.batchSize || 1,
      maxRetries: optionsConfig.maxRetries || 2,
      ...optionsConfig
    };

    if (!this.chain) {
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

      if (config.stream) {
        return await this.generateOptionsWithStreaming(disruptionData, categoryInfo, config);
      } else {
        return await this.generateOptionsBatch(disruptionData, categoryInfo, config);
      }

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

  async generateOptionsBatch(disruptionData, categoryInfo, config) {
    const basePromptVariables = this.buildPromptVariables(disruptionData, categoryInfo);
    const allOptions = [];
    const allSteps = [];
    const batchCount = Math.ceil(config.count / config.batchSize);

    // Generate options in batches to handle large counts efficiently
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

      let retryCount = 0;
      let batchResult = null;

      while (retryCount <= config.maxRetries && !batchResult) {
        try {
          const prompt = this.createBatchPromptTemplate(batchSize);
          const batchChain = prompt.pipe(this.llm).pipe((response) => this.parseResponse(response.content));
          
          batchResult = await batchChain.invoke(batchPromptVariables);
          
          if (batchResult && batchResult.options && batchResult.steps) {
            // Add batch-specific numbering to options
            batchResult.options.forEach((option, index) => {
              option.priority = startIndex + index + 1;
              option.batch = batch + 1;
            });

            allOptions.push(...batchResult.options);
            allSteps.push(...batchResult.steps);

            logInfo(`Batch ${batch + 1}/${batchCount} completed successfully`, {
              flight_number: disruptionData.flight_number,
              batch_options: batchResult.options.length,
              batch_steps: batchResult.steps.length,
              retry_count: retryCount
            });
          } else {
            throw new Error('Invalid batch response format');
          }

        } catch (error) {
          retryCount++;
          logError(`Batch ${batch + 1} attempt ${retryCount} failed`, error, {
            flight_number: disruptionData.flight_number,
            batch: batch + 1,
            retry_count: retryCount,
            max_retries: config.maxRetries
          });

          if (retryCount > config.maxRetries) {
            // Continue with next batch if this one fails completely
            logError(`Batch ${batch + 1} failed after ${config.maxRetries} retries, skipping`, error, {
              flight_number: disruptionData.flight_number,
              batch: batch + 1
            });
            break;
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    if (allOptions.length === 0) {
      throw new Error('No recovery options generated from any batch');
    }

    logInfo(`LLM generated recovery options successfully`, {
      flight_number: disruptionData.flight_number,
      provider: this.llmProvider,
      total_options: allOptions.length,
      total_steps: allSteps.length,
      requested_count: config.count,
      batches_processed: batchCount
    });

    return {
      options: allOptions,
      steps: allSteps
    };
  }

  async generateOptionsWithStreaming(disruptionData, categoryInfo, config) {
    // For streaming, we'll generate options one by one and yield results
    const basePromptVariables = this.buildPromptVariables(disruptionData, categoryInfo);
    const allOptions = [];
    const allSteps = [];

    for (let i = 0; i < config.count; i++) {
      try {
        const optionPromptVariables = {
          ...basePromptVariables,
          optionNumber: i + 1,
          totalOptions: config.count
        };

        const singleOptionPrompt = this.createSingleOptionPromptTemplate();
        const streamingChain = singleOptionPrompt.pipe(this.llm).pipe((response) => this.parseResponse(response.content));

        const result = await streamingChain.invoke(optionPromptVariables);

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

          // If callback is provided for streaming, call it
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
        // Continue with next option
      }
    }

    return {
      options: allOptions,
      steps: allSteps
    };
  }

  parseResponse(content) {
    appendFile("./logs/llm-generated-options.log", content)
    logInfo("LLM Response", content)
    try {
      // Clean the response to extract JSON
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      // Try to parse the JSON
      const parsed = JSON.parse(cleanedContent);
      
      // Validate structure
      if (!parsed.options || !Array.isArray(parsed.options)) {
        throw new Error('Invalid options array in LLM response');
      }
      
      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid steps array in LLM response');
      }

      return {
        options: parsed.options,
        steps: parsed.steps
      };

    } catch (error) {
      logError('Error parsing LLM response', error, {
        provider: this.llmProvider,
        content_preview: content ? content.substring(0, 200) + '...' : 'empty',
        content_length: content ? content.length : 0,
        error_type: error.constructor.name
      });
      throw error;
    }
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
    if (!this.llm) {
      return {
        status: 'unavailable',
        provider: this.llmProvider,
        error: 'LLM not initialized'
      };
    }

    try {
      // Simple test call
      const testMessage = { role: 'user', content: 'Hello' };
      await this.llm.invoke([testMessage]);
      return {
        status: 'healthy',
        provider: this.llmProvider,
        model: this.model
      };
    } catch (error) {
      return {
        status: 'error', 
        provider: this.llmProvider,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const llmRecoveryService = new LLMRecoveryService();

export { llmRecoveryService };
export default LLMRecoveryService;
