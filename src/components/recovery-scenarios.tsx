import { Wrench, Users, CloudRain, Building, RotateCw } from "lucide-react";

// Aircraft Issue Recovery - 8-Step Process
export const getAircraftIssueRecovery = () => {
  return {
    title: "Aircraft Issue Recovery (AOG)",
    description: "A6-FDB hydraulics failure - Ground Stop Required",
    icon: Wrench,
    priority: "CRITICAL",
    estimatedTime: "4-6 hours",
    steps: [
      {
        step: 1,
        title: "Ground Alert Triggered in AMOS",
        status: "completed",
        timestamp: "14:15:00",
        system: "AMOS MRO System",
        details: "Hydraulic system warning detected - Aircraft A6-FDB grounded",
        data: {
          alertType: "Hydraulic System Failure",
          severity: "Ground Stop Required",
          amosRef: "AMOS-2025-0110-FDB-001",
          location: "DXB Gate A12",
        },
      },
      {
        step: 2,
        title: "Assess Estimated Repair Time",
        status: "completed",
        timestamp: "14:18:00",
        system: "Maintenance Planning",
        details: "ETA from maintenance: 4-6 hours, parts available",
        data: {
          estimatedRepair: "4-6 hours",
          partsAvailable: "Yes - In stock at DXB",
          engineerAssigned: "Lead Hydraulics Specialist",
          completionETA: "20:30 GST",
        },
      },
      {
        step: 3,
        title: "Generate Rotation Impact Tree",
        status: "completed",
        timestamp: "14:20:00",
        system: "AERON Analytics",
        details: "Analyzing downstream flights and overnight implications",
        data: {
          affectedFlights: 3,
          totalPassengers: 456,
          revenueImpact: "AED 890K",
          curfewBreaches: "None identified",
          overnightImplications: "DEL turnaround affected",
        },
      },
      {
        step: 4,
        title: "Identify Alternative Aircraft",
        status: "completed",
        timestamp: "14:22:00",
        system: "Aircraft Optimizer",
        details: "Same type & config, available and ferryable aircraft found",
        data: {
          sameType: "A320-200 (3 available)",
          bestOption: "A6-FDC - Available at Gate A8",
          secondOption: "A6-FDH - Arriving 15:45",
          compatibility: "100% passenger configuration match",
        },
      },
      {
        step: 5,
        title: "Evaluate Options",
        status: "completed",
        timestamp: "14:25:00",
        system: "Decision Engine",
        details: "Swap aircraft vs delay vs cancel analysis complete",
        data: {
          swapCost: "AED 45,000 (Recommended)",
          delayCost: "AED 180,000",
          cancelCost: "AED 520,000",
          recommendation: "Aircraft Swap - A6-FDC",
        },
      },
      {
        step: 6,
        title: "Adjust Crew Pairing",
        status: "completed",
        timestamp: "14:27:00",
        system: "Crew Management",
        details: "Crew readiness verified for replacement aircraft",
        data: {
          crewAction: "Transfer to A6-FDC",
          briefingRequired: "15 minutes",
          dutyTimeImpact: "+1.25 hours (within limits)",
          positioning: "Gate A12 → A8",
        },
      },
      {
        step: 7,
        title: "Notify Stakeholders",
        status: "completed",
        timestamp: "14:30:00",
        system: "Communication Hub",
        details: "All stakeholders notified and passenger communications sent",
        data: {
          crewNotified: "✓ CrewApp + SMS",
          stationsNotified: "✓ DXB Ops, DEL Station",
          pssNotified: "✓ Amadeus, DCS Updated",
          passengersNotified: "456 passengers - 75min delay",
        },
      },
      {
        step: 8,
        title: "Recalculate Rotations",
        status: "completed",
        timestamp: "14:35:00",
        system: "Network Optimizer",
        details: "Downstream rotations and maintenance status updated",
        data: {
          rotationImpact: "Minimal network disruption",
          maintenanceUpdated: "A6-FDC schedule adjusted",
          costSavings: "88% vs cancellation",
          networkOptimization: "Complete",
        },
      },
    ],
    options: [
      {
        id: "SWAP_A6FDC",
        title: "Aircraft Swap - A6-FDC",
        description: "Immediate tail swap with available A320",
        cost: "AED 45,000",
        timeline: "75 minutes",
        confidence: 95,
        impact: "Minimal passenger disruption",
        status: "recommended",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ445",
              aircraft: "A6-FDB",
              time: "15:30-19:15",
              status: "affected",
            },
            {
              flight: "FZ446",
              aircraft: "A6-FDB",
              time: "20:45-00:30+1",
              status: "affected",
            },
            {
              flight: "FZ447",
              aircraft: "A6-FDB",
              time: "02:15+1-06:00+1",
              status: "affected",
            },
          ],
          newPlan: [
            {
              flight: "FZ445",
              aircraft: "A6-FDC",
              time: "16:45-20:30",
              status: "swapped",
            },
            {
              flight: "FZ446",
              aircraft: "A6-FDC",
              time: "22:00-01:45+1",
              status: "swapped",
            },
            {
              flight: "FZ447",
              aircraft: "A6-FDC",
              time: "03:30+1-07:15+1",
              status: "swapped",
            },
          ],
          advantages: [
            "Same aircraft type - no passenger impact",
            "A6-FDC available immediately",
            "Maintains 97% of schedule integrity",
            "No overnight accommodation needed",
          ],
          considerations: [
            "A6-FDC delayed for its next flight by 60 minutes",
            "Crew briefing required for aircraft change",
            "Passenger transfer time: 30 minutes",
          ],
        },
      },
      {
        id: "DELAY_REPAIR",
        title: "Delay for Repair Completion",
        description: "Wait for A6-FDB hydraulics system repair",
        cost: "AED 180,000",
        timeline: "4-6 hours",
        confidence: 45,
        impact: "Significant passenger disruption",
        status: "caution",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ445",
              aircraft: "A6-FDB",
              time: "15:30-19:15",
              status: "affected",
            },
            {
              flight: "FZ446",
              aircraft: "A6-FDB",
              time: "20:45-00:30+1",
              status: "affected",
            },
            {
              flight: "FZ447",
              aircraft: "A6-FDB",
              time: "02:15+1-06:00+1",
              status: "affected",
            },
          ],
          newPlan: [
            {
              flight: "FZ445",
              aircraft: "A6-FDB",
              time: "20:30-00:15+1",
              status: "delayed",
            },
            {
              flight: "FZ446",
              aircraft: "A6-FDB",
              time: "01:45+1-05:30+1",
              status: "delayed",
            },
            {
              flight: "FZ447",
              aircraft: "A6-FDB",
              time: "07:15+1-11:00+1",
              status: "delayed",
            },
          ],
          advantages: [
            "Original aircraft maintained",
            "No aircraft swap complexity",
            "Lower immediate operational costs",
          ],
          considerations: [
            "Repair ETA uncertain (4-6 hours)",
            "Massive passenger accommodation needed",
            "Cascade delays to next day operations",
            "Crew rest period management required",
          ],
        },
      },
      {
        id: "CANCEL_REBOOK",
        title: "Cancel and Rebook",
        description: "Cancel FZ445 and rebook on partner airlines",
        cost: "AED 520,000",
        timeline: "Immediate",
        confidence: 75,
        impact: "Complete route cancellation",
        status: "warning",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ445",
              aircraft: "A6-FDB",
              time: "15:30-19:15",
              status: "affected",
            },
            {
              flight: "FZ446",
              aircraft: "A6-FDB",
              time: "20:45-00:30+1",
              status: "affected",
            },
            {
              flight: "FZ447",
              aircraft: "A6-FDB",
              time: "02:15+1-06:00+1",
              status: "affected",
            },
          ],
          newPlan: [
            {
              flight: "FZ445",
              aircraft: "CANCELLED",
              time: "CANCELLED",
              status: "cancelled",
            },
            {
              flight: "FZ446",
              aircraft: "A6-FDB",
              time: "20:45-00:30+1",
              status: "normal",
            },
            {
              flight: "FZ447",
              aircraft: "A6-FDB",
              time: "02:15+1-06:00+1",
              status: "normal",
            },
          ],
          advantages: [
            "Stops cascade disruption immediately",
            "Preserves downstream rotation",
            "Quick passenger rebooking process",
            "No crew duty time issues",
          ],
          considerations: [
            "Complete revenue loss for sector",
            "High passenger compensation costs",
            "Customer satisfaction impact",
            "Network connectivity gap",
          ],
        },
      },
    ],
  };
};

