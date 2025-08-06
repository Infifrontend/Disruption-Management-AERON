// Helper functions for generating detailed recovery option information

export const getDetailedDescription = (option, flight) => {
  const flightNumber = flight?.flightNumber || 'FZ123'
  const origin = flight?.origin || 'DXB'
  const destination = flight?.destination || 'BOM'
  const aircraft = flight?.aircraft || 'B737-800'
  const registration = flight?.registration || 'A6-FDU'
  const passengers = flight?.passengers || 167
  const disruptionReason = flight?.disruptionReason || 'Technical issue'
  
  // First check for exact ID matches, then fall back to pattern matching
  const descriptions = {
    'AIRCRAFT_SWAP_A320_001': `Aircraft Swap Recovery for ${flightNumber} (${origin}→${destination}): Replace ${aircraft} ${registration} with available Airbus A320 (A6-FMC) at ${origin}. The replacement aircraft has completed D-check maintenance (last: 72 hours ago) and is certified for the ${origin}-${destination} route. Estimated passenger transfer time: 35 minutes. All cargo and baggage will be transferred with priority handling. This solution maintains schedule integrity with minimal passenger disruption.`,
    
    'DELAY_4H_OVERNIGHT': `Controlled Delay Strategy for ${flightNumber}: Implement 4-hour delay to allow comprehensive resolution of ${disruptionReason}. Includes passenger accommodation at Dubai International Hotel (147 rooms confirmed), meal vouchers for all ${passengers} passengers, and ground transportation. Weather forecast shows improvement in 3.5 hours. Alternative aircraft A6-FMF will be available as backup after 6 hours if primary resolution fails.`,
    
    'REROUTE_AUH_TECH': `Route Optimization via Abu Dhabi for ${flightNumber}: Immediate departure to ${destination} via AUH using flydubai's hub connectivity. Passengers will transit through AUH Terminal 1 with dedicated ground support. Estimated additional flight time: 45 minutes. Partnership with Etihad provides seamless ground handling. Original ${aircraft} ${registration} will undergo inspection at ${origin} while passengers continue journey.`,
    
    'PARTNER_CODESHARE': `Emergency Codeshare Activation for ${flightNumber}: Secure seats on Emirates flight EK542 (${origin}→${destination}) departing 16:45. Confirmed availability: 189 seats including 12 business class upgrades for VIP passengers. Automatic baggage transfer arranged through dnata ground services. Passenger notifications sent via SMS/email with new boarding details. Maintains arrival time within 30 minutes of original schedule.`,
    
    'CREW_REPLACEMENT_DXB': `Crew Replacement Protocol for ${flightNumber}: Deploy standby crew (Captain Al-Zaabi, F/O Rahman + 4 cabin crew) currently on duty at ${origin}. Fresh crew duty time: 2.5 hours (well within regulatory limits). Extended briefing required for ${aircraft} type rating. Estimated crew preparation time: 45 minutes. Original crew stood down due to duty time violation (13.8/13.0 hours). Passenger delay: minimal (under 1 hour).`
  }
  
  // If exact match found, return it
  if (descriptions[option.id]) {
    return descriptions[option.id]
  }
  
  // Pattern matching for dynamic options
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()
  const optionDescription = option.description || ''
  
  // Aircraft swap pattern
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    return `Aircraft Swap Recovery for ${flightNumber} (${origin}→${destination}): Replace ${aircraft} ${registration} with available replacement aircraft at ${origin}. The replacement aircraft has been selected based on availability and route certification for ${origin}-${destination}. Estimated passenger transfer time: 35-45 minutes. All cargo and baggage will be transferred with priority handling. This solution maintains schedule integrity with minimal passenger disruption. Current disruption: ${disruptionReason}.`
  }
  
  // Delay pattern
  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const delayTime = option.timeline || '4 hours'
    return `Controlled Delay Strategy for ${flightNumber}: Implement ${delayTime} delay to allow comprehensive resolution of ${disruptionReason}. Includes passenger accommodation services, meal vouchers for all ${passengers} passengers, and ground transportation as needed. This approach ensures complete issue resolution while providing appropriate passenger care. Alternative options available if technical resolution takes longer than expected.`
  }
  
  // Reroute/Diversion pattern
  if (optionId.includes('reroute') || optionId.includes('divert') || optionTitle.includes('reroute') || optionTitle.includes('divert')) {
    return `Route Optimization for ${flightNumber}: Alternative routing to reach ${destination} while managing current ${disruptionReason}. Passengers will be provided with updated routing information and any necessary ground support. Estimated additional flight time varies based on selected route. Partnership agreements with other airlines and airports provide seamless ground handling. Original ${aircraft} ${registration} status will be assessed during passenger journey.`
  }
  
  // Codeshare/Partner pattern
  if (optionId.includes('partner') || optionId.includes('codeshare') || optionTitle.includes('partner') || optionTitle.includes('codeshare')) {
    return `Emergency Codeshare Activation for ${flightNumber}: Secure seats on partner airline flight to ${destination}. Confirmed seat availability being processed for ${passengers} passengers including priority upgrades for VIP passengers. Automatic baggage transfer arranged through ground services. Passenger notifications sent via SMS/email with new boarding details. Maintains schedule integrity through airline partnerships.`
  }
  
  // Crew replacement pattern
  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return `Crew Replacement Protocol for ${flightNumber}: Deploy standby crew currently available at ${origin}. Fresh crew well within regulatory duty time limitations. Extended briefing required for ${aircraft} type rating and current route conditions. Estimated crew preparation time: 45-60 minutes. Current crew situation: ${disruptionReason}. Passenger delay minimized through efficient crew transition process.`
  }
  
  // Cancellation pattern
  if (optionId.includes('cancel') || optionTitle.includes('cancel')) {
    return `Flight Cancellation Protocol for ${flightNumber}: Due to ${disruptionReason}, flight cancellation with comprehensive passenger re-accommodation. All ${passengers} passengers will be rebooked on next available flights to ${destination}. Hotel accommodation, meal vouchers, and transportation provided as per passenger rights regulations. Priority rebooking for connecting passengers and VIP travelers. Ground services coordinating baggage handling and refund processing.`
  }
  
  // Default contextual description
  return `Recovery solution for ${flightNumber} (${origin}→${destination}): ${optionDescription}. Aircraft: ${aircraft} ${registration}. Passengers affected: ${passengers}. Current situation: ${disruptionReason}. Estimated implementation time based on current operational conditions at ${origin}. Solution focuses on ${option.impact || 'minimizing passenger disruption'} while ensuring safety and regulatory compliance.`
}

