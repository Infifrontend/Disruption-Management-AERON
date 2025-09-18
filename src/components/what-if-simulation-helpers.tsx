// Helper functions for what-if simulation and impact calculations
import { getCurrency } from '../utils/airlineThemeUtils'
import { getCurrencySymbol } from '../utils/currencyUtils'

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

const currency = getCurrency()
const currencySymbol = getCurrencySymbol()

export const calculateScenarioImpact = (baseOption:any, scenario:any, editedParams = {}) => {
  const baseCost = parseInt((baseOption.cost || '50000').replace(/[^\d]/g, '') || '50000')
  const baseTimeMatch = (baseOption.timeline || '').match(/(\d+)/)
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

    const paramValue = (editedParams as Record<string, any>)[param]

    // Apply parameter-specific adjustments
    if (param === 'Delay Duration' && paramValue !== 240) {
      const factor = paramValue / 240
      adjustedCost = adjustedCost * factor
      adjustedTime = paramValue
    }
    if (param === 'Hotel Category' || param === 'Accommodation Level') {
      const multipliers: Record<string, number> = { Budget: 0.7, Standard: 1.0, Premium: 1.5 }
      adjustedCost = adjustedCost * (multipliers[paramValue] || 1.0)
    }
    if (param === 'Priority Level' || param === 'Implementation Priority') {
       const multipliers: Record<string, number> = { Standard: 1.0, High: 1.2, Emergency: 1.5 }
      adjustedCost = adjustedCost * (multipliers[paramValue] || 1.0)
      const timeReductions: Record<string, number> = { Standard: 0, High: 10, Emergency: 20 }
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
    cost: `${currency} ${Math.round(adjustedCost).toLocaleString()}`,
    timeline: adjustedTime < 60 ? `${adjustedTime} minutes` : `${(adjustedTime / 60).toFixed(1)} hours`,
    confidence: Math.round(confidence),
    impact: adjustedCost > baseCost ? 'Higher Cost' : adjustedCost < baseCost ? 'Lower Cost' : 'Same Cost',
    riskLevel: confidence > 90 ? 'Low' : confidence > 80 ? 'Medium' : 'High'
  }
}

export const calculateImpact = (changes:any) => {
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
    originalCost: `${currency} ${baselineCost.toLocaleString()}`,
    newCost: `${currency} ${newCost.toLocaleString()}`,
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
export const generateRecoveryOptionDetails = (option:any, flight:any) => {
  if (!option) {
    console.warn('No option provided to generateRecoveryOptionDetails')
    return {}
  }

  try {
    // Calculate total cost from option cost string or default
    const extractCostFromString = (costString:any) => {
      if (!costString) return 0
      const matches = String(costString).match(/[\d,]+/)
      return matches ? parseInt(matches[0].replace(/,/g, '')) : 0
    }

    const baseCost = extractCostFromString(option.cost) || 25000

    // Generate cost breakdown with proper totals
    const costBreakdown = getCostBreakdown({
      ...option,
      id: String(option.id || ""),
      baseCost: baseCost
    })

    // Calculate total from breakdown
    const totalCost = Array.isArray(costBreakdown) 
      ? costBreakdown.reduce((sum, item) => {
          const amount = extractCostFromString(item.amount)
          return sum + amount
        }, 0)
      : baseCost

    return {
      ...option,
      // Ensure cost is properly formatted
      cost: option.cost || `${currency} ${baseCost.toLocaleString()}`,
      detailedDescription: getDetailedDescription(option, flight),
      costBreakdown: costBreakdown,
      totalCost: totalCost,
      timelineDetails: getTimelineDetails(option),
      resourceRequirements: getResourceRequirements(option),
      riskAssessment: getRiskAssessment(option),
      historicalData: {
        ...getHistoricalData(option),
        averageCost: `${currency} ${totalCost.toLocaleString()}`
      },
      alternativeConsiderations: getAlternativeConsiderations(option, flight),
      technicalSpecs: getTechnicalSpecs(option),
      stakeholderImpact: getStakeholderImpact(option, flight),
      editableParameters: getEditableParameters(option),
      whatIfScenarios: getWhatIfScenarios(option)
    }
  } catch (error) {
    console.error('Error generating recovery option details:', error)
    const defaultCost = 25000
    return {
      ...option,
      cost: option.cost || `${currency} ${defaultCost.toLocaleString()}`,
      totalCost: defaultCost,
      detailedDescription: option.description || 'No description available',
      costBreakdown: [
        {
          category: "Operational Costs",
          amount: `${currency} ${Math.floor(defaultCost * 0.6).toLocaleString()}`,
          percentage: 60,
          description: "Direct operational expenses"
        },
        {
          category: "Passenger Services",
          amount: `${currency} ${Math.floor(defaultCost * 0.25).toLocaleString()}`,
          percentage: 25,
          description: "Passenger accommodation and services"
        },
        {
          category: "Administrative",
          amount: `${currency} ${Math.floor(defaultCost * 0.15).toLocaleString()}`,
          percentage: 15,
          description: "Administrative and documentation costs"
        }
      ],
      timelineDetails: [],
      resourceRequirements: [],
      riskAssessment: [],
      historicalData: { averageCost: `${currency} ${defaultCost.toLocaleString()}` },
      alternativeConsiderations: [],
      technicalSpecs: {},
      stakeholderImpact: {},
      editableParameters: [],
      whatIfScenarios: []
    }
  }
}