
# Migration Guide: Express.js to Django REST Framework (Single App Architecture)

## Overview
This guide outlines the migration process from the current Express.js server to a Django REST Framework (DRF) application using a single app architecture called `aeron`, maintaining all functionality while leveraging Django's robust features.

## Current Express.js Architecture Analysis

### Core Services Identified
1. **Authentication & Authorization** (`/api/auth/*`)
2. **Settings Management** (`/api/settings/*`)
3. **Flight Disruptions** (`/api/disruptions/*`)
4. **Recovery Options & Steps** (`/api/recovery-*`)
5. **Passenger Services** (`/api/passengers/*`, `/api/passenger-rebookings/*`)
6. **Crew Management** (`/api/crew/*`)
7. **Aircraft Management** (`/api/aircraft/*`)
8. **Hotel & Accommodation** (`/api/hotel-bookings/*`)
9. **Analytics & Reporting** (`/api/dashboard-analytics`)
10. **LLM Integration** (via `llm-recovery-service.js`)
11. **Logging & Monitoring** (`logger.js`)
12. **Database Operations** (PostgreSQL with connection pooling)

## Migration Strategy

### Phase 1: Django Project Setup and Core Infrastructure

#### Step 1: Initialize Django Project
```bash
# Install Django and dependencies
pip install django djangorestframework
pip install psycopg2-binary python-decouple
pip install django-cors-headers django-filter
pip install celery redis  # For background tasks
pip install openai anthropic google-generativeai  # For LLM integration

# Create Django project
django-admin startproject aeron_recovery .
cd aeron_recovery
```

#### Step 2: Create Single Django App (Service Grouping)
```bash
# Single app to contain all functionality
python manage.py startapp aeron
```

### Phase 2: Django Models Migration

#### Step 3: Define Django Models Based on Current Schema