export const getCostBreakdown = (option, flight) => {
  const passengerCount = flight?.passengers || 167
  const hotelCostPerRoom = 150 // AED per night
  const mealVoucherCost = 75 // AED per passenger
  
  // Extract cost number from option.cost string for calculations
  const totalCostMatch = option.cost?.match(/[\d,]+/)
  const totalCost = totalCostMatch ? parseInt(totalCostMatch[0].replace(/,/g, '')) : 50000
  
  const breakdowns = {
    'AIRCRAFT_SWAP_A320_001': [
      { category: 'Aircraft Positioning Fee', amount: 'AED 28,500', percentage: 42, description: 'Moving A6-FMC from Terminal 1 to gate' },
      { category: 'Crew Overtime & Allowances', amount: 'AED 15,200', percentage: 23, description: 'Extended duty pay for 6 crew members' },
      { category: 'Ground Handling Premium', amount: 'AED 9,800', percentage: 15, description: 'Priority baggage/cargo transfer' },
      { category: 'Additional Fuel Uplift', amount: 'AED 7,500', percentage: 11, description: 'Extra fuel for A320 efficiency difference' },
      { category: 'Documentation & Admin', amount: 'AED 6,000', percentage: 9, description: 'Route changes, permits, notifications' }
    ],
    'DELAY_4H_OVERNIGHT': [
      { category: 'Hotel Accommodation', amount: `AED ${Math.round((passengerCount * 0.6) * hotelCostPerRoom).toLocaleString()}`, percentage: 52, description: `${Math.round(passengerCount * 0.6)} rooms at Dubai Intl Hotel` },
      { category: 'Meal Vouchers', amount: `AED ${(passengerCount * mealVoucherCost).toLocaleString()}`, percentage: 28, description: `${passengerCount} passengers × AED ${mealVoucherCost}` },
      { category: 'Ground Transportation', amount: `AED ${(passengerCount * 35).toLocaleString()}`, percentage: 12, description: '4 coach buses + individual transport' },
      { category: 'Airport Slot Rebooking', amount: 'AED 4,500', percentage: 5, description: 'New departure slot coordination' },
      { category: 'Communication & Coordination', amount: 'AED 3,200', percentage: 3, description: 'Passenger notifications, staff overtime' }
    ],
    'REROUTE_AUH_TECH': [
      { category: 'Alternative Route Costs', amount: 'AED 42,000', percentage: 58, description: 'Additional fuel + navigation fees' },
      { category: 'Ground Transport DXB-AUH', amount: 'AED 18,500', percentage: 26, description: 'Charter buses for connecting passengers' },
      { category: 'Airport Coordination Fees', amount: 'AED 7,200', percentage: 10, description: 'AUH slot + ground handling' },
      { category: 'Passenger Services', amount: 'AED 4,300', percentage: 6, description: 'Transit lounge access + refreshments' }
    ],
    'PARTNER_CODESHARE': [
      { category: 'Seat Purchase from Emirates', amount: 'AED 95,000', percentage: 72, description: '189 seats at negotiated rate' },
      { category: 'Baggage Transfer Services', amount: 'AED 12,500', percentage: 9, description: 'Priority baggage handling' },
      { category: 'Class Upgrades (VIP)', amount: 'AED 15,000', percentage: 11, description: '12 business class upgrades' },
      { category: 'Ground Coordination', amount: 'AED 8,500', percentage: 6, description: 'Check-in, boarding assistance' },
      { category: 'Passenger Compensation', amount: 'AED 3,200', percentage: 2, description: 'Service recovery vouchers' }
    ],
    'CREW_REPLACEMENT_DXB': [
      { category: 'Standby Crew Activation', amount: 'AED 18,000', percentage: 65, description: 'Call-out pay for 6 crew members' },
      { category: 'Extended Briefing Costs', amount: 'AED 4,500', percentage: 16, description: 'Training coordinator + materials' },
      { category: 'Crew Transportation', amount: 'AED 2,800', percentage: 10, description: 'Hotel pickup + crew transport' },
      { category: 'Administrative Processing', amount: 'AED 2,500', percentage: 9, description: 'Duty time documentation, roster changes' }
    ]
  }
  
  // If exact match found, return it
  if (breakdowns[option.id]) {
    return breakdowns[option.id]
  }
  
  // Generate dynamic breakdown based on option type
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()
  
  // Aircraft swap pattern
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    return [
      { category: 'Aircraft Positioning Fee', amount: `AED ${Math.round(totalCost * 0.42).toLocaleString()}`, percentage: 42, description: 'Moving replacement aircraft to departure gate' },
      { category: 'Crew Overtime & Allowances', amount: `AED ${Math.round(totalCost * 0.23).toLocaleString()}`, percentage: 23, description: 'Extended duty pay for crew members' },
      { category: 'Ground Handling Premium', amount: `AED ${Math.round(totalCost * 0.15).toLocaleString()}`, percentage: 15, description: 'Priority baggage/cargo transfer' },
      { category: 'Additional Fuel & Operations', amount: `AED ${Math.round(totalCost * 0.11).toLocaleString()}`, percentage: 11, description: 'Extra fuel and operational costs' },
      { category: 'Documentation & Admin', amount: `AED ${Math.round(totalCost * 0.09).toLocaleString()}`, percentage: 9, description: 'Route changes, permits, notifications' }
    ]
  }
  
  // Delay pattern
  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const needsAccommodation = option.timeline?.includes('hour') && parseInt(option.timeline) >= 4
    return needsAccommodation ? [
      { category: 'Hotel Accommodation', amount: `AED ${Math.round((passengerCount * 0.6) * hotelCostPerRoom).toLocaleString()}`, percentage: 52, description: `${Math.round(passengerCount * 0.6)} rooms confirmed` },
      { category: 'Meal Vouchers', amount: `AED ${(passengerCount * mealVoucherCost).toLocaleString()}`, percentage: 28, description: `${passengerCount} passengers × AED ${mealVoucherCost}` },
      { category: 'Ground Transportation', amount: `AED ${(passengerCount * 35).toLocaleString()}`, percentage: 12, description: 'Buses and individual transport' },
      { category: 'Airport Coordination', amount: `AED ${Math.round(totalCost * 0.05).toLocaleString()}`, percentage: 5, description: 'Slot rebooking and coordination' },
      { category: 'Communication & Admin', amount: `AED ${Math.round(totalCost * 0.03).toLocaleString()}`, percentage: 3, description: 'Passenger notifications, staff overtime' }
    ] : [
      { category: 'Delay Coordination', amount: `AED ${Math.round(totalCost * 0.40).toLocaleString()}`, percentage: 40, description: 'Operational delay management' },
      { category: 'Passenger Services', amount: `AED ${Math.round(totalCost * 0.35).toLocaleString()}`, percentage: 35, description: 'Terminal amenities and refreshments' },
      { category: 'Crew Overtime', amount: `AED ${Math.round(totalCost * 0.15).toLocaleString()}`, percentage: 15, description: 'Extended crew duty time' },
      { category: 'Administrative Costs', amount: `AED ${Math.round(totalCost * 0.10).toLocaleString()}`, percentage: 10, description: 'Documentation and notifications' }
    ]
  }
  
  // Reroute pattern
  if (optionId.includes('reroute') || optionId.includes('divert') || optionTitle.includes('reroute') || optionTitle.includes('divert')) {
    return [
      { category: 'Alternative Route Costs', amount: `AED ${Math.round(totalCost * 0.58).toLocaleString()}`, percentage: 58, description: 'Additional fuel and navigation fees' },
      { category: 'Ground Transportation', amount: `AED ${Math.round(totalCost * 0.26).toLocaleString()}`, percentage: 26, description: 'Passenger transport between airports' },
      { category: 'Airport Coordination Fees', amount: `AED ${Math.round(totalCost * 0.10).toLocaleString()}`, percentage: 10, description: 'Alternative airport slot and handling' },
      { category: 'Passenger Services', amount: `AED ${Math.round(totalCost * 0.06).toLocaleString()}`, percentage: 6, description: 'Transit support and refreshments' }
    ]
  }
  
  // Partner/Codeshare pattern
  if (optionId.includes('partner') || optionId.includes('codeshare') || optionTitle.includes('partner') || optionTitle.includes('codeshare')) {
    return [
      { category: 'Partner Airline Seats', amount: `AED ${Math.round(totalCost * 0.72).toLocaleString()}`, percentage: 72, description: `${passengerCount} seats at negotiated rate` },
      { category: 'Baggage Transfer Services', amount: `AED ${Math.round(totalCost * 0.09).toLocaleString()}`, percentage: 9, description: 'Priority baggage handling' },
      { category: 'Class Upgrades (VIP)', amount: `AED ${Math.round(totalCost * 0.11).toLocaleString()}`, percentage: 11, description: 'VIP passenger upgrades' },
      { category: 'Ground Coordination', amount: `AED ${Math.round(totalCost * 0.06).toLocaleString()}`, percentage: 6, description: 'Check-in and boarding assistance' },
      { category: 'Service Recovery', amount: `AED ${Math.round(totalCost * 0.02).toLocaleString()}`, percentage: 2, description: 'Passenger compensation vouchers' }
    ]
  }
  
  // Crew replacement pattern
  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return [
      { category: 'Standby Crew Activation', amount: `AED ${Math.round(totalCost * 0.65).toLocaleString()}`, percentage: 65, description: 'Call-out pay for replacement crew' },
      { category: 'Extended Briefing Costs', amount: `AED ${Math.round(totalCost * 0.16).toLocaleString()}`, percentage: 16, description: 'Training coordinator and materials' },
      { category: 'Crew Transportation', amount: `AED ${Math.round(totalCost * 0.10).toLocaleString()}`, percentage: 10, description: 'Transport to airport' },
      { category: 'Administrative Processing', amount: `AED ${Math.round(totalCost * 0.09).toLocaleString()}`, percentage: 9, description: 'Duty time documentation, roster changes' }
    ]
  }
  
  // Cancellation pattern
  if (optionId.includes('cancel') || optionTitle.includes('cancel')) {
    return [
      { category: 'Passenger Rebooking', amount: `AED ${Math.round(totalCost * 0.45).toLocaleString()}`, percentage: 45, description: `Rebooking ${passengerCount} passengers on alternative flights` },
      { category: 'Hotel Accommodation', amount: `AED ${Math.round(totalCost * 0.25).toLocaleString()}`, percentage: 25, description: 'Overnight accommodation for passengers' },
      { category: 'Meal Allowances', amount: `AED ${Math.round(totalCost * 0.15).toLocaleString()}`, percentage: 15, description: 'Meal vouchers and catering' },
      { category: 'Compensation & Refunds', amount: `AED ${Math.round(totalCost * 0.10).toLocaleString()}`, percentage: 10, description: 'EU261 and passenger compensation' },
      { category: 'Ground Services', amount: `AED ${Math.round(totalCost * 0.05).toLocaleString()}`, percentage: 5, description: 'Baggage handling and customer service' }
    ]
  }
  
  // Default breakdown
  return [
    { category: 'Primary Recovery Cost', amount: `AED ${Math.round(totalCost * 0.70).toLocaleString()}`, percentage: 70, description: 'Main implementation cost' },
    { category: 'Supporting Services', amount: `AED ${Math.round(totalCost * 0.20).toLocaleString()}`, percentage: 20, description: 'Additional services required' },
    { category: 'Administrative Overhead', amount: `AED ${Math.round(totalCost * 0.10).toLocaleString()}`, percentage: 10, description: 'Documentation and coordination' }
  ]
}