// Crew Issue Recovery - 6-Step Process
export const getCrewIssueRecovery = (flight) => {
  return {
    title: "Crew Issue Recovery",
    description: `${flight?.flightNumber} - Crew duty time breach - Unable to operate`,
    icon: Users,
    priority: "HIGH",
    estimatedTime: "15-30 minutes",
    steps: [
      {
        step: 1,
        title: "Crew Control Notified via AIMS",
        status: "completed",
        timestamp: "13:45:00",
        system: "AIMS Crew System",
        details: `Crew duty time breach detected for ${flight?.flightNumber}`,
        data: {
          flightNumber: flight?.flightNumber,
          crewMember: "Capt. Ahmed Al-Rashid",
          reason: "Duty Time Breach - FDP Limit Exceeded",
          dutyStart: "14:00:00",
          reportTime: "13:45:00",
          currentFDP: "13.5 hours",
          maxFDP: "13.0 hours",
        },
      },
      {
        step: 2,
        title: "System Checks Available Resources",
        status: "completed",
        timestamp: "13:47:00",
        system: "Crew Availability Engine",
        details: "Standby crew, reserve crew, and deadhead options analyzed",
        data: {
          standbyAvailable: "Capt. Mohammed Al-Zaabi (B737 qualified)",
          reserveAvailable: "Capt. Sarah Thompson (B737 qualified)",
          deadheadOptions: "Capt. Ali Ahmed (AUH base - 90 min positioning)",
          fdpLegality: "All options within FDP limits",
          aircraftType: flight?.aircraft || "B737-800",
          routeRequirements: `${flight?.origin}-${flight?.destination} qualified`,
        },
      },
      {
        step: 3,
        title: "Evaluate Crew Swap Options",
        status: "completed",
        timestamp: "13:50:00",
        system: "Crew Optimizer",
        details: "Crew pairing compatibility and legal requirements assessed",
        data: {
          selectedCrew: "Capt. Mohammed Al-Zaabi",
          pairingCompatibility: "Excellent with F/O Hassan",
          legalCompliance: "Full FDP compliance",
          experience: `3,250 hours ${flight?.aircraft || "B737"}`,
          qualifications: "ETOPS, Cat III, PBN qualified",
          lastRoute: `Last flown: ${flight?.origin}-BOM (similar route)`,
        },
      },
      {
        step: 4,
        title: "Update Crew Roster in AIMS",
        status: "completed",
        timestamp: "13:52:00",
        system: "AIMS Crew Management",
        details: "Roster updated and notifications sent",
        data: {
          rosterUpdate: `Capt. Al-Zaabi → ${flight?.flightNumber}`,
          notifications: "Crew notified via CrewApp",
          briefingTime: "13:55 (Extended for crew change)",
          dutyTime: "9.2 hours remaining FDP",
          originalCrew: "Capt. Al-Rashid - duty time exceeded",
          newCrew: "Capt. Al-Zaabi - fresh duty period",
        },
      },
      {
        step: 5,
        title: "Backup Options Ready",
        status: "standby",
        timestamp: "13:54:00",
        system: "Contingency Planning",
        details: "Alternative solutions prepared if primary fails",
        data: {
          backupOption1: "Deadhead Capt. from AUH (90 min)",
          backupOption2: "Delay flight 3 hours for crew rest",
          backupOption3: "Partner airline crew (Emirates)",
          backupOption4: "Crew discretion extension (if applicable)",
          contingencyDelay: "90-180 minutes maximum",
          regulatoryCompliance: "All options GCAA compliant",
        },
      },
      {
        step: 6,
        title: "Record Incident Impact",
        status: "completed",
        timestamp: "14:00:00",
        system: "Operations Log",
        details: "Incident logged with minimal operational impact",
        data: {
          operationalImpact: "Minimal - 30-minute delay",
          costImpact: "AED 8,500 - Standby crew pay",
          passengerImpact: `${flight?.passengers} passengers - 30min delay`,
          regulatoryReport: "FDP breach reported to GCAA",
          lessonsLearned: "Crew rostering review required",
          connectionImpact: `${flight?.connectionFlights} connections protected`,
        },
      },
    ],
    options: [
      {
        id: "STANDBY_CREW",
        title: "Assign Standby Crew",
        description: "Capt. Mohammed Al-Zaabi from standby roster",
        cost: "AED 8,500",
        timeline: "30 minutes",
        confidence: 92,
        impact: "Minimal operational disruption",
        status: "recommended",
        rotationPlan: {
          originalPlan: [
            {
              flight: flight?.flightNumber,
              crew: "Capt. Al-Rashid + F/O Hassan",
              time: flight?.scheduledDeparture,
              status: "crew_duty_breach",
            },
          ],
          newPlan: [
            {
              flight: flight?.flightNumber,
              crew: "Capt. Al-Zaabi + F/O Hassan",
              time: flight?.scheduledDeparture,
              status: "crew_swapped",
            },
          ],
          crewOfficerActions: [
            {
              action: "Immediate Standby Crew Activation",
              timeline: "13:45-13:50 (5 minutes)",
              details:
                "Contact Capt. Al-Zaabi via CrewApp emergency notification",
              responsibility: "Duty Crew Manager",
              status: "completed",
            },
            {
              action: "Original Crew Duty Time Recording",
              timeline: "13:45-13:47 (2 minutes)",
              details:
                "Log Capt. Al-Rashid FDP breach in AIMS - 13.5/13.0 hours",
              responsibility: "Crew Administrator",
              status: "completed",
            },
            {
              action: "Cascade Analysis - Al-Zaabi Next Assignment",
              timeline: "13:47-13:52 (5 minutes)",
              details: "Check standby crew next 48-hour schedule conflicts",
              responsibility: "Crew Scheduler",
              status: "completed",
            },
            {
              action: "Rest Period Management",
              timeline: "13:52-13:55 (3 minutes)",
              details: "Schedule Al-Rashid mandatory 12-hour rest period",
              responsibility: "Crew Administrator",
              status: "completed",
            },
            {
              action: "Crew Positioning & Briefing",
              timeline: "13:55-14:15 (20 minutes)",
              details: "Al-Zaabi crew room briefing + aircraft familiarization",
              responsibility: "Training Coordinator",
              status: "in_progress",
            },
            {
              action: "Future Schedule Protection",
              timeline: "14:00-14:10 (10 minutes)",
              details: "Protect Al-Zaabi 48-hour rotation from conflicts",
              responsibility: "Senior Crew Planner",
              status: "in_progress",
            },
          ],
          cascadeAnalysis: {
            affectedCrewMembers: [
              {
                name: "Capt. Al-Rashid",
                currentStatus: "Duty time exceeded - requires rest",
                nextAssignment: "FZ567 DXB-KHI tomorrow 08:00",
                impact: "Protected - sufficient rest period",
                action: "No further changes required",
              },
              {
                name: "Capt. Al-Zaabi (Standby)",
                currentStatus: "Activated from standby",
                nextAssignment: "FZ203 DXB-DEL tomorrow 16:45",
                impact: "Potential fatigue - monitor closely",
                action: "Consider backup crew for tomorrow",
              },
              {
                name: "F/O Hassan",
                currentStatus: "Continues with new captain",
                nextAssignment: "FZ182 COK-DXB tomorrow 20:30",
                impact: "No change - schedule maintained",
                action: "Monitor for pairing comfort",
              },
            ],
            downstreamEffects: {
              today: "Zero additional disruptions",
              tomorrow: "1 potential crew shortage for FZ203",
              dayAfter: "Al-Rashid returns to normal roster",
              weeklyImpact: "Minimal - contained within 48 hours",
            },
          },
          costBreakdown: {
            standbyActivation: "AED 2,500",
            briefingOvertimeCosts: "AED 800",
            crewPositioning: "AED 0 (local)",
            potentialBackupCrew: "AED 5,200",
            totalImpact: "AED 8,500",
            savings: "AED 170,000 vs delay option",
          },
          advantages: [
            "Standby crew immediately available at DXB",
            `${flight?.aircraft} qualified and current ratings`,
            "Excellent pairing history with F/O Hassan",
            "Within all regulatory duty time limits",
            "ETOPS and route qualified for COK sector",
            "Minimal impact on future crew schedules",
          ],
          considerations: [
            "Extended briefing required (20 minutes)",
            "Standby crew pay activation costs",
            "AIMS roster update and notifications",
            "30-minute departure delay for crew change",
            "Original captain requires mandatory rest",
            "Monitor replacement crew fatigue levels",
          ],
        },
      },
      {
        id: "DEADHEAD_CREW",
        title: "Deadhead Crew from AUH",
        description: "Position qualified Captain from Abu Dhabi",
        cost: "AED 25,000",
        timeline: "120 minutes",
        confidence: 85,
        impact: "Moderate schedule delay",
        status: "caution",
        rotationPlan: {
          originalPlan: [
            {
              flight: flight?.flightNumber,
              crew: "Capt. Al-Rashid + F/O Hassan",
              time: flight?.scheduledDeparture,
              status: "crew_duty_breach",
            },
          ],
          newPlan: [
            {
              flight: flight?.flightNumber,
              crew: "Capt. Ali Ahmed + F/O Hassan",
              time: "16:30-21:15",
              status: "delayed_crew_positioning",
            },
          ],
          advantages: [
            "Qualified backup crew available in AUH base",
            "Maintains original aircraft and F/O Hassan",
            `${flight?.aircraft} qualified captain with COK experience`,
            "Route experience and ETOPS qualifications",
            "Positioning flight readily available",
          ],
          considerations: [
            "120-minute departure delay impact",
            "Crew positioning costs (AUH-DXB deadhead)",
            `${flight?.connectionFlights} passenger connections at risk`,
            "AUH base operations require backup coverage",
            "Extended crew duty time monitoring required",
            "Ground transport coordination at both bases",
          ],
        },
      },
      {
        id: "DELAY_COMPLIANCE",
        title: "Delay for Crew Rest Completion",
        description: "Wait for original crew mandatory rest period",
        cost: "AED 45,000",
        timeline: "3 hours",
        confidence: 65,
        impact: "Significant passenger disruption",
        status: "warning",
        rotationPlan: {
          originalPlan: [
            {
              flight: flight?.flightNumber,
              crew: "Capt. Al-Rashid + F/O Hassan",
              time: flight?.scheduledDeparture,
              status: "crew_duty_breach",
            },
          ],
          newPlan: [
            {
              flight: flight?.flightNumber,
              crew: "Capt. Al-Rashid + F/O Hassan",
              time: "17:20-22:45",
              status: "delayed_crew_rest",
            },
          ],
          advantages: [
            "Uses original qualified crew - no retraining",
            "Full GCAA regulatory compliance guaranteed",
            "No crew change complexity or briefing time",
            "Familiar aircraft type and route knowledge",
            "Maintains crew pairing stability",
            "No additional crew qualification requirements",
          ],
          considerations: [
            "3-hour minimum delay for mandatory rest period",
            `${flight?.passengers} passengers require accommodation`,
            `${flight?.connectionFlights} connections missed at ${flight?.destination}`,
            "Potential curfew issues at COK destination",
            "Crew hotel accommodation and meal costs",
            "High passenger compensation liability",
            "Tomorrow schedule requires backup crew",
            "Significant reputation and customer impact",
          ],
        },
      },
    ],
  };
};