**aeron/models.py**
```python
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.postgres.fields import JSONField
import uuid

# User Management
class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('passenger_manager', 'Passenger Manager'),
        ('crew_manager', 'Crew Manager'),
    ]
    
    user_type = models.CharField(max_length=50, choices=USER_TYPE_CHOICES)
    user_code = models.CharField(max_length=10, unique=True)
    full_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Settings Management
class Setting(models.Model):
    TYPE_CHOICES = [
        ('boolean', 'Boolean'),
        ('number', 'Number'),
        ('string', 'String'),
        ('object', 'Object'),
        ('array', 'Array'),
    ]
    
    category = models.CharField(max_length=100)
    key = models.CharField(max_length=100)
    value = JSONField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['category', 'key']

class SettingsAudit(models.Model):
    CHANGE_TYPES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ]
    
    setting = models.ForeignKey(Setting, on_delete=models.CASCADE)
    category = models.CharField(max_length=100)
    key = models.CharField(max_length=100)
    old_value = JSONField(null=True, blank=True)
    new_value = JSONField()
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPES)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)

class ScreenSetting(models.Model):
    screen_id = models.CharField(max_length=50, unique=True)
    screen_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    enabled = models.BooleanField(default=True)
    required = models.BooleanField(default=False)
    icon = models.CharField(max_length=50, default='Settings')
    updated_by = models.CharField(max_length=100, default='system')
    updated_at = models.DateTimeField(auto_now=True)

class CustomRule(models.Model):
    TYPE_CHOICES = [
        ('Hard', 'Hard'),
        ('Soft', 'Soft'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Draft', 'Draft'),
    ]
    
    rule_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    priority = models.IntegerField(default=3)
    overridable = models.BooleanField(default=True)
    conditions = models.TextField(blank=True)
    actions = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_by = models.CharField(max_length=100, default='system')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.CharField(max_length=100, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

class CustomParameter(models.Model):
    parameter_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    weight = models.IntegerField(default=10)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.CharField(max_length=100, default='system')
    created_at = models.DateTimeField(auto_now_add=True)

# Flight Operations
class DisruptionCategory(models.Model):
    category_code = models.CharField(max_length=50, unique=True)
    category_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority_level = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

class FlightDisruption(models.Model):
    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    flight_number = models.CharField(max_length=10)
    route = models.CharField(max_length=50)
    origin = models.CharField(max_length=3)
    destination = models.CharField(max_length=3)
    origin_city = models.CharField(max_length=100, blank=True)
    destination_city = models.CharField(max_length=100, blank=True)
    aircraft = models.CharField(max_length=50)
    scheduled_departure = models.DateTimeField()
    estimated_departure = models.DateTimeField(null=True, blank=True)
    delay_minutes = models.IntegerField(default=0)
    passengers = models.IntegerField()
    crew = models.IntegerField()
    connection_flights = models.IntegerField(default=0)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    disruption_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    disruption_reason = models.TextField(blank=True)
    categorization = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(DisruptionCategory, on_delete=models.SET_NULL, null=True)
    recovery_status = models.CharField(max_length=50, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['flight_number', 'scheduled_departure']

class RecoveryOptionTemplate(models.Model):
    category = models.ForeignKey(DisruptionCategory, on_delete=models.CASCADE)
    template_code = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField()
    default_timeline = models.CharField(max_length=100, blank=True)
    default_confidence = models.IntegerField(default=80)
    default_impact = models.CharField(max_length=20, default='Medium')
    default_status = models.CharField(max_length=20, default='available')
    template_data = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['category', 'template_code']

class RecoveryOption(models.Model):
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='recovery_options')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cost = models.CharField(max_length=100, blank=True)
    timeline = models.CharField(max_length=100, blank=True)
    confidence = models.IntegerField(default=0)
    impact = models.TextField(blank=True)
    status = models.CharField(max_length=50, default='generated')
    priority = models.IntegerField(default=0)
    advantages = JSONField(default=list)
    considerations = JSONField(default=list)
    resource_requirements = JSONField(default=list)
    cost_breakdown = JSONField(default=dict)
    timeline_details = JSONField(default=list)
    risk_assessment = JSONField(default=list)
    technical_specs = JSONField(default=dict)
    metrics = JSONField(default=dict)
    rotation_plan = JSONField(default=dict)
    impact_area = JSONField(default=list)
    impact_summary = models.TextField(blank=True)
    crew_available = JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'title']

class RecoveryStep(models.Model):
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='recovery_steps')
    step_number = models.IntegerField()
    title = models.TextField()
    status = models.CharField(max_length=50, default='pending')
    timestamp = models.CharField(max_length=50, blank=True)
    system = models.CharField(max_length=255, blank=True)
    details = models.TextField(blank=True)
    step_data = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'step_number']

# Passenger Services
class Passenger(models.Model):
    pnr = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    flight_number = models.CharField(max_length=10)
    seat_number = models.CharField(max_length=10, blank=True)
    ticket_class = models.CharField(max_length=20)
    loyalty_tier = models.CharField(max_length=20, default='Bronze')
    special_needs = models.TextField(blank=True)
    contact_info = JSONField(default=dict)
    rebooking_status = models.CharField(max_length=50, blank=True)
    new_flight_number = models.CharField(max_length=10, blank=True)
    new_seat_number = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PassengerRebooking(models.Model):
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    pnr = models.CharField(max_length=10)
    passenger_id = models.CharField(max_length=50)
    passenger_name = models.CharField(max_length=255)
    original_flight = models.CharField(max_length=10)
    original_seat = models.CharField(max_length=10, blank=True)
    rebooked_flight = models.CharField(max_length=10)
    rebooked_cabin = models.CharField(max_length=50)
    rebooked_seat = models.CharField(max_length=10, blank=True)
    rebooking_date = models.DateTimeField(auto_now_add=True)
    additional_services = JSONField(default=list)
    status = models.CharField(max_length=50, default='Confirmed')
    total_passengers_in_pnr = models.IntegerField(default=1)
    rebooking_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'passenger_id', 'pnr']

# Crew Management
class CrewMember(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('On Duty', 'On Duty'),
        ('Rest', 'Rest'),
        ('Unavailable', 'Unavailable'),
    ]
    
    employee_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=50)
    qualifications = models.JSONField(default=list)
    duty_time_remaining = models.IntegerField()
    base_location = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    current_flight = models.CharField(max_length=10, blank=True)
    contact_info = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CrewDisruptionMapping(models.Model):
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    crew_member = models.ForeignKey(CrewMember, on_delete=models.CASCADE)
    disruption_reason = models.TextField(blank=True)
    affected_date = models.DateTimeField(auto_now_add=True)
    resolution_status = models.CharField(max_length=50, default='Pending')
    replacement_crew = models.ForeignKey(CrewMember, on_delete=models.SET_NULL, null=True, blank=True, related_name='replacement_for')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'crew_member']

class CrewHotelAssignment(models.Model):
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    crew_member = JSONField()  # Array of crew member objects
    hotel_name = models.CharField(max_length=255)
    hotel_location = models.CharField(max_length=500, blank=True)
    check_in_date = models.DateTimeField()
    check_out_date = models.DateTimeField()
    room_number = models.CharField(max_length=50, blank=True)
    special_requests = models.TextField(blank=True)
    assignment_status = models.CharField(max_length=50, default='assigned')
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    booking_reference = models.CharField(max_length=100, unique=True, blank=True)
    transport_details = JSONField(default=dict)
    created_by = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Aircraft Management
class Aircraft(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('In Use', 'In Use'),
        ('Maintenance', 'Maintenance'),
        ('Out of Service', 'Out of Service'),
    ]
    
    MAINTENANCE_STATUS_CHOICES = [
        ('Operational', 'Operational'),
        ('Due', 'Due'),
        ('In Progress', 'In Progress'),
    ]
    
    registration = models.CharField(max_length=20, unique=True)
    aircraft_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    location = models.CharField(max_length=50)
    maintenance_status = models.CharField(max_length=20, choices=MAINTENANCE_STATUS_CHOICES)
    fuel_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    next_maintenance = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Hotel Management
class HotelBooking(models.Model):
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, null=True, blank=True)
    passenger_pnr = models.CharField(max_length=10, blank=True)
    hotel_name = models.CharField(max_length=255)
    check_in = models.DateTimeField()
    check_out = models.DateTimeField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=50, default='Pending')
    booking_reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Analytics and Logging
class RecoveryLog(models.Model):
    solution_id = models.CharField(max_length=50, unique=True)
    disruption_id = models.CharField(max_length=50)
    flight_number = models.CharField(max_length=10)
    route = models.CharField(max_length=50)
    aircraft = models.CharField(max_length=50)
    disruption_type = models.CharField(max_length=50)
    disruption_reason = models.TextField(blank=True)
    priority = models.CharField(max_length=20)
    date_created = models.DateTimeField()
    date_executed = models.DateTimeField(null=True, blank=True)
    date_completed = models.DateTimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    status = models.CharField(max_length=20)
    affected_passengers = models.IntegerField(null=True, blank=True)
    actual_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    cost_variance = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    otp_impact = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    solution_chosen = models.TextField(blank=True)
    total_options = models.IntegerField(null=True, blank=True)
    executed_by = models.CharField(max_length=255, blank=True)
    approved_by = models.CharField(max_length=255, blank=True)
    passenger_satisfaction = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    rebooking_success = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    categorization = models.CharField(max_length=100, blank=True)
    cancellation_avoided = models.BooleanField(default=False)
    potential_delay_minutes = models.IntegerField(null=True, blank=True)
    actual_delay_minutes = models.IntegerField(null=True, blank=True)
    delay_reduction_minutes = models.IntegerField(null=True, blank=True)
    disruption_category = models.CharField(max_length=50, blank=True)
    recovery_efficiency = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    network_impact = models.CharField(max_length=20, blank=True)
    downstream_flights_affected = models.IntegerField(null=True, blank=True)
    details = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Step 4: Create and Run Migrations
```bash
python manage.py makemigrations aeron
python manage.py migrate
```

### Phase 3: API Layer Migration

#### Step 5: Create Django REST Framework Serializers

**aeron/serializers.py**
```python
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'user_type', 'user_code', 'full_name']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return data

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'

class SettingsAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = SettingsAudit
        fields = '__all__'
        read_only_fields = ['changed_at']

class ScreenSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenSetting
        fields = '__all__'

class CustomRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomRule
        fields = '__all__'

class CustomParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomParameter
        fields = '__all__'

class DisruptionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DisruptionCategory
        fields = '__all__'

class FlightDisruptionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    
    class Meta:
        model = FlightDisruption
        fields = '__all__'

class RecoveryOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecoveryOption
        fields = '__all__'

class RecoveryStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecoveryStep
        fields = '__all__'

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = '__all__'

class PassengerRebookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassengerRebooking
        fields = '__all__'

class CrewMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrewMember
        fields = '__all__'

class CrewHotelAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrewHotelAssignment
        fields = '__all__'

class AircraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aircraft
        fields = '__all__'

class HotelBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelBooking
        fields = '__all__'

class RecoveryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecoveryLog
        fields = '__all__'
```

#### Step 6: Create Django Views

**aeron/views.py**
```python
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.db.models import Q
from .models import *
from .serializers import *
from .services import LLMRecoveryService

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    
    return Response({
        'error': 'Invalid credentials'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    return Response({'success': True, 'user': UserSerializer(request.user).data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    return Response({'success': True})

# Settings Views
class SettingsViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.filter(is_active=True)
    serializer_class = SettingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset.order_by('category', 'key')
    
    @action(detail=False, methods=['get'])
    def tabs(self, request):
        """Equivalent to /api/settings/tabs endpoint"""
        settings = self.get_queryset()
        
        # Group settings by tab categories (same logic as Express.js)
        tab_settings = {
            'screens': {},
            'passengerPriority': {},
            'rules': {},
            'recoveryOptions': {},
            'nlp': {},
            'notifications': {},
            'system': {},
        }
        
        field_labels = {
            'loyaltyTier': 'Loyalty Tier Status',
            'ticketClass': 'Ticket Class (Business/Economy)',
            'specialNeeds': 'Special Requirements',
            'groupSize': 'Family/Group Bookings',
            'connectionRisk': 'Missed Connection Risk',
            # Add all other field labels from Express.js
        }
        
        for setting in settings:
            category = setting.category
            key = setting.key
            
            full_setting = {
                'id': setting.id,
                'category': setting.category,
                'key': setting.key,
                'value': setting.value,
                'type': setting.type,
                'description': setting.description or f'Weight percentage for {key} in {category}',
                'created_at': setting.created_at,
                'updated_at': setting.updated_at,
                'label': field_labels.get(key, key.capitalize()),
                'updated_by': setting.updated_by.username if setting.updated_by else 'system',
                'is_active': setting.is_active,
            }
            
            # Map database categories to tab categories (same logic as Express.js)
            if category in ['passengerPrioritization', 'flightPrioritization', 'flightScoring', 'passengerScoring']:
                if category not in tab_settings['passengerPriority']:
                    tab_settings['passengerPriority'][category] = []
                tab_settings['passengerPriority'][category].append(full_setting)
            elif category in ['operationalRules', 'recoveryConstraints', 'automationSettings']:
                if category not in tab_settings['rules']:
                    tab_settings['rules'][category] = []
                tab_settings['rules'][category].append(full_setting)
            elif category in ['recoveryOptionsRanking', 'aircraftSelectionCriteria', 'crewAssignmentCriteria']:
                if category not in tab_settings['recoveryOptions']:
                    tab_settings['recoveryOptions'][category] = []
                tab_settings['recoveryOptions'][category].append(full_setting)
            elif category in ['nlpSettings', 'manualKnowledgeEntries']:
                if category not in tab_settings['nlp']:
                    tab_settings['nlp'][category] = []
                tab_settings['nlp'][category].append(full_setting)
            elif category == 'notificationSettings':
                if category not in tab_settings['notifications']:
                    tab_settings['notifications'][category] = []
                tab_settings['notifications'][category].append(full_setting)
            else:
                if category not in tab_settings['system']:
                    tab_settings['system'][category] = []
                tab_settings['system'][category].append(full_setting)
        
        return Response(tab_settings)
    
    @action(detail=False, methods=['post'])
    def batch(self, request):
        """Batch update settings"""
        settings_data = request.data.get('settings', [])
        updated_by = request.user if request.user.is_authenticated else None
        
        with transaction.atomic():
            results = []
            for setting_data in settings_data:
                setting_data['updated_by'] = updated_by.id if updated_by else None
                
                setting, created = Setting.objects.update_or_create(
                    category=setting_data['category'],
                    key=setting_data['key'],
                    defaults={
                        'value': setting_data['value'],
                        'type': setting_data['type'],
                        'updated_by': updated_by
                    }
                )
                results.append(SettingSerializer(setting).data)
        
        return Response({'success': True, 'saved_settings': len(results)})
    
    @action(detail=False, methods=['post'])
    def reset(self, request):
        """Reset settings to defaults"""
        # Implementation for resetting settings
        return Response({'message': 'Settings reset to defaults successfully'})

# Screen Settings Views
class ScreenSettingViewSet(viewsets.ModelViewSet):
    queryset = ScreenSetting.objects.all()
    serializer_class = ScreenSettingSerializer
    permission_classes = [IsAuthenticated]

# Custom Rules Views
class CustomRuleViewSet(viewsets.ModelViewSet):
    queryset = CustomRule.objects.all()
    serializer_class = CustomRuleSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def batch(self, request):
        """Batch save custom rules"""
        rules = request.data.get('rules', [])
        updated_by = request.user.username if request.user.is_authenticated else 'system'
        
        with transaction.atomic():
            results = []
            for rule_data in rules:
                rule_data['created_by'] = updated_by
                rule_data['updated_by'] = updated_by
                
                rule, created = CustomRule.objects.update_or_create(
                    rule_id=rule_data['rule_id'],
                    defaults=rule_data
                )
                results.append(CustomRuleSerializer(rule).data)
        
        return Response({
            'success': True,
            'saved_rules': len(results),
            'rules': results
        })

# Flight Disruption Views
class FlightDisruptionViewSet(viewsets.ModelViewSet):
    queryset = FlightDisruption.objects.all()
    serializer_class = FlightDisruptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Apply filters (same as Express.js)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update disruptions from external API"""
        disruptions = request.data.get('disruptions', [])
        
        if not isinstance(disruptions, list):
            return Response({'error': 'Expected array of disruptions'}, status=400)
        
        updated = 0
        inserted = 0
        errors = 0
        
        for disruption_data in disruptions:
            try:
                flight_num = disruption_data.get('flight_number') or disruption_data.get('flightNumber')
                scheduled_dep = disruption_data.get('scheduled_departure') or disruption_data.get('scheduledDeparture')
                
                if not flight_num or not scheduled_dep:
                    errors += 1
                    continue
                
                # Process disruption data
                defaults = {
                    'route': disruption_data.get('route', f"{disruption_data.get('origin', 'UNK')} → {disruption_data.get('destination', 'UNK')}"),
                    'origin': disruption_data.get('origin', 'UNK'),
                    'destination': disruption_data.get('destination', 'UNK'),
                    'origin_city': disruption_data.get('origin_city', 'Unknown'),
                    'destination_city': disruption_data.get('destination_city', 'Unknown'),
                    'aircraft': disruption_data.get('aircraft', 'Unknown'),
                    'estimated_departure': disruption_data.get('estimated_departure'),
                    'delay_minutes': disruption_data.get('delay_minutes', 0),
                    'passengers': disruption_data.get('passengers', 0),
                    'crew': disruption_data.get('crew', 6),
                    'connection_flights': disruption_data.get('connection_flights', 0),
                    'severity': disruption_data.get('severity', 'Medium'),
                    'disruption_type': disruption_data.get('disruption_type', 'Technical'),
                    'status': disruption_data.get('status', 'Active'),
                    'disruption_reason': disruption_data.get('disruption_reason', 'API sync'),
                    'categorization': disruption_data.get('categorization'),
                }
                
                disruption, created = FlightDisruption.objects.update_or_create(
                    flight_number=flight_num,
                    scheduled_departure=scheduled_dep,
                    defaults=defaults
                )
                
                if created:
                    inserted += 1
                else:
                    updated += 1
                    
            except Exception as e:
                errors += 1
                continue
        
        return Response({
            'success': True,
            'inserted': inserted,
            'updated': updated,
            'errors': errors,
            'total': len(disruptions)
        })

# Recovery Options Views
class RecoveryOptionViewSet(viewsets.ModelViewSet):
    queryset = RecoveryOption.objects.all()
    serializer_class = RecoveryOptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        disruption_id = self.request.query_params.get('disruption_id')
        if disruption_id:
            queryset = queryset.filter(disruption_id=disruption_id)
        return queryset.order_by('priority', '-confidence')

# Add other viewsets for remaining models...
class PassengerViewSet(viewsets.ModelViewSet):
    queryset = Passenger.objects.all()
    serializer_class = PassengerSerializer
    permission_classes = [IsAuthenticated]

class CrewMemberViewSet(viewsets.ModelViewSet):
    queryset = CrewMember.objects.all()
    serializer_class = CrewMemberSerializer
    permission_classes = [IsAuthenticated]

class AircraftViewSet(viewsets.ModelViewSet):
    queryset = Aircraft.objects.all()
    serializer_class = AircraftSerializer
    permission_classes = [IsAuthenticated]

class HotelBookingViewSet(viewsets.ModelViewSet):
    queryset = HotelBooking.objects.all()
    serializer_class = HotelBookingSerializer
    permission_classes = [IsAuthenticated]

class RecoveryLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RecoveryLog.objects.all()
    serializer_class = RecoveryLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return super().get_queryset().order_by('-created_at')

# Health check view
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    try:
        # Test database connection
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'database': db_status,
        'environment': settings.DEBUG and 'development' or 'production',
    })
```

#### Step 7: Create URL Patterns

**aeron/urls.py**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'settings', views.SettingsViewSet)
router.register(r'screen-settings', views.ScreenSettingViewSet)
router.register(r'custom-rules', views.CustomRuleViewSet)
router.register(r'disruptions', views.FlightDisruptionViewSet)
router.register(r'recovery-options', views.RecoveryOptionViewSet)
router.register(r'passengers', views.PassengerViewSet)
router.register(r'crew', views.CrewMemberViewSet)
router.register(r'aircraft', views.AircraftViewSet)
router.register(r'hotel-bookings', views.HotelBookingViewSet)
router.register(r'recovery-logs', views.RecoveryLogViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.login, name='login'),
    path('auth/verify/', views.verify_token, name='verify_token'),
    path('auth/logout/', views.logout, name='logout'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # API routes
    path('', include(router.urls)),
]
```

**aeron_recovery/urls.py**
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('aeron.urls')),
]
```

#### Step 8: Create LLM Service

**aeron/services.py**
```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class LLMRecoveryService:
    def __init__(self):
        self.providers = {}
        self.current_provider = None
        self.initialize_providers()
    
    def initialize_providers(self):
        """Initialize available LLM providers"""
        if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
            self.providers['openai'] = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                model=getattr(settings, 'OPENAI_MODEL', 'gpt-3.5-turbo'),
                temperature=getattr(settings, 'OPENAI_TEMPERATURE', 0.7)
            )
            self.current_provider = 'openai'
        
        if hasattr(settings, 'ANTHROPIC_API_KEY') and settings.ANTHROPIC_API_KEY:
            self.providers['anthropic'] = ChatAnthropic(
                api_key=settings.ANTHROPIC_API_KEY,
                model=getattr(settings, 'ANTHROPIC_MODEL', 'claude-3-sonnet-20240229'),
                temperature=getattr(settings, 'ANTHROPIC_TEMPERATURE', 0.7)
            )
            if not self.current_provider:
                self.current_provider = 'anthropic'
    
    def generate_recovery_options(self, disruption_data, category_info=None, options_config=None):
        """Generate recovery options using LLM (same functionality as Express.js)"""
        if not self.current_provider:
            return self.fallback_to_default_generator(disruption_data, category_info)
        
        try:
            config = options_config or {'count': 3}
            prompt_data = self.build_prompt_data(disruption_data, category_info, config['count'])
            
            prompt = ChatPromptTemplate.from_template("""
            You are an expert flight operations recovery specialist. Generate {optionsCount} comprehensive recovery options for the following disruption:

            Flight Information:
            - Flight: {flightNumber} ({route})
            - Aircraft: {aircraft}
            - Scheduled: {scheduledDeparture}
            - Delay: {delayMinutes} minutes
            - Passengers: {passengers}
            - Issue: {disruptionType} - {disruptionReason}
            - Severity: {severity}

            Generate exactly {optionsCount} recovery options with realistic costs, timelines, and operational details.
            Return only valid JSON format.
            """)
            
            llm = self.providers[self.current_provider]
            chain = prompt | llm
            
            response = chain.invoke(prompt_data)
            return self.parse_response(response.content, disruption_data.get('flight_number'))
            
        except Exception as e:
            logger.error(f'LLM generation failed: {str(e)}')
            return self.fallback_to_default_generator(disruption_data, category_info)
    
    def build_prompt_data(self, disruption_data, category_info, options_count):
        """Build prompt data (same structure as Express.js)"""
        return {
            'optionsCount': options_count,
            'flightNumber': disruption_data.get('flight_number', 'Unknown'),
            'route': disruption_data.get('route', f"{disruption_data.get('origin')} → {disruption_data.get('destination')}"),
            'aircraft': disruption_data.get('aircraft', 'Unknown'),
            'scheduledDeparture': disruption_data.get('scheduled_departure', 'Unknown'),
            'delayMinutes': disruption_data.get('delay_minutes', 0),
            'passengers': disruption_data.get('passengers', 0),
            'disruptionType': disruption_data.get('disruption_type', 'Unknown'),
            'disruptionReason': disruption_data.get('disruption_reason', 'Unknown'),
            'severity': disruption_data.get('severity', 'Medium'),
        }
    
    def parse_response(self, content, flight_number):
        """Parse LLM response (same logic as Express.js)"""
        try:
            import json
            # Clean the response
            cleaned = content.strip()
            if cleaned.startswith('```'):
                cleaned = cleaned.replace('```json', '').replace('```', '')
            
            parsed = json.loads(cleaned)
            
            if not parsed.get('options') or not isinstance(parsed['options'], list):
                raise ValueError('Invalid options array')
            
            return {
                'options': parsed['options'],
                'steps': parsed.get('steps', [])
            }
            
        except Exception as e:
            logger.error(f'Failed to parse LLM response: {str(e)}')
            raise ValueError('Invalid LLM response format')
    
    def fallback_to_default_generator(self, disruption_data, category_info):
        """Fallback to default generator (implement default options)"""
        logger.info('Using fallback recovery generator')
        return {
            'options': [
                {
                    'title': 'Aircraft Swap',
                    'description': 'Replace with available standby aircraft',
                    'cost': 'AED 22,800',
                    'timeline': '1.5-2 hours',
                    'confidence': 88,
                    'impact': 'Minimal passenger disruption',
                    'status': 'recommended',
                    'priority': 1
                }
            ],
            'steps': [
                {
                    'step': 1,
                    'title': 'Assessment and Decision',
                    'status': 'completed',
                    'timestamp': timezone.now().isoformat(),
                    'system': 'Recovery Engine',
                    'details': 'Initial disruption assessment completed'
                }
            ]
        }
```

### Phase 4: Configuration and Deployment

#### Step 9: Django Settings Configuration

**aeron_recovery/settings.py**
```python
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = ['0.0.0.0', 'localhost', '*.replit.dev', '*.replit.com']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'aeron',  # Single app containing all functionality
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'aeron_recovery.urls'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='aeron_settings'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'require' if config('DB_SSL', default=True, cast=bool) else 'disable',
        },
    }
}

# Use existing DATABASE_URL if available (for Replit compatibility)
if config('DATABASE_URL', default=None):
    import dj_database_url
    DATABASES['default'] = dj_database_url.parse(config('DATABASE_URL'))

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# CORS settings
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5000,https://*.replit.dev',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_ALLOW_CREDENTIALS = True

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}

# Custom user model
AUTH_USER_MODEL = 'aeron.User'

# LLM Integration settings
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
OPENAI_MODEL = config('OPENAI_MODEL', default='gpt-3.5-turbo')
OPENAI_TEMPERATURE = config('OPENAI_TEMPERATURE', default=0.7, cast=float)

ANTHROPIC_API_KEY = config('ANTHROPIC_API_KEY', default='')
ANTHROPIC_MODEL = config('ANTHROPIC_MODEL', default='claude-3-sonnet-20240229')
ANTHROPIC_TEMPERATURE = config('ANTHROPIC_TEMPERATURE', default=0.7, cast=float)

# Celery configuration for background tasks
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379')

USE_TZ = True
TIME_ZONE = 'UTC'
```

#### Step 10: Create Admin Configuration

**aeron/admin.py**
```python
from django.contrib import admin
from .models import *

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ['category', 'key', 'type', 'is_active', 'updated_at']
    list_filter = ['category', 'type', 'is_active']
    search_fields = ['category', 'key']

@admin.register(FlightDisruption)
class FlightDisruptionAdmin(admin.ModelAdmin):
    list_display = ['flight_number', 'route', 'severity', 'status', 'created_at']
    list_filter = ['severity', 'status', 'disruption_type']
    search_fields = ['flight_number', 'route']

@admin.register(RecoveryOption)
class RecoveryOptionAdmin(admin.ModelAdmin):
    list_display = ['title', 'disruption', 'confidence', 'status', 'priority']
    list_filter = ['status', 'priority']
    search_fields = ['title', 'disruption__flight_number']

@admin.register(CrewMember)
class CrewMemberAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'name', 'role', 'status', 'base_location']
    list_filter = ['role', 'status', 'base_location']
    search_fields = ['employee_id', 'name']

@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display = ['registration', 'aircraft_type', 'status', 'location']
    list_filter = ['status', 'aircraft_type', 'maintenance_status']
    search_fields = ['registration', 'aircraft_type']

# Register other models
admin.site.register(DisruptionCategory)
admin.site.register(CustomRule)
admin.site.register(Passenger)
admin.site.register(HotelBooking)
admin.site.register(RecoveryLog)
```

### Phase 5: Data Migration

#### Step 11: Create Data Migration Script

**aeron/management/commands/migrate_express_data.py**
```python
from django.core.management.base import BaseCommand
from django.db import transaction
import psycopg2
import json
from aeron.models import *

class Command(BaseCommand):
    help = 'Migrate data from Express.js PostgreSQL schema to Django'
    
    def add_arguments(self, parser):
        parser.add_argument('--source-db', type=str, help='Source database URL')
        parser.add_argument('--dry-run', action='store_true', help='Dry run without saving')
    
    def handle(self, *args, **options):
        source_db = options['source_db']
        dry_run = options['dry_run']
        
        if not source_db:
            self.stdout.write(
                self.style.ERROR('Source database URL is required')
            )
            return
        
        try:
            with psycopg2.connect(source_db) as conn:
                self.migrate_settings(conn, dry_run)
                self.migrate_disruptions(conn, dry_run)
                self.migrate_recovery_data(conn, dry_run)
                
            self.stdout.write(
                self.style.SUCCESS('Data migration completed successfully')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Migration failed: {str(e)}')
            )
    
    def migrate_settings(self, conn, dry_run):
        """Migrate settings data"""
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM settings WHERE is_active = true")
            settings_data = cursor.fetchall()
            
            for row in settings_data:
                if not dry_run:
                    Setting.objects.update_or_create(
                        category=row[1],
                        key=row[2],
                        defaults={
                            'value': row[3],
                            'type': row[4],
                            'description': row[5],
                            'is_active': row[10]
                        }
                    )
        
        self.stdout.write(f'Migrated {len(settings_data)} settings')
    
    def migrate_disruptions(self, conn, dry_run):
        """Migrate flight disruptions"""
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM flight_disruptions")
            disruptions_data = cursor.fetchall()
            
            for row in disruptions_data:
                if not dry_run:
                    FlightDisruption.objects.update_or_create(
                        flight_number=row[1],
                        scheduled_departure=row[8],
                        defaults={
                            'route': row[2],
                            'origin': row[3],
                            'destination': row[4],
                            'aircraft': row[7],
                            'passengers': row[11],
                            'crew': row[12],
                            'severity': row[14],
                            'disruption_type': row[15],
                            'status': row[16],
                            'disruption_reason': row[17]
                        }
                    )
        
        self.stdout.write(f'Migrated {len(disruptions_data)} disruptions')
    
    def migrate_recovery_data(self, conn, dry_run):
        """Migrate recovery options and steps"""
        # Migrate recovery options
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM recovery_options")
            options_data = cursor.fetchall()
            
            for row in options_data:
                if not dry_run:
                    try:
                        disruption = FlightDisruption.objects.get(id=row[1])
                        RecoveryOption.objects.update_or_create(
                            disruption=disruption,
                            title=row[2],
                            defaults={
                                'description': row[3],
                                'cost': row[4],
                                'timeline': row[5],
                                'confidence': row[6],
                                'impact': row[7],
                                'status': row[8],
                                'priority': row[9]
                            }
                        )
                    except FlightDisruption.DoesNotExist:
                        continue
        
        self.stdout.write(f'Migrated {len(options_data)} recovery options')
```

### Phase 6: Testing and Deployment

#### Step 12: Create Requirements File

**requirements.txt**
```txt
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
django-filter==23.4
psycopg2-binary==2.9.9
python-decouple==3.8
dj-database-url==2.1.0
celery==5.3.4
redis==5.0.1
openai==1.3.5
anthropic==0.7.7
langchain-openai==0.0.2
langchain-anthropic==0.1.1
langchain-core==0.1.0
```

#### Step 13: Create Run Script

**manage.py** (Django default)
```python
#!/usr/bin/env python
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aeron_recovery.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
```

## Migration Execution Plan

### Pre-Migration Checklist
1. **Backup Current Database**: Create full backup of PostgreSQL database
2. **Environment Setup**: Install Python and required packages
3. **Configuration Review**: Map all Express.js environment variables to Django settings
4. **API Documentation**: Document all current API endpoints for testing

### Migration Steps

#### Phase 1: Setup (Day 1-2)
1. Create Django project with single `aeron` app
2. Define all models based on current schema
3. Configure database connections
4. Create and run initial migrations

#### Phase 2: Core Migration (Day 3-5)
1. Implement authentication system
2. Migrate settings management functionality
3. Migrate flight operations models and views
4. Implement basic API endpoints

#### Phase 3: Service Migration (Day 6-8)
1. Migrate LLM integration service
2. Migrate recovery planning logic
3. Migrate passenger and crew services
4. Migrate analytics functionality

#### Phase 4: Data Migration (Day 9-10)
1. Run data migration scripts
2. Validate data integrity
3. Test API compatibility
4. Performance testing

#### Phase 5: Deployment (Day 11-12)
1. Configure production settings for Replit
2. Deploy Django application
3. Run integration tests
4. Monitor and optimize

### API Compatibility

The Django implementation maintains the same API endpoints as Express.js:

- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/settings/tabs` - Tab-wise settings
- `POST /api/settings/batch` - Batch update settings
- `GET /api/disruptions/` - Flight disruptions
- `POST /api/disruptions/bulk-update` - Bulk update from external API
- `GET /api/recovery-options/` - Recovery options
- All other endpoints maintain the same structure

### Benefits of Single App Architecture

1. **Simplified Structure**: All related functionality in one app
2. **Easier Maintenance**: Single codebase for all services
3. **Better Performance**: Reduced overhead from multiple apps
4. **Cleaner Imports**: Direct model imports without cross-app dependencies
5. **Unified Admin**: Single admin interface for all models

### Deployment on Replit

The Django application is configured to run on Replit with:
- PostgreSQL database integration
- Port binding to 0.0.0.0:5000
- Environment variable configuration
- CORS settings for Replit domains
- Logging configuration
- Static file serving

The migration maintains all Express.js functionality while providing Django's benefits including admin interface, ORM, security features, and robust testing framework.