export const getTimelineDetails = (option) => {
  const currentTime = new Date()
  const addMinutes = (minutes) => new Date(currentTime.getTime() + minutes * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  
  const timelines = {
    'AIRCRAFT_SWAP_A320_001': [
      { step: 'Decision Confirmation', duration: '5 minutes', status: 'pending', startTime: addMinutes(0), endTime: addMinutes(5), details: 'Management approval and resource confirmation' },
      { step: 'Aircraft Positioning', duration: '35 minutes', status: 'pending', startTime: addMinutes(5), endTime: addMinutes(40), details: 'Move A6-FMC from Terminal 1 to departure gate' },
      { step: 'Crew Briefing & Preparation', duration: '25 minutes', status: 'pending', startTime: addMinutes(10), endTime: addMinutes(35), details: 'Flight crew briefing for A320 configuration' },
      { step: 'Passenger & Baggage Transfer', duration: '40 minutes', status: 'pending', startTime: addMinutes(25), endTime: addMinutes(65), details: 'Transfer passengers and priority baggage handling' },
      { step: 'Final Checks & Departure', duration: '15 minutes', status: 'pending', startTime: addMinutes(65), endTime: addMinutes(80), details: 'Pre-flight checks and departure clearance' }
    ],
    'DELAY_4H_OVERNIGHT': [
      { step: 'Passenger Notification', duration: '8 minutes', status: 'pending', startTime: addMinutes(0), endTime: addMinutes(8), details: 'SMS/email alerts to all passengers' },
      { step: 'Hotel Booking Confirmation', duration: '25 minutes', status: 'pending', startTime: addMinutes(5), endTime: addMinutes(30), details: 'Secure 89 rooms at Dubai International Hotel' },
      { step: 'Ground Transportation Setup', duration: '35 minutes', status: 'pending', startTime: addMinutes(15), endTime: addMinutes(50), details: 'Deploy 4 buses for passenger transport' },
      { step: 'Technical Issue Resolution', duration: '3 hours', status: 'pending', startTime: addMinutes(30), endTime: addMinutes(210), details: 'Complete technical inspection and repairs' },
      { step: 'Return & Departure Prep', duration: '45 minutes', status: 'pending', startTime: addMinutes(210), endTime: addMinutes(255), details: 'Passenger return and boarding preparation' }
    ],
    'CREW_REPLACEMENT_DXB': [
      { step: 'Standby Crew Activation', duration: '8 minutes', status: 'pending', startTime: addMinutes(0), endTime: addMinutes(8), details: 'Contact and confirm availability of standby crew' },
      { step: 'Crew Transportation', duration: '20 minutes', status: 'pending', startTime: addMinutes(8), endTime: addMinutes(28), details: 'Transport crew from hotel to airport' },
      { step: 'Extended Safety Briefing', duration: '35 minutes', status: 'pending', startTime: addMinutes(20), endTime: addMinutes(55), details: 'Route-specific briefing and documentation' },
      { step: 'Pre-flight Preparation', duration: '25 minutes', status: 'pending', startTime: addMinutes(45), endTime: addMinutes(70), details: 'Aircraft checks and passenger boarding prep' },
      { step: 'Departure Clearance', duration: '10 minutes', status: 'pending', startTime: addMinutes(70), endTime: addMinutes(80), details: 'Final clearances and departure' }
    ]
  }
  
  // If exact match found, return it
  if (timelines[option.id]) {
    return timelines[option.id]
  }
  
  // Generate dynamic timeline based on option type and timeline
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()
  const timelineMatch = (option.timeline || '').match(/(\d+)/)
  const totalMinutes = timelineMatch ? parseInt(timelineMatch[1]) * 60 : 120
  
  // Aircraft swap pattern
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    const steps = Math.ceil(totalMinutes / 20) // Roughly 20-minute steps
    return [
      { step: 'Decision Confirmation', duration: '5 minutes', status: 'pending', startTime: addMinutes(0), endTime: addMinutes(5), details: 'Management approval and resource confirmation' },
      { step: 'Aircraft Positioning', duration: `${Math.round(totalMinutes * 0.4)} minutes`, status: 'pending', startTime: addMinutes(5), endTime: addMinutes(5 + Math.round(totalMinutes * 0.4)), details: 'Move replacement aircraft to departure gate' },
      { step: 'Crew Briefing & Preparation', duration: `${Math.round(totalMinutes * 0.25)} minutes`, status: 'pending', startTime: addMinutes(10), endTime: addMinutes(10 + Math.round(totalMinutes * 0.25)), details: 'Flight crew briefing for aircraft configuration' },
      { step: 'Passenger & Baggage Transfer', duration: `${Math.round(totalMinutes * 0.35)} minutes`, status: 'pending', startTime: addMinutes(Math.round(totalMinutes * 0.25)), endTime: addMinutes(Math.round(totalMinutes * 0.6)), details: 'Transfer passengers and priority baggage handling' },
      { step: 'Final Checks & Departure', duration: '15 minutes', status: 'pending', startTime: addMinutes(totalMinutes - 15), endTime: addMinutes(totalMinutes), details: 'Pre-flight checks and departure clearance' }
    ]
  }
  
  // Delay pattern
  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const hasAccommodation = totalMinutes >= 240 // 4+ hours
    return hasAccommodation ? [
      { step: 'Passenger Notification', duration: '8 minutes', status: 'pending', startTime: addMinutes(0), endTime: addMinutes(8), details: 'SMS/email alerts to all passengers' },
      { step: 'Accommodation Booking', duration: '25 minutes', status: 'pending', startTime: addMinutes(5), endTime: addMinutes(30), details: 'Secure hotel rooms and transportation' },
      { step: 'Ground Transportation Setup', duration: '35 minutes', status: 'pending', startTime: addMinutes(15), endTime: addMinutes(50), details: 'Deploy buses for passenger transport' },
      { step: 'Issue Resolution Period', duration: `${Math.round(totalMinutes * 0.75)} minutes`, status: 'pending', startTime: addMinutes(30), endTime: addMinutes(30 + Math.round(totalMinutes * 0.75)), details: 'Technical issue resolution and aircraft preparation' },
      { step: 'Return & Departure Prep', duration: '45 minutes', status: 'pending', startTime: addMinutes(totalMinutes - 45), endTime: addMinutes(totalMinutes), details: 'Passenger return and boarding preparation' }
    ] : [
      { step: 'Passenger Notification', duration: '5 minutes', status: 'pending', startTime: addMinutes(0), endTime: addMinutes(5), details: 'Immediate passenger notification' },
      { step: 'Terminal Services Setup', duration: '15 minutes', status: 'pending', startTime: addMinutes(5), endTime: addMinutes(20), details: 'Arrange terminal amenities and refreshments' },
      { step: 'Issue Resolution', duration: `${totalMinutes - 30} minutes`, status: 'pending', startTime: addMinutes(20), endTime: addMinutes(totalMinutes - 10), details: 'Resolve technical or operational issues' },
      { step: 'Boarding & Departure', duration: '10 minutes', status: 'pending', startTime: addMinutes(totalMinutes - 10), endTime: addMinutes(totalMinutes), details: 'Complete boarding and departure' }
    ]
  }
  
  // Crew replacement pattern
  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return [
      { step: 'Standby Crew Activation', duration: '8 minutes', status: 'pending', startTime: addMinutes(0), endTime: addMinutes(8), details: 'Contact and confirm availability of standby crew' },
      { step: 'Crew Transportation', duration: `${Math.round(totalMinutes * 0.25)} minutes`, status: 'pending', startTime: addMinutes(8), endTime: addMinutes(8 + Math.round(totalMinutes * 0.25)), details: 'Transport crew to airport' },
      { step: 'Extended Safety Briefing', duration: `${Math.round(totalMinutes * 0.35)} minutes`, status: 'pending', startTime: addMinutes(Math.round(totalMinutes * 0.25)), endTime: addMinutes(Math.round(totalMinutes * 0.6)), details: 'Route-specific briefing and documentation' },
      { step: 'Pre-flight Preparation', duration: `${Math.round(totalMinutes * 0.25)} minutes`, status: 'pending', startTime: addMinutes(Math.round(totalMinutes * 0.6)), endTime: addMinutes(Math.round(totalMinutes * 0.85)), details: 'Aircraft checks and passenger boarding prep' },
      { step: 'Departure Clearance', duration: '10 minutes', status: 'pending', startTime: addMinutes(totalMinutes - 10), endTime: addMinutes(totalMinutes), details: 'Final clearances and departure' }
    ]
  }
  
  // Default timeline
  const stepCount = Math.min(5, Math.max(3, Math.ceil(totalMinutes / 30)))
  const stepDuration = Math.round(totalMinutes / stepCount)
  
  return Array.from({ length: stepCount }, (_, index) => ({
    step: index === 0 ? 'Implementation Start' : 
          index === stepCount - 1 ? 'Completion & Departure' : 
          `Execution Phase ${index}`,
    duration: `${stepDuration} minutes`,
    status: 'pending',
    startTime: addMinutes(index * stepDuration),
    endTime: addMinutes((index + 1) * stepDuration),
    details: index === 0 ? 'Initial setup and preparation' :
             index === stepCount - 1 ? 'Final checks and departure' :
             `Main implementation activities - step ${index}`
  }))
}