// Weather Delay Recovery - 6-Step Process
export const getWeatherDelayRecovery = () => {
  console.log("test");
  return {
    title: "Weather Delay Recovery",
    description: "Heavy thunderstorms at DEL - Low visibility 800m",
    icon: CloudRain,
    priority: "MEDIUM",
    estimatedTime: "2-4 hours",
    steps: [
      {
        step: 1,
        title: "Weather Trigger Received",
        status: "completed",
        timestamp: "12:30:00",
        system: "Weather Monitoring",
        details: "ATC holding all arrivals due to severe weather",
        data: {
          weatherType: "Thunderstorms + Low Visibility",
          visibility: "800m (Required: 1200m)",
          atcStatus: "All arrivals on hold",
          forecast: "Improvement expected 16:00-17:00",
        },
      },
      {
        step: 2,
        title: "Assess Impact on Operations",
        status: "completed",
        timestamp: "12:35:00",
        system: "Operations Control",
        details: "Holding time, EOBT, and curfew risk evaluation",
        data: {
          holdingTime: "2-4 hours estimated",
          eobtImpact: "Departure delayed to 17:30",
          curfewRisk: "None - within DEL operating hours",
          fuelConsideration: "Additional 800kg required",
        },
      },
      {
        step: 3,
        title: "Evaluate Recovery Actions",
        status: "completed",
        timestamp: "12:40:00",
        system: "Recovery Engine",
        details: "Multiple recovery options assessed",
        data: {
          delayOption: "Delay within legal/curfew limits",
          swapOption: "No aircraft swap required",
          rerouteOption: "Via PNQ possible with ground transport",
          crewImpact: "Within FDP limits",
        },
      },
      {
        step: 4,
        title: "Connecting Passenger Analysis",
        status: "completed",
        timestamp: "12:45:00",
        system: "Passenger Services",
        details: "Connection impacts and rebooking options",
        data: {
          connectingPax: "47 passengers with connections",
          mctBreaches: "12 passengers - tight connections",
          rebookingOptions: "EK/AI flights available",
          accommodation: "Not required - same day arrival",
        },
      },
      {
        step: 5,
        title: "Adjust Crew Patterns",
        status: "completed",
        timestamp: "12:50:00",
        system: "Crew Management",
        details: "Crew duty time and rest periods updated",
        data: {
          dutyAdjustment: "+3 hours within FDP limits",
          restPeriod: "Maintained - no overnight impact",
          crewNotification: "Updated via CrewApp",
          checkoutTime: "Revised to 22:15 DEL",
        },
      },
      {
        step: 6,
        title: "Calculate OTP Impact",
        status: "completed",
        timestamp: "12:55:00",
        system: "Performance Analytics",
        details: "On-time performance impact logged",
        data: {
          otpImpact: "Weather delay - excluded from OTP",
          causeCode: "WX - Severe Weather DEL",
          networkImpact: "Minimal - isolated incident",
          costImpact: "AED 25,000 (fuel + handling)",
        },
      },
    ],
    options: [
      {
        id: "DELAY_WEATHER",
        title: "Delay for Weather Clearance",
        description: "Wait for weather improvement at DEL",
        cost: "AED 25,000",
        timeline: "2-3 hours",
        confidence: 90,
        impact: "Managed schedule delay",
        status: "recommended",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ445",
              route: "DXB-DEL",
              time: "15:30-19:15",
              status: "affected",
            },
          ],
          newPlan: [
            {
              flight: "FZ445",
              route: "DXB-DEL",
              time: "17:30-21:15",
              status: "weather_delayed",
            },
          ],
          advantages: [
            "Weather forecast shows improvement",
            "All connections protected",
            "No aircraft swap required",
            "Fuel sufficient for extended holding",
          ],
          considerations: [
            "Dependent on weather improvement",
            "Crew duty time monitoring",
            "Passenger notification required",
          ],
        },
      },
      {
        id: "REROUTE_PNQ",
        title: "Reroute via Pune",
        description: "Divert to PNQ with ground transport",
        cost: "AED 45,000",
        timeline: "4 hours total",
        confidence: 75,
        impact: "Extended travel time",
        status: "caution",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ445",
              route: "DXB-DEL",
              time: "15:30-19:15",
              status: "affected",
            },
          ],
          newPlan: [
            {
              flight: "FZ445",
              route: "DXB-PNQ+Bus",
              time: "15:30-20:30+2h bus",
              status: "rerouted",
            },
          ],
          advantages: [
            "PNQ weather conditions good",
            "Ground transport available",
            "Passengers reach destination same day",
          ],
          considerations: [
            "Additional 2.5-hour bus journey",
            "Ground transport coordination",
            "Passenger comfort during transfer",
          ],
        },
      },
      {
        id: "CANCEL_WEATHER",
        title: "Cancel Due to Weather",
        description: "Cancel flight and rebook passengers",
        cost: "AED 180,000",
        timeline: "Immediate",
        confidence: 60,
        impact: "Complete sector cancellation",
        status: "warning",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ445",
              route: "DXB-DEL",
              time: "15:30-19:15",
              status: "affected",
            },
          ],
          newPlan: [
            {
              flight: "FZ445",
              route: "CANCELLED",
              time: "CANCELLED",
              status: "cancelled",
            },
          ],
          advantages: [
            "Immediate resolution",
            "Aircraft available for other routes",
            "Weather exemption from compensation",
          ],
          considerations: [
            "Complete revenue loss",
            "Customer dissatisfaction",
            "Rebooking complexity",
          ],
        },
      },
    ],
  };
};

