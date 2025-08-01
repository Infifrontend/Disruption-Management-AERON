// Helper functions for what-if simulation and impact calculations

// Import the helper functions from the recovery option helpers
import { 
  getDetailedDescription, 
  getCostBreakdown, 
  getTimelineDetails, 
  getResourceRequirements, 
  getRiskAssessment, 
  getTechnicalSpecs, 
  getHistoricalData, 
  getAlternativeConsiderations, 
  getStakeholderImpact, 
  getEditableParameters, 
  getWhatIfScenarios 
} from './recovery-option-helpers'

export const calculateScenarioImpact = (baseOption, scenario, editedParams = {}) => {
  const baseCost = parseInt(baseOption.cost?.replace(/[^\d]/g, '') || '50000')
  const baseTimeMatch = baseOption.timeline?.match(/(\d+)/)
  const baseTime = baseTimeMatch ? parseInt(baseTimeMatch[1]) * 60 : 120 // Convert to minutes
  
  let adjustedCost = baseCost
  let adjustedTime = baseTime
  let confidence = baseOption.confidence || 85
  
  // Apply scenario adjustments
  if (scenario.adjustments?.costReduction) {
    adjustedCost = baseCost * (1 - scenario.adjustments.costReduction / 100)
  }
  if (scenario.adjustments?.costIncrease) {
    adjustedCost = baseCost * (1 + scenario.adjustments.costIncrease / 100)
  }
  if (scenario.adjustments?.timeReduction) {
    adjustedTime = baseTime - scenario.adjustments.timeReduction
  }
  if (scenario.adjustments?.timeIncrease) {
    adjustedTime = baseTime + scenario.adjustments.timeIncrease
  }
  
  confidence = scenario.adjustments?.successProbability || confidence
  
  // Apply parameter edits
  Object.keys(editedParams).forEach(param => {
    const paramValue = editedParams[param]
    
    // Apply parameter-specific adjustments
    if (param === 'Delay Duration' && paramValue !== 240) {
      const factor = paramValue / 240
      adjustedCost = adjustedCost * factor
      adjustedTime = paramValue
    }
    if (param === 'Hotel Category' || param === 'Accommodation Level') {
      const multipliers = { 'Budget': 0.7, 'Standard': 1.0, 'Premium': 1.5 }
      adjustedCost = adjustedCost * (multipliers[paramValue] || 1.0)
    }
    if (param === 'Priority Level' || param === 'Implementation Priority') {
      const multipliers = { 'Standard': 1.0, 'High': 1.2, 'Emergency': 1.5 }
      adjustedCost = adjustedCost * (multipliers[paramValue] || 1.0)
      const timeReductions = { 'Standard': 0, 'High': 10, 'Emergency': 20 }
      adjustedTime = adjustedTime - (timeReductions[paramValue] || 0)
    }
    if (param === 'Transfer Time Buffer' || param === 'Timeline Buffer') {
      adjustedTime = Math.max(30, adjustedTime + (paramValue - 40)) // Adjust from default 40 minutes
    }
    if (param === 'Briefing Duration') {
      adjustedTime = adjustedTime + (paramValue - 35) // Adjust from default 35 minutes
    }
  })
  
  return {
    cost: `AED ${Math.round(adjustedCost).toLocaleString()}`,
    timeline: adjustedTime < 60 ? `${adjustedTime} minutes` : `${(adjustedTime / 60).toFixed(1)} hours`,
    confidence: Math.round(confidence),
    impact: adjustedCost > baseCost ? 'Higher Cost' : adjustedCost < baseCost ? 'Lower Cost' : 'Same Cost',
    riskLevel: confidence > 90 ? 'Low' : confidence > 80 ? 'Medium' : 'High'
  }
}

export const calculateImpact = (changes) => {
  const baselineCost = 50000
  const baselineTime = 80 // minutes

  let newCost = baselineCost
  let newTime = baselineTime
  let risks = []
  let benefits = []

  if (changes.crewSwap) {
    newCost += 8500 // Additional crew costs
    newTime += 15 // Additional briefing time
    risks.push('Extended crew briefing required')
    risks.push('Potential delay if standby crew unavailable')
  }

  if (changes.aircraftChange) {
    newCost += 15000 // Aircraft positioning costs
    newTime += 25 // Aircraft positioning time
    risks.push('Aircraft availability conflict possible')
    benefits.push('More reliable aircraft assignment')
  }

  if (changes.scheduleAdjustment) {
    newCost += 5000 // Schedule coordination costs
    newTime += 10 // Coordination time
    benefits.push('Better integration with overall schedule')
  }

  return {
    originalCost: `AED ${baselineCost.toLocaleString()}`,
    newCost: `AED ${newCost.toLocaleString()}`,
    costDifference: newCost - baselineCost,
    originalTime: `${Math.floor(baselineTime / 60)}h ${baselineTime % 60}m`,
    newTime: `${Math.floor(newTime / 60)}h ${newTime % 60}m`,
    timeDifference: newTime - baselineTime,
    risks,
    benefits,
    confidence: Math.max(70, 95 - (risks.length * 5)),
    recommendation: risks.length <= 2 ? 'Recommended' : 'Requires Review'
  }
}

// Generate recovery options with contextual details
export const generateRecoveryOptionDetails = (option, flight) => {
  if (!option) {
    console.warn('No option provided to generateRecoveryOptionDetails')
    return {}
  }

  try {
    return {
      ...option,
      detailedDescription: getDetailedDescription(option, flight),
      costBreakdown: getCostBreakdown(option, flight),
      timelineDetails: getTimelineDetails(option),
      resourceRequirements: getResourceRequirements(option),
      riskAssessment: getRiskAssessment(option),
      historicalData: getHistoricalData(option),
      alternativeConsiderations: getAlternativeConsiderations(option, flight),
      technicalSpecs: getTechnicalSpecs(option),
      stakeholderImpact: getStakeholderImpact(option, flight),
      editableParameters: getEditableParameters(option),
      whatIfScenarios: getWhatIfScenarios(option)
    }
  } catch (error) {
    console.error('Error generating recovery option details:', error)
    return {
      ...option,
      detailedDescription: option.description || 'No description available',
      costBreakdown: [],
      timelineDetails: [],
      resourceRequirements: [],
      riskAssessment: [],
      historicalData: {},
      alternativeConsiderations: [],
      technicalSpecs: {},
      stakeholderImpact: {},
      editableParameters: [],
      whatIfScenarios: []
    }
  }
}