export const getResourceRequirements = (option) => {
  const resources = {
    'AIRCRAFT_SWAP_A320_001': [
      { type: 'Aircraft', resource: 'Airbus A320 (A6-FMC)', availability: 'Available', location: 'DXB Terminal 1, Stand 215', status: 'Ready', eta: 'On Stand', details: 'Last check: 72h ago, Flight hours: 247/4000' },
      { type: 'Flight Crew', resource: 'Captain Al-Mahmoud + F/O Singh', availability: 'On Duty', location: 'Crew Room B, Terminal 2', status: 'Briefed', eta: '15 minutes', details: 'A320 qualified, duty time: 3.2 hours' },
      { type: 'Cabin Crew', resource: '4 Flight Attendants (Team Delta)', availability: 'On Standby', location: 'Crew Lounge Level 3', status: 'Ready', eta: '10 minutes', details: 'Multi-type qualified including A320' },
      { type: 'Ground Equipment', resource: 'Tug + GPU + Air Start Unit', availability: 'Confirmed', location: 'Equipment Bay 7', status: 'Dispatched', eta: '5 minutes', details: 'Priority equipment allocation' },
      { type: 'Ground Handling', resource: 'dnata Premium Service Team', availability: 'Available', location: 'Gate A15 Operations', status: 'Assigned', eta: 'On Location', details: '8-person team for baggage transfer' }
    ],
    'DELAY_4H_OVERNIGHT': [
      { type: 'Accommodation', resource: '89 Hotel Rooms', availability: 'Confirmed', location: 'Dubai International Hotel', status: 'Reserved', eta: 'Available Now', details: 'Block booking confirmed, late check-out arranged' },
      { type: 'Transportation', resource: '4 Coach Buses (55 seats each)', availability: 'Dispatched', location: 'Terminal 2 Pickup Point', status: 'En Route', eta: '12 minutes', details: 'Emirates Transport Service, priority dispatch' },
      { type: 'Catering', resource: 'Meal Vouchers (167 × AED 75)', availability: 'Ready', location: 'Terminal F&B Partners', status: 'Printed', eta: 'Available Now', details: 'Valid at 15 terminal restaurants until 23:00' },
      { type: 'Technical Support', resource: 'Boeing 737 Specialist Team', availability: 'En Route', location: 'Maintenance Hangar 2', status: 'Responding', eta: '25 minutes', details: '3 certified engineers + diagnostic equipment' },
      { type: 'Customer Service', resource: '6 Service Representatives', availability: 'Available', location: 'Service Desk Terminal 2', status: 'Deployed', eta: 'On Location', details: 'Multilingual team for passenger assistance' }
    ],
    'CREW_REPLACEMENT_DXB': [
      { type: 'Replacement Captain', resource: 'Captain Al-Zaabi', availability: 'Confirmed', location: 'Dubai Airport Hotel Room 847', status: 'En Route', eta: '25 minutes', details: 'B737 TRI, 12,500 flight hours, duty time: 0 hours' },
      { type: 'Replacement F/O', resource: 'F/O Rahman', availability: 'Confirmed', location: 'Crew Rest Area Terminal 2', status: 'Ready', eta: '5 minutes', details: 'B737 qualified, 3,200 flight hours, duty time: 1.5 hours' },
      { type: 'Cabin Crew', resource: 'Original team (rested)', availability: 'Available', location: 'Gate Area', status: 'Ready', eta: 'On Location', details: 'Cabin crew within duty limits, no replacement needed' },
      { type: 'Training Coordinator', resource: 'Captain Al-Rashid (TRI)', availability: 'On Call', location: 'Training Center B', status: 'Responding', eta: '15 minutes', details: 'For extended crew briefing and documentation' }
    ]
  }
  
  // If exact match found, return it
  if (resources[option.id]) {
    return resources[option.id]
  }
  
  // Generate dynamic resources based on option type
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()
  
  // Aircraft swap pattern
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    return [
      { type: 'Replacement Aircraft', resource: 'Available Aircraft (TBD)', availability: 'Available', location: 'DXB Terminal Area', status: 'Ready', eta: 'On Stand', details: 'Aircraft selection based on route requirements and availability' },
      { type: 'Flight Crew', resource: 'Qualified Crew Team', availability: 'On Duty', location: 'Crew Room Terminal 2', status: 'Briefed', eta: '15 minutes', details: 'Type-rated crew with current qualifications' },
      { type: 'Cabin Crew', resource: 'Flight Attendants', availability: 'On Standby', location: 'Crew Lounge', status: 'Ready', eta: '10 minutes', details: 'Multi-type qualified cabin crew' },
      { type: 'Ground Equipment', resource: 'Aircraft Support Equipment', availability: 'Confirmed', location: 'Equipment Bay', status: 'Dispatched', eta: '5 minutes', details: 'Tug, GPU, and ground support equipment' },
      { type: 'Ground Handling', resource: 'Premium Ground Service Team', availability: 'Available', location: 'Gate Operations', status: 'Assigned', eta: 'On Location', details: 'Specialized team for aircraft swap operations' }
    ]
  }
  
  // Delay pattern
  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const timelineMatch = option.timeline?.match(/(\d+)/)
    const hours = timelineMatch ? parseInt(timelineMatch[1]) : 4
    const needsAccommodation = hours >= 4
    
    if (needsAccommodation) {
      return [
        { type: 'Accommodation', resource: 'Hotel Rooms', availability: 'Confirmed', location: 'Airport Hotels', status: 'Reserved', eta: 'Available Now', details: 'Block booking confirmed for passenger accommodation' },
        { type: 'Transportation', resource: 'Coach Buses', availability: 'Dispatched', location: 'Terminal Pickup Point', status: 'En Route', eta: '12 minutes', details: 'Transport service for passenger transfer' },
        { type: 'Catering', resource: 'Meal Vouchers', availability: 'Ready', location: 'Terminal F&B Partners', status: 'Printed', eta: 'Available Now', details: 'Meal allowances for all affected passengers' },
        { type: 'Technical Support', resource: 'Maintenance Team', availability: 'En Route', location: 'Maintenance Hangar', status: 'Responding', eta: '25 minutes', details: 'Specialized engineers and diagnostic equipment' },
        { type: 'Customer Service', resource: 'Service Representatives', availability: 'Available', location: 'Service Desk', status: 'Deployed', eta: 'On Location', details: 'Multilingual team for passenger assistance' }
      ]
    } else {
      return [
        { type: 'Terminal Services', resource: 'Passenger Amenities', availability: 'Available', location: 'Terminal Lounges', status: 'Ready', eta: 'Immediate', details: 'Lounge access and refreshment services' },
        { type: 'Technical Support', resource: 'Maintenance Team', availability: 'Available', location: 'Aircraft Stand', status: 'Responding', eta: '15 minutes', details: 'Quick resolution team and equipment' },
        { type: 'Customer Service', resource: 'Ground Staff', availability: 'Available', location: 'Gate Area', status: 'Deployed', eta: 'On Location', details: 'Customer service team for passenger updates' },
        { type: 'Communication', resource: 'Passenger Information System', availability: 'Active', location: 'Terminal Wide', status: 'Broadcasting', eta: 'Immediate', details: 'Real-time updates via displays and announcements' }
      ]
    }
  }
  
  // Crew replacement pattern
  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return [
      { type: 'Replacement Captain', resource: 'Standby Captain', availability: 'Confirmed', location: 'Crew Hotel/Rest Area', status: 'En Route', eta: '25 minutes', details: 'Type-rated captain with required flight hours' },
      { type: 'Replacement F/O', resource: 'Standby First Officer', availability: 'Confirmed', location: 'Crew Rest Area', status: 'Ready', eta: '5 minutes', details: 'Qualified first officer within duty limits' },
      { type: 'Cabin Crew', resource: 'Original/Replacement Cabin Crew', availability: 'Available', location: 'Gate Area', status: 'Ready', eta: 'On Location', details: 'Cabin crew assessment and replacement if needed' },
      { type: 'Training Coordinator', resource: 'Training Captain (TRI)', availability: 'On Call', location: 'Training Center', status: 'Responding', eta: '15 minutes', details: 'Extended crew briefing and documentation support' }
    ]
  }
  
  // Default resource requirements
  return [
    { type: 'Operational Resources', resource: 'Standard operational resources', availability: 'Available', location: 'Various locations', status: 'Ready', eta: 'As required', details: 'Standard resource allocation for this recovery type' },
    { type: 'Ground Support', resource: 'Ground handling team', availability: 'Available', location: 'Gate operations', status: 'Assigned', eta: 'On Location', details: 'Standard ground support services' },
    { type: 'Customer Service', resource: 'Service representatives', availability: 'Available', location: 'Terminal areas', status: 'Deployed', eta: 'On Location', details: 'Customer service support team' }
  ]
}

