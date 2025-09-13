import { ChatPromptTemplate } from "@langchain/core/prompts";
import { generateRecoveryOptionsForDisruption } from './recovery-generator.js';
import { logInfo, logError } from './logger.js';

// LLM Provider imports
import { modelRouter } from './model-router.js';
import { appendFile } from "fs/promises";

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
        streaming: config.stream,
        generation_method: 'incremental_streaming'
      });

      // Always use streaming incremental generation for optimal token usage and logging
      return await this.generateOptionsIncrementally(disruptionData, categoryInfo, config);

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

  async generateOptionsIncrementally(disruptionData, categoryInfo, config) {
    const providerInfo = this.modelRouter.getCurrentProviderInfo();

    logInfo(`Using streaming incremental generation for ${config.count} options`, {
      flight_number: disruptionData.flight_number,
      provider: providerInfo.provider,
      streaming: config.stream,
      options_count: config.count
    });

    const allOptions = [];
    let steps = [];
    let successfulGenerations = 0;
    let totalTokensUsed = 0;
    let totalProcessingTime = 0;
    const streamedResponses = [];

    // Generate single option prompt template
    const singleOptionPrompt = this.createSingleOptionPrompt();

    // Generate steps once (they don't change much between options)
    steps = this.generateSteps(disruptionData, categoryInfo);

    // Generate each option individually with streaming
    for (let i = 0; i < config.count; i++) {
      let attempt = 0;
      let optionGenerated = false;

      while (attempt < config.maxRetries && !optionGenerated) {
        const startTime = Date.now();
        try {
          logInfo(`Generating option ${i + 1}/${config.count} with streaming`, {
            flight_number: disruptionData.flight_number,
            option_number: i + 1,
            attempt: attempt + 1,
            provider: providerInfo.provider,
            model: providerInfo.model,
            streaming_enabled: config.stream
          });

          const promptData = this.buildSingleOptionPromptData(
            disruptionData,
            categoryInfo,
            i + 1,
            allOptions.length
          );

          // Stream the LLM response
          const streamedContent = await this.streamSingleOptionGeneration(
            singleOptionPrompt,
            promptData,
            disruptionData.flight_number,
            i + 1,
            startTime
          );

          const endTime = Date.now();
          const processingTime = endTime - startTime;
          totalProcessingTime += processingTime;

          // Store the streamed response
          streamedResponses.push({
            optionNumber: i + 1,
            content: streamedContent.fullContent,
            processingTime: processingTime,
            tokens: streamedContent.tokens,
            timestamp: new Date().toISOString()
          });

          // Parse the consolidated response
          const parsedResult = this.parseSingleOptionResponse(
            streamedContent.fullContent,
            disruptionData.flight_number,
            i + 1
          );

          if (parsedResult && parsedResult.option) {
            allOptions.push(parsedResult.option);

            // Merge steps with existing steps (avoid duplicates)
            if (parsedResult.steps && parsedResult.steps.length > 0) {
              parsedResult.steps.forEach(newStep => {
                const existingStep = steps.find(s => s.step === newStep.step);
                if (!existingStep) {
                  steps.push(newStep);
                }
              });
            }

            successfulGenerations++;
            optionGenerated = true;
            totalTokensUsed += streamedContent.tokens.total_tokens || streamedContent.tokens.estimated_tokens || 0;

            logInfo(`Successfully generated and streamed option ${i + 1}`, {
              flight_number: disruptionData.flight_number,
              option_title: parsedResult.option.title,
              total_generated: successfulGenerations,
              steps_added: parsedResult.steps ? parsedResult.steps.length : 0,
              processing_time_ms: processingTime,
              tokens_used: streamedContent.tokens,
              stream_chunks_received: streamedContent.chunksReceived,
              provider: providerInfo.provider
            });

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          const endTime = Date.now();
          const processingTime = endTime - startTime;

          attempt++;
          logError(`Failed to generate option ${i + 1}, attempt ${attempt}`, error, {
            flight_number: disruptionData.flight_number,
            option_number: i + 1,
            attempt: attempt,
            processing_time_ms: processingTime,
            provider: providerInfo.provider,
            error_type: error.constructor.name,
            streaming_enabled: config.stream
          });

          if (attempt >= config.maxRetries) {
            logError(`Giving up on option ${i + 1} after ${config.maxRetries} attempts`, error, {
              flight_number: disruptionData.flight_number,
              option_number: i + 1,
              total_processing_time_ms: processingTime
            });
            break;
          }

          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // If we didn't get enough options, try fallback for remaining
    if (allOptions.length < config.count) {
      logInfo(`Only generated ${allOptions.length}/${config.count} options, using fallback for remainder`, {
        flight_number: disruptionData.flight_number,
        generated: allOptions.length,
        requested: config.count
      });

      try {
        const fallbackResult = this.fallbackToDefaultGenerator(disruptionData, categoryInfo);
        const remainingCount = config.count - allOptions.length;

        // Add fallback options to fill the gap
        for (let i = 0; i < Math.min(remainingCount, fallbackResult.options.length); i++) {
          allOptions.push({
            ...fallbackResult.options[i],
            priority: allOptions.length + 1,
            status: 'fallback'
          });
        }
      } catch (fallbackError) {
        logError('Fallback generation also failed', fallbackError, {
          flight_number: disruptionData.flight_number
        });
      }
    }

    // Log final consolidation of all streamed responses
    logInfo(`Incremental streaming generation complete`, {
      flight_number: disruptionData.flight_number,
      options_generated: allOptions.length,
      steps_generated: steps.length,
      llm_success: successfulGenerations,
      provider: providerInfo.provider,
      total_processing_time_ms: totalProcessingTime,
      average_processing_time_ms: successfulGenerations > 0 ? Math.round(totalProcessingTime / successfulGenerations) : 0,
      total_tokens_used: totalTokensUsed,
      success_rate: `${successfulGenerations}/${config.count}`,
      streamed_responses_count: streamedResponses.length,
      performance_metrics: {
        options_per_second: successfulGenerations > 0 ? (successfulGenerations / (totalProcessingTime / 1000)).toFixed(2) : 0,
        average_tokens_per_option: successfulGenerations > 0 ? Math.round(totalTokensUsed / successfulGenerations) : 0,
        total_stream_chunks: streamedResponses.reduce((sum, resp) => sum + (resp.chunksReceived || 0), 0)
      },
      consolidated_result: {
        total_options: allOptions.length,
        total_steps: steps.length,
        streaming_successful: config.stream && streamedResponses.length > 0
      }
    });

    return {
      options: allOptions,
      steps: steps,
      streamingMetadata: {
        responsesStreamed: streamedResponses.length,
        totalChunks: streamedResponses.reduce((sum, resp) => sum + (resp.chunksReceived || 0), 0),
        streamingEnabled: config.stream
      }
    };
  }

  async streamSingleOptionGeneration(promptTemplate, promptData, flightNumber, optionNumber, startTime) {
    try {
      const llm = this.modelRouter.getProvider();
      const providerInfo = this.modelRouter.getCurrentProviderInfo();

      appendFile("logs/llm-generated-options.log", "generating recovery option =============>")
      appendFile('logs/llm-generated-options.log', {
        "prompt":promptTemplate,
        "promtData": promptData

      });

      logInfo(`Starting streaming generation for option ${optionNumber}`, {
        flight_number: flightNumber,
        option_number: optionNumber,
        provider: providerInfo.provider,
        model: providerInfo.model
      });

      let fullContent = '';
      let chunksReceived = 0;
      let tokens = {
        prompt_tokens: null,
        completion_tokens: null,
        total_tokens: null,
        estimated_tokens: null
      };

      // Configure streaming for the LLM provider
      const streamingLLM = llm.bind({
        streaming: true,
        callbacks: [{
          handleLLMNewToken: (token) => {
            fullContent += token;
            chunksReceived++;

            // Log streaming progress every 10 chunks to avoid log spam
            if (chunksReceived % 10 === 0) {
              logInfo(`Streaming progress for option ${optionNumber}`, {
                flight_number: flightNumber,
                option_number: optionNumber,
                chunks_received: chunksReceived,
                content_length: fullContent.length,
                provider: providerInfo.provider,
                streaming_time_ms: Date.now() - startTime
              });
            }
          },
          handleLLMEnd: (output) => {
            // Extract final token information
            tokens = this.extractTokenInfo(output);

            logInfo(`Streaming completed for option ${optionNumber}`, {
              flight_number: flightNumber,
              option_number: optionNumber,
              total_chunks: chunksReceived,
              final_content_length: fullContent.length,
              tokens: tokens,
              provider: providerInfo.provider,
              total_streaming_time_ms: Date.now() - startTime
            });
          }
        }]
      });

      // Create chain with streaming LLM
      const chain = promptTemplate.pipe(streamingLLM);

      // Invoke the chain (this will trigger streaming)
      const response = await chain.invoke(promptData);

      // If streaming didn't work (fallback), use the response content
      if (!fullContent && response.content) {
        fullContent = response.content;
        tokens = this.extractTokenInfo(response);
        chunksReceived = 1;

        logInfo(`Fallback to non-streaming for option ${optionNumber}`, {
          flight_number: flightNumber,
          option_number: optionNumber,
          content_length: fullContent.length,
          provider: providerInfo.provider
        });
      }
      appendFile('logs/llm-generated-options.log', "llm generated option ==========>")
      appendFile('logs/llm-generated-options.log', fullContent);
      // Log the complete raw streamed response
      // this.logRawStreamedResponse(fullContent, flightNumber, optionNumber, Date.now() - startTime, chunksReceived, tokens, providerInfo);

      return {
        fullContent: fullContent,
        chunksReceived: chunksReceived,
        tokens: tokens,
        streamingTime: Date.now() - startTime
      };

    } catch (error) {
      logError(`Streaming failed for option ${optionNumber}`, error, {
        flight_number: flightNumber,
        option_number: optionNumber,
        streaming_time_ms: Date.now() - startTime,
        error_type: error.constructor.name
      });
      throw error;
    }
  }

  logRawStreamedResponse(content, flightNumber, optionNumber, streamingTime, chunksReceived, tokens, providerInfo) {
    try {
      const contentLength = content ? content.length : 0;

      logInfo(`Raw Streamed LLM Response Generated`, {
        flight_number: flightNumber,
        option_number: optionNumber,
        provider: providerInfo.provider,
        model: providerInfo.model,
        streaming_time_ms: streamingTime,
        chunks_received: chunksReceived,
        response_length_chars: contentLength,
        tokens: tokens,
        timestamp: new Date().toISOString(),
        streaming_metadata: {
          chunks_per_second: chunksReceived > 0 ? (chunksReceived / (streamingTime / 1000)).toFixed(2) : 0,
          chars_per_chunk: chunksReceived > 0 ? Math.round(contentLength / chunksReceived) : 0,
          streaming_successful: chunksReceived > 1
        },
        raw_response_preview: content ? content.substring(0, 500) + (content.length > 500 ? '...' : '') : 'empty'
      });

      // Log full streamed response in a separate detailed log entry
      logInfo(`LLM Full Streamed Response Detail`, {
        flight_number: flightNumber,
        option_number: optionNumber,
        provider: providerInfo.provider,
        streaming_time_ms: streamingTime,
        chunks_received: chunksReceived,
        full_streamed_response: content
      });

    } catch (error) {
      logError('Failed to log raw streamed LLM response', error, {
        flight_number: flightNumber,
        option_number: optionNumber,
        provider: providerInfo.provider,
        streaming_time_ms: streamingTime
      });
    }
  }

  async generateOptionsBatch(disruptionData, categoryInfo, config) {
    const llm = this.modelRouter.getProvider();
    const providerInfo = this.modelRouter.getCurrentProviderInfo();
    const promptData = this.buildPromptData(disruptionData, categoryInfo, config.count);
    const chain = this.basePrompt.pipe(llm);

    let attempt = 0;
    let totalProcessingTime = 0;

    while (attempt < config.maxRetries) {
      const startTime = Date.now();
      try {
        logInfo(`Starting batch generation attempt ${attempt + 1}`, {
          flight_number: disruptionData.flight_number,
          options_count: config.count,
          provider: providerInfo.provider,
          model: providerInfo.model,
          attempt: attempt + 1
        });

        const response = await chain.invoke(promptData);
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        totalProcessingTime += processingTime;

        // Log raw LLM response with timing and token information
        this.logRawLLMResponse(response, disruptionData.flight_number, 'batch', processingTime, providerInfo);

        const result = this.parseResponse(response.content, disruptionData.flight_number);

        logInfo(`Successfully generated ${result.options.length} recovery options (batch)`, {
          flight_number: disruptionData.flight_number,
          options_generated: result.options.length,
          steps_generated: result.steps.length,
          processing_time_ms: processingTime,
          tokens_used: this.extractTokenInfo(response),
          provider: providerInfo.provider
        });

        return result;
      } catch (error) {
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        totalProcessingTime += processingTime;

        attempt++;
        logError(`Batch attempt ${attempt} failed`, error, {
          flight_number: disruptionData.flight_number,
          attempt: attempt,
          processing_time_ms: processingTime,
          total_processing_time_ms: totalProcessingTime,
          provider: providerInfo.provider,
          error_type: error.constructor.name
        });

        if (attempt >= config.maxRetries) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  parseSingleOptionResponse(content, flightNumber, optionNumber) {
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

      // Validate structure - should have option and steps
      if (!parsed.option) {
        // Fallback: if it's just an option object without wrapper
        if (parsed.title && parsed.description) {
          return {
            option: {
              ...parsed,
              priority: parsed.priority || optionNumber,
              confidence: parsed.confidence || 80,
              impact: parsed.impact || 'Medium',
              status: parsed.status || 'recommended'
            },
            steps: []
          };
        }
        throw new Error('Invalid option structure - missing option object');
      }

      // Normalize the response structure
      return {
        option: {
          ...parsed.option,
          priority: parsed.option.priority || optionNumber,
          confidence: parsed.option.confidence || 80,
          impact: parsed.option.impact || 'Medium',
          status: parsed.option.status || 'recommended'
        },
        steps: parsed.steps || []
      };

    } catch (error) {
      logError(`Failed to parse single option response`, error, {
        flightNumber: flightNumber,
        optionNumber: optionNumber,
        contentPreview: content ? content.substring(0, 200) : 'empty'
      });
      return null;
    }
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

  generateSteps(disruptionData, categoryInfo) {
    // Generate standard steps based on disruption type
    const baseSteps = [
      {
        step: 1,
        title: "Disruption Detection and Analysis",
        status: "completed",
        timestamp: new Date().toISOString(),
        system: "AMOS/AIMS/OCC",
        details: `${disruptionData.disruption_type} disruption detected for ${disruptionData.flight_number}`,
        data: {
          flight_number: disruptionData.flight_number,
          disruption_type: disruptionData.disruption_type,
          severity: disruptionData.severity
        }
      },
      {
        step: 2,
        title: "Recovery Options Generation",
        status: "in-progress",
        timestamp: new Date().toISOString(),
        system: "Recovery Engine",
        details: "LLM-powered recovery options generation in progress",
        data: {
          options_requested: 3,
          category: categoryInfo.category_name || 'General'
        }
      },
      {
        step: 3,
        title: "Resource Availability Check",
        status: "pending",
        timestamp: new Date().toISOString(),
        system: "Resource Management",
        details: "Checking crew, aircraft, and ground resource availability",
        data: {
          aircraft: disruptionData.aircraft,
          passengers: disruptionData.passengers
        }
      },
      {
        step: 4,
        title: "Implementation Planning",
        status: "pending",
        timestamp: new Date().toISOString(),
        system: "Operations Control",
        details: "Detailed implementation planning for selected recovery option",
        data: {
          estimated_delay: disruptionData.delay_minutes || 0
        }
      }
    ];

    return baseSteps;
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