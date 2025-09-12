
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { generateRecoveryOptionsForDisruption } from './recovery-generator.js';
import { logInfo, logError, logException } from './logger.js';

// Test logger immediately on import
console.log('LLM Recovery Service: Testing logger...');
logInfo('LLM Recovery Service module loaded', { 
  timestamp: new Date().toISOString(),
  module: 'llm-recovery-service',
  status: 'initializing'
});

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
    console.log(`LLM Recovery Service: Initializing with provider ${this.llmProvider}`);
    logInfo('Starting LLM initialization', {
      provider: this.llmProvider,
      model: this.model,
      timestamp: new Date().toISOString()
    });
    
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

      console.log(`LLM Recovery Service initialized with ${this.llmProvider} provider`);
      logInfo(`LLM Recovery Service initialized with ${this.llmProvider} provider`, {
        provider: this.llmProvider,
        model: this.model,
        status: 'initialized'
      });
    } catch (error) {
      console.error(`Failed to initialize LLM: ${error.message}`, error);
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
    if (!this.chain) {
      logError('LLM chain not available, falling back to default recovery generator', null, {
        provider: this.llmProvider,
        flight_number: disruptionData.flight_number,
        fallback: true
      });
      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }

    try {
      const promptVariables = this.buildPromptVariables(disruptionData, categoryInfo);
      
      logInfo(`Generating LLM recovery options for flight ${disruptionData.flight_number}`, {
        flight_number: disruptionData.flight_number,
        provider: this.llmProvider,
        model: this.model,
        disruption_type: disruptionData.disruption_type,
        severity: disruptionData.severity,
        category: categoryInfo.category_name
      });
      
      const result = await this.chain.invoke(promptVariables);
      
      if (result && result.options && result.steps) {
        logInfo(`LLM generated recovery options successfully`, {
          flight_number: disruptionData.flight_number,
          provider: this.llmProvider,
          options_count: result.options.length,
          steps_count: result.steps.length,
          duration: 'success'
        });
        return result;
      } else {
        throw new Error('Invalid LLM response format');
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

  parseResponse(content) {
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