export const getRiskAssessment = (option) => {
  const risks = {
    'AIRCRAFT_SWAP_A320_001': [
      { risk: 'Aircraft Availability Conflict', probability: 'Low', impact: 'Medium', mitigation: 'Secondary aircraft A6-FMB confirmed standby at Terminal 3', riskScore: 3 },
      { risk: 'Passenger Baggage Transfer Delays', probability: 'Medium', impact: 'Low', mitigation: 'Priority baggage team deployed, 40-minute transfer window', riskScore: 2 },
      { risk: 'A320 vs B737 Seat Configuration Issues', probability: 'Low', impact: 'Low', mitigation: 'Similar layouts, seat map provided to passengers', riskScore: 1 },
      { risk: 'Weather Deterioration During Transfer', probability: 'Low', impact: 'High', mitigation: 'Weather forecast stable for next 3 hours', riskScore: 3 }
    ],
    'DELAY_4H_OVERNIGHT': [
      { risk: 'Hotel Capacity Insufficient', probability: 'Low', impact: 'High', mitigation: 'Overflow arrangement with 3 partner hotels confirmed', riskScore: 3 },
      { risk: 'Technical Issue More Complex Than Expected', probability: 'Medium', impact: 'High', mitigation: 'Boeing AOG team on standby, parts inventory checked', riskScore: 6 },
      { risk: 'Passenger Compensation Claims (EU261)', probability: 'High', impact: 'Medium', mitigation: 'Legal team prepared, compensation budget allocated', riskScore: 6 },
      { risk: 'Crew Duty Time Expiry Next Day', probability: 'Medium', impact: 'Medium', mitigation: 'Fresh crew on standby for morning departure', riskScore: 4 }
    ],
    'CREW_REPLACEMENT_DXB': [
      { risk: 'Standby Crew Unavailable', probability: 'Low', impact: 'High', mitigation: 'Two qualified captains confirmed available', riskScore: 3 },
      { risk: 'Extended Briefing Delays Departure', probability: 'Medium', impact: 'Low', mitigation: 'Pre-briefing materials prepared, time buffer included', riskScore: 2 },
      { risk: 'Regulatory Compliance Issues', probability: 'Low', impact: 'High', mitigation: 'All crew meet regulatory minimums, documentation verified', riskScore: 3 },
      { risk: 'Crew Fatigue After Long Duty', probability: 'Low', impact: 'Medium', mitigation: 'Fresh crew with minimal duty time, medical clearance verified', riskScore: 2 }
    ]
  }
  
  // If exact match found, return it
  if (risks[option.id]) {
    return risks[option.id]
  }
  
  // Generate dynamic risk assessment based on option type
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()
  const confidence = option.confidence || 85
  
  // Aircraft swap pattern
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    return [
      { risk: 'Aircraft Availability Conflict', probability: 'Low', impact: 'Medium', mitigation: 'Secondary aircraft options confirmed in standby', riskScore: 3 },
      { risk: 'Passenger Baggage Transfer Delays', probability: 'Medium', impact: 'Low', mitigation: 'Priority baggage team deployed with extended transfer window', riskScore: 2 },
      { risk: 'Aircraft Type Configuration Differences', probability: 'Low', impact: 'Low', mitigation: 'Similar aircraft configurations, passenger seat maps provided', riskScore: 1 },
      { risk: 'Weather Impact During Transfer', probability: 'Low', impact: 'High', mitigation: 'Weather monitoring active, contingency plans prepared', riskScore: 3 }
    ]
  }
  
  // Delay pattern
  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const timelineMatch = option.timeline?.match(/(\d+)/)
    const hours = timelineMatch ? parseInt(timelineMatch[1]) : 4
    const isLongDelay = hours >= 4
    
    return isLongDelay ? [
      { risk: 'Accommodation Capacity Issues', probability: 'Low', impact: 'High', mitigation: 'Multiple hotel partnerships and overflow arrangements confirmed', riskScore: 3 },
      { risk: 'Extended Resolution Time', probability: 'Medium', impact: 'High', mitigation: 'Specialist teams on standby, parts inventory verified', riskScore: 6 },
      { risk: 'Passenger Compensation Claims', probability: 'High', impact: 'Medium', mitigation: 'Legal compliance team prepared, compensation budget allocated', riskScore: 6 },
      { risk: 'Crew Duty Time Limitations', probability: 'Medium', impact: 'Medium', mitigation: 'Fresh crew on standby for next departure', riskScore: 4 }
    ] : [
      { risk: 'Extended Resolution Time', probability: 'Medium', impact: 'Medium', mitigation: 'Technical teams responding, time buffers included', riskScore: 4 },
      { risk: 'Passenger Dissatisfaction', probability: 'Medium', impact: 'Low', mitigation: 'Terminal amenities and regular updates provided', riskScore: 2 },
      { risk: 'Connecting Flight Impacts', probability: 'High', impact: 'Medium', mitigation: 'Rebooking team active, partner airline coordination', riskScore: 6 },
      { risk: 'Weather Window Closure', probability: 'Low', impact: 'High', mitigation: 'Weather monitoring, alternative plans prepared', riskScore: 3 }
    ]
  }
  
  // Crew replacement pattern
  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return [
      { risk: 'Standby Crew Unavailable', probability: 'Low', impact: 'High', mitigation: 'Multiple qualified crew members confirmed available', riskScore: 3 },
      { risk: 'Extended Briefing Time', probability: 'Medium', impact: 'Low', mitigation: 'Pre-briefing materials prepared, time buffers included', riskScore: 2 },
      { risk: 'Regulatory Compliance Issues', probability: 'Low', impact: 'High', mitigation: 'All crew qualifications verified, documentation current', riskScore: 3 },
      { risk: 'Crew Coordination Challenges', probability: 'Low', impact: 'Medium', mitigation: 'Training coordinator available, standardized procedures', riskScore: 2 }
    ]
  }
  
  // Cancellation pattern
  if (optionId.includes('cancel') || optionTitle.includes('cancel')) {
    return [
      { risk: 'Alternative Flight Capacity', probability: 'High', impact: 'High', mitigation: 'Partner airline agreements, multiple rebooking options', riskScore: 9 },
      { risk: 'Passenger Compensation Costs', probability: 'High', impact: 'Medium', mitigation: 'Compensation budget allocated, efficient processing system', riskScore: 6 },
      { risk: 'Baggage Handling Complexity', probability: 'Medium', impact: 'Medium', mitigation: 'Dedicated baggage team, tracking systems active', riskScore: 4 },
      { risk: 'Customer Satisfaction Impact', probability: 'High', impact: 'Medium', mitigation: 'Service recovery program, compensation packages', riskScore: 6 }
    ]
  }
  
  // Default risk assessment based on confidence level
  const baseRisk = confidence > 90 ? 'Low' : confidence > 75 ? 'Medium' : 'High'
  const riskMultiplier = confidence > 90 ? 2 : confidence > 75 ? 4 : 6
  
  return [
    { risk: 'Implementation Complexity', probability: baseRisk, impact: 'Medium', mitigation: 'Experienced team assigned, procedures well documented', riskScore: Math.min(riskMultiplier, 6) },
    { risk: 'Resource Availability', probability: 'Medium', impact: 'Medium', mitigation: 'Backup resources identified, contingency plans prepared', riskScore: 4 },
    { risk: 'Timeline Adherence', probability: baseRisk, impact: 'Low', mitigation: 'Buffer time included, monitoring systems active', riskScore: Math.min(riskMultiplier / 2, 3) },
    { risk: 'Passenger Impact', probability: 'Medium', impact: 'Medium', mitigation: 'Communication plan active, service recovery measures prepared', riskScore: 4 }
  ]
}

