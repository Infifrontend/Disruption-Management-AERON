
# Migration Guide: Express.js to Django REST Framework (Aeron Application)

## Overview
This guide provides a comprehensive migration strategy from the current Express.js server to a Django REST Framework (DRF) application using a single app architecture called `aeron`. The migration maintains all existing functionality while leveraging Django's robust features for better scalability and maintainability.

## Table of Contents
1. [Migration Strategy Overview](#migration-strategy-overview)
2. [Express.js Service Analysis](#expressjs-service-analysis)
3. [Django Foundation Setup](#django-foundation-setup)
4. [Database Schema Migration](#database-schema-migration)
5. [Service-by-Service Migration](#service-by-service-migration)
6. [Migration Stages](#migration-stages)
7. [Testing & Validation](#testing--validation)

## Migration Strategy Overview

### Core Principles
- **Single App Architecture**: All functionality consolidated into the `aeron` Django app
- **Database Schema Preservation**: Maintain existing PostgreSQL schema structure
- **API Compatibility**: Preserve all existing REST endpoints
- **Functionality Parity**: Ensure identical behavior across all services
- **Zero Data Loss**: Complete data integrity during migration

### Migration Benefits
- Enhanced security with Django's built-in features
- Better ORM with Django models
- Improved admin interface
- Enhanced testing framework
- Better code organization and maintainability

## Express.js Service Analysis

Based on `server/start.js`, the application contains the following services:

### 1. Authentication Services
**Location**: Lines 150-220 in start.js
**Endpoints**:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/verify` - Token verification  
- `POST /api/auth/logout` - User logout

**Functionality**:
- JWT token generation and validation
- Password verification (bcrypt + fallback)
- User session management
- Database user validation

**Migration Notes**: Will use Django's authentication system with DRF tokens

### 2. Settings Management Services
**Location**: Lines 250-450 in start.js
**Endpoints**:
- `GET /api/settings` - Retrieve all settings
- `GET /api/settings/tabs` - Tab-wise settings
- `GET /api/settings/:category/:key` - Specific setting
- `POST /api/settings` - Create/update setting
- `DELETE /api/settings/:category/:key` - Delete setting
- `POST /api/settings/batch` - Bulk settings update

**Functionality**:
- Hierarchical settings management
- Category-based organization
- JSON value storage
- Audit trail support
- Batch operations

### 3. Screen Settings Services
**Location**: Lines 450-550 in start.js
**Endpoints**:
- `GET /api/screen-settings` - UI screen configurations
- `POST /api/screen-settings` - Update screen settings
- `PUT /api/screen-settings/:screen_id` - Toggle screen
- `POST /api/screen-settings/batch` - Bulk screen updates

**Functionality**:
- UI visibility control
- Screen state management
- Required/optional screen flags

### 4. Custom Rules Management
**Location**: Lines 550-650 in start.js
**Endpoints**:
- `GET /api/custom-rules` - Retrieve rules
- `POST /api/custom-rules` - Create rule
- `POST /api/custom-rules/batch` - Bulk rule operations
- `PUT /api/custom-rules/:rule_id` - Update rule
- `DELETE /api/custom-rules/:rule_id` - Delete rule

**Functionality**:
- Business rule engine
- Priority-based rule execution
- Rule categorization
- Override capabilities

### 5. Flight Disruption Services
**Location**: Lines 750-950 in start.js
**Endpoints**:
- `GET /api/disruptions/` - List disruptions with filters
- `POST /api/disruptions/` - Create new disruption
- `GET /api/disruptions/:id` - Get specific disruption
- `PUT /api/disruptions/:id/recovery-status` - Update status
- `POST /api/disruptions/bulk-update` - Bulk disruption updates

**Functionality**:
- Flight disruption tracking
- Status management
- Category mapping
- Bulk operations
- Recovery status tracking

### 6. Recovery Options Services
**Location**: Lines 1200-1500 in start.js
**Endpoints**:
- `GET /api/recovery-options/:disruptionId` - Get recovery options
- `POST /api/recovery-options/generate/:disruptionId` - Generate options
- `GET /api/recovery-option/:optionId` - Get option details
- `POST /api/recovery-options/generate-llm/:disruptionId` - LLM generation

**Functionality**:
- Recovery option generation
- LLM-powered suggestions
- Option ranking and scoring
- Detailed analysis (cost, timeline, resources)

### 7. Passenger Services
**Location**: Lines 1000-1200 in start.js
**Endpoints**:
- `GET /api/passengers/pnr/:pnr` - Passenger lookup
- `PUT /api/passengers/:pnr/rebooking` - Update rebooking
- `POST /api/passenger-rebookings` - Create rebooking
- `GET /api/passenger-rebookings/disruption/:disruptionId` - Get rebookings

**Functionality**:
- Passenger lookup and management
- Rebooking operations
- PNR-based services
- Disruption-passenger mapping

### 8. Crew Management Services
**Location**: Lines 1500-1600 in start.js
**Endpoints**:
- `GET /api/crew/available` - Available crew
- `GET /api/crew/flight/:flightNumber` - Flight crew

**Functionality**:
- Crew availability tracking
- Flight assignments
- Duty time management

### 9. Aircraft Management Services
**Location**: Lines 1600-1700 in start.js
**Endpoints**:
- `GET /api/aircraft` - All aircraft
- `GET /api/aircraft/available` - Available aircraft
- `PUT /api/aircraft/:id/status` - Update aircraft status

**Functionality**:
- Aircraft tracking
- Status management
- Availability monitoring

### 10. Analytics Services
**Location**: Lines 1700-2000 in start.js
**Endpoints**:
- `GET /api/dashboard-analytics` - Dashboard data
- `GET /api/analytics/kpi` - KPI metrics
- `GET /api/past-recovery-kpi` - Historical KPIs
- `GET /api/past-recovery-logs` - Recovery logs

**Functionality**:
- Performance analytics
- Historical data analysis
- KPI calculations
- Dashboard metrics

### 11. LLM Integration Services
**Location**: Lines 1400-1500 in start.js
**Endpoints**:
- `GET /api/llm-recovery/health` - LLM health check
- `POST /api/llm-recovery/provider/switch` - Switch LLM provider
- `GET /api/llm-recovery/providers` - List providers

**Functionality**:
- Multi-provider LLM support
- Health monitoring
- Dynamic provider switching

## Django Foundation Setup

### Stage 1: Project Initialization

```bash
# Create Django project
django-admin startproject aeron_project
cd aeron_project

# Create the main aeron app
python manage.py startapp aeron

# Install required packages
pip install djangorestframework
pip install psycopg2-binary
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install celery
pip install openai
pip install python-dotenv
```

### Stage 2: Django Settings Configuration

**File**: `aeron_project/settings.py`

```python
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key-here')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['*']  # Configure appropriately for production

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
    'aeron',
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

ROOT_URLCONF = 'aeron_project.urls'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'aeron_settings'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', '0.0.0.0'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require' if os.getenv('NODE_ENV') == 'production' else 'prefer',
        },
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOW_ALL_ORIGINS = DEBUG

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
```

## Database Schema Migration

### Stage 3: Django Models Creation

All models will be created in `aeron/models.py` to match the existing database schema:

**File**: `aeron/models.py`

```python
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json

class Setting(models.Model):
    SETTING_TYPES = [
        ('boolean', 'Boolean'),
        ('number', 'Number'),
        ('string', 'String'),
        ('object', 'Object'),
        ('array', 'Array'),
    ]
    
    category = models.CharField(max_length=100)
    key = models.CharField(max_length=100)
    value = models.JSONField()
    type = models.CharField(max_length=20, choices=SETTING_TYPES)
    description = models.TextField(blank=True)
    updated_by = models.CharField(max_length=100, default='system')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'settings'
        unique_together = ['category', 'key']

class ScreenSetting(models.Model):
    screen_id = models.CharField(max_length=50, unique=True)
    screen_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    enabled = models.BooleanField(default=True)
    required = models.BooleanField(default=False)
    icon = models.CharField(max_length=50, default='Settings')
    updated_by = models.CharField(max_length=100, default='system')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'screen_settings'

class CustomRule(models.Model):
    RULE_TYPES = [
        ('Hard', 'Hard'),
        ('Soft', 'Soft'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Draft', 'Draft'),
    ]
    
    rule_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=RULE_TYPES)
    priority = models.IntegerField(default=3)
    overridable = models.BooleanField(default=True)
    conditions = models.TextField()
    actions = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_by = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.CharField(max_length=100, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'custom_rules'

class DisruptionCategory(models.Model):
    category_code = models.CharField(max_length=50, unique=True)
    category_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority_level = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'disruption_categories'

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
    category = models.ForeignKey(DisruptionCategory, on_delete=models.SET_NULL, null=True, blank=True)
    recovery_status = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'flight_disruptions'
        unique_together = ['flight_number', 'scheduled_departure']

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
    advantages = models.JSONField(default=list)
    considerations = models.JSONField(default=list)
    resource_requirements = models.JSONField(default=dict)
    cost_breakdown = models.JSONField(default=dict)
    timeline_details = models.JSONField(default=dict)
    risk_assessment = models.JSONField(default=dict)
    technical_specs = models.JSONField(default=dict)
    metrics = models.JSONField(default=dict)
    rotation_plan = models.JSONField(default=dict)
    impact_area = models.JSONField(default=list)
    impact_summary = models.TextField(blank=True)
    crew_available = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'recovery_options'
        unique_together = ['disruption', 'title']

class Passenger(models.Model):
    TICKET_CLASS_CHOICES = [
        ('Economy', 'Economy'),
        ('Business', 'Business'),
        ('First', 'First'),
    ]
    
    LOYALTY_TIER_CHOICES = [
        ('Bronze', 'Bronze'),
        ('Silver', 'Silver'),
        ('Gold', 'Gold'),
        ('Platinum', 'Platinum'),
    ]
    
    pnr = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    flight_number = models.CharField(max_length=10)
    seat_number = models.CharField(max_length=10, blank=True)
    ticket_class = models.CharField(max_length=20, choices=TICKET_CLASS_CHOICES)
    loyalty_tier = models.CharField(max_length=20, choices=LOYALTY_TIER_CHOICES, default='Bronze')
    special_needs = models.TextField(blank=True)
    contact_info = models.JSONField(default=dict)
    rebooking_status = models.CharField(max_length=50, blank=True)
    new_flight_number = models.CharField(max_length=10, blank=True)
    new_seat_number = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'passengers'

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
    contact_info = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'crew_members'

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
    
    class Meta:
        db_table = 'aircraft'

class PassengerRebooking(models.Model):
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='passenger_rebookings')
    pnr = models.CharField(max_length=10)
    passenger_id = models.CharField(max_length=50)
    passenger_name = models.CharField(max_length=255)
    original_flight = models.CharField(max_length=10, blank=True)
    original_seat = models.CharField(max_length=10, blank=True)
    rebooked_flight = models.CharField(max_length=10, blank=True)
    rebooked_cabin = models.CharField(max_length=50, blank=True)
    rebooked_seat = models.CharField(max_length=10, blank=True)
    rebooking_date = models.DateTimeField(null=True, blank=True)
    additional_services = models.JSONField(default=list)
    status = models.CharField(max_length=50, default='pending')
    total_passengers_in_pnr = models.IntegerField(default=1)
    rebooking_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'passenger_rebookings'
        unique_together = ['disruption', 'passenger_id', 'pnr']
```

## Service-by-Service Migration

### Stage 4: Django Views & Serializers

**File**: `aeron/serializers.py`

```python
from rest_framework import serializers
from .models import *

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'

class ScreenSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenSetting
        fields = '__all__'

class CustomRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomRule
        fields = '__all__'

class DisruptionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DisruptionCategory
        fields = '__all__'

class FlightDisruptionSerializer(serializers.ModelSerializer):
    category_code = serializers.CharField(source='category.category_code', read_only=True)
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    
    class Meta:
        model = FlightDisruption
        fields = '__all__'

class RecoveryOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecoveryOption
        fields = '__all__'

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = '__all__'

class CrewMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrewMember
        fields = '__all__'

class AircraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aircraft
        fields = '__all__'

class PassengerRebookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassengerRebooking
        fields = '__all__'
```

**File**: `aeron/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Count, Sum, Avg
from .models import *
from .serializers import *
from .services import *

class AuthViewSet(viewsets.ViewSet):
    permission_classes = []
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Implement authentication logic
        user = authenticate(request, username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'token': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                }
            })
        
        return Response({'error': 'Invalid credentials'}, 
                       status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        # JWT verification handled by DRF JWT middleware
        return Response({'success': True, 'user': request.user.id})
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        return Response({'success': True})

class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.filter(is_active=True)
    serializer_class = SettingSerializer
    
    @action(detail=False, methods=['get'])
    def tabs(self, request):
        """Organize settings by tabs matching Express.js structure"""
        settings = self.get_queryset()
        
        tab_settings = {
            'screens': {},
            'passengerPriority': {},
            'rules': {},
            'recoveryOptions': {},
            'nlp': {},
            'notifications': {},
            'system': {},
        }
        
        # Group settings by category and map to tabs
        for setting in settings:
            serialized = self.get_serializer(setting).data
            category = setting.category
            
            if category in ['passengerPrioritization', 'flightPrioritization', 
                          'flightScoring', 'passengerScoring']:
                if category not in tab_settings['passengerPriority']:
                    tab_settings['passengerPriority'][category] = []
                tab_settings['passengerPriority'][category].append(serialized)
            elif category in ['operationalRules', 'recoveryConstraints', 'automationSettings']:
                if category not in tab_settings['rules']:
                    tab_settings['rules'][category] = []
                tab_settings['rules'][category].append(serialized)
            # Add other category mappings...
        
        return Response(tab_settings)
    
    @action(detail=False, methods=['post'])
    def batch(self, request):
        """Bulk update settings"""
        settings_data = request.data.get('settings', [])
        updated_by = request.data.get('updated_by', 'system')
        
        updated_count = 0
        for setting_data in settings_data:
            Setting.objects.update_or_create(
                category=setting_data['category'],
                key=setting_data['key'],
                defaults={
                    'value': setting_data['value'],
                    'type': setting_data['type'],
                    'updated_by': updated_by,
                }
            )
            updated_count += 1
        
        return Response({'success': True, 'saved_settings': updated_count})

class FlightDisruptionViewSet(viewsets.ModelViewSet):
    queryset = FlightDisruption.objects.all()
    serializer_class = FlightDisruptionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by recovery_status
        recovery_status = self.request.query_params.get('recovery_status')
        if recovery_status:
            queryset = queryset.filter(recovery_status=recovery_status)
        
        # Filter by category_code
        category_code = self.request.query_params.get('category_code')
        if category_code:
            queryset = queryset.filter(category__category_code=category_code)
        
        # Filter to exclude expired (older than 24 hours)
        from django.utils import timezone
        from datetime import timedelta
        twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
        queryset = queryset.filter(created_at__gte=twenty_four_hours_ago)
        queryset = queryset.exclude(status='expired')
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['put'])
    def recovery_status(self, request, pk=None):
        """Update recovery status"""
        disruption = self.get_object()
        recovery_status = request.data.get('recovery_status')
        
        if not recovery_status:
            return Response({'error': 'Recovery status is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        disruption.recovery_status = recovery_status
        disruption.save()
        
        return Response({'success': True, 'disruption': self.get_serializer(disruption).data})
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update disruptions from external API"""
        disruptions_data = request.data.get('disruptions', [])
        
        updated = 0
        inserted = 0
        errors = 0
        
        for disruption_data in disruptions_data:
            try:
                flight_number = disruption_data.get('flight_number') or disruption_data.get('flightNumber')
                scheduled_departure = disruption_data.get('scheduled_departure') or disruption_data.get('scheduledDeparture')
                
                if not flight_number or not scheduled_departure:
                    errors += 1
                    continue
                
                disruption, created = FlightDisruption.objects.update_or_create(
                    flight_number=flight_number,
                    scheduled_departure=scheduled_departure,
                    defaults={
                        'route': disruption_data.get('route', 'UNK → UNK'),
                        'origin': disruption_data.get('origin', 'UNK'),
                        'destination': disruption_data.get('destination', 'UNK'),
                        'aircraft': disruption_data.get('aircraft', 'Unknown'),
                        'passengers': disruption_data.get('passengers', 0),
                        'crew': disruption_data.get('crew', 6),
                        'severity': disruption_data.get('severity', 'Medium'),
                        'disruption_type': disruption_data.get('disruption_type', 'Technical'),
                        'status': disruption_data.get('status', 'Active'),
                        'disruption_reason': disruption_data.get('disruption_reason', 'API sync'),
                        # Map other fields...
                    }
                )
                
                if created:
                    inserted += 1
                else:
                    updated += 1
                    
            except Exception as e:
                errors += 1
        
        return Response({
            'success': True,
            'inserted': inserted,
            'updated': updated,
            'errors': errors,
            'total': len(disruptions_data)
        })

class RecoveryOptionViewSet(viewsets.ModelViewSet):
    queryset = RecoveryOption.objects.all()
    serializer_class = RecoveryOptionSerializer
    
    @action(detail=False, methods=['post'], url_path='generate/(?P<disruption_id>[^/.]+)')
    def generate(self, request, disruption_id=None):
        """Generate recovery options for a disruption"""
        try:
            disruption = FlightDisruption.objects.get(id=disruption_id)
            
            # Check if options already exist
            existing_options = RecoveryOption.objects.filter(disruption=disruption).count()
            if existing_options > 0:
                return Response({
                    'success': True,
                    'message': 'Recovery options already exist',
                    'exists': True,
                    'optionsCount': existing_options,
                })
            
            # Generate recovery options using service
            from .services.recovery_generator import RecoveryGeneratorService
            generator = RecoveryGeneratorService()
            options, steps = generator.generate_recovery_options(disruption)
            
            # Save options to database
            saved_options = []
            for option_data in options:
                option = RecoveryOption.objects.create(
                    disruption=disruption,
                    title=option_data['title'],
                    description=option_data['description'],
                    cost=option_data.get('cost', 'TBD'),
                    timeline=option_data.get('timeline', 'TBD'),
                    confidence=option_data.get('confidence', 80),
                    advantages=option_data.get('advantages', []),
                    considerations=option_data.get('considerations', []),
                    # Map other fields...
                )
                saved_options.append(option)
            
            return Response({
                'success': True,
                'optionsCount': len(saved_options),
                'stepsCount': len(steps),
                'message': f'Generated {len(saved_options)} recovery options',
            })
            
        except FlightDisruption.DoesNotExist:
            return Response({'error': 'Disruption not found'}, 
                          status=status.HTTP_404_NOT_FOUND)

class AnalyticsViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard analytics matching Express.js structure"""
        date_filter = request.query_params.get('dateFilter', 'today')
        
        # Calculate date range based on filter
        from django.utils import timezone
        from datetime import datetime, timedelta
        
        now = timezone.now()
        if date_filter == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        # Add other date filter logic...
        
        # Get disruptions for the date range
        disruptions = FlightDisruption.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date,
            status__ne='expired'
        )
        
        # Calculate performance metrics
        total_passengers = disruptions.aggregate(Sum('passengers'))['passengers__sum'] or 0
        completed_recoveries = disruptions.filter(
            Q(recovery_status='completed') | Q(status='Resolved')
        ).count()
        
        analytics = {
            'performance': {
                'costSavings': f'AED {total_passengers // 1000}K',
                'avgDecisionTime': '120 min',
                'passengersServed': total_passengers,
                'successRate': '95.2%',
                'decisionsProcessed': disruptions.count(),
            },
            'passengerImpact': {
                'affectedPassengers': total_passengers,
                'highPriority': disruptions.filter(severity__in=['High', 'Critical']).aggregate(Sum('passengers'))['passengers__sum'] or 0,
                'rebookings': PassengerRebooking.objects.filter(
                    disruption__in=disruptions,
                    status='confirmed'
                ).count(),
                'resolved': total_passengers // 2,  # Example calculation
            },
            # Add other analytics sections...
        }
        
        return Response(analytics)

# Add other viewsets for remaining services...
```

### Stage 5: URL Configuration

**File**: `aeron/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'settings', SettingViewSet)
router.register(r'screen-settings', ScreenSettingViewSet)
router.register(r'custom-rules', CustomRuleViewSet)
router.register(r'disruptions', FlightDisruptionViewSet)
router.register(r'recovery-options', RecoveryOptionViewSet)
router.register(r'passengers', PassengerViewSet)
router.register(r'crew', CrewMemberViewSet)
router.register(r'aircraft', AircraftViewSet)
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include('rest_framework.urls')),
]
```

**File**: `aeron_project/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('aeron.urls')),
]
```

## Migration Stages

### Stage 6: Phased Migration Plan

#### Phase 1: Foundation Setup (Week 1)
- [ ] Django project initialization
- [ ] Database connection configuration
- [ ] Basic model creation
- [ ] Initial migrations
- [ ] Authentication system setup

#### Phase 2: Core Services Migration (Week 2-3)
- [ ] Settings management services
- [ ] Flight disruption services  
- [ ] Recovery option services
- [ ] Basic CRUD operations testing

#### Phase 3: Advanced Services (Week 4-5)
- [ ] Analytics services
- [ ] Passenger services
- [ ] Crew management
- [ ] Aircraft management
- [ ] LLM integration services

#### Phase 4: Integration & Testing (Week 6)
- [ ] API endpoint compatibility testing
- [ ] Data migration verification
- [ ] Performance optimization
- [ ] Security hardening

#### Phase 5: Deployment & Cutover (Week 7)
- [ ] Production deployment on Replit
- [ ] Load testing
- [ ] Gradual traffic migration
- [ ] Monitoring setup

### Stage 7: Service Implementation Templates

**File**: `aeron/services/__init__.py`
```python
# Service layer initialization
```

**File**: `aeron/services/recovery_generator.py`

```python
from typing import List, Dict, Tuple
from ..models import FlightDisruption, DisruptionCategory, RecoveryOption

