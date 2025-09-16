"""
AERON Django API Views - matching Express.js functionality
Provides comprehensive flight recovery operations API
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenVerifyView as BaseTokenVerifyView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import (
    Settings, SettingsAudit, CustomRules, FlightDisruption, DisruptionCategory,
    RecoveryOption, RecoveryStep, Passenger, PassengerRebooking, CrewMember,
    Aircraft, HotelBooking, RecoveryLog, PendingRecoverySolution, RecoveryOptionTemplate
)
from .services.recovery_generator import generate_recovery_options_for_disruption
from .services.ai_recovery_service import generate_ai_recovery_options, get_ai_service_info

logger = logging.getLogger(__name__)

# Authentication Views
class LoginView(APIView):
    """User authentication - matches /api/auth/login"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            
            if not email or not password:
                return Response({
                    'success': False,
                    'error': 'Email and password required'
                }, status=HTTP_400_BAD_REQUEST)
            
            # For now, using Django's default auth
            # In production, this would use the custom UserAccount model
            user = authenticate(request, username=email, password=password)
            
            if user and user.is_active:
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                
                return Response({
                    'success': True,
                    'access': access_token,
                    'refresh': str(refresh),
                    'user': {
                        'email': user.email,
                        'username': user.username,
                        'is_admin': user.is_staff
                    }
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Invalid credentials'
                }, status=HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                'success': False,
                'error': 'Login failed'
            }, status=HTTP_500_INTERNAL_SERVER_ERROR)

class TokenVerifyView(APIView):
    """Token verification - matches /api/auth/verify"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            token = request.data.get('token')
            if not token:
                return Response({'valid': False, 'error': 'Token required'}, status=HTTP_400_BAD_REQUEST)
            
            # Verify the JWT token
            from rest_framework_simplejwt.tokens import UntypedToken
            from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
            from django.contrib.auth import get_user_model
            import jwt
            from django.conf import settings
            
            try:
                UntypedToken(token)
                decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded_token.get('user_id')
                user = get_user_model().objects.get(id=user_id)
                
                return Response({
                    'valid': True,
                    'user': {
                        'email': user.email,
                        'username': user.username,
                        'is_admin': user.is_staff
                    }
                })
            except (InvalidToken, TokenError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                return Response({'valid': False, 'error': 'Invalid token'}, status=HTTP_400_BAD_REQUEST)
            except get_user_model().DoesNotExist:
                return Response({'valid': False, 'error': 'User not found'}, status=HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            return Response({'valid': False, 'error': 'Token verification failed'}, status=HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    """User logout - matches /api/auth/logout"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # For JWT, client-side logout (remove token from client storage)
            # Server-side token blacklisting could be implemented here if needed
            return Response({'success': True, 'message': 'Logged out successfully'})
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({'success': False, 'error': 'Logout failed'})