export const getTechnicalSpecs = (option) => {
  const specs = {
    'AIRCRAFT_SWAP_A320_001': {
      implementation: 'Hot swap protocol with parallel ground operations and priority aircraft positioning',
      systemsRequired: ['ACARS Real-time Updates', 'Ground Power Unit', 'Baggage Transfer System', 'Passenger Information Display'],
      certifications: ['EASA Type Certificate', 'GCAA Operational Approval', 'FAA Category III Weather Capability'],
      maintenanceStatus: 'A-Check completed 72 hours ago, 247 flight hours remaining until next inspection',
      fuelRequirement: '14,200 kg (sufficient for route + 45min holding + diversion reserves)',
      weatherLimitations: 'Category III approach capability, no weather restrictions for DXB-BOM route',
      aircraftSpecs: 'A320-232, 180 seats (174Y+6J), WiFi enabled, entertainment system operational',
      routeApproval: 'Certified for all flydubai destinations, current route approval valid'
    },
    'DELAY_4H_OVERNIGHT': {
      implementation: 'Comprehensive delay management with passenger care services',
      systemsRequired: ['Hotel Booking System', 'Transport Coordination', 'Passenger Notification Platform'],
      certifications: ['EU261 Compliance', 'UAE Passenger Rights Compliance', 'IATA Resolution 824'],
      maintenanceStatus: 'Technical inspection scheduled, Boeing specialist team assigned',
      timeFramework: '4-hour window allows complete diagnostic and repair cycle',
      weatherLimitations: 'Weather improvement expected within 3.5 hours based on meteorological data',
      passengerCare: 'Full meal, accommodation, and transport provision per airline policy',
      regulatoryCompliance: 'Meets all passenger care requirements for delay duration'
    },
    'CREW_REPLACEMENT_DXB': {
      implementation: 'Emergency crew replacement with extended briefing protocol',
      systemsRequired: ['Crew Management System', 'Training Records Database', 'Duty Time Tracking'],
      certifications: ['GCAA Crew Licensing', 'Flydubai Type Ratings', 'Current Medical Certificates'],
      crewQualifications: 'All replacement crew current on B737-800, route qualified',
      dutyTimeCompliance: 'Fresh crew well within all regulatory duty time limitations',
      briefingRequirements: 'Extended briefing for crew pairing, weather, NOTAMs, special procedures',
      backupResources: 'Second standby crew available if primary replacement unavailable',
      trainingStatus: 'All crew current on recurrent training, emergency procedures up to date'
    }
  }
  
  // If exact match found, return it
  if (specs[option.id]) {
    return specs[option.id]
  }
  
  // Generate dynamic technical specs based on option type
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()
  
  // Aircraft swap pattern
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    return {
      implementation: 'Aircraft swap protocol with coordinated ground operations and priority positioning',
      systemsRequired: ['ACARS Real-time Updates', 'Ground Power Unit', 'Baggage Transfer System', 'Passenger Information Display', 'Aircraft Positioning Coordination'],
      certifications: ['EASA Type Certificate', 'GCAA Operational Approval', 'Route-specific Weather Capability'],
      maintenanceStatus: 'Replacement aircraft maintenance status verified, airworthiness certificate current',
      fuelRequirement: 'Route-specific fuel planning with regulatory reserves and contingency allowances',
      weatherLimitations: 'Standard weather operational limits, current conditions monitored',
      aircraftSpecs: 'Replacement aircraft specifications compatible with route requirements',
      routeApproval: 'Aircraft certified for destination, operational approvals verified'
    }
  }
  
  // Delay pattern
  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const timelineMatch = option.timeline?.match(/(\d+)/)
    const hours = timelineMatch ? parseInt(timelineMatch[1]) : 4
    
    return {
      implementation: 'Comprehensive delay management with passenger care and issue resolution',
      systemsRequired: hours >= 4 ? ['Hotel Booking System', 'Transport Coordination', 'Passenger Notification Platform', 'Maintenance Support Systems'] : ['Terminal Services System', 'Passenger Notification Platform', 'Maintenance Support Systems'],
      certifications: ['EU261 Compliance', 'UAE Passenger Rights Compliance', 'IATA Resolution 824'],
      maintenanceStatus: 'Technical teams assigned for issue resolution during delay period',
      timeFramework: `${hours}-hour window allows for comprehensive issue resolution and passenger care`,
      weatherLimitations: 'Weather conditions monitored, improvement timeline assessed',
      passengerCare: hours >= 4 ? 'Full meal, accommodation, and transport provision per airline policy' : 'Terminal amenities and refreshment services provided',
      regulatoryCompliance: 'Meets all passenger care requirements for delay duration and circumstances'
    }
  }
  
  // Crew replacement pattern
  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return {
      implementation: 'Emergency crew replacement with extended briefing and qualification verification',
      systemsRequired: ['Crew Management System', 'Training Records Database', 'Duty Time Tracking', 'Qualification Verification System'],
      certifications: ['GCAA Crew Licensing', 'Flydubai Type Ratings', 'Current Medical Certificates', 'Route Qualifications'],
      crewQualifications: 'All replacement crew verified current on aircraft type, route qualified',
      dutyTimeCompliance: 'Fresh crew well within all regulatory duty time limitations and rest requirements',
      briefingRequirements: 'Extended briefing for crew pairing, weather, NOTAMs, special procedures, and current conditions',
      backupResources: 'Additional standby crew available if primary replacement unavailable',
      trainingStatus: 'All crew current on recurrent training, emergency procedures, and company standards'
    }
  }
  
  // Default technical specs
  return {
    implementation: 'Standard recovery procedures following approved operational protocols',
    systemsRequired: ['Basic operational systems', 'Communication platforms', 'Monitoring systems'],
    certifications: ['Standard operational certifications', 'Regulatory compliance maintained'],
    maintenanceStatus: 'Current maintenance status verified, technical support available',
    operationalRequirements: 'All operational requirements met for safe and compliant implementation',
    regulatoryCompliance: 'Full compliance with aviation regulations and company procedures',
    resourceAvailability: 'Required resources confirmed available and allocated',
    systemIntegration: 'Integration with existing operational systems verified'
  }
}

export const getHistoricalData = (option) => {
  const baseData = {
    similarScenarios: Math.floor(Math.random() * 25) + 8,
    successRate: Math.floor(Math.random() * 15) + 85,
    avgExecutionTime: `${Math.floor(Math.random() * 45) + 35} minutes`,
    avgCostVariance: `±${Math.floor(Math.random() * 12) + 8}%`,
    lastUsed: `${Math.floor(Math.random() * 15) + 2} days ago`,
    passengerSatisfaction: Math.floor(Math.random() * 15) + 78
  }

  const specificData = {
    'AIRCRAFT_SWAP_A320_001': {
      ...baseData,
      successRate: 94,
      avgExecutionTime: '68 minutes',
      avgCostVariance: '±12%',
      specificNotes: 'Most successful during operational hours 06:00-22:00',
      seasonalTrends: 'Higher success rate during winter months (Nov-Mar)',
      previousIncidents: 'Last failure: baggage transfer delay (15 days ago)'
    },
    'DELAY_4H_OVERNIGHT': {
      ...baseData,
      successRate: 89,
      avgExecutionTime: '4h 23m',
      avgCostVariance: '±18%',
      specificNotes: 'Hotel availability critical factor in success',
      seasonalTrends: 'Challenges during peak season (Dec-Feb, Jun-Aug)',
      previousIncidents: 'Last issue: hotel overbooking (8 days ago)'
    },
    'CREW_REPLACEMENT_DXB': {
      ...baseData,
      successRate: 96,
      avgExecutionTime: '52 minutes',
      avgCostVariance: '±8%',
      specificNotes: 'Fastest resolution when standby crew on-site',
      seasonalTrends: 'Consistent performance year-round',
      previousIncidents: 'Perfect record last 30 days'
    }
  }

  // If exact match found, return it
  if (specificData[option.id]) {
    return specificData[option.id]
  }

  // Generate contextual historical data based on option type and confidence
  const confidence = option.confidence || 85
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()

  // Adjust success rate based on confidence
  const adjustedSuccessRate = Math.min(98, Math.max(75, confidence + Math.floor(Math.random() * 10) - 5))
  
  // Pattern-based historical data
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    return {
      ...baseData,
      successRate: adjustedSuccessRate,
      avgExecutionTime: `${Math.floor(Math.random() * 30) + 50} minutes`,
      avgCostVariance: '±12%',
      specificNotes: 'Most successful during operational hours, depends on aircraft availability',
      seasonalTrends: 'Higher success rate during winter months due to better weather conditions',
      previousIncidents: `Last issue: ${Math.floor(Math.random() * 20) + 5} days ago`
    }
  }

  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const timelineMatch = option.timeline?.match(/(\d+)/)
    const hours = timelineMatch ? parseInt(timelineMatch[1]) : 4
    
    return {
      ...baseData,
      successRate: adjustedSuccessRate,
      avgExecutionTime: hours >= 4 ? `${hours}h ${Math.floor(Math.random() * 30) + 15}m` : `${hours * 60 + Math.floor(Math.random() * 30)} minutes`,
      avgCostVariance: hours >= 4 ? '±18%' : '±10%',
      specificNotes: hours >= 4 ? 'Hotel availability critical factor in success' : 'Terminal service capacity important for passenger comfort',
      seasonalTrends: 'Challenges during peak travel seasons and weather events',
      previousIncidents: `Last issue: ${Math.floor(Math.random() * 15) + 3} days ago`
    }
  }

  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return {
      ...baseData,
      successRate: adjustedSuccessRate,
      avgExecutionTime: `${Math.floor(Math.random() * 25) + 45} minutes`,
      avgCostVariance: '±8%',
      specificNotes: 'Fastest resolution when standby crew available on-site',
      seasonalTrends: 'Consistent performance year-round, slight challenges during peak holidays',
      previousIncidents: `Perfect record last ${Math.floor(Math.random() * 20) + 10} days`
    }
  }

  return {
    ...baseData,
    successRate: adjustedSuccessRate,
    specificNotes: 'Performance varies based on operational conditions and resource availability',
    seasonalTrends: 'Generally consistent performance with seasonal variations',
    previousIncidents: `Last review: ${Math.floor(Math.random() * 10) + 2} days ago`
  }
}