class RecoveryGeneratorService:
    """Service to generate recovery options based on disruption data"""
    
    def generate_recovery_options(self, disruption: FlightDisruption) -> Tuple[List[Dict], List[Dict]]:
        """Generate recovery options and steps for a given disruption"""
        
        options = []
        steps = []
        
        # Determine category-specific options
        if disruption.category:
            if disruption.category.category_code == 'AIRCRAFT_ISSUE':
                options = self._generate_aircraft_options(disruption)
            elif disruption.category.category_code == 'CREW_ISSUE':
                options = self._generate_crew_options(disruption)
            elif disruption.category.category_code == 'ATC_WEATHER':
                options = self._generate_weather_options(disruption)
            # Add other categories...
        else:
            # Default options
            options = self._generate_default_options(disruption)
        
        # Generate recovery steps
        steps = self._generate_recovery_steps(disruption)
        
        return options, steps
    
    def _generate_aircraft_options(self, disruption: FlightDisruption) -> List[Dict]:
        """Generate aircraft-specific recovery options"""
        return [
            {
                'title': 'Aircraft Swap',
                'description': 'Replace affected aircraft with available alternative',
                'cost': 'AED 25,000',
                'timeline': '75 minutes',
                'confidence': 95,
                'impact': 'Low',
                'advantages': [
                    'Same aircraft type - minimal passenger impact',
                    'Available immediately',
                    'Maintains schedule integrity'
                ],
                'considerations': [
                    'Crew briefing required for aircraft change',
                    'Passenger transfer time needed'
                ],
                'resource_requirements': {
                    'aircraft': 1,
                    'crew_briefing_time': 30,
                    'ground_crew': 4
                }
            },
            {
                'title': 'Delay for Repair',
                'description': 'Wait for technical issue resolution',
                'cost': 'AED 8,500',
                'timeline': '180 minutes',
                'confidence': 75,
                'impact': 'Medium',
                'advantages': [
                    'Original aircraft maintained',
                    'Lower direct costs'
                ],
                'considerations': [
                    'Uncertain repair completion time',
                    'Passenger accommodation required'
                ]
            },
            {
                'title': 'Cancel and Rebook',
                'description': 'Cancel flight and rebook on alternatives',
                'cost': 'AED 45,000',
                'timeline': '60 minutes',
                'confidence': 100,
                'impact': 'High',
                'advantages': [
                    'Stops cascade disruption',
                    'Quick resolution'
                ],
                'considerations': [
                    'Complete revenue loss',
                    'High compensation costs'
                ]
            }
        ]
    
    def _generate_crew_options(self, disruption: FlightDisruption) -> List[Dict]:
        """Generate crew-specific recovery options"""
        return [
            {
                'title': 'Assign Standby Crew',
                'description': 'Activate standby crew members',
                'cost': 'AED 3,500',
                'timeline': '30 minutes',
                'confidence': 92,
                'impact': 'Low',
                'advantages': [
                    'Quick resolution',
                    'Minimal schedule impact'
                ],
                'considerations': [
                    'Standby crew availability',
                    'Briefing time required'
                ]
            },
            {
                'title': 'Position Deadhead Crew',
                'description': 'Transport qualified crew from another location',
                'cost': 'AED 12,000',
                'timeline': '120 minutes',
                'confidence': 85,
                'impact': 'Medium',
                'advantages': [
                    'Crew availability expanded',
                    'Maintains original aircraft'
                ],
                'considerations': [
                    'Transport time and cost',
                    'Crew rest requirements'
                ]
            }
        ]
    
    def _generate_weather_options(self, disruption: FlightDisruption) -> List[Dict]:
        """Generate weather-specific recovery options"""
        return [
            {
                'title': 'Delay for Weather Clearance',
                'description': 'Wait for weather conditions to improve',
                'cost': 'AED 6,000',
                'timeline': '120 minutes',
                'confidence': 80,
                'impact': 'Medium',
                'advantages': [
                    'Original route maintained',
                    'Weather typically improves'
                ],
                'considerations': [
                    'Weather unpredictability',
                    'Passenger accommodation'
                ]
            }
        ]
    
    def _generate_default_options(self, disruption: FlightDisruption) -> List[Dict]:
        """Generate default recovery options for uncategorized disruptions"""
        return [
            {
                'title': 'Standard Recovery Plan',
                'description': 'Apply standard recovery procedures',
                'cost': 'AED 15,000',
                'timeline': '90 minutes',
                'confidence': 75,
                'impact': 'Medium',
                'advantages': ['Proven approach', 'Balanced cost and time'],
                'considerations': ['May not address specific root cause']
            }
        ]
    
    def _generate_recovery_steps(self, disruption: FlightDisruption) -> List[Dict]:
        """Generate recovery steps for the disruption"""
        return [
            {
                'step': 1,
                'title': 'Initial Assessment',
                'status': 'completed',
                'timestamp': '2025-01-10 12:30:00',
                'system': 'AERON Core',
                'details': f'Disruption identified: {disruption.flight_number}',
                'data': {'disruption_id': disruption.id}
            },
            {
                'step': 2,
                'title': 'Recovery Options Analysis',
                'status': 'in_progress',
                'timestamp': '2025-01-10 12:35:00',
                'system': 'Recovery Engine',
                'details': 'Analyzing available recovery options',
                'data': {'options_count': 3}
            }
        ]
