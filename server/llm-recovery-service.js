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
You are an expert flight operations recovery specialist with deep knowledge of airline operations, crew regulations, aircraft maintenance, and passenger rights. Generate {optionsCount} comprehensive recovery options for the following disruption, following industry best practices and regulatory compliance.

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

Based on the disruption category, consider these recovery strategies:
- Aircraft Issues: Aircraft swap, delay for repair, cancellation with rebooking
- Crew Issues: Standby crew assignment, crew positioning, delay for rest completion
- Weather Issues: Delay for clearance, rerouting, cancellation
- Curfew/Congestion: Aircraft swap for earlier slot, overnight delay, alternative routing
- Rotation/Maintenance: Alternative aircraft assignment, schedule adjustments

Generate exactly {optionsCount} recovery options with realistic costs, timelines, and operational details:

{{
  "options": [
    {{
      "title": "Specific recovery action title",
      "description": "Detailed operational description with specific actions and procedures",
      "cost": "AED X,XXX",
      "timeline": "X hours/minutes",
      "confidence": 85,
      "impact": "Low/Medium/High passenger/operational impact",
      "status": "recommended/caution/warning",
      "priority": 1,
      "advantages": [
        "Specific operational advantage",
        "Cost/time efficiency benefit",
        "Passenger satisfaction benefit"
      ],
      "considerations": [
        "Specific operational constraint",
        "Resource requirement",
        "Potential risk factor"
      ],
      "impact_area": ["crew", "passenger", "aircraft", "operations"],
      "impact_summary": "Comprehensive impact analysis for {flightNumber}: Brief summary of how this recovery affects operations, passengers, crew, and network.",
      "resource_requirements": [
        {{
          "title": "Resource Type",
          "subtitle": "Specific Resource",
          "availability": "Status",
          "status": "Confirmed/Pending/Available",
          "location": "Location details",
          "eta": "Time estimate",
          "details": "Additional resource details"
        }}
      ],
      "cost_breakdown": {{
        "breakdown": [
          {{
            "amount": "AED X,XXX",
            "category": "Category Name",
            "percentage": 60,
            "description": "Cost component description"
          }}
        ],
        "total": {{
          "amount": "AED X,XXX",
          "title": "Total Estimated Cost",
          "description": "Overall cost summary"
        }}
      }},
      "timeline_details": [
        {{
          "step": "Action description",
          "status": "completed/in-progress/pending",
          "details": "Specific step details and requirements",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "duration": "X min"
        }}
      ],
      "risk_assessment": [
        {{
          "risk": "Specific risk description",
          "risk_impact": "Low/Medium/High",
          "mitigation_impact": "Low/Medium/High",
          "score": 5,
          "mitigation": "Specific mitigation strategy and actions"
        }}
      ],
      "technical_specs": {{
        "implementation": {{
          "title": "Implementation",
          "details": "Technical implementation approach and procedures"
        }},
        "systems_required": {{
          "title": "Systems required",
          "details": ["System 1", "System 2", "System 3"]
        }},
        "certifications": {{
          "title": "Certifications",
          "details": ["Cert 1", "Cert 2", "Cert 3"]
        }},
        "operational_requirements": {{
          "title": "Operational requirements",
          "details": "Specific operational requirements and constraints"
        }}
      }},
      "metrics": {{
        "costEfficiency": 85,
        "timeEfficiency": 90,
        "passengerSatisfaction": 80,
        "crewViolations": 0,
        "aircraftSwaps": 1,
        "networkImpact": "Low/Medium/High"
      }}
    }}
  ],
  "steps": [
    {{
      "step": 1,
      "title": "System/Process notification",
      "status": "completed/in-progress/pending",
      "timestamp": "{timestamp}",
      "system": "AMOS/AIMS/OCC/Recovery Engine",
      "details": "Detailed step description with specific actions and data",
      "data": {{
        "key1": "value1",
        "key2": "value2"
      }}
    }}
  ]
}}

Important Guidelines:
1. Use realistic costs based on operation type and complexity
2. Provide specific, actionable timeline steps with realistic durations
3. Include proper system names (AMOS, AIMS, OCC, Recovery Engine)
4. Consider regulatory compliance (EU261, GCAA, crew duty time limits)
5. Include specific resource requirements and availability
6. Provide detailed risk assessments with mitigation strategies
7. Ensure confidence scores reflect actual feasibility
8. Use appropriate status indicators (recommended/caution/warning)
9. Include network impact considerations for downstream flights

Return only valid JSON. No markdown formatting or extra text.`);
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