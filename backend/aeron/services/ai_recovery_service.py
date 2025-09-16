"""
AI-powered recovery service with multi-LLM provider support
Supports OpenAI, Anthropic, and Google Gemini with streaming capabilities
"""

import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, AsyncGenerator
from dataclasses import dataclass
from enum import Enum

# LLM Provider imports - will be configured via integrations
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class LLMProvider(Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic" 
    GEMINI = "gemini"


@dataclass
class LLMConfig:
    provider: LLMProvider
    model: str
    temperature: float
    max_tokens: int
    api_key: str
    base_url: Optional[str] = None


class AIRecoveryService:
    """AI-powered recovery options generator with multi-LLM support"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.current_provider = None
        self.providers_config = {}
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize available LLM providers based on environment variables"""
        
        # OpenAI Configuration
        if OPENAI_AVAILABLE and os.getenv('OPENAI_API_KEY'):
            self.providers_config[LLMProvider.OPENAI] = LLMConfig(
                provider=LLMProvider.OPENAI,
                model=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
                temperature=float(os.getenv('OPENAI_TEMPERATURE', '0.7')),
                max_tokens=int(os.getenv('OPENAI_MAX_TOKENS', '4000')),
                api_key=os.getenv('OPENAI_API_KEY')
            )
            
        # Anthropic Configuration  
        if ANTHROPIC_AVAILABLE and os.getenv('ANTHROPIC_API_KEY'):
            self.providers_config[LLMProvider.ANTHROPIC] = LLMConfig(
                provider=LLMProvider.ANTHROPIC,
                model=os.getenv('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229'),
                temperature=float(os.getenv('ANTHROPIC_TEMPERATURE', '0.7')),
                max_tokens=int(os.getenv('ANTHROPIC_MAX_TOKENS', '32000')),
                api_key=os.getenv('ANTHROPIC_API_KEY')
            )
            
        # Gemini Configuration
        if GEMINI_AVAILABLE and os.getenv('GEMINI_API_KEY'):
            self.providers_config[LLMProvider.GEMINI] = LLMConfig(
                provider=LLMProvider.GEMINI,
                model=os.getenv('GEMINI_MODEL', 'gemini-pro'),
                temperature=float(os.getenv('GEMINI_TEMPERATURE', '0.7')),
                max_tokens=int(os.getenv('GEMINI_MAX_TOKENS', '8192')),
                api_key=os.getenv('GEMINI_API_KEY')
            )
        
        # Set default provider
        default_provider_name = os.getenv('LLM_DEFAULT_PROVIDER', 'openai')
        try:
            default_provider = LLMProvider(default_provider_name)
            if default_provider in self.providers_config:
                self.current_provider = default_provider
            elif self.providers_config:
                self.current_provider = list(self.providers_config.keys())[0]
        except ValueError:
            if self.providers_config:
                self.current_provider = list(self.providers_config.keys())[0]
        
        self.logger.info(f"Initialized {len(self.providers_config)} LLM providers")
        if self.current_provider:
            self.logger.info(f"Default provider: {self.current_provider.value}")
    
    def get_current_provider_info(self) -> Dict[str, str]:
        """Get information about current provider"""
        if not self.current_provider or self.current_provider not in self.providers_config:
            return {"provider": "none", "model": "none"}
            
        config = self.providers_config[self.current_provider]
        return {
            "provider": config.provider.value,
            "model": config.model
        }
    
    def switch_provider(self, provider_name: str) -> bool:
        """Switch to a different LLM provider"""
        try:
            provider = LLMProvider(provider_name)
            if provider in self.providers_config:
                self.current_provider = provider
                self.logger.info(f"Switched to provider: {provider.value}")
                return True
            else:
                self.logger.warning(f"Provider {provider_name} not configured")
                return False
        except ValueError:
            self.logger.error(f"Unknown provider: {provider_name}")
            return False
    
    def create_single_option_prompt(self, disruption_data: Dict[str, Any], category_info: Dict[str, Any], 
                                  option_number: int = 1, previous_count: int = 0) -> str:
        """Create prompt for generating a single recovery option"""
        
        template = """You are an expert flight operations recovery specialist. Generate ONE comprehensive recovery option with associated implementation steps for the following disruption, following industry best practices and regulatory compliance.

Flight Information:
- Flight: {flight_number} ({route})
- Aircraft: {aircraft}
- Scheduled: {scheduled_departure}
- Current Status: {estimated_departure}
- Delay: {delay_minutes} minutes
- Passengers: {passengers}
- Crew: {crew}
- Issue: {disruption_type} - {disruption_reason}
- Severity: {severity}
- Category: {category_name}

Option Priority: {option_priority} (Generate option #{option_number} of recovery plan)
Previous Options Generated: {previous_count}

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
    "priority": {option_priority},
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
    "impact_summary": "Comprehensive impact analysis for {flight_number}: Brief summary of how this recovery affects operations, passengers, crew, and network.",
    "metrics": {{
      "costEfficiency": 85,
      "timeEfficiency": 90,
      "passengerSatisfaction": 80,
      "crewViolations": 0,
      "aircraftSwaps": 1,
      "networkImpact": "Low/Medium/High"
    }}
  }},
  "steps": [
    {{
      "step": 1,
      "title": "System notification",
      "status": "completed/in-progress/pending",
      "timestamp": "{timestamp}",
      "system": "AMOS/AIMS/OCC/Recovery Engine",
      "details": "Detailed step description with specific actions taken or required for {flight_number}",
      "data": {{
        "flight_number": "{flight_number}",
        "disruption_type": "{disruption_type}",
        "priority": "High/Medium/Low",
        "resources_allocated": ["Resource 1", "Resource 2"],
        "estimated_resolution": "XX minutes"
      }}
    }}
  ]
}}

Important Guidelines:
1. Use realistic costs based on operation type and complexity
2. Provide specific, actionable timeline steps with realistic durations
3. Include proper system names (AMOS, AIMS, OCC, Recovery Engine)
4. Consider regulatory compliance (EU261, GCAA, crew duty time limits)
5. Ensure confidence scores reflect actual feasibility
6. Use appropriate status indicators (recommended/caution/warning)
7. Include network impact considerations for downstream flights

Return only valid JSON. No markdown formatting or extra text."""

        return template.format(
            flight_number=disruption_data.get('flight_number', 'Unknown'),
            route=disruption_data.get('route', f"{disruption_data.get('origin', 'UNK')} → {disruption_data.get('destination', 'UNK')}"),
            aircraft=disruption_data.get('aircraft', 'Unknown'),
            scheduled_departure=disruption_data.get('scheduled_departure', 'Unknown'),
            estimated_departure=disruption_data.get('estimated_departure', 'Unknown'),
            delay_minutes=disruption_data.get('delay_minutes', 0),
            passengers=disruption_data.get('passengers', 0),
            crew=disruption_data.get('crew', 0),
            disruption_type=disruption_data.get('disruption_type', 'Unknown'),
            disruption_reason=disruption_data.get('disruption_reason', 'Unknown'),
            severity=disruption_data.get('severity', 'Medium'),
            category_name=category_info.get('category_name', 'General'),
            option_number=option_number,
            option_priority=option_number,
            previous_count=previous_count,
            timestamp=datetime.now().isoformat()
        )
    
    async def generate_recovery_options(self, disruption_data: Dict[str, Any], 
                                      category_info: Optional[Dict] = None,
                                      options_config: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate AI-powered recovery options"""
        
        if not self.current_provider:
            return {
                "error": "No LLM provider configured",
                "options": [],
                "steps": [],
                "metadata": {
                    "generation_time": datetime.now().isoformat(),
                    "generator": "ai_powered",
                    "provider": "none"
                }
            }
        
        config = options_config or {}
        count = config.get('count', 3)
        category_info = category_info or {}
        
        try:
            self.logger.info(f"Generating {count} AI recovery options using {self.current_provider.value}")
            
            # Generate options based on provider
            if self.current_provider == LLMProvider.OPENAI:
                result = await self._generate_with_openai(disruption_data, category_info, count)
            elif self.current_provider == LLMProvider.ANTHROPIC:
                result = await self._generate_with_anthropic(disruption_data, category_info, count)
            elif self.current_provider == LLMProvider.GEMINI:
                result = await self._generate_with_gemini(disruption_data, category_info, count)
            else:
                raise ValueError(f"Unsupported provider: {self.current_provider}")
            
            result["metadata"] = {
                "generation_time": datetime.now().isoformat(),
                "generator": "ai_powered",
                "provider": self.current_provider.value,
                "model": self.providers_config[self.current_provider].model,
                "options_requested": count
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"AI generation failed: {str(e)}")
            return {
                "error": str(e),
                "options": [],
                "steps": [],
                "metadata": {
                    "generation_time": datetime.now().isoformat(),
                    "generator": "ai_powered",
                    "provider": self.current_provider.value if self.current_provider else "none",
                    "error": str(e)
                }
            }
    
    async def _generate_with_openai(self, disruption_data: Dict[str, Any], 
                                  category_info: Dict[str, Any], count: int) -> Dict[str, Any]:
        """Generate options using OpenAI"""
        if not OPENAI_AVAILABLE:
            raise RuntimeError("OpenAI library not available")
            
        config = self.providers_config[LLMProvider.OPENAI]
        client = openai.OpenAI(api_key=config.api_key)
        
        prompt = self.create_single_option_prompt(disruption_data, category_info, 1, 0)
        
        response = client.chat.completions.create(
            model=config.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=config.temperature,
            max_tokens=config.max_tokens
        )
        
        content = response.choices[0].message.content
        result = json.loads(content)
        
        return {
            "options": [result["option"]] if "option" in result else [],
            "steps": result.get("steps", []),
            "tokens_used": response.usage.total_tokens if response.usage else 0
        }
    
    async def _generate_with_anthropic(self, disruption_data: Dict[str, Any], 
                                     category_info: Dict[str, Any], count: int) -> Dict[str, Any]:
        """Generate options using Anthropic Claude"""
        if not ANTHROPIC_AVAILABLE:
            raise RuntimeError("Anthropic library not available")
            
        config = self.providers_config[LLMProvider.ANTHROPIC]
        client = anthropic.Anthropic(api_key=config.api_key)
        
        prompt = self.create_single_option_prompt(disruption_data, category_info, 1, 0)
        
        response = client.messages.create(
            model=config.model,
            max_tokens=config.max_tokens,
            temperature=config.temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = response.content[0].text
        result = json.loads(content)
        
        return {
            "options": [result["option"]] if "option" in result else [],
            "steps": result.get("steps", []),
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens if response.usage else 0
        }
    
    async def _generate_with_gemini(self, disruption_data: Dict[str, Any], 
                                  category_info: Dict[str, Any], count: int) -> Dict[str, Any]:
        """Generate options using Google Gemini"""
        if not GEMINI_AVAILABLE:
            raise RuntimeError("Gemini library not available")
            
        config = self.providers_config[LLMProvider.GEMINI]
        genai.configure(api_key=config.api_key)
        
        model = genai.GenerativeModel(config.model)
        prompt = self.create_single_option_prompt(disruption_data, category_info, 1, 0)
        
        generation_config = genai.types.GenerationConfig(
            temperature=config.temperature,
            max_output_tokens=config.max_tokens
        )
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        if response.text:
            result = json.loads(response.text)
            return {
                "options": [result["option"]] if "option" in result else [],
                "steps": result.get("steps", []),
                "tokens_used": 0  # Gemini doesn't provide token count in free tier
            }
        else:
            raise RuntimeError("Empty response from Gemini")
    
    def get_available_providers(self) -> List[str]:
        """Get list of available LLM providers"""
        return [provider.value for provider in self.providers_config.keys()]
    
    def is_provider_available(self, provider_name: str) -> bool:
        """Check if a specific provider is available"""
        try:
            provider = LLMProvider(provider_name)
            return provider in self.providers_config
        except ValueError:
            return False


# Global service instance
ai_recovery_service = AIRecoveryService()

async def generate_ai_recovery_options(disruption_data: Dict[str, Any], 
                                     category_info: Optional[Dict] = None,
                                     options_config: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Main async function to generate AI recovery options
    """
    return await ai_recovery_service.generate_recovery_options(disruption_data, category_info, options_config)

def get_ai_service_info() -> Dict[str, Any]:
    """Get information about the AI service"""
    return {
        "current_provider": ai_recovery_service.get_current_provider_info(),
        "available_providers": ai_recovery_service.get_available_providers(),
        "total_providers": len(ai_recovery_service.providers_config)
    }