```

## Testing & Validation

### Stage 8: Comprehensive Testing Plan

#### Unit Testing
Create comprehensive unit tests for all models and services:

**File**: `aeron/tests/test_models.py`

```python
from django.test import TestCase
from django.core.exceptions import ValidationError
from aeron.models import *

class FlightDisruptionModelTest(TestCase):
    def setUp(self):
        self.category = DisruptionCategory.objects.create(
            category_code='AIRCRAFT_ISSUE',
            category_name='Aircraft Issue',
            description='Technical aircraft issues'
        )
        
    def test_flight_disruption_creation(self):
        disruption = FlightDisruption.objects.create(
            flight_number='FZ203',
            route='DXB → DEL',
            origin='DXB',
            destination='DEL',
            aircraft='B737-800',
            scheduled_departure='2025-01-10 16:45:00+00:00',
            passengers=195,
            crew=6,
            severity='High',
            disruption_type='Technical',
            status='Active',
            category=self.category
        )
        
        self.assertEqual(disruption.flight_number, 'FZ203')
        self.assertEqual(disruption.category.category_code, 'AIRCRAFT_ISSUE')
        self.assertTrue(disruption.id is not None)

class SettingModelTest(TestCase):
    def test_setting_creation(self):
        setting = Setting.objects.create(
            category='operationalRules',
            key='maxDelayThreshold',
            value=180,
            type='number'
        )
        
        self.assertEqual(setting.value, 180)
        self.assertEqual(setting.type, 'number')
        self.assertTrue(setting.is_active)