export const getAlternativeConsiderations = (option, flight) => {
  const considerations = {
    'AIRCRAFT_SWAP_A320_001': [
      `Cancellation considered but ${flight?.passengers || 167} passengers would face 24-hour delay until next available slot`,
      'Partner airline Emirates has limited availability (only 45 seats) on next 3 flights',
      'Delay option rejected as technical issue requires 6+ hours resolution time',
      'Aircraft swap selected as optimal balance: maintains schedule, acceptable cost, minimal passenger impact',
      'Alternative A6-FMB aircraft available but requires 2-hour positioning from Sharjah'
    ],
    'DELAY_4H_OVERNIGHT': [
      'Aircraft swap evaluated but no suitable replacement available at DXB',
      'Diversion to AUH considered but adds 3 hours to passenger journey time',
      'Partner codeshare has only 89 available seats, requiring split solutions',
      '4-hour delay chosen to ensure complete technical resolution and passenger safety',
      'Shorter 2-hour delay insufficient for comprehensive Boeing inspection requirements'
    ],
    'CREW_REPLACEMENT_DXB': [
      'Flight cancellation avoided through rapid standby crew deployment',
      'Delay until next day considered but passenger accommodation costs exceed crew replacement',
      'Partner airline option available but would require passenger re-booking complexity',
      'Crew replacement fastest solution with minimal passenger disruption',
      'Original crew available for next rotation after mandatory rest period'
    ]
  }
  
  // If exact match found, return it
  if (considerations[option.id]) {
    return considerations[option.id]
  }
  
  // Generate dynamic considerations based on option type
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()
  const passengers = flight?.passengers || 167
  const origin = flight?.origin || 'DXB'
  const destination = flight?.destination || 'BOM'
  
  // Aircraft swap pattern
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    return [
      `Cancellation considered but ${passengers} passengers would face significant delays until next available departure`,
      `Partner airline has limited availability on ${origin}-${destination} route during this timeframe`,
      'Extended delay option evaluated but technical issue resolution time uncertain',
      'Aircraft swap selected as optimal balance: maintains schedule integrity, acceptable cost, minimal passenger impact',
      'Alternative aircraft options evaluated with positioning requirements and route certifications considered'
    ]
  }
  
  // Delay pattern
  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const timelineMatch = option.timeline?.match(/(\d+)/)
    const hours = timelineMatch ? parseInt(timelineMatch[1]) : 4
    
    return [
      'Aircraft swap evaluated but suitable replacement aircraft not immediately available',
      `Diversion to alternative airport considered but adds significant travel time for ${passengers} passengers`,
      `Partner airline codeshare has limited capacity, would require split passenger solutions`,
      `${hours}-hour delay chosen to ensure complete issue resolution and maintain safety standards`,
      hours >= 4 ? 'Shorter delay options insufficient for comprehensive technical resolution requirements' : 'Extended delay avoided through focused technical intervention approach'
    ]
  }
  
  // Crew replacement pattern
  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return [
      'Flight cancellation avoided through efficient standby crew deployment procedures',
      'Extended delay until next day considered but passenger accommodation costs exceed crew replacement',
      'Partner airline assistance available but would require complex passenger rebooking coordination',
      'Crew replacement selected as fastest solution with minimal passenger disruption',
      'Original crew will be available for subsequent rotations after mandatory rest period compliance'
    ]
  }
  
  // Cancellation pattern
  if (optionId.includes('cancel') || optionTitle.includes('cancel')) {
    return [
      `All ${passengers} passengers will be accommodated on alternative flights with priority rebooking`,
      'Delay options evaluated but resolution timeline exceeds acceptable passenger wait time',
      'Aircraft swap considered but replacement aircraft not available within reasonable timeframe',
      'Cancellation selected to ensure passenger welfare and regulatory compliance',
      'Partner airline coordination active to minimize rebooking delays and provide alternative routing options'
    ]
  }
  
  // Default considerations
  return [
    'Comprehensive evaluation completed for all available recovery alternatives',
    'Current option selected based on optimal cost-benefit analysis and operational constraints',
    'Passenger impact assessment prioritized while maintaining safety and regulatory compliance',
    'Alternative solutions remain available as backup options if circumstances change',
    'Continuous monitoring ensures adaptation to evolving operational conditions'
  ]
}

export const getStakeholderImpact = (option, flight) => {
  const passengerCount = flight?.passengers || 167
  const vipCount = Math.floor(passengerCount * 0.08) // ~8% VIP
  const connectingCount = Math.floor(passengerCount * 0.25) // ~25% connecting
  const origin = flight?.origin || 'DXB'
  const destination = flight?.destination || 'BOM'
  
  return {
    passengers: { 
      impact: `${passengerCount} passengers affected, ${vipCount} VIP priority passengers`, 
      sentiment: 'Concerned but cooperative with recovery efforts', 
      actions: `Proactive SMS/email notifications sent, special assistance for ${vipCount} VIP passengers`,
      details: `${connectingCount} connecting passengers require rebooking assistance and coordination`
    },
    crew: { 
      impact: 'Flight and cabin crew operational status adjusted according to recovery plan', 
      sentiment: 'Professional cooperation and readiness', 
      actions: 'Appropriate compensation approved, crew meal and rest provisions arranged',
      details: 'Crew scheduling optimized for subsequent rotations and regulatory compliance'
    },
    airports: { 
      impact: `Gate and resource coordination at ${origin}, ground handling priority established`, 
      sentiment: 'Fully cooperative with recovery operations', 
      actions: 'Priority slot allocation confirmed, expedited ground services activated',
      details: 'Airport operations center coordinating all ground support and resource allocation'
    },
    partners: { 
      impact: 'Ground handling services, partner airlines, and service providers coordinated', 
      sentiment: 'Supportive partnership cooperation', 
      actions: 'Priority service agreements activated, partnership protocols engaged',
      details: 'Partner airlines offering backup capacity and coordination if additional support needed'
    },
    management: { 
      impact: `Cost impact: ${option.cost}, operational disruption contained within acceptable parameters`, 
      sentiment: 'Solution approved and monitoring active', 
      actions: 'Budget allocation confirmed, operations director monitoring progress and outcomes',
      details: 'Full incident debrief scheduled post-recovery for continuous improvement analysis'
    },
    regulators: { 
      impact: 'GCAA notification protocols followed, passenger rights compliance maintained', 
      sentiment: 'Regulatory compliance satisfied', 
      actions: 'Standard regulatory reporting completed, passenger rights protection ensured',
      details: 'All safety and operational regulations fully complied with throughout recovery process'
    }
  }
}

