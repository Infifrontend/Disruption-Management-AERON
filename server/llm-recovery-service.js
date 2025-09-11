
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatCohere } from "@langchain/cohere";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { generateRecoveryOptionsForDisruption } from './recovery-generator.js';

class LLMRecoveryService {
  constructor() {
    this.llmProvider = process.env.LLM_PROVIDER || 'openai';
    this.model = process.env.LLM_MODEL || 'gpt-3.5-turbo';
    this.llm = null;
    this.chain = null;
    this.disruptionCache = new Map();
    this.initializeLLM();
  }

  /**
   * Get LLM provider instance based on configuration
   */
  getLLMProvider() {
    const provider = this.llmProvider.toLowerCase();
    
    switch (provider) {
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider');
        }
        return new ChatOpenAI({
          modelName: this.model,
          temperature: 0.7,
          openAIApiKey: process.env.OPENAI_API_KEY,
          maxTokens: 4000,
        });

      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY environment variable is required for Anthropic provider');
        }
        return new ChatAnthropic({
          modelName: this.model || 'claude-3-sonnet-20240229',
          temperature: 0.7,
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
          maxTokens: 4000,
        });

      case 'google':
      case 'google-genai':
        if (!process.env.GOOGLE_API_KEY) {
          throw new Error('GOOGLE_API_KEY environment variable is required for Google provider');
        }
        return new ChatGoogleGenerativeAI({
          modelName: this.model || 'gemini-pro',
          temperature: 0.7,
          apiKey: process.env.GOOGLE_API_KEY,
        });

      case 'cohere':
        if (!process.env.COHERE_API_KEY) {
          throw new Error('COHERE_API_KEY environment variable is required for Cohere provider');
        }
        return new ChatCohere({
          model: this.model || 'command',
          temperature: 0.7,
          apiKey: process.env.COHERE_API_KEY,
        });

      case 'huggingface':
      case 'hf':
        if (!process.env.HUGGINGFACE_API_KEY) {
          throw new Error('HUGGINGFACE_API_KEY environment variable is required for HuggingFace provider');
        }
        return new HuggingFaceInference({
          model: this.model || 'microsoft/DialoGPT-medium',
          apiKey: process.env.HUGGINGFACE_API_KEY,
          temperature: 0.7,
        });