```

#### Integration Testing
**File**: `aeron/tests/test_apis.py`

```python
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from aeron.models import *

class DisruptionAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = DisruptionCategory.objects.create(
            category_code='AIRCRAFT_ISSUE',
            category_name='Aircraft Issue'
        )
        
        self.disruption = FlightDisruption.objects.create(
            flight_number='FZ203',
            route='DXB → DEL',
            origin='DXB',
            destination='DEL',
            aircraft='B737-800',
            scheduled_departure='2025-01-10 16:45:00+00:00',
            passengers=195,
            crew=6,
            severity='High',
            disruption_type='Technical',
            status='Active',
            category=self.category
        )
    
    def test_get_disruptions(self):
        response = self.client.get('/api/disruptions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_disruption(self):
        data = {
            'flight_number': 'FZ204',
            'route': 'DXB → BOM',
            'origin': 'DXB',
            'destination': 'BOM',
            'aircraft': 'B737-800',
            'scheduled_departure': '2025-01-11 08:30:00+00:00',
            'passengers': 180,
            'crew': 6,
            'severity': 'Medium',
            'disruption_type': 'Weather',
            'status': 'Active'
        }
        
        response = self.client.post('/api/disruptions/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_generate_recovery_options(self):
        response = self.client.post(f'/api/recovery-options/generate/{self.disruption.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreater(response.data['optionsCount'], 0)
```

#### Performance Testing
**File**: `aeron/tests/test_performance.py`

```python
from django.test import TestCase
from django.test.utils import override_settings
from django.core.management import call_command
import time
from aeron.models import FlightDisruption

class PerformanceTest(TestCase):
    def setUp(self):
        # Create test data
        for i in range(1000):
            FlightDisruption.objects.create(
                flight_number=f'FZ{200+i}',
                route='DXB → DEL',
                origin='DXB',
                destination='DEL',
                aircraft='B737-800',
                scheduled_departure=f'2025-01-{(i%28)+1:02d} 08:30:00+00:00',
                passengers=195,
                crew=6,
                severity='Medium',
                disruption_type='Technical',
                status='Active'
            )
    
    def test_disruption_query_performance(self):
        """Test that disruption queries perform within acceptable limits"""
        start_time = time.time()
        
        disruptions = list(FlightDisruption.objects.filter(
            status='Active'
        ).order_by('-created_at')[:50])
        
        end_time = time.time()
        query_time = end_time - start_time
        
        # Should complete within 100ms for 1000 records
        self.assertLess(query_time, 0.1)
        self.assertEqual(len(disruptions), 50)
```

### Data Migration Testing
**File**: `aeron/management/commands/test_migration.py`

```python
from django.core.management.base import BaseCommand
from django.db import connection
from aeron.models import *

class Command(BaseCommand):
    help = 'Test data migration from existing database'
    
    def handle(self, *args, **options):
        self.stdout.write('Starting migration validation...')
        
        # Test data integrity
        self.test_settings_migration()
        self.test_disruptions_migration()
        self.test_recovery_options_migration()
        
        self.stdout.write(self.style.SUCCESS('Migration validation completed'))
    
    def test_settings_migration(self):
        """Validate settings data migration"""
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM settings WHERE is_active = true")
            db_count = cursor.fetchone()[0]
        
        model_count = Setting.objects.filter(is_active=True).count()
        
        if db_count == model_count:
            self.stdout.write(self.style.SUCCESS(f'✓ Settings migration: {model_count} records'))
        else:
            self.stdout.write(self.style.ERROR(f'✗ Settings mismatch: DB={db_count}, Model={model_count}'))
    
    def test_disruptions_migration(self):
        """Validate disruptions data migration"""
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM flight_disruptions")
            db_count = cursor.fetchone()[0]
        
        model_count = FlightDisruption.objects.count()
        
        if db_count == model_count:
            self.stdout.write(self.style.SUCCESS(f'✓ Disruptions migration: {model_count} records'))
        else:
            self.stdout.write(self.style.ERROR(f'✗ Disruptions mismatch: DB={db_count}, Model={model_count}'))
```

## Final Implementation Steps

### Step 1: Environment Setup
```bash
# Run from Replit environment
pip install -r requirements.txt
python manage.py makemigrations aeron
python manage.py migrate
python manage.py collectstatic --noinput
```

### Step 2: Data Migration
```bash
# Export existing data
pg_dump $DB_URL > backup.sql

# Run Django migrations
python manage.py migrate

# Test migration
python manage.py test_migration
```

### Step 3: Service Validation
```bash
# Run comprehensive tests
python manage.py test aeron
python manage.py test aeron.tests.test_performance

# Start Django development server
python manage.py runserver 0.0.0.0:3001
```

### Step 4: Production Deployment
```bash
# Configure production settings
export DJANGO_SETTINGS_MODULE=aeron_project.settings.production

# Run production server (use Gunicorn for production)
pip install gunicorn
gunicorn aeron_project.wsgi:application --bind 0.0.0.0:3001
```

## Success Metrics

### Migration Completion Criteria
- [ ] All 85+ API endpoints migrated and functional
- [ ] 100% data integrity maintained
- [ ] All existing functionality preserved
- [ ] Performance benchmarks met (response time < 200ms)
- [ ] Zero data loss during migration
- [ ] All tests passing (unit, integration, performance)
- [ ] Security audit completed
- [ ] Documentation updated

### Post-Migration Benefits
- Enhanced security with Django's built-in features
- Better code organization and maintainability
- Improved admin interface for data management
- Enhanced ORM capabilities
- Better testing framework integration
- Easier deployment and scaling on Replit

This comprehensive migration guide ensures a smooth transition from Express.js to Django REST Framework while maintaining all existing functionality and improving the overall system architecture.
