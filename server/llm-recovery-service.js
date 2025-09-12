import { ChatPromptTemplate } from "@langchain/core/prompts";
import { generateRecoveryOptionsForDisruption } from './recovery-generator.js';
import { logInfo, logError } from './logger.js';
import { modelRouter } from './model-router.js';

class LLMRecoveryService {
  constructor() {
    this.modelRouter = modelRouter;
    this.basePrompt = this.createBasePrompt();
  }

  createBasePrompt() {
    return ChatPromptTemplate.fromTemplate(`
You are an expert flight operations recovery specialist. Generate {optionsCount} comprehensive recovery options for the following disruption.

Flight Information:
- Flight: {flightNumber} ({route})
- Aircraft: {aircraft}
- Scheduled: {scheduledDeparture}
- Current Status: {estimatedDeparture}
- Delay: {delayMinutes} minutes
- Passengers: {passengers}
- Crew: {crew}
- Issue: {disruptionType} - {disruptionReason}
- Severity: {severity}
- Category: {categoryName}

Generate exactly {optionsCount} recovery options in this JSON format:
{{
  "options": [
    {{
      "title": "Brief title",
      "description": "Detailed description",
      "cost": "AED X,XXX",
      "timeline": "X hours",
      "confidence": 85,
      "impact": "Medium",
      "status": "recommended",
      "priority": 1,
      "advantages": ["advantage 1", "advantage 2"],
      "considerations": ["consideration 1", "consideration 2"],
      "impact_area": ["crew", "passenger", "aircraft"],
      "cost_breakdown": {{
        "total": {{ "amount": "AED X,XXX", "description": "Total cost" }},
        "breakdown": [{{ "amount": "AED XXX", "category": "Operations", "percentage": 60 }}]
      }},
      "timeline_details": [{{
        "step": "Initial action",
        "status": "pending",
        "duration": "30 min",
        "startTime": "14:00",
        "endTime": "14:30"
      }}],
      "risk_assessment": [{{
        "risk": "Potential delay risk",
        "risk_impact": "Medium",
        "score": 5,
        "mitigation": "Monitor closely"
      }}]
    }}
  ],
  "steps": [
    {{
      "step": 1,
      "title": "Step title",
      "status": "pending",
      "timestamp": "{timestamp}",
      "system": "OPS",
      "details": "Step details"
    }}
  ]
}}

Return only valid JSON. No markdown formatting.`);
  }

  buildPromptData(disruptionData, categoryInfo = {}, optionsCount = 3) {
    return {
      optionsCount: optionsCount,
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
      categoryName: categoryInfo.category_name || 'General',
      timestamp: new Date().toISOString()
    };
  }

  async generateRecoveryOptions(disruptionData, categoryInfo = {}, optionsConfig = {}) {
    const config = {
      count: optionsConfig.count || 3,
      maxRetries: 2,
      ...optionsConfig
    };

    try {
      const llm = this.modelRouter.getProvider();
      const providerInfo = this.modelRouter.getCurrentProviderInfo();

      logInfo(`Generating ${config.count} recovery options with ${providerInfo.provider}`, {
        flight_number: disruptionData.flight_number,
        provider: providerInfo.provider,
        model: providerInfo.model,
        options_count: config.count
      });

      const promptData = this.buildPromptData(disruptionData, categoryInfo, config.count);
      const chain = this.basePrompt.pipe(llm);

      let attempt = 0;
      while (attempt < config.maxRetries) {
        try {
          const response = await chain.invoke(promptData);
          const result = this.parseResponse(response.content, disruptionData.flight_number);

          logInfo(`Successfully generated ${result.options.length} recovery options`, {
            flight_number: disruptionData.flight_number,
            provider: providerInfo.provider,
            options_generated: result.options.length,
            steps_generated: result.steps.length
          });

          return result;
        } catch (error) {
          attempt++;
          logError(`Attempt ${attempt} failed`, error, {
            flight_number: disruptionData.flight_number,
            attempt: attempt
          });

          if (attempt >= config.maxRetries) {
            throw error;
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    } catch (error) {
      logError('LLM generation failed, using fallback', error, {
        flight_number: disruptionData.flight_number,
        fallback: true
      });

      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }
  }

  parseResponse(content, flightNumber) {
    try {
      // Clean the response
      let cleaned = content.trim();

      // Remove markdown code blocks
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      // Find JSON boundaries
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(cleaned);

      // Validate structure
      if (!parsed.options || !Array.isArray(parsed.options)) {
        throw new Error('Invalid options array');
      }

      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid steps array');
      }

      // Normalize response
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

    } catch (error) {
      logError('Failed to parse LLM response', error, {
        flightNumber: flightNumber,
        contentPreview: content ? content.substring(0, 200) : 'empty'
      });
      throw new Error('Invalid LLM response format');
    }
  }

  fallbackToDefaultGenerator(disruptionData, categoryInfo) {
    logInfo('Using fallback recovery generator', {
      flight_number: disruptionData.flight_number,
      reason: 'LLM failed'
    });

    return generateRecoveryOptionsForDisruption(disruptionData, categoryInfo);
  }

  // Simple delegation methods
  async healthCheck() {
    return await this.modelRouter.healthCheck();
  }

  listProviders() {
    return this.modelRouter.listProviders();
  }

  switchProvider(providerName) {
    return this.modelRouter.switchProvider(providerName);
  }

  get llmProvider() {
    return this.modelRouter.getCurrentProviderInfo().provider;
  }
}

// Create singleton instance
const llmRecoveryService = new LLMRecoveryService();

export { llmRecoveryService };
export default LLMRecoveryService;