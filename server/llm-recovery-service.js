
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
            maxTokens: 4000
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

  createSingleOptionPromptTemplate() {
    const template = `You are an expert flight operations recovery specialist. Generate ONE specific recovery option for the following flight disruption.

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

Generate option #{optionNumber} in JSON format. Be concise but comprehensive:

{{
  "option": {{
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
  }},
  "steps": [
    {{
      "step": number,
      "title": "Step title related to this option",
      "status": "completed/in-progress/pending", 
      "timestamp": "ISO timestamp",
      "system": "System name",
      "details": "Step details"
    }}
  ]
}}

Return only valid JSON.`;

    return ChatPromptTemplate.fromTemplate(template);
  }

  createStepsPromptTemplate() {
    const template = `Generate recovery steps for the following flight disruption:

Flight Disruption Information:
- Flight Number: {flightNumber}
- Route: {route}
- Aircraft: {aircraft}
- Disruption Type: {disruptionType}
- Disruption Reason: {disruptionReason}
- Severity: {severity}
- Category: {categoryName}

Generate {stepCount} recovery steps in JSON format:

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

Return only valid JSON.`;

    return ChatPromptTemplate.fromTemplate(template);
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

Please generate {optionsCount} recovery options in JSON format with the following structure for each option:
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

  async generateSingleOption(disruptionData, categoryInfo, optionNumber, config) {
    const promptTemplate = this.createSingleOptionPromptTemplate();
    const promptVariables = {
      ...this.buildPromptVariables(disruptionData, categoryInfo, config),
      optionNumber,
      maxTokens: config.maxTokensPerOption
    };

    const singleChain = RunnableSequence.from([
      promptTemplate,
      this.llm,
      (response) => this.parseSingleOptionResponse(response.content)
    ]);

    const result = await singleChain.invoke(promptVariables);
    return result;
  }

  async generateRecoverySteps(disruptionData, categoryInfo, config) {
    const promptTemplate = this.createStepsPromptTemplate();
    const promptVariables = {
      ...this.buildPromptVariables(disruptionData, categoryInfo, config),
      stepCount: config.stepCount
    };

    const stepsChain = RunnableSequence.from([
      promptTemplate,
      this.llm,
      (response) => this.parseStepsResponse(response.content)
    ]);

    const result = await stepsChain.invoke(promptVariables);
    return result;
  }

  buildPromptVariables(disruptionData, categoryInfo = {}, config = {}) {
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
      categoryName: categoryInfo.category_name || disruptionData.categorization || 'General',
      optionsCount: config.optionsCount || 3,
      includeSteps: config.includeSteps || true
    };
  }

  async generateRecoveryOptions(disruptionData, categoryInfo = {}, config = {}) {
    if (!this.chain) {
      logError('LLM chain not available, falling back to default recovery generator', null, {
        provider: this.llmProvider,
        flight_number: disruptionData.flight_number,
        fallback: true
      });
      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }

    // Default configuration
    const defaultConfig = {
      optionsCount: 3,
      maxTokensPerOption: 1500,
      includeSteps: true,
      stepCount: 5,
      incrementalGeneration: true
    };

    const finalConfig = { ...defaultConfig, ...config };

    try {
      logInfo(`Generating LLM recovery options for flight ${disruptionData.flight_number}`, {
        flight_number: disruptionData.flight_number,
        provider: this.llmProvider,
        model: this.model,
        disruption_type: disruptionData.disruption_type,
        severity: disruptionData.severity,
        category: categoryInfo.category_name,
        options_count: finalConfig.optionsCount,
        incremental: finalConfig.incrementalGeneration
      });

      if (finalConfig.incrementalGeneration) {
        return await this.generateIncrementalOptions(disruptionData, categoryInfo, finalConfig);
      } else {
        return await this.generateBatchOptions(disruptionData, categoryInfo, finalConfig);
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

  async generateIncrementalOptions(disruptionData, categoryInfo, config) {
    const allOptions = [];
    const allSteps = [];

    logInfo(`Starting incremental generation of ${config.optionsCount} options`, {
      flight_number: disruptionData.flight_number,
      provider: this.llmProvider
    });

    // Generate options one by one to avoid token limits
    for (let i = 0; i < config.optionsCount; i++) {
      try {
        const singleOptionResult = await this.generateSingleOption(disruptionData, categoryInfo, i + 1, config);
        
        if (singleOptionResult.option) {
          allOptions.push(singleOptionResult.option);
        }
        
        if (singleOptionResult.steps && singleOptionResult.steps.length > 0) {
          allSteps.push(...singleOptionResult.steps);
        }

        logInfo(`Generated option ${i + 1}/${config.optionsCount}`, {
          flight_number: disruptionData.flight_number,
          option_title: singleOptionResult.option?.title || 'Unknown'
        });

        // Small delay to avoid rate limiting
        if (i < config.optionsCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        logError(`Failed to generate option ${i + 1}`, error, {
          flight_number: disruptionData.flight_number,
          option_number: i + 1
        });
      }
    }

    // Generate common steps if not generated per option
    if (config.includeSteps && allSteps.length === 0) {
      try {
        const stepsResult = await this.generateRecoverySteps(disruptionData, categoryInfo, config);
        allSteps.push(...stepsResult.steps);
      } catch (error) {
        logError('Failed to generate recovery steps', error, {
          flight_number: disruptionData.flight_number
        });
      }
    }

    logInfo(`Incremental generation completed`, {
      flight_number: disruptionData.flight_number,
      total_options: allOptions.length,
      total_steps: allSteps.length
    });

    return {
      options: allOptions,
      steps: allSteps
    };
  }

  async generateBatchOptions(disruptionData, categoryInfo, config) {
    const promptVariables = this.buildPromptVariables(disruptionData, categoryInfo, config);
    const result = await this.chain.invoke(promptVariables);
    
    if (result && result.options && result.steps) {
      logInfo(`Batch generation completed successfully`, {
        flight_number: disruptionData.flight_number,
        provider: this.llmProvider,
        options_count: result.options.length,
        steps_count: result.steps.length
      });
      return result;
    } else {
      throw new Error('Invalid LLM response format');
    }
  }

  parseSingleOptionResponse(content) {
    appendFile("./logs/llm-generated-single-option.log", content + "\n---\n")
    logInfo("LLM Single Option Response", { contentLength: content.length })
    
    try {
      // Clean the response to extract JSON
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      // Try to parse the JSON
      const parsed = JSON.parse(cleanedContent);
      
      // Validate structure for single option
      if (!parsed.option) {
        throw new Error('Invalid option object in LLM response');
      }

      return {
        option: parsed.option,
        steps: parsed.steps || []
      };

    } catch (error) {
      logError('Error parsing single option LLM response', error, {
        provider: this.llmProvider,
        content_preview: content ? content.substring(0, 200) + '...' : 'empty',
        content_length: content ? content.length : 0,
        error_type: error.constructor.name
      });
      throw error;
    }
  }

  parseStepsResponse(content) {
    appendFile("./logs/llm-generated-steps.log", content + "\n---\n")
    logInfo("LLM Steps Response", { contentLength: content.length })
    
    try {
      // Clean the response to extract JSON
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      // Try to parse the JSON
      const parsed = JSON.parse(cleanedContent);
      
      // Validate structure for steps
      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid steps array in LLM response');
      }

      return {
        steps: parsed.steps
      };

    } catch (error) {
      logError('Error parsing steps LLM response', error, {
        provider: this.llmProvider,
        content_preview: content ? content.substring(0, 200) + '...' : 'empty',
        content_length: content ? content.length : 0,
        error_type: error.constructor.name
      });
      throw error;
    }
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