// Airport Curfew Recovery - 6-Step Process
export const getCurfewCongestionRecovery = () => {
  return {
    title: "Airport Curfew Recovery",
    description: "BOM curfew breach - ETA 23:15 (15 min past curfew)",
    icon: Building,
    priority: "HIGH",
    estimatedTime: "45 minutes",
    steps: [
      {
        step: 1,
        title: "Determine Curfew Parameters",
        status: "completed",
        timestamp: "21:45:00",
        system: "Airport Operations",
        details: "BOM curfew 23:00-06:00, current ETA 23:15",
        data: {
          curfewStart: "23:00 local time",
          curfewEnd: "06:00 local time",
          currentETA: "23:15 (15 min past curfew)",
          curfewType: "Noise restriction - strict enforcement",
        },
      },
      {
        step: 2,
        title: "Evaluate Delay Impact",
        status: "completed",
        timestamp: "21:47:00",
        system: "Flight Planning",
        details: "Arrival time vs curfew window analysis",
        data: {
          delayDuration: "15 minutes past curfew",
          alternativeETA: "06:15 next day (post-curfew)",
          operationalImpact: "Overnight accommodation required",
          costImplication: "AED 185,000 accommodation",
        },
      },
      {
        step: 3,
        title: "Assess Recovery Options",
        status: "completed",
        timestamp: "21:50:00",
        system: "Operations Planning",
        details: "Priority handling, delays, swaps, and rerouting evaluated",
        data: {
          priorityHandling: "Not available - strict curfew",
          delayOption: "Until 06:00 next day",
          swapOption: "Earlier departure with FZ201",
          rerouteOption: "Via PNQ with ground transport",
        },
      },
      {
        step: 4,
        title: "Optimize Aircraft Rotation",
        status: "completed",
        timestamp: "21:52:00",
        system: "Network Planning",
        details: "Ensure aircraft returns to maintenance hub",
        data: {
          rotationImpact: "Minimal with aircraft swap",
          maintenanceHub: "DXB - return maintained",
          nextDayOperations: "Protected with swap option",
          utilization: "Optimal with FZ201 swap",
        },
      },
      {
        step: 5,
        title: "Crew Rest Calculations",
        status: "completed",
        timestamp: "21:55:00",
        system: "Crew Management",
        details: "Crew duty time and rest requirements updated",
        data: {
          currentDuty: "6.5 hours (within limits)",
          restRequirement: "12 hours minimum",
          accommodation: "Crew hotel arranged if needed",
          nextDutyStart: "10:00 next day",
        },
      },
      {
        step: 6,
        title: "Notify Stakeholders",
        status: "completed",
        timestamp: "21:58:00",
        system: "Communication Hub",
        details: "All relevant parties notified of curfew solution",
        data: {
          airportOps: "✓ BOM Ground Handling",
          stationControl: "✓ DXB + BOM Stations",
          passengers: "178 passengers notified",
          crewNotified: "✓ Gate change to B7",
        },
      },
    ],
    options: [
      {
        id: "SWAP_EARLY",
        title: "Aircraft Swap for Earlier Departure",
        description: "Swap with FZ201 for 22:15 departure",
        cost: "AED 45,000",
        timeline: "45 minutes",
        confidence: 92,
        impact: "Beat curfew timing",
        status: "recommended",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ445",
              route: "DXB-BOM",
              time: "22:30-23:15",
              status: "curfew_breach",
            },
          ],
          newPlan: [
            {
              flight: "FZ445",
              route: "DXB-BOM",
              time: "22:15-22:45",
              status: "curfew_compliant",
            },
          ],
          advantages: [
            "Depart 22:15, arrive 22:45 (before curfew)",
            "Zero passenger rebooking",
            "Significant cost savings vs overnight",
            "Maintains schedule integrity",
          ],
          considerations: [
            "FZ201 delayed by 60 minutes",
            "Quick crew coordination needed",
            "Gate change from B3 to B7",
          ],
        },
      },
      {
        id: "DIVERT_PNQ",
        title: "Divert to Pune",
        description: "Land at PNQ with ground transport",
        cost: "AED 180,000",
        timeline: "4 hours total",
        confidence: 80,
        impact: "Extended journey",
        status: "caution",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ445",
              route: "DXB-BOM",
              time: "22:30-23:15",
              status: "curfew_breach",
            },
          ],
          newPlan: [
            {
              flight: "FZ445",
              route: "DXB-PNQ+Bus",
              time: "22:30-22:45+2h bus",
              status: "diverted",
            },
          ],
          advantages: [
            "PNQ no curfew restrictions",
            "Bus transport available",
            "Same day arrival",
          ],
          considerations: [
            "2-hour bus journey to BOM",
            "Ground transport coordination",
            "Passenger comfort concerns",
          ],
        },
      },
      {
        id: "OVERNIGHT_DELAY",
        title: "Overnight Delay",
        description: "Delay until 06:00 curfew end",
        cost: "AED 320,000",
        timeline: "7 hours",
        confidence: 65,
        impact: "Overnight accommodation",
        status: "warning",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ445",
              route: "DXB-BOM",
              time: "22:30-23:15",
              status: "curfew_breach",
            },
          ],
          newPlan: [
            {
              flight: "FZ445",
              route: "DXB-BOM",
              time: "06:00+1-06:45+1",
              status: "overnight_delay",
            },
          ],
          advantages: [
            "Original route maintained",
            "No aircraft swap complexity",
            "Crew gets proper rest",
          ],
          considerations: [
            "High accommodation costs",
            "Passenger dissatisfaction",
            "7-hour delay impact",
          ],
        },
      },
    ],
  };
};

