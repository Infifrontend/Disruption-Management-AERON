"""
Standard recovery generator service - Python equivalent of recovery-generator.js
Provides template-based recovery options with embedded data
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# Embedded crew data (equivalent to availableDummyCrew in JS)
AVAILABLE_DUMMY_CREW = [
    {
        "name": "Capt. James Walker",
        "role_code": "CAPT",
        "role": "Captain",
        "qualifications": [{"code": "B737", "name": "Boeing 737"}],
        "status": "available",
        "issue": None,
        "experience_years": 18,
        "base": "LHR",
        "languages": ["English"],
        "rotation_impact": [
            {
                "flightNumber": "FZ141",
                "origin_code": "LHR",
                "destination_code": "DXB",
                "origin": "London Heathrow",
                "destination": "Dubai",
                "departure": "2025-09-10T07:30:00+01:00",
                "arrival": "2025-09-10T15:30:00+04:00",
                "delay": "On Time",
                "passengers": 178,
                "status": "On Time",
                "impact": "High Impact",
                "reason": "Primary PIC — replacement required, flight will be delayed or cancelled without a qualified Captain."
            }
        ]
    },
    {
        "name": "Capt. Ravi Sharma",
        "role_code": "CAPT",
        "role": "Captain",
        "qualifications": [{"code": "B737", "name": "Boeing 737"}],
        "status": "available",
        "issue": None,
        "experience_years": 15,
        "base": "DEL",
        "languages": ["English", "Hindi"],
        "rotation_impact": [
            {
                "flightNumber": "FZ431",
                "origin_code": "DEL",
                "destination_code": "DXB",
                "origin": "Delhi",
                "destination": "Dubai",
                "departure": "2025-09-10T09:00:00+05:30",
                "arrival": "2025-09-10T11:30:00+04:00",
                "delay": "15 min",
                "passengers": 164,
                "status": "Delayed",
                "impact": "High Impact",
                "reason": "Primary PIC removed — replacement required, departure may be delayed while finding a qualified Captain."
            }
        ]
    },
    {
        "name": "FO Michael Adams",
        "role_code": "FO",
        "role": "First officer",
        "qualifications": [{"code": "B737M", "name": "Boeing 737 MAX"}],
        "status": "available",
        "issue": None,
        "experience_years": 8,
        "base": "JFK",
        "languages": ["English", "Spanish"],
        "rotation_impact": [
            {
                "flightNumber": "FZ523",
                "origin_code": "DXB",
                "destination_code": "DOH",
                "origin": "Dubai",
                "destination": "Doha",
                "departure": "2025-09-10T11:00:00+04:00",
                "arrival": "2025-09-10T11:50:00+03:00",
                "delay": "On Time",
                "passengers": 156,
                "status": "On Time",
                "impact": "High Impact",
                "reason": "Primary FO removed — flight cannot legally depart without a qualified First Officer unless a reserve is available at origin."
            }
        ]
    }
]

def get_aircraft_issues_recovery_data():
    """Return embedded aircraft issues recovery templates"""
    return [
        {
            "title": "Aircraft Swap - Immediate",
            "description": "Replace with available standby aircraft",
            "cost": "AED 22,800",
            "timeline": "1.5-2 hours",
            "confidence": 88,
            "impact": "Minimal passenger disruption",
            "status": "recommended",
            "category": "Aircraft Issue",
            "priority": 1,
            "advantages": [
                "Fastest resolution with minimal delay",
                "Maintains schedule integrity",
                "Low passenger compensation cost",
                "Preserves network connectivity"
            ],
            "considerations": [
                "Requires available spare aircraft",
                "Crew briefing and familiarization needed",
                "Gate coordination and positioning",
                "Passenger transfer logistics"
            ],
            "impact_area": ["crew"],
            "impact_summary": "Aircraft issue recovery: Technical disruption requiring aircraft substitution with minimal passenger impact through efficient swap procedures.",
            "resource_requirements": [
                {
                    "title": "Replacement Aircraft",
                    "subtitle": "Available Aircraft (TBD)",
                    "availability": "Ready",
                    "status": "Available",
                    "location": "Terminal Area",
                    "eta": "On Stand",
                    "details": "Aircraft selection based on route requirements and availability"
                },
                {
                    "title": "Flight Crew",
                    "subtitle": "Qualified Crew Team",
                    "availability": "Briefed",
                    "status": "On Duty",
                    "location": "Crew Room Terminal 2",
                    "eta": "15 minutes",
                    "details": "Type-rated crew with current qualifications"
                }
            ],
            "cost_breakdown": {
                "breakdown": [
                    {
                        "amount": "AED 15,000",
                        "category": "Delay Costs",
                        "percentage": 66,
                        "description": "Passenger compensation and handling"
                    },
                    {
                        "amount": "AED 5,000",
                        "category": "Aircraft Swap",
                        "percentage": 22,
                        "description": "Cost of mobilizing standby aircraft"
                    },
                    {
                        "amount": "AED 2,800",
                        "category": "Logistics",
                        "percentage": 12,
                        "description": "Ground handling and coordination"
                    }
                ],
                "total": {
                    "amount": "AED 22,800",
                    "title": "Total Estimated Cost",
                    "description": "Ground handling and coordination"
                }
            },
            "timeline_details": [
                {
                    "step": "Decision Confirmation",
                    "status": "completed",
                    "details": "Management approval and resource confirmation",
                    "startTime": "23:34",
                    "endTime": "23:39",
                    "duration": "5 min"
                },
                {
                    "step": "Aircraft Positioning",
                    "status": "in-progress",
                    "details": "Move replacement aircraft to departure gate",
                    "startTime": "23:39",
                    "endTime": "05:39",
                    "duration": "360 min"
                }
            ],
            "risk_assessment": [
                {
                    "risk": "Aircraft Availability Conflict",
                    "risk_impact": "Low",
                    "mitigation_impact": "Medium",
                    "score": 3,
                    "mitigation": "Secondary aircraft options confirmed in standby"
                }
            ],
            "technical_specs": {
                "implementation": {
                    "title": "Implementation",
                    "details": "Aircraft swap protocol with coordinated ground operations and priority positioning"
                },
                "systems_required": {
                    "title": "Systems required",
                    "details": [
                        "ACARS Real-time Updates",
                        "Ground Power Unit",
                        "Baggage Transfer System",
                        "Passenger Information Display",
                        "Aircraft Positioning Coordination"
                    ]
                },
                "certifications": {
                    "title": "Certifications",
                    "details": [
                        "EASA Type Certificate",
                        "GCAA Operational Approval",
                        "Route-specific Weather Capability"
                    ]
                }
            },
            "crew_available": AVAILABLE_DUMMY_CREW,
            "metrics": {
                "costEfficiency": 85,
                "timeEfficiency": 90,
                "passengerSatisfaction": 85,
                "recovery_analysis": "Aircraft Swap Recovery: Replace aircraft with available replacement. Estimated passenger transfer time: 35-45 minutes. This solution maintains schedule integrity with minimal passenger disruption.",
                "crewViolations": 1,
                "aircraftSwaps": 1,
                "networkImpact": "Minimal"
            }
        }
    ]

def get_crew_issues_recovery_data():
    """Return embedded crew issues recovery templates"""
    return [
        {
            "title": "Standby Crew Assignment",
            "description": "Assign available standby crew members",
            "cost": "AED 8,500",
            "timeline": "45-60 minutes",
            "confidence": 92,
            "impact": "Low passenger disruption",
            "status": "recommended",
            "category": "Crew Issue",
            "priority": 1,
            "advantages": [
                "Quick resolution with minimal delay",
                "Maintains original flight schedule",
                "Low operational cost",
                "No aircraft change required"
            ],
            "considerations": [
                "Standby crew availability at origin",
                "Crew duty time compliance",
                "Route qualification requirements",
                "Passenger boarding delay"
            ]
        }
    ]

def get_weather_issues_recovery_data():
    """Return embedded weather issues recovery templates"""
    return [
        {
            "title": "Weather Hold - Monitor & Dispatch",
            "description": "Hold for weather improvement and dispatch when clear",
            "cost": "AED 3,200",
            "timeline": "2-4 hours",
            "confidence": 75,
            "impact": "Medium passenger disruption",
            "status": "caution",
            "category": "Weather Issue",
            "priority": 2
        }
    ]

def get_curfew_congestion_recovery_data():
    """Return embedded curfew/congestion recovery templates"""
    return [
        {
            "title": "Overnight Accommodation",
            "description": "Provide hotel accommodation and reschedule for next day",
            "cost": "AED 18,500",
            "timeline": "Next day departure",
            "confidence": 95,
            "impact": "High passenger disruption",
            "status": "warning",
            "category": "Curfew/Congestion",
            "priority": 3
        }
    ]

def get_rotation_maintenance_recovery_data():
    """Return embedded rotation/maintenance recovery templates"""
    return [
        {
            "title": "Alternative Aircraft Assignment",
            "description": "Reassign to different aircraft in rotation",
            "cost": "AED 12,400",
            "timeline": "2-3 hours",
            "confidence": 85,
            "impact": "Medium passenger disruption",
            "status": "recommended",
            "category": "Rotation/Maintenance",
            "priority": 2
        }
    ]

class RecoveryGenerator:
    """Standard recovery options generator using templates"""
    
    def __init__(self):
        self.recovery_data_map = {
            'AIRCRAFT_ISSUE': get_aircraft_issues_recovery_data,
            'CREW_ISSUE': get_crew_issues_recovery_data,
            'ATC_WEATHER': get_weather_issues_recovery_data,
            'CURFEW_CONGESTION': get_curfew_congestion_recovery_data,
            'ROTATION_MAINTENANCE': get_rotation_maintenance_recovery_data
        }
    
    def generate_recovery_options_for_disruption(self, disruption_data: Dict[str, Any], category_info: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Generate recovery options for a flight disruption
        
        Args:
            disruption_data: Flight disruption information
            category_info: Optional category information
            
        Returns:
            Dictionary containing options and steps
        """
        try:
            # Determine category
            category_code = None
            if category_info and 'category_code' in category_info:
                category_code = category_info['category_code']
            elif 'categorization' in disruption_data:
                category_code = self._map_categorization_to_code(disruption_data['categorization'])
            else:
                category_code = 'AIRCRAFT_ISSUE'  # Default
            
            # Get template data for category
            recovery_data_func = self.recovery_data_map.get(category_code, get_aircraft_issues_recovery_data)
            template_options = recovery_data_func()
            
            # Customize options for this specific disruption
            customized_options = []
            for template in template_options:
                customized_option = self._customize_option_for_disruption(template, disruption_data)
                customized_options.append(customized_option)
            
            # Generate implementation steps
            steps = self._generate_recovery_steps(disruption_data, customized_options)
            
            return {
                "options": customized_options,
                "steps": steps,
                "metadata": {
                    "category_code": category_code,
                    "disruption_id": disruption_data.get('id'),
                    "flight_number": disruption_data.get('flight_number'),
                    "generation_time": datetime.now().isoformat(),
                    "generator": "template_based"
                }
            }
            
        except Exception as e:
            return {
                "options": [],
                "steps": [],
                "error": str(e),
                "metadata": {
                    "generation_time": datetime.now().isoformat(),
                    "generator": "template_based"
                }
            }
    
    def _map_categorization_to_code(self, categorization: str) -> str:
        """Map categorization string to category code"""
        categorization_lower = categorization.lower()
        
        if any(term in categorization_lower for term in ['aircraft', 'aog', 'technical', 'engine']):
            return 'AIRCRAFT_ISSUE'
        elif any(term in categorization_lower for term in ['crew', 'duty time', 'sick']):
            return 'CREW_ISSUE'
        elif any(term in categorization_lower for term in ['weather', 'atc', 'fog', 'storm']):
            return 'ATC_WEATHER'
        elif any(term in categorization_lower for term in ['airport', 'curfew', 'congestion', 'runway']):
            return 'CURFEW_CONGESTION'
        elif any(term in categorization_lower for term in ['rotation', 'maintenance']):
            return 'ROTATION_MAINTENANCE'
        else:
            return 'AIRCRAFT_ISSUE'
    
    def _customize_option_for_disruption(self, template: Dict[str, Any], disruption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Customize a template option for specific disruption"""
        customized = template.copy()
        
        # Update impact summary with flight-specific info
        flight_number = disruption_data.get('flight_number', 'Unknown')
        if 'impact_summary' in customized:
            customized['impact_summary'] = customized['impact_summary'].replace(
                'FZ147', flight_number
            ).replace(
                'Aircraft issue recovery for FZ147',
                f"Recovery option for {flight_number}"
            )
        
        # Customize timeline based on disruption severity
        if disruption_data.get('severity') == 'Critical':
            customized['priority'] = 1
            customized['status'] = 'recommended'
        elif disruption_data.get('severity') == 'Low':
            customized['priority'] = max(customized.get('priority', 1), 2)
        
        # Add disruption-specific data
        customized['disruption_context'] = {
            'flight_number': flight_number,
            'aircraft': disruption_data.get('aircraft', 'Unknown'),
            'route': disruption_data.get('route', 'Unknown'),
            'passengers': disruption_data.get('passengers', 0),
            'delay_minutes': disruption_data.get('delay_minutes', 0)
        }
        
        return customized
    
    def _generate_recovery_steps(self, disruption_data: Dict[str, Any], options: List[Dict]) -> List[Dict[str, Any]]:
        """Generate implementation steps for recovery options"""
        flight_number = disruption_data.get('flight_number', 'Unknown')
        timestamp = datetime.now().isoformat()
        
        steps = [
            {
                "step": 1,
                "title": "Disruption Notification",
                "status": "completed",
                "timestamp": timestamp,
                "system": "AMOS",
                "details": f"Disruption detected for flight {flight_number}. Recovery options analysis initiated.",
                "data": {
                    "flight_number": flight_number,
                    "disruption_type": disruption_data.get('disruption_type', 'Unknown'),
                    "priority": "High",
                    "resources_allocated": ["Recovery Team", "Operations Control"],
                    "estimated_resolution": "60 minutes"
                }
            },
            {
                "step": 2,
                "title": "Resource Assessment",
                "status": "in-progress",
                "timestamp": timestamp,
                "system": "Resource Management",
                "details": "Evaluating available resources including crew, aircraft, and ground services.",
                "data": {
                    "aircraft": disruption_data.get('aircraft', 'Unknown'),
                    "passengers": disruption_data.get('passengers', 0),
                    "crew_required": "Flight crew + Cabin crew",
                    "ground_services": ["Ground Handling", "Passenger Services"]
                }
            },
            {
                "step": 3,
                "title": "Recovery Implementation",
                "status": "pending",
                "timestamp": timestamp,
                "system": "Operations Control",
                "details": f"Execute selected recovery option for {flight_number}.",
                "data": {
                    "recovery_type": "Template-based option",
                    "expected_completion": "As per selected option timeline",
                    "monitoring_frequency": "15 minutes",
                    "escalation_threshold": "120 minutes"
                }
            }
        ]
        
        return steps

# Global instance
recovery_generator = RecoveryGenerator()

def generate_recovery_options_for_disruption(disruption_data: Dict[str, Any], category_info: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Main function to generate recovery options - matches JS export
    """
    return recovery_generator.generate_recovery_options_for_disruption(disruption_data, category_info)