# Settings Management Views
class SettingsListView(APIView):
    """Settings management - matches /api/settings"""
    
    def get(self, request):
        """Get all active settings"""
        try:
            settings_qs = Settings.objects.filter(is_active=True)
            
            # Group by category
            settings_by_category = {}
            for setting in settings_qs:
                if setting.category not in settings_by_category:
                    settings_by_category[setting.category] = {}
                settings_by_category[setting.category][setting.key] = setting.value
            
            return Response(settings_by_category)
        except Exception as e:
            logger.error(f"Settings retrieval error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create or update a setting"""
        try:
            data = request.data
            category = data.get('category')
            key = data.get('key')
            value = data.get('value')
            type_str = data.get('type', 'string')
            
            if not all([category, key, value is not None]):
                return Response({
                    'error': 'category, key, and value are required'
                }, status=HTTP_400_BAD_REQUEST)
            
            # Get old value for audit trail
            old_setting = None
            try:
                old_setting = Settings.objects.get(category=category, key=key)
            except Settings.DoesNotExist:
                pass
            
            setting, created = Settings.objects.update_or_create(
                category=category,
                key=key,
                defaults={
                    'value': value,
                    'type': type_str,
                    'updated_by': getattr(request.user, 'username', 'system')
                }
            )
            
            # Create audit trail
            SettingsAudit.objects.create(
                setting_id=setting.id,
                category=category,
                key=key,
                old_value=old_setting.value if old_setting else None,
                new_value=value,
                change_type='CREATE' if created else 'UPDATE',
                changed_by=getattr(request.user, 'username', 'system'),
                reason='API update'
            )
            
            return Response({
                'id': setting.id,
                'category': setting.category,
                'key': setting.key,
                'value': setting.value,
                'type': setting.type,
                'created': created
            }, status=HTTP_201_CREATED if created else HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Settings save error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)

class SettingsTabsView(APIView):
    """Settings organized by tabs - matches /api/settings/tabs"""
    
    def get(self, request):
        try:
            settings_qs = Settings.objects.filter(is_active=True)
            
            # Organize settings into tabs based on categories
            tabs = {
                'operationalRules': {},
                'recoveryConstraints': {},
                'automationSettings': {},
                'passengerPrioritization': {},
                'recoveryOptionsRanking': {},
                'aircraftSelectionCriteria': {},
                'crewAssignmentCriteria': {},
                'flightPrioritization': {},
                'flightScoring': {},
                'passengerScoring': {},
                'nlpSettings': {},
                'notificationSettings': {},
            }
            
            for setting in settings_qs:
                if setting.category in tabs:
                    tabs[setting.category][setting.key] = {
                        'value': setting.value,
                        'type': setting.type,
                        'description': setting.description
                    }
            
            return Response(tabs)
        except Exception as e:
            logger.error(f"Settings tabs error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)

class SettingsBatchUpdateView(APIView):
    """Batch settings update - matches /api/settings/batch"""
    
    def post(self, request):
        try:
            settings_data = request.data.get('settings', [])
            updated_by = getattr(request.user, 'username', 'system')
            
            if not isinstance(settings_data, list):
                return Response({
                    'error': 'Settings must be an array'
                }, status=HTTP_400_BAD_REQUEST)
            
            results = []
            for setting_data in settings_data:
                category = setting_data.get('category')
                key = setting_data.get('key')
                value = setting_data.get('value')
                type_str = setting_data.get('type', 'string')
                
                setting, created = Settings.objects.update_or_create(
                    category=category,
                    key=key,
                    defaults={
                        'value': value,
                        'type': type_str,
                        'updated_by': updated_by
                    }
                )
                results.append(setting)
            
            return Response({
                'success': True,
                'saved_settings': len(results)
            })
            
        except Exception as e:
            logger.error(f"Batch settings error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)

# Screen Settings View (stored as regular settings)
class ScreenSettingsView(APIView):
    """Screen settings - matches /api/screen-settings"""
    
    def get(self, request):
        try:
            # Screen settings are stored as regular settings with category='screenSettings'
            screen_settings = Settings.objects.filter(
                category='screenSettings',
                is_active=True
            )
            
            # Transform to expected format
            screens = []
            for setting in screen_settings:
                screens.append({
                    'id': setting.key,
                    'name': setting.value.get('name', setting.key),
                    'category': setting.value.get('category', 'general'),
                    'enabled': setting.value.get('enabled', True),
                    'required': setting.value.get('required', False),
                    'icon': setting.value.get('icon', 'Settings')
                })
            
            return Response(screens)
        except Exception as e:
            logger.error(f"Screen settings error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            screen_data = request.data
            screen_id = screen_data.get('screen_id')
            
            Settings.objects.update_or_create(
                category='screenSettings',
                key=screen_id,
                defaults={
                    'value': screen_data,
                    'type': 'object',
                    'updated_by': getattr(request.user, 'username', 'system')
                }
            )
            
            return Response({'success': True})
        except Exception as e:
            logger.error(f"Screen settings save error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)

# Custom Rules Management
class CustomRulesView(APIView):
    """Custom rules management - matches /api/custom-rules"""
    
    def get(self, request):
        try:
            rules = CustomRules.objects.filter(status='Active')
            rules_data = []
            
            for rule in rules:
                rules_data.append({
                    'rule_id': rule.rule_id,
                    'name': rule.name,
                    'description': rule.description,
                    'category': rule.category,
                    'type': rule.type,
                    'priority': rule.priority,
                    'overridable': rule.overridable,
                    'conditions': rule.conditions,
                    'actions': rule.actions,
                    'status': rule.status,
                    'created_by': rule.created_by,
                    'created_at': rule.created_at,
                    'updated_at': rule.updated_at
                })
            
            return Response(rules_data)
        except Exception as e:
            logger.error(f"Custom rules error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            rule_data = request.data
            rule_id = rule_data.get('rule_id')
            
            rule, created = CustomRules.objects.update_or_create(
                rule_id=rule_id,
                defaults={
                    'name': rule_data.get('name'),
                    'description': rule_data.get('description'),
                    'category': rule_data.get('category'),
                    'type': rule_data.get('type', 'Soft'),
                    'priority': rule_data.get('priority', 3),
                    'overridable': rule_data.get('overridable', True),
                    'conditions': rule_data.get('conditions'),
                    'actions': rule_data.get('actions'),
                    'status': rule_data.get('status', 'Active'),
                    'created_by': getattr(request.user, 'username', 'system')
                }
            )
            
            return Response({
                'rule_id': rule.rule_id,
                'name': rule.name,
                'created': created
            }, status=HTTP_201_CREATED if created else HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Custom rules save error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)

# Flight Disruptions Management
class DisruptionsView(APIView):
    """Flight disruptions - matches /api/disruptions/"""
    
    def get(self, request):
        try:
            # Get query parameters
            recovery_status = request.GET.get('recovery_status')
            category_code = request.GET.get('category_code')
            
            # Build query
            disruptions_qs = FlightDisruption.objects.select_related('category').all()
            
            if recovery_status:
                disruptions_qs = disruptions_qs.filter(recovery_status=recovery_status)
            if category_code:
                disruptions_qs = disruptions_qs.filter(category__category_code=category_code)
            
            # Transform data to match Express.js format
            results = []
            for disruption in disruptions_qs.order_by('-created_at'):
                results.append({
                    'id': disruption.id,
                    'flight_number': disruption.flight_number,
                    'route': disruption.route,
                    'origin': disruption.origin,
                    'destination': disruption.destination,
                    'origin_city': disruption.origin_city,
                    'destination_city': disruption.destination_city,
                    'aircraft': disruption.aircraft,
                    'scheduled_departure': disruption.scheduled_departure.isoformat() if disruption.scheduled_departure else None,
                    'estimated_departure': disruption.estimated_departure.isoformat() if disruption.estimated_departure else None,
                    'delay_minutes': disruption.delay_minutes,
                    'passengers': disruption.passengers,
                    'crew': disruption.crew,
                    'connection_flights': disruption.connection_flights,
                    'severity': disruption.severity,
                    'disruption_type': disruption.disruption_type,
                    'status': disruption.status,
                    'disruption_reason': disruption.disruption_reason,
                    'categorization': disruption.categorization,
                    'recovery_status': disruption.recovery_status,
                    'category_code': disruption.category.category_code if disruption.category else None,
                    'category_name': disruption.category.category_name if disruption.category else None,
                    'category_description': disruption.category.description if disruption.category else None,
                    'created_at': disruption.created_at.isoformat(),
                    'updated_at': disruption.updated_at.isoformat()
                })
            
            return Response(results)
        except Exception as e:
            logger.error(f"Disruptions retrieval error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            data = request.data
            
            # Handle both camelCase and snake_case field names
            flight_number = data.get('flight_number') or data.get('flightNumber')
            route = data.get('route')
            origin = data.get('origin')
            destination = data.get('destination')
            origin_city = data.get('origin_city') or data.get('originCity')
            destination_city = data.get('destination_city') or data.get('destinationCity')
            aircraft = data.get('aircraft')
            scheduled_departure = data.get('scheduled_departure') or data.get('scheduledDeparture')
            estimated_departure = data.get('estimated_departure') or data.get('estimatedDeparture')
            delay_minutes = data.get('delay_minutes') or data.get('delay') or 0
            passengers = data.get('passengers')
            crew = data.get('crew')
            connection_flights = data.get('connection_flights') or data.get('connectionFlights') or 0
            severity = data.get('severity') or 'Medium'
            disruption_type = data.get('disruption_type') or data.get('disruptionType') or data.get('type')
            status = data.get('status') or 'Active'
            disruption_reason = data.get('disruption_reason') or data.get('disruptionReason')
            categorization = data.get('categorization')
            category_code = data.get('category_code')
            
            # Validate required fields
            if not all([flight_number, aircraft, scheduled_departure, passengers, crew]):
                return Response({
                    'error': 'Missing required fields',
                    'details': 'flight_number, aircraft, scheduled_departure, passengers, and crew are required'
                }, status=HTTP_400_BAD_REQUEST)
            
            # Use defaults for missing fields
            safe_route = route or f"{origin or 'UNK'} → {destination or 'UNK'}"
            safe_origin = origin or 'UNK'
            safe_destination = destination or 'UNK'
            safe_origin_city = origin_city or 'Unknown'
            safe_destination_city = destination_city or 'Unknown'
            safe_disruption_reason = disruption_reason or 'No reason provided'
            
            # Handle category mapping
            category_obj = None
            if category_code:
                try:
                    category_obj = DisruptionCategory.objects.get(category_code=category_code, is_active=True)
                except DisruptionCategory.DoesNotExist:
                    pass
            
            # Fallback to categorization mapping if no category found
            if not category_obj and categorization:
                category_code = self._map_categorization_to_code(categorization)
                try:
                    category_obj = DisruptionCategory.objects.get(category_code=category_code, is_active=True)
                except DisruptionCategory.DoesNotExist:
                    pass
            
            # Default category
            if not category_obj:
                category_obj, _ = DisruptionCategory.objects.get_or_create(
                    category_code='AIRCRAFT_ISSUE',
                    defaults={
                        'category_name': 'Aircraft Issue',
                        'description': 'Default category for technical issues'
                    }
                )
            
            # Create or update disruption
            disruption, created = FlightDisruption.objects.update_or_create(
                flight_number=flight_number,
                scheduled_departure=scheduled_departure,
                defaults={
                    'route': safe_route,
                    'origin': safe_origin,
                    'destination': safe_destination,
                    'origin_city': safe_origin_city,
                    'destination_city': safe_destination_city,
                    'aircraft': aircraft,
                    'estimated_departure': estimated_departure,
                    'delay_minutes': delay_minutes,
                    'passengers': passengers,
                    'crew': crew,
                    'connection_flights': connection_flights,
                    'severity': severity,
                    'disruption_type': disruption_type,
                    'status': status,
                    'disruption_reason': safe_disruption_reason,
                    'categorization': categorization,
                    'category': category_obj
                }
            )
            
            return Response({
                'id': disruption.id,
                'flight_number': disruption.flight_number,
                'route': disruption.route,
                'status': 'created' if created else 'updated'
            }, status=HTTP_201_CREATED if created else HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Disruption save error: {str(e)}")
            return Response({
                'error': 'Failed to save disruption',
                'details': str(e)
            }, status=HTTP_500_INTERNAL_SERVER_ERROR)
    
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

# Recovery Options Views
class RecoveryOptionsView(APIView):
    """Recovery options management - matches multiple recovery endpoints"""
    
    def get(self, request):
        try:
            disruption_id = request.GET.get('disruptionId')
            category_code = request.GET.get('categoryCode')
            option_id = request.GET.get('optionId')
            
            if option_id:
                # Get specific option details
                try:
                    option = RecoveryOption.objects.get(id=option_id)
                    return Response(self._format_recovery_option(option))
                except RecoveryOption.DoesNotExist:
                    return Response({'error': 'Recovery option not found'}, status=HTTP_404_NOT_FOUND)
            
            elif disruption_id:
                # Get options for specific disruption
                options = RecoveryOption.objects.filter(disruption_id=disruption_id)
                return Response([self._format_recovery_option(opt) for opt in options])
            
            elif category_code:
                # Get template options by category
                try:
                    category = DisruptionCategory.objects.get(category_code=category_code)
                    templates = RecoveryOptionTemplate.objects.filter(category=category, is_active=True)
                    
                    template_data = []
                    for template in templates:
                        template_data.append({
                            'template_code': template.template_code,
                            'title': template.title,
                            'description': template.description,
                            'default_timeline': template.default_timeline,
                            'default_confidence': template.default_confidence,
                            'default_impact': template.default_impact,
                            'template_data': template.template_data
                        })
                    
                    return Response(template_data)
                except DisruptionCategory.DoesNotExist:
                    return Response({'error': 'Category not found'}, status=HTTP_404_NOT_FOUND)
            
            else:
                return Response({'error': 'disruptionId, categoryCode, or optionId required'}, status=HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Recovery options error: {str(e)}")
            return Response({'error': str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _format_recovery_option(self, option: RecoveryOption) -> Dict[str, Any]:
        """Format recovery option for API response"""
        return {
            'id': option.id,
            'title': option.title,
            'description': option.description,
            'cost': option.cost,
            'timeline': option.timeline,
            'confidence': option.confidence,
            'impact': option.impact,
            'status': option.status,
            'priority': option.priority,
            'advantages': option.advantages,
            'considerations': option.considerations,
            'resource_requirements': option.resource_requirements,
            'cost_breakdown': option.cost_breakdown,
            'timeline_details': option.timeline_details,
            'risk_assessment': option.risk_assessment,
            'technical_specs': option.technical_specs,
            'metrics': option.metrics,
            'rotation_plan': option.rotation_plan,
            'detailed_cost_analysis': option.detailed_cost_analysis,
            'timeline_breakdown': option.timeline_breakdown,
            'resource_details': option.resource_details,
            'risk_details': option.risk_details,
            'technical_details': option.technical_details,
            'impact_area': option.impact_area,
            'impact_summary': option.impact_summary,
            'created_at': option.created_at.isoformat(),
            'updated_at': option.updated_at.isoformat()
        }

class RecoveryOptionsGenerateView(APIView):
    """Recovery options generation - matches /api/recovery-options/generate/:disruptionId"""
    
    def post(self, request):
        try:
            disruption_id = request.data.get('disruptionId')
            generator_type = request.data.get('generator', 'standard')  # 'standard' or 'ai'
            
            if not disruption_id:
                return Response({'error': 'disruptionId required'}, status=HTTP_400_BAD_REQUEST)
            
            try:
                disruption = FlightDisruption.objects.select_related('category').get(id=disruption_id)
            except FlightDisruption.DoesNotExist:
                return Response({'error': 'Disruption not found'}, status=HTTP_404_NOT_FOUND)
            
            # Format disruption data for generators
            disruption_data = {
                'id': disruption.id,
                'flight_number': disruption.flight_number,
                'route': disruption.route,
                'origin': disruption.origin,
                'destination': disruption.destination,
                'aircraft': disruption.aircraft,
                'scheduled_departure': disruption.scheduled_departure.isoformat() if disruption.scheduled_departure else None,
                'estimated_departure': disruption.estimated_departure.isoformat() if disruption.estimated_departure else None,
                'delay_minutes': disruption.delay_minutes,
                'passengers': disruption.passengers,
                'crew': disruption.crew,
                'severity': disruption.severity,
                'disruption_type': disruption.disruption_type,
                'disruption_reason': disruption.disruption_reason,
                'categorization': disruption.categorization
            }
            
            category_info = {}
            if disruption.category:
                category_info = {
                    'category_code': disruption.category.category_code,
                    'category_name': disruption.category.category_name,
                    'description': disruption.category.description
                }
            
            if generator_type == 'ai':
                # Use AI generator
                import asyncio
                result = asyncio.run(generate_ai_recovery_options(disruption_data, category_info))
            else:
                # Use standard template generator
                result = generate_recovery_options_for_disruption(disruption_data, category_info)
            
            # Save generated options to database
            saved_options = []
            for option_data in result.get('options', []):
                recovery_option = RecoveryOption.objects.create(
                    disruption=disruption,
                    title=option_data.get('title', 'Recovery Option'),
                    description=option_data.get('description', ''),
                    cost=option_data.get('cost', ''),
                    timeline=option_data.get('timeline', ''),
                    confidence=option_data.get('confidence', 0),
                    impact=option_data.get('impact', ''),
                    status=option_data.get('status', 'generated'),
                    priority=option_data.get('priority', 0),
                    advantages=option_data.get('advantages', []),
                    considerations=option_data.get('considerations', []),
                    resource_requirements=option_data.get('resource_requirements', []),
                    cost_breakdown=option_data.get('cost_breakdown', {}),
                    timeline_details=option_data.get('timeline_details', []),
                    risk_assessment=option_data.get('risk_assessment', []),
                    technical_specs=option_data.get('technical_specs', {}),
                    metrics=option_data.get('metrics', {}),
                    impact_area=option_data.get('impact_area', []),
                    impact_summary=option_data.get('impact_summary', '')
                )
                saved_options.append(self._format_recovery_option(recovery_option))
            
            # Save generated steps
            saved_steps = []
            for i, step_data in enumerate(result.get('steps', []), 1):
                recovery_step = RecoveryStep.objects.create(
                    disruption=disruption,
                    step_number=step_data.get('step', i),
                    title=step_data.get('title', f'Step {i}'),
                    status=step_data.get('status', 'pending'),
                    timestamp=step_data.get('timestamp', ''),
                    system=step_data.get('system', ''),
                    details=step_data.get('details', ''),
                    step_data=step_data.get('data', {})
                )
                saved_steps.append({
                    'step': recovery_step.step_number,
                    'title': recovery_step.title,
                    'status': recovery_step.status,
                    'timestamp': recovery_step.timestamp,
                    'system': recovery_step.system,
                    'details': recovery_step.details,
                    'data': recovery_step.step_data
                })
            
            return Response({
                'success': True,
                'options': saved_options,
                'steps': saved_steps,
                'metadata': result.get('metadata', {}),
                'generator': generator_type
            })
            
        except Exception as e:
            logger.error(f"Recovery generation error: {str(e)}")
            return Response({
                'error': 'Recovery generation failed',
                'details': str(e)
            }, status=HTTP_500_INTERNAL_SERVER_ERROR)

# Placeholder views for other endpoints
class DisruptionsBulkView(APIView):
    """Bulk disruptions operations"""
    def post(self, request):
        return Response({'message': 'Bulk operations endpoint - implementation pending'})

class PassengerServicesView(APIView):
    """Passenger services management"""
    def get(self, request):
        return Response({'message': 'Passenger services endpoint - implementation pending'})

class PassengerLookupView(APIView):
    """Passenger PNR lookup"""
    def get(self, request):
        return Response({'message': 'Passenger lookup endpoint - implementation pending'})

class CrewManagementView(APIView):
    """Crew management"""
    def get(self, request):
        return Response({'message': 'Crew management endpoint - implementation pending'})

class CrewAvailabilityView(APIView):
    """Crew availability"""
    def get(self, request):
        return Response({'message': 'Crew availability endpoint - implementation pending'})

class AircraftManagementView(APIView):
    """Aircraft management"""
    def get(self, request):
        return Response({'message': 'Aircraft management endpoint - implementation pending'})

class AircraftAvailabilityView(APIView):
    """Aircraft availability"""
    def get(self, request):
        return Response({'message': 'Aircraft availability endpoint - implementation pending'})

class AnalyticsView(APIView):
    """Analytics and reporting"""
    def get(self, request):
        return Response({'message': 'Analytics endpoint - implementation pending'})

class DashboardAnalyticsView(APIView):
    """Dashboard analytics"""
    def get(self, request):
        return Response({'message': 'Dashboard analytics endpoint - implementation pending'})

class LLMIntegrationView(APIView):
    """LLM service integration"""
    def get(self, request):
        """Get AI service information"""
        return Response(get_ai_service_info())
    
    def post(self, request):
        """Switch LLM provider"""
        provider = request.data.get('provider')
        if provider:
            from .services.ai_recovery_service import ai_recovery_service
            success = ai_recovery_service.switch_provider(provider)
            return Response({
                'success': success,
                'current_provider': ai_recovery_service.get_current_provider_info()
            })
        return Response({'error': 'Provider name required'}, status=HTTP_400_BAD_REQUEST)