export const getEditableParameters = (option) => {
  const editableParams = {
    'AIRCRAFT_SWAP_A320_001': [
      { name: 'Replacement Aircraft', type: 'select', value: 'A6-FMC (A320)', options: ['A6-FMC (A320)', 'A6-FMB (A320)', 'A6-FDK (B737-800)'], impact: 'cost', description: 'Alternative aircraft selection' },
      { name: 'Transfer Time Buffer', type: 'slider', value: 40, min: 25, max: 60, unit: 'minutes', impact: 'timeline', description: 'Additional time for passenger/baggage transfer' },
      { name: 'Priority Level', type: 'select', value: 'Standard', options: ['Standard', 'High', 'Emergency'], impact: 'cost', description: 'Resource allocation priority' },
      { name: 'Passenger Compensation', type: 'switch', value: false, impact: 'cost', description: 'Additional compensation beyond standard' }
    ],
    'DELAY_4H_OVERNIGHT': [
      { name: 'Delay Duration', type: 'slider', value: 240, min: 120, max: 480, unit: 'minutes', impact: 'cost', description: 'Total delay time' },
      { name: 'Hotel Category', type: 'select', value: 'Standard', options: ['Budget', 'Standard', 'Premium'], impact: 'cost', description: 'Accommodation level' },
      { name: 'Meal Allowance', type: 'slider', value: 75, min: 50, max: 120, unit: 'AED', impact: 'cost', description: 'Per passenger meal voucher value' },
      { name: 'Transport Type', type: 'select', value: 'Coach', options: ['Coach', 'Individual Taxi', 'Mixed'], impact: 'cost', description: 'Passenger transportation method' }
    ],
    'CREW_REPLACEMENT_DXB': [
      { name: 'Replacement Captain', type: 'select', value: 'Capt. Al-Zaabi', options: ['Capt. Al-Zaabi', 'Capt. Al-Mahmoud', 'Capt. Singh'], impact: 'timeline', description: 'Available standby captains' },
      { name: 'Briefing Duration', type: 'slider', value: 35, min: 20, max: 60, unit: 'minutes', impact: 'timeline', description: 'Extended crew briefing time' },
      { name: 'Crew Transport', type: 'select', value: 'Standard', options: ['Standard', 'Priority', 'Helicopter'], impact: 'cost', description: 'Crew transportation method' }
    ]
  }
  
  // If exact match found, return it
  if (editableParams[option.id]) {
    return editableParams[option.id]
  }
  
  // Generate dynamic parameters based on option type
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()
  
  // Aircraft swap pattern
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    return [
      { name: 'Replacement Aircraft', type: 'select', value: 'Auto-Selected', options: ['Auto-Selected', 'A320 Family', 'B737 Family', 'Alternative Type'], impact: 'cost', description: 'Aircraft type selection' },
      { name: 'Transfer Time Buffer', type: 'slider', value: 40, min: 25, max: 60, unit: 'minutes', impact: 'timeline', description: 'Additional time for passenger/baggage transfer' },
      { name: 'Priority Level', type: 'select', value: 'Standard', options: ['Standard', 'High', 'Emergency'], impact: 'cost', description: 'Resource allocation priority' },
      { name: 'Passenger Compensation', type: 'switch', value: false, impact: 'cost', description: 'Additional compensation beyond standard' }
    ]
  }
  
  // Delay pattern
  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const timelineMatch = option.timeline?.match(/(\d+)/)
    const defaultMinutes = timelineMatch ? parseInt(timelineMatch[1]) * 60 : 240
    
    return [
      { name: 'Delay Duration', type: 'slider', value: defaultMinutes, min: 60, max: 720, unit: 'minutes', impact: 'cost', description: 'Total delay time' },
      { name: 'Accommodation Level', type: 'select', value: 'Standard', options: ['Budget', 'Standard', 'Premium'], impact: 'cost', description: 'Passenger accommodation level' },
      { name: 'Meal Allowance', type: 'slider', value: 75, min: 50, max: 120, unit: 'AED', impact: 'cost', description: 'Per passenger meal voucher value' },
      { name: 'Transport Method', type: 'select', value: 'Coach', options: ['Coach', 'Individual Taxi', 'Mixed'], impact: 'cost', description: 'Passenger transportation method' }
    ]
  }
  
  // Crew replacement pattern
  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return [
      { name: 'Crew Selection', type: 'select', value: 'Auto-Assigned', options: ['Auto-Assigned', 'Specific Captain', 'Nearest Available'], impact: 'timeline', description: 'Crew assignment method' },
      { name: 'Briefing Duration', type: 'slider', value: 35, min: 20, max: 60, unit: 'minutes', impact: 'timeline', description: 'Extended crew briefing time' },
      { name: 'Transport Priority', type: 'select', value: 'Standard', options: ['Standard', 'Priority', 'Emergency'], impact: 'cost', description: 'Crew transportation priority' },
      { name: 'Backup Crew Alert', type: 'switch', value: true, impact: 'cost', description: 'Alert additional backup crew' }
    ]
  }
  
  // Default parameters
  return [
    { name: 'Implementation Priority', type: 'select', value: 'Standard', options: ['Standard', 'High', 'Emergency'], impact: 'cost', description: 'Resource allocation priority' },
    { name: 'Timeline Buffer', type: 'slider', value: 15, min: 5, max: 45, unit: 'minutes', impact: 'timeline', description: 'Additional time buffer for implementation' },
    { name: 'Passenger Communication', type: 'select', value: 'Standard', options: ['Basic', 'Standard', 'Enhanced'], impact: 'cost', description: 'Level of passenger communication and updates' }
  ]
}

export const getWhatIfScenarios = (option) => {
  const scenarios = {
    'AIRCRAFT_SWAP_A320_001': [
      { scenario: 'Original aircraft becomes available', impact: 'Save AED 28,500 positioning cost', probability: 15, timeline: '2 hours' },
      { scenario: 'A320 experiences technical delay', impact: 'Additional AED 12,000 + 45min delay', probability: 8, timeline: '1.5 hours' },
      { scenario: 'Passenger connections missed', impact: 'AED 8,500 rebooking costs', probability: 12, timeline: 'Immediate' }
    ],
    'DELAY_4H_OVERNIGHT': [
      { scenario: 'Weather clears earlier than expected', impact: 'Save AED 15,000 hotel costs', probability: 25, timeline: '2.5 hours' },
      { scenario: 'Hotel capacity insufficient', impact: 'Additional AED 8,000 alternative accommodation', probability: 10, timeline: '30 minutes' },
      { scenario: 'Extended delay to 6+ hours', impact: 'Additional AED 22,000 costs + compensation', probability: 18, timeline: '4 hours' }
    ],
    'CREW_REPLACEMENT_DXB': [
      { scenario: 'Standby crew unavailable', impact: 'AED 35,000 external crew procurement', probability: 12, timeline: '3 hours' },
      { scenario: 'Original crew becomes available', impact: 'Save AED 18,000 standby costs', probability: 8, timeline: '1 hour' },
      { scenario: 'Extended briefing required', impact: 'Additional AED 3,500 + 30min delay', probability: 30, timeline: '45 minutes' }
    ]
  }
  
  // If exact match found, return it
  if (scenarios[option.id]) {
    return scenarios[option.id]
  }
  
  // Generate dynamic what-if scenarios based on option type
  const optionTitle = (option.title || '').toLowerCase()
  const optionId = (option.id || '').toLowerCase()
  const costMatch = (option.cost || '').match(/[\d,]+/)
  const baseCost = costMatch ? parseInt(costMatch[0].replace(/,/g, '')) : 50000
  
  // Aircraft swap pattern
  if (optionId.includes('aircraft_swap') || optionTitle.includes('aircraft swap') || optionTitle.includes('swap aircraft')) {
    return [
      { scenario: 'Original aircraft issue resolved quickly', impact: `Save AED ${Math.round(baseCost * 0.4).toLocaleString()} positioning cost`, probability: 15, timeline: '2 hours' },
      { scenario: 'Replacement aircraft experiences delay', impact: `Additional AED ${Math.round(baseCost * 0.2).toLocaleString()} + extended delay`, probability: 8, timeline: '1.5 hours' },
      { scenario: 'Passenger connections missed due to delay', impact: `AED ${Math.round(baseCost * 0.15).toLocaleString()} rebooking costs`, probability: 12, timeline: 'Immediate' },
      { scenario: 'Weather impacts aircraft positioning', impact: `Additional AED ${Math.round(baseCost * 0.1).toLocaleString()} + delay`, probability: 20, timeline: '1 hour' }
    ]
  }
  
  // Delay pattern
  if (optionId.includes('delay') || optionTitle.includes('delay')) {
    const timelineMatch = option.timeline?.match(/(\d+)/)
    const hours = timelineMatch ? parseInt(timelineMatch[1]) : 4
    
    return [
      { scenario: 'Issue resolved earlier than expected', impact: `Save AED ${Math.round(baseCost * 0.3).toLocaleString()} accommodation costs`, probability: 25, timeline: `${Math.max(1, hours - 2)} hours` },
      { scenario: hours >= 4 ? 'Hotel capacity insufficient' : 'Terminal capacity issues', impact: `Additional AED ${Math.round(baseCost * 0.15).toLocaleString()} alternative arrangements`, probability: 10, timeline: '30 minutes' },
      { scenario: 'Extended delay required', impact: `Additional AED ${Math.round(baseCost * 0.4).toLocaleString()} costs + compensation`, probability: 18, timeline: `${hours + 2} hours` },
      { scenario: 'Passenger rebooking requests', impact: `AED ${Math.round(baseCost * 0.2).toLocaleString()} alternative flight costs`, probability: 15, timeline: 'Immediate' }
    ]
  }
  
  // Crew replacement pattern
  if (optionId.includes('crew') || optionTitle.includes('crew')) {
    return [
      { scenario: 'Standby crew unavailable at critical time', impact: `AED ${Math.round(baseCost * 1.5).toLocaleString()} external crew procurement`, probability: 12, timeline: '3 hours' },
      { scenario: 'Original crew situation resolved', impact: `Save AED ${Math.round(baseCost * 0.8).toLocaleString()} standby costs`, probability: 8, timeline: '1 hour' },
      { scenario: 'Extended briefing or training required', impact: `Additional AED ${Math.round(baseCost * 0.2).toLocaleString()} + extended delay`, probability: 30, timeline: '45 minutes' },
      { scenario: 'Weather impacts crew transport', impact: `Additional AED ${Math.round(baseCost * 0.1).toLocaleString()} + delay`, probability: 15, timeline: '30 minutes' }
    ]
  }
  
  // Default scenarios
  return [
    { scenario: 'Standard recovery proceeds smoothly', impact: 'No additional costs, on-time completion', probability: 70, timeline: 'As planned' },
    { scenario: 'Minor complications arise', impact: `Additional ${Math.round(baseCost * 0.15).toLocaleString()} AED cost overhead`, probability: 20, timeline: '+30 minutes' },
    { scenario: 'Major complications require alternative approach', impact: 'Switch to backup recovery option', probability: 10, timeline: '+2 hours' }
  ]
}