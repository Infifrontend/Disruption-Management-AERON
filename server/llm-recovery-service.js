import { ChatPromptTemplate } from "@langchain/core/prompts";
import { generateRecoveryOptionsForDisruption } from './recovery-generator.js';
import { logInfo, logError } from './logger.js';

// LLM Provider imports
import { modelRouter } from './model-router.js';
import { appendFile } from "fs/promises";
import { json } from "stream/consumers";

class LLMRecoveryService {
  constructor() {
    this.modelRouter = modelRouter;
    this.basePrompt = this.createBasePrompt();
  }

  createSingleOptionPrompt() {
    return ChatPromptTemplate.fromTemplate(`
You are an expert flight operations recovery specialist. Generate ONE comprehensive recovery option with associated implementation steps for the following disruption, following industry best practices and regulatory compliance.

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

Option Priority: {optionPriority} (Generate option #{optionNumber} of recovery plan)
Previous Options Generated: {previousCount}

Based on the disruption category, focus on this recovery strategy:
- Aircraft Issues: Aircraft swap, delay for repair, cancellation with rebooking
- Crew Issues: Standby crew assignment, crew positioning, delay for rest completion  
- Weather Issues: Delay for clearance, rerouting, cancellation
- Curfew/Congestion: Aircraft swap for earlier slot, overnight delay, alternative routing
- Rotation/Maintenance: Alternative aircraft assignment, schedule adjustments

Generate exactly ONE recovery option with realistic costs, timelines, operational details, and implementation steps:

{{
  "option": {{
    "title": "Specific recovery action title",
    "description": "Detailed operational description with specific actions and procedures",
    "cost": "AED X,XXX",
    "timeline": "X hours/minutes",
    "confidence": 85,
    "impact": "Low/Medium/High passenger/operational impact",
    "status": "recommended/caution/warning",
    "priority": {optionPriority},
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
    }},
    "crew_available": [
      {{
        "name": "Crew Member Name",
        "role_code": "CAPT/FO/SCC/CC",
        "role": "Captain/First Officer/Senior Cabin Crew/Cabin Crew",
        "qualifications": [
          {{
            "code": "B737",
            "name": "Boeing 737 Type Rating"
          }}
        ],
        "status": "available/unavailable/duty_exceeded",
        "issue": "Optional issue description or null",
        "experience_years": 10,
        "base": "DXB",
        "languages": ["English", "Arabic"]
      }}
    ],
    "rotation_plan": {{
      "aircraftOptions": [
        {{
          "reg": "A6-XXX",
          "type": "B737-800 (189Y)",
          "etops": {{
            "status": "available/none",
            "value": "180min/None"
          }},
          "cabinMatch": {{
            "status": "exact/similar/reduced",
            "value": "Exact/Similar/Reduced"
          }},
          "availability": "Available Now/Available HH:MM",
          "assigned": {{
            "status": "none/assigned",
            "value": "None/Flight Number"
          }},
          "turnaround": "XX min",
          "maintenance": {{
            "status": "current/due/aog",
            "value": "Current/Due A-Check/AOG Issue"
          }},
          "option_score": {{
            "cost_score": "XX%",
            "delay_score": "XX%",
            "crew_impact": "XX%",
            "fuel_score": "XX%",
            "overall": "XX%"
          }},
          "rotation_impact": [
            {{
              "flightNumber": "FZXXX",
              "origin_code": "DXB",
              "destination_code": "XXX",
              "origin": "Dubai",
              "destination": "Destination",
              "departure": "2025-XX-XXTXX:XX:XX+XX:XX",
              "arrival": "2025-XX-XXTXX:XX:XX+XX:XX",
              "delay": "XX min",
              "passengers": 180,
              "status": "On Time/Delayed/Cancelled",
              "impact": "Low/Medium/High Impact",
              "reason": "Impact reason description"
            }}
          ]
        }}
      ],
      "nextSectors": [
        {{
          "flight": "FZXXX Origin-Destination",
          "departure": "Dep: HH:MM → HH:MM (+XX min)/On Time/Cancelled",
          "impact": "Low/Medium/High Impact",
          "reason": "Impact reason"
        }}
      ],
      "operationalConstraints": {{
        "gateCompatibility": {{
          "status": "Compatible/Coordination Required",
          "details": "Gate assignment details"
        }},
        "slotCapacity": {{
          "status": "Available/Coordination Required",
          "details": "Slot coordination details"
        }},
        "curfewViolation": {{
          "status": "No Risk/Risk/Violation",
          "details": "Curfew status details"
        }},
        "passengerConnections": {{
          "status": "No Impact/Medium Impact/High Impact",
          "details": "Connection impact details"
        }}
      }},
      "costBreakdown": {{
        "delayCost": {{
          "metric_value": "AED X,XXX",
          "detail": "Cost breakdown detail"
        }},
        "fuelEfficiency": {{
          "metric_value": "+X.X%",
          "detail": "vs original aircraft"
        }},
        "hotelTransport": {{
          "metric_value": "AED X,XXX/N/A",
          "detail": "Crew accommodation details"
        }},
        "eu261Risk": {{
          "metric_value": "Low/Medium/High/Critical",
          "detail": "€XXX per passenger"
        }}
      }},
      "recommended_option": {{
        "option": "Aircraft Registration/Plan Name",
        "summary": "Brief recommendation summary with key benefits and confidence level"
      }}
    }}
  }},
  "steps": [
    {{
      "step": 1,
      "title": "System/Process notification",
      "status": "completed/in-progress/pending",
      "timestamp": "{timestamp}",
      "system": "AMOS/AIMS/OCC/Recovery Engine",
      "details": "Detailed step description with specific actions taken or required for {flightNumber}",
      "data": {{
        "flight_number": "{flightNumber}",
        "disruption_type": "{disruptionType}",
        "priority": "High/Medium/Low",
        "resources_allocated": ["Resource 1", "Resource 2"],
        "estimated_resolution": "XX minutes"
      }}
    }},
    {{
      "step": 2,
      "title": "Resource Coordination and Allocation",
      "status": "in-progress/pending",
      "timestamp": "{timestamp}",
      "system": "Resource Management/Operations Control",
      "details": "Coordinate and allocate required resources including crew, aircraft, and ground services",
      "data": {{
        "aircraft": "{aircraft}",
        "passengers": {passengers},
        "crew_required": "X flight crew + X cabin crew",
        "ground_services": ["Service 1", "Service 2"]
      }}
    }},
    {{
      "step": 3,
      "title": "Implementation Execution",
      "status": "pending",
      "timestamp": "{timestamp}",
      "system": "Ground Operations/Flight Operations",
      "details": "Execute the selected recovery option with coordinated operational support",
      "data": {{
        "recovery_type": "Recovery action type",
        "expected_completion": "HH:MM",
        "monitoring_frequency": "X minutes",
        "escalation_threshold": "XX minutes"
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
10. Include crew availability and rotation planning details
11. Generate implementation steps that follow the recovery-generator.js structure

Return only valid JSON. No markdown formatting or extra text.`);
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

  buildSingleOptionPromptData(disruptionData, categoryInfo = {}, optionNumber = 1, previousCount = 0) {
    return {
      optionNumber: optionNumber,
      optionPriority: optionNumber,
      previousCount: previousCount,
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
      stream: true, // Always enable streaming for better token management
      ...optionsConfig
    };

    try {
      const providerInfo = this.modelRouter.getCurrentProviderInfo();

      logInfo(`Generating ${config.count} recovery options with streaming enabled`, {
        flight_number: disruptionData.flight_number,
        provider: providerInfo.provider,
        model: providerInfo.model,
        options_count: config.count,
        streaming: config.stream
      });

      // Use batch prompt with count in promptData, stream response in one go
      return await this.generateOptionsBatchStream(disruptionData, categoryInfo, config);

    } catch (error) {
      logError('LLM streaming generation failed, using fallback', error, {
        flight_number: disruptionData.flight_number,
        fallback: true,
        streaming_attempted: config.stream,
        error_type: error.constructor.name
      });

      return this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
    }
  }

  async generateOptionsBatchStream(disruptionData, categoryInfo, config) {
    const providerInfo = this.modelRouter.getCurrentProviderInfo();
    const llm = this.modelRouter.getProvider();
    const promptData = this.buildPromptData(disruptionData, categoryInfo, config.count);
    const chain = this.basePrompt.pipe(llm.bind({
      streaming: true,
      callbacks: [{
        handleLLMNewToken: (token) => {
          this._fullContent = (this._fullContent || '') + token;
          this._chunksReceived = (this._chunksReceived || 0) + 1;
          if (this._chunksReceived % 10 === 0) {
            logInfo('Streaming batch progress', {
              flight_number: disruptionData.flight_number,
              chunks_received: this._chunksReceived,
              content_length: this._fullContent.length,
              provider: providerInfo.provider
            });
          }
        },
        handleLLMEnd: (output) => {
          this._tokens = this.extractTokenInfo(output);
          logInfo('Streaming batch completed', {
            flight_number: disruptionData.flight_number,
            total_chunks: this._chunksReceived,
            final_content_length: this._fullContent.length,
            tokens: this._tokens,
            provider: providerInfo.provider
          });
        }
      }]
    }));

    this._fullContent = '';
    this._chunksReceived = 0;
    this._tokens = {};
    const startTime = Date.now();
    let response;
    try {
      response = await chain.invoke(promptData);
    } catch (error) {
      logError('Streaming batch failed', error, {
        flight_number: disruptionData.flight_number,
        error_type: error.constructor.name
      });
      throw error;
    }
    const streamingTime = Date.now() - startTime;
    let fullContent = this._fullContent || (response && response.content) || '';
    let tokens = this._tokens || this.extractTokenInfo(response);
    let chunksReceived = this._chunksReceived || 1;

    // Log the streamed response
    logInfo('LLM Full Batch Streamed Response', {
      flight_number: disruptionData.flight_number,
      streaming_time_ms: streamingTime,
      chunks_received: chunksReceived
    });

    appendFile('logs/llm-generated-options.log', `\n[${new Date().toISOString()}] Flight: ${disruptionData.flight_number}, Provider: ${providerInfo.provider}, Model: ${providerInfo.model}, Streaming Time: ${streamingTime}ms, Chunks: ${chunksReceived}, Tokens: ${JSON.stringify(tokens)}\nResponse:\n${fullContent}\n---\n`);

    // Parse the batch response
    let result;
    try {
      result = this.parseResponse(fullContent, disruptionData.flight_number);
    } catch (error) {
      logError('Failed to parse batch streamed response', error, {
        flight_number: disruptionData.flight_number,
        contentPreview: fullContent ? fullContent.substring(0, 200) : 'empty'
      });
      throw new Error('Invalid LLM batch response format');
    }

    return {
      ...result,
      streamingMetadata: {
        chunksReceived,
        streamingTime,
        tokens,
        streamingEnabled: config.stream
      }
    };
  }

  logRawLLMResponse(response, flightNumber, optionNumber, processingTime, providerInfo) {
    try {
      const responseLength = response.content ? response.content.length : 0;
      const tokenInfo = this.extractTokenInfo(response);

      logInfo(`Raw LLM Response Generated`, {
        flight_number: flightNumber,
        option_number: optionNumber,
        provider: providerInfo.provider,
        model: providerInfo.model,
        processing_time_ms: processingTime,
        response_length_chars: responseLength,
        tokens: tokenInfo,
        timestamp: new Date().toISOString(),
        raw_response_preview: response.content ? response.content.substring(0, 500) + (response.content.length > 500 ? '...' : '') : 'empty',
        response_metadata: {
          has_content: !!response.content,
          content_type: typeof response.content,
          response_object_keys: Object.keys(response || {}),
          additional_data: response.additional_kwargs || response.metadata || {}
        }
      });

      // Log full raw response in a separate detailed log entry
      logInfo(`LLM Full Raw Response Detail`, {
        flight_number: flightNumber,
        option_number: optionNumber,
        provider: providerInfo.provider,
        processing_time_ms: processingTime,
        full_raw_response: response.content,
        response_object: {
          ...response,
          content: '[CONTENT_LOGGED_SEPARATELY]' // Avoid duplication
        }
      });

    } catch (error) {
      logError('Failed to log raw LLM response', error, {
        flight_number: flightNumber,
        option_number: optionNumber,
        provider: providerInfo.provider,
        processing_time_ms: processingTime
      });
    }
  }

  extractTokenInfo(response) {
    try {
      // Different providers store token information in different places
      const tokenInfo = {
        prompt_tokens: null,
        completion_tokens: null,
        total_tokens: null,
        estimated_tokens: null
      };

      // Check common locations for token usage information
      if (response.usage) {
        tokenInfo.prompt_tokens = response.usage.prompt_tokens;
        tokenInfo.completion_tokens = response.usage.completion_tokens;
        tokenInfo.total_tokens = response.usage.total_tokens;
      } else if (response.additional_kwargs && response.additional_kwargs.usage) {
        tokenInfo.prompt_tokens = response.additional_kwargs.usage.prompt_tokens;
        tokenInfo.completion_tokens = response.additional_kwargs.usage.completion_tokens;
        tokenInfo.total_tokens = response.additional_kwargs.usage.total_tokens;
      } else if (response.metadata && response.metadata.usage) {
        tokenInfo.prompt_tokens = response.metadata.usage.prompt_tokens;
        tokenInfo.completion_tokens = response.metadata.usage.completion_tokens;
        tokenInfo.total_tokens = response.metadata.usage.total_tokens;
      }

      // If no token info available, estimate based on content length
      if (!tokenInfo.total_tokens && response.content) {
        // Rough estimation: ~4 characters per token
        tokenInfo.estimated_tokens = Math.ceil(response.content.length / 4);
      }

      return tokenInfo;
    } catch (error) {
      logError('Failed to extract token information', error);
      return {
        prompt_tokens: null,
        completion_tokens: null,
        total_tokens: null,
        estimated_tokens: response.content ? Math.ceil(response.content.length / 4) : null,
        extraction_error: error.message
      };
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