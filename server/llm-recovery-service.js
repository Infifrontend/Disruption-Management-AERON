
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { generateRecoveryOptionsForDisruption } from './recovery-generator.js';
import { logInfo, logError } from './logger.js';

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
      logInfo(`Initializing LLM Recovery Service with provider: ${this.llmProvider}`, {
        provider: this.llmProvider,
        model: this.model
      });

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
          logInfo('OpenAI LLM provider initialized successfully', { model: this.model });
          break;

        case 'anthropic':
          if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY environment variable is required for Anthropic provider');
          }
          this.llm = new ChatAnthropic({
            model: this.model || 'claude-3-sonnet-20240229',
            temperature: 0.7,
            apiKey: process.env.ANTHROPIC_API_KEY,
          });
          logInfo('Anthropic LLM provider initialized successfully', { model: this.model || 'claude-3-sonnet-20240229' });
          break;

        default:
          throw new Error(`Unsupported LLM provider: ${this.llmProvider}`);
      }

      // Initialize prompt template
      this.promptTemplate = this.createPromptTemplate();
      logInfo('LLM prompt template created successfully');
      
      // Create runnable chain
      this.chain = RunnableSequence.from([
        this.promptTemplate,
        this.llm,
        (response) => this.parseResponse(response.content)
      ]);

      logInfo(`LLM Recovery Service initialized successfully`, {
        provider: this.llmProvider,
        model: this.model,
        status: 'ready'
      });
    } catch (error) {
      logError('Failed to initialize LLM Recovery Service', error, {
        provider: this.llmProvider,
        model: this.model
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

  async generateRecoveryOptions(disruptionData, categoryInfo = {}) {
    const flightNumber = disruptionData.flight_number || 'Unknown';
    const disruptionType = disruptionData.disruption_type || 'Unknown';
    const category = categoryInfo.category_name || 'Unknown';

    if (!this.chain) {
      logError('LLM chain not available, falling back to default recovery generator', null, {
        flightNumber,
        disruptionType,
        category,
        provider: this.llmProvider
      });
      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }

    try {
      const startTime = Date.now();
      const promptVariables = this.buildPromptVariables(disruptionData, categoryInfo);
      
      logInfo(`Starting LLM recovery options generation`, {
        flightNumber,
        disruptionType,
        category,
        provider: this.llmProvider,
        model: this.model,
        passengers: disruptionData.passengers,
        delayMinutes: disruptionData.delay_minutes
      });
      
      const result = await this.chain.invoke(promptVariables);
      const duration = Date.now() - startTime;
      
      if (result && result.options && result.steps) {
        logInfo('LLM recovery options generated successfully', {
          flightNumber,
          disruptionType,
          category,
          provider: this.llmProvider,
          optionsCount: result.options.length,
          stepsCount: result.steps.length,
          duration: `${duration}ms`
        });
        return result;
      } else {
        throw new Error('Invalid LLM response format - missing options or steps arrays');
      }

    } catch (error) {
      logError('Failed to generate LLM recovery options', error, {
        flightNumber,
        disruptionType,
        category,
        provider: this.llmProvider,
        model: this.model,
        errorType: error.name || 'UnknownError'
      });
      
      logInfo('Falling back to default recovery generator', {
        flightNumber,
        disruptionType,
        reason: 'LLM generation failed'
      });
      
      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }
  }

  parseResponse(content) {
    try {
      logInfo('Parsing LLM response', {
        contentLength: content.length,
        hasMarkdown: content.includes('```')
      });

      // Clean the response to extract JSON
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        logInfo('Removed markdown code blocks from LLM response');
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

      logInfo('LLM response parsed successfully', {
        optionsCount: parsed.options.length,
        stepsCount: parsed.steps.length,
        hasValidStructure: true
      });

      return {
        options: parsed.options,
        steps: parsed.steps
      };

    } catch (error) {
      logError('Failed to parse LLM response', error, {
        contentLength: content.length,
        contentPreview: content.substring(0, 200),
        errorType: error.name
      });
      throw error;
    }
  }

  fallbackToDefaultGenerator(disruptionData, categoryInfo) {
    const flightNumber = disruptionData.flight_number || 'Unknown';
    const disruptionType = disruptionData.disruption_type || 'Unknown';
    
    logInfo('Using fallback default recovery generator', {
      flightNumber,
      disruptionType,
      category: categoryInfo.category_name || 'Unknown',
      reason: 'LLM service unavailable or failed'
    });

    try {
      const result = generateRecoveryOptionsForDisruption(disruptionData, categoryInfo);
      
      logInfo('Fallback recovery options generated successfully', {
        flightNumber,
        disruptionType,
        optionsCount: result.options?.length || 0,
        stepsCount: result.steps?.length || 0,
        source: 'default_generator'
      });

      return result;
    } catch (error) {
      logError('Fallback recovery generator failed', error, {
        flightNumber,
        disruptionType,
        category: categoryInfo.category_name || 'Unknown'
      });
      throw error;
    }
  }

  async healthCheck() {
    logInfo('Starting LLM health check', {
      provider: this.llmProvider,
      model: this.model
    });

    if (!this.llm) {
      logError('LLM health check failed - not initialized', null, {
        provider: this.llmProvider,
        model: this.model
      });
      return {
        status: 'unavailable',
        provider: this.llmProvider,
        error: 'LLM not initialized'
      };
    }

    try {
      const startTime = Date.now();
      // Simple test call
      const testMessage = { role: 'user', content: 'Hello' };
      await this.llm.invoke([testMessage]);
      const duration = Date.now() - startTime;

      logInfo('LLM health check passed', {
        provider: this.llmProvider,
        model: this.model,
        duration: `${duration}ms`,
        status: 'healthy'
      });

      return {
        status: 'healthy',
        provider: this.llmProvider,
        model: this.model
      };
    } catch (error) {
      logError('LLM health check failed', error, {
        provider: this.llmProvider,
        model: this.model,
        errorType: error.name
      });

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