// Rotation Misalignment Recovery - 7-Step Process
export const getRotationMisalignmentRecovery = () => {
  return {
    title: "Rotation Misalignment Recovery",
    description: "A6-FDJ maintenance overrun - Line check extended 3 hours",
    icon: RotateCw,
    priority: "MEDIUM",
    estimatedTime: "90 minutes",
    steps: [
      {
        step: 1,
        title: "AMOS Maintenance Hold Flag",
        status: "completed",
        timestamp: "11:30:00",
        system: "AMOS Maintenance",
        details: "A6-FDJ line check extended by 3 hours",
        data: {
          aircraft: "A6-FDJ",
          maintenanceType: "Line Check",
          originalETA: "11:30:00",
          revisedETA: "14:30:00",
          delay: "3 hours extension",
        },
      },
      {
        step: 2,
        title: "Recalculate Available Time",
        status: "completed",
        timestamp: "11:32:00",
        system: "Fleet Management",
        details: "Aircraft availability pushed to 14:30",
        data: {
          originalAvailable: "11:30:00",
          newAvailable: "14:30:00",
          impactedFlights: "FZ567 (13:00 departure)",
          bufferTime: "1 hour 30 minutes lost",
        },
      },
      {
        step: 3,
        title: "Evaluate Next Rotation Legs",
        status: "completed",
        timestamp: "11:35:00",
        system: "Schedule Analyzer",
        details: "Downstream flight impact assessment",
        data: {
          nextFlight: "FZ567 DXB-KHI 13:00",
          subsequentFlight: "FZ568 KHI-DXB 16:30",
          curfewImpact: "None - within operating hours",
          crewImpact: "FDP extension required",
        },
      },
      {
        step: 4,
        title: "Maintenance Requirement Review",
        status: "completed",
        timestamp: "11:38:00",
        system: "Maintenance Planning",
        details: "Maintenance window flexibility assessed",
        data: {
          maintenanceType: "Scheduled line check",
          flexibility: "Limited - safety critical",
          canDelay: "No - must complete",
          nextMaintenance: "150 flight hours",
        },
      },
      {
        step: 5,
        title: "Optimizer Solution",
        status: "completed",
        timestamp: "11:40:00",
        system: "AERON Optimizer",
        details: "Rebuild tail assignment with minimal disruption",
        data: {
          recommendedAction: "Aircraft swap with A6-FDL",
          alternativeAircraft: "A6-FDL available for FZ567",
          optimalSolution: "Swap assignment - minimal cost",
          networkImpact: "Contained to single day",
        },
      },
      {
        step: 6,
        title: "Evaluate Crew Impact",
        status: "completed",
        timestamp: "11:42:00",
        system: "Crew Operations",
        details: "Crew assignments and overnight impacts assessed",
        data: {
          crewImpact: "Minimal - same aircraft type",
          overnightCrew: "No impact - day return",
          dutyTime: "Within normal limits",
          briefingRequired: "Standard - same A320 type",
        },
      },
      {
        step: 7,
        title: "Push Updated Plan",
        status: "completed",
        timestamp: "11:45:00",
        system: "Operations Control",
        details: "Updated plan distributed to all stakeholders",
        data: {
          aimsUpdate: "✓ Crew assignments updated",
          occNotified: "✓ Operations Control Center",
          maintenanceNotified: "✓ A6-FDJ maintenance team",
          crewNotified: "✓ FZ567 crew - aircraft change",
        },
      },
    ],
    options: [
      {
        id: "SWAP_A6FDL",
        title: "Aircraft Swap with A6-FDL",
        description: "Assign A6-FDL to FZ567, A6-FDJ resumes later",
        cost: "AED 75,000",
        timeline: "90 minutes",
        confidence: 88,
        impact: "Minimal network disruption",
        status: "recommended",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ567",
              aircraft: "A6-FDJ",
              time: "13:00-15:45",
              status: "maintenance_delayed",
            },
            {
              flight: "FZ568",
              aircraft: "A6-FDJ",
              time: "16:30-19:15",
              status: "affected",
            },
          ],
          newPlan: [
            {
              flight: "FZ567",
              aircraft: "A6-FDL",
              time: "13:00-15:45",
              status: "aircraft_swapped",
            },
            {
              flight: "FZ568",
              aircraft: "A6-FDL",
              time: "16:30-19:15",
              status: "aircraft_swapped",
            },
          ],
          advantages: [
            "A6-FDL available immediately",
            "Same A320 type - no complexity",
            "Zero passenger impact",
            "Network disruption contained",
          ],
          considerations: [
            "A6-FDL flight FZ405 delayed 60 minutes",
            "Crew briefing for aircraft change",
            "A6-FDJ returns to service 14:30",
          ],
        },
      },
      {
        id: "ACCEPT_DELAYS",
        title: "Accept Cascade Delays",
        description: "Wait for A6-FDJ maintenance completion",
        cost: "AED 150,000",
        timeline: "3 hours",
        confidence: 70,
        impact: "Multiple flight delays",
        status: "caution",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ567",
              aircraft: "A6-FDJ",
              time: "13:00-15:45",
              status: "maintenance_delayed",
            },
            {
              flight: "FZ568",
              aircraft: "A6-FDJ",
              time: "16:30-19:15",
              status: "affected",
            },
          ],
          newPlan: [
            {
              flight: "FZ567",
              aircraft: "A6-FDJ",
              time: "16:00-18:45",
              status: "delayed",
            },
            {
              flight: "FZ568",
              aircraft: "A6-FDJ",
              time: "19:30-22:15",
              status: "delayed",
            },
          ],
          advantages: [
            "Original aircraft maintained",
            "No swap complexity",
            "Maintenance completed properly",
          ],
          considerations: [
            "3-hour delay cascade",
            "456 passengers affected",
            "Connection impacts at KHI",
          ],
        },
      },
      {
        id: "PARTIAL_CANCEL",
        title: "Cancel Selected Legs",
        description: "Cancel FZ567, maintain rest of rotation",
        cost: "AED 200,000",
        timeline: "2 hours",
        confidence: 75,
        impact: "Strategic cancellation",
        status: "warning",
        rotationPlan: {
          originalPlan: [
            {
              flight: "FZ567",
              aircraft: "A6-FDJ",
              time: "13:00-15:45",
              status: "maintenance_delayed",
            },
            {
              flight: "FZ568",
              aircraft: "A6-FDJ",
              time: "16:30-19:15",
              status: "affected",
            },
          ],
          newPlan: [
            {
              flight: "FZ567",
              aircraft: "CANCELLED",
              time: "CANCELLED",
              status: "cancelled",
            },
            {
              flight: "FZ568",
              aircraft: "A6-FDJ",
              time: "16:30-19:15",
              status: "normal",
            },
          ],
          advantages: [
            "Stops delay propagation",
            "Preserves return sector",
            "Quick passenger rebooking",
          ],
          considerations: [
            "Complete sector revenue loss",
            "234 passengers require rebooking",
            "Network gap created",
          ],
        },
      },
    ],
  };
};

// Main function to get scenario data based on categorization
export const getScenarioData = (categorization) => {
  console.log("categorization", categorization);
  switch (categorization) {
    case "Aircraft issue (e.g., AOG)":
      return getAircraftIssueRecovery();
    case "Crew issue (e.g., sick report, duty time breach)":
      return getCrewIssueRecovery;
    case "ATC/weather delay":
      return getWeatherDelayRecovery();
    case "Airport curfew/ramp congestion":
      return getCurfewCongestionRecovery();
    case "Rotation misalignment or maintenance hold":
      return getRotationMisalignmentRecovery();
    default:
      return getAircraftIssueRecovery(); // Default fallback
  }
};