      default:
        throw new Error(`Unsupported LLM provider: ${provider}. Supported providers: openai, anthropic, google, cohere, huggingface`);
    }
  }

  initializeLLM() {
    try {
      this.llm = this.getLLMProvider();
      this.initializeChain();
      console.log(`✅ LLM Recovery Service initialized with ${this.llmProvider} provider (${this.model})`);
    } catch (error) {
      console.error(`❌ Failed to initialize LLM: ${error.message}`);
      this.llm = null;
      this.chain = null;
    }
  }

  /**
   * Initialize the LangChain chain with modern RunnableSequence
   */
  initializeChain() {
    if (!this.llm) return;

    const promptTemplate = this.createPromptTemplate();
    const outputParser = new StringOutputParser();

    this.chain = RunnableSequence.from([
      promptTemplate,
      this.llm,
      outputParser,
    ]);
  }

  createPromptTemplate() {
    const template = `
You are an expert flight operations recovery specialist. Given the following flight disruption details, generate comprehensive recovery options.

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

Return only valid JSON with both "options" and "steps" arrays.
`;

    return PromptTemplate.fromTemplate(template);
  }

  /**
   * Cache disruption data to avoid repeated database queries
   */
  cacheDisruptionData(disruptionId, data) {
    this.disruptionCache.set(disruptionId, {
      data,
      timestamp: Date.now(),
      ttl: 300000 // 5 minutes
    });
  }

  getCachedDisruptionData(disruptionId) {
    const cached = this.disruptionCache.get(disruptionId);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.disruptionCache.delete(disruptionId);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Build prompt variables from disruption data
   */
  buildPromptVariables(disruptionData, categoryInfo = {}) {
    return {
      flightNumber: disruptionData.flight_number || 'Unknown',
      route: disruptionData.route || `${disruptionData.origin || 'UNK'} → ${disruptionData.destination || 'UNK'}`,
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
    if (!this.llm || !this.chain) {
      console.warn('LLM not available, falling back to default recovery generator');
      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }

    try {
      const promptVariables = this.buildPromptVariables(disruptionData, categoryInfo);

      console.log(`Generating LLM recovery options for flight ${disruptionData.flight_number} using ${this.llmProvider}`);
      
      const response = await this.chain.invoke(promptVariables);

      // Parse LLM response
      const parsedResponse = this.parseLLMResponse(response);
      
      if (parsedResponse && parsedResponse.options && parsedResponse.steps) {
        console.log(`✅ LLM generated ${parsedResponse.options.length} options and ${parsedResponse.steps.length} steps`);
        return parsedResponse;
      } else {
        throw new Error('Invalid LLM response format');
      }

    } catch (error) {
      console.error(`Error calling LLM (${this.llmProvider}):`, error.message);
      console.warn('Falling back to default recovery generator');
      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }
  }

  parseLLMResponse(llmOutput) {
    try {
      // Clean the response to extract JSON
      let cleanedOutput = llmOutput.trim();
      
      // Remove markdown code blocks if present
      if (cleanedOutput.startsWith('```')) {
        cleanedOutput = cleanedOutput.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      // Handle different response formats from different providers
      if (cleanedOutput.includes('"options"') && cleanedOutput.includes('"steps"')) {
        // Direct JSON format
        const parsed = JSON.parse(cleanedOutput);
        return this.validateParsedResponse(parsed);
      } else {
        // Try to extract JSON from text response
        const jsonMatch = cleanedOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return this.validateParsedResponse(parsed);
        }
        throw new Error('No valid JSON found in response');
      }

    } catch (error) {
      console.error('Error parsing LLM response:', error.message);
      console.error('Raw LLM output (first 500 chars):', llmOutput.substring(0, 500));
      return null;
    }
  }

  validateParsedResponse(parsed) {
    // Validate structure
    if (!parsed.options || !Array.isArray(parsed.options)) {
      throw new Error('Invalid options array in LLM response');
    }
    
    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error('Invalid steps array in LLM response');
    }

    // Ensure minimum required fields in options
    parsed.options = parsed.options.map((option, index) => ({
      title: option.title || `Recovery Option ${index + 1}`,
      description: option.description || 'Generated recovery option',
      cost: option.cost || 'TBD',
      timeline: option.timeline || 'TBD',
      confidence: option.confidence || 80,
      impact: option.impact || 'Medium',
      status: option.status || 'recommended',
      priority: option.priority || (index + 1),
      advantages: Array.isArray(option.advantages) ? option.advantages : [],
      considerations: Array.isArray(option.considerations) ? option.considerations : [],
      ...option
    }));

    // Ensure minimum required fields in steps
    parsed.steps = parsed.steps.map((step, index) => ({
      step: step.step || (index + 1),
      title: step.title || `Step ${index + 1}`,
      status: step.status || 'pending',
      timestamp: step.timestamp || new Date().toISOString(),
      system: step.system || 'LLM Generator',
      details: step.details || 'Recovery step details',
      ...step
    }));

    return {
      options: parsed.options,
      steps: parsed.steps
    };
  }

  fallbackToDefaultGenerator(disruptionData, categoryInfo) {
    console.log('Using fallback default recovery generator');
    return generateRecoveryOptionsForDisruption(disruptionData, categoryInfo);
  }

  async healthCheck() {
    if (!this.llm || !this.chain) {
      return {
        status: 'unavailable',
        provider: this.llmProvider,
        model: this.model,
        error: 'LLM not initialized'
      };
    }

    try {
      // Simple test call with timeout
      const testPrompt = "Respond with just 'OK' to confirm you're working.";
      const testResponse = await Promise.race([
        this.llm.invoke([{ role: 'user', content: testPrompt }]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 10000)
        )
      ]);
      
      return {
        status: 'healthy',
        provider: this.llmProvider,
        model: this.model,
        testResponse: testResponse?.content?.substring(0, 100) || 'No response'
      };
    } catch (error) {
      return {
        status: 'error', 
        provider: this.llmProvider,
        model: this.model,
        error: error.message
      };
    }
  }

  /**
   * Switch provider dynamically
   */
  async switchProvider(newProvider, newModel = null) {
    const oldProvider = this.llmProvider;
    const oldModel = this.model;
    
    try {
      this.llmProvider = newProvider;
      if (newModel) this.model = newModel;
      
      this.initializeLLM();
      
      if (!this.llm) {
        throw new Error(`Failed to initialize ${newProvider} provider`);
      }
      
      console.log(`✅ Switched from ${oldProvider} to ${newProvider} provider`);
      return true;
    } catch (error) {
      // Rollback on failure
      this.llmProvider = oldProvider;
      this.model = oldModel;
      this.initializeLLM();
      
      console.error(`❌ Failed to switch to ${newProvider}:`, error.message);
      throw error;
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    const providers = [];
    
    if (process.env.OPENAI_API_KEY) providers.push('openai');
    if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
    if (process.env.GOOGLE_API_KEY) providers.push('google');
    if (process.env.COHERE_API_KEY) providers.push('cohere');
    if (process.env.HUGGINGFACE_API_KEY) providers.push('huggingface');
    
    return providers;
  }

  /**
   * Clear disruption cache
   */
  clearCache() {
    this.disruptionCache.clear();
    console.log('LLM service cache cleared');
  }
}

// Create singleton instance
const llmRecoveryService = new LLMRecoveryService();

export { llmRecoveryService };
export default LLMRecoveryService;
