
# Migration Guide: Express.js to Django REST Framework (Aeron Application)

## Table of Contents
1. [Migration Overview](#migration-overview)
2. [Foundation Setup](#foundation-setup)
3. [Service-by-Service Implementation](#service-by-service-implementation)
4. [Migration Execution Phases](#migration-execution-phases)
5. [Testing & Validation](#testing--validation)
6. [Deployment Strategy](#deployment-strategy)

## Migration Overview

### Strategic Approach
This migration transforms the Express.js application into a Django REST Framework (DRF) application using a single-app architecture. The process maintains all existing functionality while leveraging Django's robust features for better scalability and maintainability.

### Core Principles
- **Incremental Migration**: Service-by-service migration to minimize risk
- **Data Integrity**: Zero data loss with comprehensive validation
- **API Compatibility**: Maintain all existing endpoints and response formats
- **Performance Parity**: Ensure equivalent or better performance
- **Security Enhancement**: Leverage Django's built-in security features

## Foundation Setup

### Stage 1: Django Project Initialization

#### Step 1.1: Create Django Project Structure
Create the main Django project and configure the single app architecture:
- Initialize Django project named `aeron_project`
- Create single app named `aeron` to house all functionality
- Configure project settings for PostgreSQL connection
- Set up static files and media handling
- Configure logging to match existing system

#### Step 1.2: Database Configuration
Configure Django to use the existing PostgreSQL database:
- Set up database connection using existing credentials
- Configure connection pooling to match Express.js performance
- Set up database routing for read/write operations
- Configure SSL settings for production environment
- Test connection stability and performance

#### Step 1.3: Environment Configuration
Migrate environment variables and configuration:
- Create Django settings modules for different environments
- Migrate all environment variables from Express.js
- Set up CORS configuration to match existing setup
- Configure middleware stack for request processing
- Set up debugging and development tools

#### Step 1.4: Authentication System Setup
Establish authentication framework:
- Configure Django REST Framework JWT authentication
- Set up user models to match existing database schema
- Implement token generation and validation
- Create authentication middleware
- Set up permission classes for API access

## Service-by-Service Implementation

### Authentication Services (/api/auth/*)

**API Endpoints:**
- `POST /api/auth/login`
- `POST /api/auth/verify`
- `POST /api/auth/logout`

#### Implementation Instructions

**Step 1: User Model Implementation**
```python
# aeron/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class UserAccount(AbstractUser):
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=50)
    user_code = models.CharField(max_length=50)
    full_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']
```

**Step 2: JWT Token Serializers**
```python
# aeron/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
import bcrypt

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        user = UserAccount.objects.filter(email=email.lower(), is_active=True).first()
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        
        # Support both demo password and bcrypt
        if password == "password123" or bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            attrs['username'] = user.username
            return super().validate(attrs)
        
        raise serializers.ValidationError('Invalid credentials')
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['userId'] = user.id
        token['email'] = user.email
        token['userType'] = user.user_type
        token['userCode'] = user.user_code
        token['fullName'] = user.full_name
        return token
```

**Step 3: Authentication Views**
```python
# aeron/views/auth.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(email=request.data['email'].lower())
            response.data = {
                'success': True,
                'token': response.data['access'],
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'userType': user.user_type,
                    'userCode': user.user_code,
                    'fullName': user.full_name,
                }
            }
        return response

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_token(request):
    try:
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        UntypedToken(token)
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return Response({'success': True, 'user': decoded})
    except Exception:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout(request):
    return Response({'success': True})
```

**Step 4: URL Configuration**
```python
# aeron/urls/auth.py
from django.urls import path
from aeron.views.auth import LoginView, verify_token, logout

urlpatterns = [
    path('login', LoginView.as_view(), name='login'),
    path('verify', verify_token, name='verify'),
    path('logout', logout, name='logout'),
]
```

### Settings Management Services (/api/settings/*)

**API Endpoints:**
- `GET /api/settings`
- `GET /api/settings/tabs`
- `GET /api/settings/:category/:key`
- `GET /api/settings/category/:category`
- `POST /api/settings`
- `POST /api/settings/batch`
- `DELETE /api/settings/:category/:key`
- `POST /api/settings/reset`

#### Implementation Instructions

**Step 1: Settings Model**
```python
# aeron/models.py
class Setting(models.Model):
    SETTING_TYPES = [
        ('string', 'String'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('object', 'Object'),
    ]
    
    category = models.CharField(max_length=100)
    key = models.CharField(max_length=100)
    value = models.JSONField()
    type = models.CharField(max_length=20, choices=SETTING_TYPES)
    description = models.TextField(blank=True)
    updated_by = models.CharField(max_length=100, default='system')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['category', 'key']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['category', 'key']),
        ]
```

**Step 2: Settings Serializers**
```python
# aeron/serializers.py
class SettingSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    
    class Meta:
        model = Setting
        fields = ['id', 'category', 'key', 'value', 'type', 'description', 
                 'label', 'updated_by', 'is_active', 'created_at', 'updated_at']
    
    def get_label(self, obj):
        field_labels = {
            'loyaltyTier': 'Loyalty Tier Status',
            'ticketClass': 'Ticket Class (Business/Economy)',
            'specialNeeds': 'Special Requirements',
            # Add all field labels from Express.js
        }
        return field_labels.get(obj.key, obj.key.replace('_', ' ').title())

class TabSettingsSerializer(serializers.Serializer):
    screens = serializers.DictField()
    passengerPriority = serializers.DictField()
    rules = serializers.DictField()
    recoveryOptions = serializers.DictField()
    nlp = serializers.DictField()
    notifications = serializers.DictField()
    system = serializers.DictField()
```

**Step 3: Settings ViewSet**
```python
# aeron/views/settings.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.filter(is_active=True)
    serializer_class = SettingSerializer
    
    def list(self, request):
        settings = self.get_queryset().order_by('category', 'key')
        serializer = self.get_serializer(settings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def tabs(self, request):
        settings = self.get_queryset().order_by('category', 'key')
        
        # Organize settings by tab categories
        tab_settings = {
            'screens': {},
            'passengerPriority': {},
            'rules': {},
            'recoveryOptions': {},
            'nlp': {},
            'notifications': {},
            'system': {},
        }
        
        for setting in settings:
            serializer = self.get_serializer(setting)
            full_setting = serializer.data
            category = setting.category
            
            # Map categories to tabs
            if category in ['passengerPrioritization', 'flightPrioritization', 'flightScoring', 'passengerScoring']:
                if category not in tab_settings['passengerPriority']:
                    tab_settings['passengerPriority'][category] = []
                tab_settings['passengerPriority'][category].append(full_setting)
            elif category in ['operationalRules', 'recoveryConstraints', 'automationSettings']:
                if category not in tab_settings['rules']:
                    tab_settings['rules'][category] = []
                tab_settings['rules'][category].append(full_setting)
            # Continue mapping for other categories...
        
        return Response(tab_settings)
    
    @action(detail=False, methods=['post'])
    def batch(self, request):
        settings_data = request.data.get('settings', [])
        updated_by = request.data.get('updated_by', 'system')
        
        with transaction.atomic():
            results = []
            for setting_data in settings_data:
                setting, created = Setting.objects.update_or_create(
                    category=setting_data['category'],
                    key=setting_data['key'],
                    defaults={
                        'value': setting_data['value'],
                        'type': setting_data['type'],
                        'updated_by': updated_by,
                    }
                )
                results.append(setting)
        
        return Response({'success': True, 'saved_settings': len(results)})
    
    @action(detail=False, methods=['post'])
    def reset(self, request):
        # Clear existing settings
        Setting.objects.all().delete()
        
        # Insert default settings
        defaults = [
            {'category': 'operationalRules', 'key': 'maxDelayThreshold', 'value': 180, 'type': 'number'},
            {'category': 'operationalRules', 'key': 'minConnectionTime', 'value': 45, 'type': 'number'},
            # Add all default settings from Express.js
        ]
        
        for default in defaults:
            Setting.objects.create(**default, updated_by='system')
        
        return Response({'message': 'Settings reset to defaults successfully'})
```

### Screen Settings Services (/api/screen-settings/*)

**API Endpoints:**
- `GET /api/screen-settings`
- `POST /api/screen-settings`
- `PUT /api/screen-settings/:screen_id`
- `POST /api/screen-settings/batch`

#### Implementation Instructions

**Step 1: Screen Settings Model**
```python
# aeron/models.py
class ScreenSetting(models.Model):
    screen_id = models.CharField(max_length=100, unique=True)
    screen_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    enabled = models.BooleanField(default=True)
    required = models.BooleanField(default=False)
    icon = models.CharField(max_length=50, default='Settings')
    updated_by = models.CharField(max_length=100, default='system')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Step 2: Screen Settings Views**
```python
# aeron/views/screen_settings.py
class ScreenSettingViewSet(viewsets.ModelViewSet):
    queryset = ScreenSetting.objects.all()
    serializer_class = ScreenSettingSerializer
    
    def list(self, request):
        screens = self.get_queryset().order_by('category', 'screen_name')
        transformed_screens = []
        
        for screen in screens:
            transformed_screens.append({
                'id': screen.screen_id,
                'name': screen.screen_name,
                'icon': screen.icon,
                'category': screen.category,
                'enabled': screen.enabled,
                'required': screen.required,
            })
        
        return Response(transformed_screens)
    
    @action(detail=False, methods=['post'])
    def batch(self, request):
        screen_settings = request.data.get('screenSettings', [])
        updated_by = request.data.get('updated_by', 'system')
        
        with transaction.atomic():
            updated_screens = []
            for screen in screen_settings:
                screen_obj, created = ScreenSetting.objects.update_or_create(
                    screen_id=screen['id'],
                    defaults={
                        'screen_name': screen['name'],
                        'category': screen['category'],
                        'enabled': screen['enabled'],
                        'required': screen['required'],
                        'icon': screen.get('icon', 'Settings'),
                        'updated_by': updated_by,
                    }
                )
                updated_screens.append(screen_obj)
        
        return Response({
            'message': f'Updated {len(updated_screens)} screen settings',
            'screens': [self.get_serializer(s).data for s in updated_screens]
        })
```

### Custom Rules Management (/api/custom-rules/*)

**API Endpoints:**
- `GET /api/custom-rules`
- `POST /api/custom-rules`
- `POST /api/custom-rules/batch`
- `PUT /api/custom-rules/:rule_id`
- `DELETE /api/custom-rules/:rule_id`

#### Implementation Instructions

**Step 1: Custom Rules Model**
```python
# aeron/models.py
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
    
    rule_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=RULE_TYPES)
    priority = models.IntegerField()
    overridable = models.BooleanField(default=True)
    conditions = models.TextField()
    actions = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_by = models.CharField(max_length=100, default='system')
    updated_by = models.CharField(max_length=100, default='system')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Step 2: Custom Rules ViewSet**
```python
# aeron/views/custom_rules.py
class CustomRuleViewSet(viewsets.ModelViewSet):
    queryset = CustomRule.objects.all()
    serializer_class = CustomRuleSerializer
    lookup_field = 'rule_id'
    
    def get_queryset(self):
        return CustomRule.objects.all().order_by('priority', 'created_at')
    
    @action(detail=False, methods=['post'])
    def batch(self, request):
        rules = request.data.get('rules', [])
        updated_by = request.data.get('updated_by', 'system')
        
        with transaction.atomic():
            results = []
            for rule_data in rules:
                rule, created = CustomRule.objects.update_or_create(
                    rule_id=rule_data['rule_id'],
                    defaults={
                        'name': rule_data['name'],
                        'description': rule_data['description'],
                        'category': rule_data['category'],
                        'type': rule_data['type'],
                        'priority': rule_data['priority'],
                        'overridable': rule_data['overridable'],
                        'conditions': rule_data['conditions'],
                        'actions': rule_data['actions'],
                        'status': rule_data.get('status', 'Active'),
                        'created_by': rule_data.get('created_by', updated_by),
                        'updated_by': updated_by,
                    }
                )
                results.append(rule)
        
        return Response({
            'success': True,
            'saved_rules': len(results),
            'rules': [self.get_serializer(r).data for r in results]
        })
```

### Flight Disruption Services (/api/disruptions/*)

**API Endpoints:**
- `GET /api/disruptions/`
- `POST /api/disruptions/`
- `GET /api/disruptions/:id`
- `PUT /api/disruptions/:id/recovery-status`
- `POST /api/disruptions/bulk-update`
- `POST /api/disruptions/update-expired`

#### Implementation Instructions

**Step 1: Disruption Models**
```python
# aeron/models.py
class DisruptionCategory(models.Model):
    category_code = models.CharField(max_length=50, unique=True)
    category_name = models.CharField(max_length=255)
    description = models.TextField()
    priority_level = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)

class FlightDisruption(models.Model):
    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Delayed', 'Delayed'),
        ('Resolved', 'Resolved'),
        ('expired', 'Expired'),
    ]
    
    RECOVERY_STATUS_CHOICES = [
        ('none', 'None'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
    ]
    
    flight_number = models.CharField(max_length=20)
    route = models.CharField(max_length=100)
    origin = models.CharField(max_length=10)
    destination = models.CharField(max_length=10)
    origin_city = models.CharField(max_length=100, default='Unknown')
    destination_city = models.CharField(max_length=100, default='Unknown')
    aircraft = models.CharField(max_length=50)
    scheduled_departure = models.DateTimeField()
    estimated_departure = models.DateTimeField(null=True, blank=True)
    delay_minutes = models.IntegerField(default=0)
    passengers = models.IntegerField()
    crew = models.IntegerField()
    connection_flights = models.IntegerField(default=0)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    disruption_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    disruption_reason = models.TextField()
    recovery_status = models.CharField(max_length=20, choices=RECOVERY_STATUS_CHOICES, default='none')
    categorization = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(DisruptionCategory, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['flight_number', 'scheduled_departure']
```

**Step 2: Disruption Views**
```python
# aeron/views/disruptions.py
class FlightDisruptionViewSet(viewsets.ModelViewSet):
    queryset = FlightDisruption.objects.all()
    serializer_class = FlightDisruptionSerializer
    
    def get_queryset(self):
        queryset = FlightDisruption.objects.select_related('category')
        
        # Filter last 24 hours and exclude expired
        twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
        queryset = queryset.filter(
            created_at__gte=twenty_four_hours_ago,
            status__ne='expired'
        )
        
        # Apply query filters
        recovery_status = self.request.query_params.get('recovery_status')
        category_code = self.request.query_params.get('category_code')
        
        if recovery_status:
            queryset = queryset.filter(recovery_status=recovery_status)
        
        if category_code:
            queryset = queryset.filter(category__category_code=category_code)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        # Handle both camelCase and snake_case field names
        data = request.data.copy()
        
        # Map camelCase to snake_case
        field_mapping = {
            'flightNumber': 'flight_number',
            'originCity': 'origin_city',
            'destinationCity': 'destination_city',
            'scheduledDeparture': 'scheduled_departure',
            'estimatedDeparture': 'estimated_departure',
            'delayMinutes': 'delay_minutes',
            'connectionFlights': 'connection_flights',
            'disruptionType': 'disruption_type',
            'disruptionReason': 'disruption_reason',
        }
        
        for camel_key, snake_key in field_mapping.items():
            if camel_key in data and snake_key not in data:
                data[snake_key] = data[camel_key]
        
        # Handle category mapping
        category_code = data.get('category_code')
        if category_code:
            try:
                category = DisruptionCategory.objects.get(
                    category_code=category_code,
                    is_active=True
                )
                data['category'] = category.id
            except DisruptionCategory.DoesNotExist:
                pass
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        disruptions = request.data.get('disruptions', [])
        
        inserted = 0
        updated = 0
        errors = 0
        
        for disruption_data in disruptions:
            try:
                flight_number = disruption_data.get('flight_number') or disruption_data.get('flightNumber')
                scheduled_departure = disruption_data.get('scheduled_departure') or disruption_data.get('scheduledDeparture')
                
                if not flight_number or not scheduled_departure:
                    errors += 1
                    continue
                
                # Check if record exists
                existing = FlightDisruption.objects.filter(
                    flight_number=flight_number,
                    scheduled_departure__date=parse_date(scheduled_departure)
                ).first()
                
                if existing:
                    # Update existing
                    serializer = self.get_serializer(existing, data=disruption_data, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                        updated += 1
                    else:
                        errors += 1
                else:
                    # Create new
                    serializer = self.get_serializer(data=disruption_data)
                    if serializer.is_valid():
                        serializer.save()
                        inserted += 1
                    else:
                        errors += 1
                        
            except Exception as e:
                errors += 1
        
        return Response({
            'success': True,
            'inserted': inserted,
            'updated': updated,
            'errors': errors,
            'total': len(disruptions)
        })
    
    @action(detail=False, methods=['post'])
    def update_expired(self, request):
        twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
        
        updated_disruptions = FlightDisruption.objects.filter(
            created_at__lt=twenty_four_hours_ago,
            status__ne='expired'
        ).update(status='expired', updated_at=timezone.now())
        
        return Response({
            'success': True,
            'updatedCount': updated_disruptions,
            'cutoffTime': twenty_four_hours_ago.isoformat(),
        })
    
    @action(detail=True, methods=['put'])
    def recovery_status(self, request, pk=None):
        disruption = self.get_object()
        recovery_status = request.data.get('recovery_status')
        
        if not recovery_status:
            return Response(
                {'error': 'Recovery status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        disruption.recovery_status = recovery_status
        disruption.save()
        
        return Response({
            'success': True,
            'disruption': self.get_serializer(disruption).data
        })
```

### Recovery Options Services (/api/recovery-options/*)

**API Endpoints:**
- `GET /api/recovery-options/:disruptionId`
- `POST /api/recovery-options/generate/:disruptionId`
- `POST /api/recovery-options/generate-llm/:disruptionId`
- `GET /api/recovery-option/:optionId`
- `GET /api/recovery-option/:optionId/rotation-plan`
- `GET /api/recovery-option/:optionId/cost-analysis`
- `GET /api/recovery-option/:optionId/timeline`
- `GET /api/recovery-option/:optionId/resources`
- `GET /api/recovery-option/:optionId/technical`

#### Implementation Instructions

**Step 1: Recovery Options Model**
```python
# aeron/models.py
class RecoveryOption(models.Model):
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    cost = models.CharField(max_length=50)
    timeline = models.CharField(max_length=50)
    confidence = models.IntegerField(default=80)
    impact = models.CharField(max_length=50, default='Medium')
    status = models.CharField(max_length=50, default='generated')
    priority = models.IntegerField(default=1)
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
    impact_summary = models.CharField(max_length=500, blank=True)
    crew_available = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'title']
```

**Step 2: Recovery Options ViewSet**
```python
# aeron/views/recovery_options.py
class RecoveryOptionViewSet(viewsets.ModelViewSet):
    queryset = RecoveryOption.objects.all()
    serializer_class = RecoveryOptionSerializer
    
    def list(self, request):
        disruption_id = request.query_params.get('disruption_id')
        if disruption_id:
            options = self.get_queryset().filter(disruption_id=disruption_id)
            options = options.order_by('-confidence', 'priority')
            
            # Check for pending recovery solutions
            pending_solutions = PendingRecoverySolution.objects.filter(
                disruption_id=disruption_id
            ).order_by('-submitted_at')
            
            # Enhance options with pending solution data
            response_data = []
            for option in options:
                option_data = self.get_serializer(option).data
                
                # Find matching pending solution
                pending = pending_solutions.filter(option_id=str(option.id)).first()
                if pending:
                    option_data['pending_recovery_solutions'] = {
                        'id': pending.id,
                        'status': pending.status,
                        'submitted_at': pending.submitted_at,
                        'submitted_by': pending.submitted_by,
                        'approval_required': pending.approval_required,
                    }
                else:
                    option_data['pending_recovery_solutions'] = {}
                
                response_data.append(option_data)
            
            return Response(response_data)
        
        return Response([])
    
    @action(detail=False, methods=['post'], url_path='generate/(?P<disruption_id>[^/.]+)')
    def generate_options(self, request, disruption_id=None):
        try:
            disruption = FlightDisruption.objects.get(id=disruption_id)
        except FlightDisruption.DoesNotExist:
            return Response(
                {'error': 'Disruption not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if options already exist
        existing_options = RecoveryOption.objects.filter(disruption=disruption)
        existing_steps = RecoveryStep.objects.filter(disruption=disruption)
        
        if existing_options.exists() and existing_steps.exists():
            return Response({
                'success': True,
                'message': 'Recovery options and steps already exist',
                'exists': True,
                'optionsCount': existing_options.count(),
                'stepsCount': existing_steps.count(),
            })
        
        # Generate recovery options based on disruption category
        from aeron.services.recovery_generator import RecoveryGenerator
        
        generator = RecoveryGenerator(disruption)
        options, steps = generator.generate_recovery_options()
        
        # Save options and steps
        saved_options = []
        for option_data in options:
            option = RecoveryOption.objects.create(
                disruption=disruption,
                **option_data
            )
            saved_options.append(option)
        
        saved_steps = []
        for step_data in steps:
            step = RecoveryStep.objects.create(
                disruption=disruption,
                **step_data
            )
            saved_steps.append(step)
        
        return Response({
            'success': True,
            'optionsCount': len(saved_options),
            'stepsCount': len(saved_steps),
            'message': f'Generated {len(saved_options)} recovery options and {len(saved_steps)} steps',
        })
    
    @action(detail=False, methods=['post'], url_path='generate-llm/(?P<disruption_id>[^/.]+)')
    def generate_llm_options(self, request, disruption_id=None):
        try:
            disruption = FlightDisruption.objects.get(id=disruption_id)
        except FlightDisruption.DoesNotExist:
            return Response(
                {'error': 'Disruption not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate options using LLM service
        from aeron.services.llm_recovery import LLMRecoveryService
        
        llm_service = LLMRecoveryService()
        options, steps = llm_service.generate_recovery_options(
            disruption,
            request.data.get('optionsConfig', {})
        )
        
        return Response({
            'success': True,
            'optionsCount': len(options),
            'stepsCount': len(steps),
            'message': f'Generated {len(options)} LLM recovery options and {len(steps)} steps',
            'source': 'llm',
            'provider': llm_service.provider,
            'options': options,
            'steps': steps,
        })
    
    @action(detail=True, methods=['get'])
    def rotation_plan(self, request, pk=None):
        option = self.get_object()
        
        rotation_plan = option.rotation_plan or {}
        
        # If no rotation plan, generate sample data
        if not rotation_plan:
            rotation_plan = {
                'aircraftOptions': [
                    {
                        'reg': 'A6-FED',
                        'type': 'B737-800 (189Y)',
                        'etops': {'status': 'available', 'value': '180min'},
                        'cabinMatch': {'status': 'exact', 'value': 'Exact'},
                        'availability': 'Available Now',
                        'assigned': {'status': 'none', 'value': 'None'},
                        'turnaround': '45 min',
                        'maintenance': {'status': 'current', 'value': 'Current'},
                        'recommended': True,
                    }
                ],
                'crewData': [
                    {
                        'name': 'Captain Mohammed Al-Zaabi',
                        'type': 'Captain',
                        'status': 'Available',
                        'location': 'Dubai Airport Hotel',
                        'availability': 'Available',
                        'dutyTime': '2h 15m remaining',
                        'nextAssignment': 'FZ892 - 16:30',
                        'qualifications': ['B737-800', 'B737-MAX8'],
                        'experience': '15 years',
                    }
                ],
                'operationalConstraints': {
                    'gateCompatibility': {
                        'status': 'compatible',
                        'details': 'Gate A24 suitable for B737-800',
                    },
                    'slotCapacity': {
                        'status': 'available',
                        'details': 'Slot confirmed for departure window',
                    },
                },
            }
        
        return Response({
            'success': True,
            'rotationPlan': rotation_plan
        })
```

### Passenger Services (/api/passengers/*, /api/passenger-rebookings/*)

**API Endpoints:**
- `GET /api/passengers/pnr/:pnr`
- `PUT /api/passengers/:pnr/rebooking`
- `POST /api/passenger-rebookings`
- `GET /api/passenger-rebookings/disruption/:disruptionId`
- `GET /api/passenger-rebookings/pnr/:pnr`

#### Implementation Instructions

**Step 1: Passenger Models**
```python
# aeron/models.py
class Passenger(models.Model):
    pnr = models.CharField(max_length=10, db_index=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    seat_number = models.CharField(max_length=10, blank=True)
    ticket_class = models.CharField(max_length=20)
    loyalty_tier = models.CharField(max_length=20, blank=True)
    special_needs = models.TextField(blank=True)
    flight_number = models.CharField(max_length=20)
    rebooking_status = models.CharField(max_length=50, default='Pending')
    new_flight_number = models.CharField(max_length=20, blank=True)
    new_seat_number = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PassengerRebooking(models.Model):
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    pnr = models.CharField(max_length=10)
    passenger_id = models.CharField(max_length=50)
    passenger_name = models.CharField(max_length=255)
    original_flight = models.CharField(max_length=20)
    original_seat = models.CharField(max_length=10, blank=True)
    rebooked_flight = models.CharField(max_length=20)
    rebooked_cabin = models.CharField(max_length=20)
    rebooked_seat = models.CharField(max_length=10, blank=True)
    rebooking_date = models.DateTimeField()
    additional_services = models.JSONField(default=list)
    status = models.CharField(max_length=50, default='confirmed')
    total_passengers_in_pnr = models.IntegerField(default=1)
    rebooking_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'passenger_id', 'pnr']
```

**Step 2: Passenger Views**
```python
# aeron/views/passengers.py
class PassengerViewSet(viewsets.ModelViewSet):
    queryset = Passenger.objects.all()
    serializer_class = PassengerSerializer
    lookup_field = 'pnr'
    
    @action(detail=True, methods=['put'], url_path='rebooking')
    def update_rebooking(self, request, pnr=None):
        passenger = self.get_object()
        
        rebooking_status = request.data.get('rebookingStatus')
        new_flight_number = request.data.get('newFlightNumber')
        new_seat_number = request.data.get('newSeatNumber')
        
        passenger.rebooking_status = rebooking_status
        passenger.new_flight_number = new_flight_number
        passenger.new_seat_number = new_seat_number
        passenger.save()
        
        return Response(self.get_serializer(passenger).data)

class PassengerRebookingViewSet(viewsets.ModelViewSet):
    queryset = PassengerRebooking.objects.all()
    serializer_class = PassengerRebookingSerializer
    
    def create(self, request, *args, **kwargs):
        rebookings = request.data.get('rebookings', [])
        
        if not rebookings:
            return Response(
                {'error': 'Invalid rebookings data'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            inserted_rebookings = []
            
            for rebooking_data in rebookings:
                # Validate required fields
                required_fields = ['disruption_id', 'pnr', 'passenger_id', 'passenger_name']
                if not all(field in rebooking_data for field in required_fields):
                    continue
                
                rebooking, created = PassengerRebooking.objects.update_or_create(
                    disruption_id=rebooking_data['disruption_id'],
                    passenger_id=rebooking_data['passenger_id'],
                    pnr=rebooking_data['pnr'],
                    defaults={
                        'passenger_name': rebooking_data['passenger_name'],
                        'original_flight': rebooking_data.get('original_flight', ''),
                        'original_seat': rebooking_data.get('original_seat', ''),
                        'rebooked_flight': rebooking_data.get('rebooked_flight', ''),
                        'rebooked_cabin': rebooking_data.get('rebooked_cabin', ''),
                        'rebooked_seat': rebooking_data.get('rebooked_seat', ''),
                        'rebooking_date': rebooking_data.get('rebooking_date', timezone.now()),
                        'additional_services': rebooking_data.get('additional_services', []),
                        'status': 'confirmed',
                        'total_passengers_in_pnr': rebooking_data.get('total_passengers_in_pnr', 1),
                        'rebooking_cost': rebooking_data.get('rebooking_cost', 0),
                        'notes': rebooking_data.get('notes', ''),
                    }
                )
                inserted_rebookings.append(rebooking)
        
        return Response({
            'success': True,
            'rebookings': [self.get_serializer(r).data for r in inserted_rebookings]
        })
    
    @action(detail=False, methods=['get'], url_path='disruption/(?P<disruption_id>[^/.]+)')
    def by_disruption(self, request, disruption_id=None):
        rebookings = self.get_queryset().filter(disruption_id=disruption_id)
        rebookings = rebookings.order_by('-created_at')
        serializer = self.get_serializer(rebookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='pnr/(?P<pnr>[^/.]+)')
    def by_pnr(self, request, pnr=None):
        rebookings = self.get_queryset().filter(pnr=pnr)
        rebookings = rebookings.order_by('-created_at')
        serializer = self.get_serializer(rebookings, many=True)
        return Response(serializer.data)
```

### Analytics Services (/api/analytics/*, /api/dashboard-analytics, /api/past-recovery-*)

**API Endpoints:**
- `GET /api/dashboard-analytics`
- `GET /api/analytics/kpi`
- `GET /api/analytics/predictions`
- `GET /api/past-recovery-kpi`
- `GET /api/past-recovery-trends`
- `GET /api/past-recovery-logs`
- `GET /api/passenger-impact`
- `GET /api/disrupted-stations`
- `GET /api/operational-insights`

#### Implementation Instructions

**Step 1: Analytics Views**
```python
# aeron/views/analytics.py
class AnalyticsViewSet(viewsets.ViewSet):
    
    @action(detail=False, methods=['get'])
    def dashboard_analytics(self, request):
        date_filter = request.query_params.get('dateFilter', 'today')
        
        # Calculate date range
        now = timezone.now()
        if date_filter == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        elif date_filter == 'yesterday':
            start_date = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date + timedelta(days=1)
        elif date_filter == 'this_week':
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        # Add other date filters...
        
        # Get disruptions for date range
        disruptions = FlightDisruption.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Calculate performance metrics
        total_passengers = disruptions.aggregate(
            total=models.Sum('passengers')
        )['total'] or 0
        
        completed_recoveries = disruptions.filter(
            recovery_status__in=['completed', 'approved']
        ).count()
        
        success_rate = (completed_recoveries / disruptions.count() * 100) if disruptions.count() > 0 else 0
        
        # Calculate passenger impact
        high_priority_disruptions = disruptions.filter(severity__in=['High', 'Critical'])
        high_priority_passengers = high_priority_disruptions.aggregate(
            total=models.Sum('passengers')
        )['total'] or 0
        
        # Get rebookings
        rebookings_count = PassengerRebooking.objects.filter(
            disruption__in=disruptions,
            status='confirmed'
        ).count()
        
        # Calculate disrupted stations
        station_stats = disruptions.values('origin', 'origin_city').annotate(
            disrupted_flights=models.Count('id'),
            affected_passengers=models.Sum('passengers')
        ).order_by('-affected_passengers')[:3]
        
        disrupted_stations = []
        for stat in station_stats:
            severity = 'high' if stat['affected_passengers'] > 500 else 'medium' if stat['affected_passengers'] > 200 else 'low'
            disrupted_stations.append({
                'code': stat['origin'],
                'name': f"{stat['origin']} - {stat['origin_city']}",
                'disruptedFlights': stat['disrupted_flights'],
                'passengersAffected': stat['affected_passengers'],
                'severity': severity,
            })
        
        analytics = {
            'performance': {
                'costSavings': f'AED {total_passengers * 100 // 1000}K',
                'avgDecisionTime': '45 min',
                'passengersServed': total_passengers,
                'successRate': f'{success_rate:.1f}%',
                'decisionsProcessed': disruptions.count(),
            },
            'passengerImpact': {
                'affectedPassengers': total_passengers,
                'highPriority': high_priority_passengers,
                'rebookings': rebookings_count,
                'resolved': completed_recoveries * 150,  # Estimate passengers per recovery
            },
            'disruptedStations': disrupted_stations,
            'operationalInsights': {
                'recoveryRate': f'{success_rate:.1f}%',
                'avgResolutionTime': '2.4h',
                'networkImpact': 'Medium' if disruptions.count() > 5 else 'Low',
                'criticalPriority': high_priority_disruptions.count(),
                'activeDisruptions': disruptions.filter(status='Active').count(),
                'mostDisruptedRoute': {
                    'route': 'DXB → DEL',
                    'impact': 'Medium Impact'
                },
            },
        }
        
        return Response(analytics)
    
    @action(detail=False, methods=['get'])
    def kpi(self, request):
        active_disruptions = FlightDisruption.objects.filter(status='Active').count()
        total_passengers = FlightDisruption.objects.filter(status='Active').aggregate(
            total=models.Sum('passengers')
        )['total'] or 0
        avg_delay = FlightDisruption.objects.filter(delay_minutes__gt=0).aggregate(
            avg=models.Avg('delay_minutes')
        )['avg'] or 0
        
        return Response({
            'activeDisruptions': active_disruptions,
            'affectedPassengers': total_passengers,
            'averageDelay': round(avg_delay),
            'recoverySuccessRate': 95.8,
            'onTimePerformance': 87.3,
            'costSavings': 2.4,
        })
    
    @action(detail=False, methods=['get'])
    def past_recovery_kpi(self, request):
        # Calculate KPI from completed recoveries
        completed_recoveries = FlightDisruption.objects.filter(
            recovery_status__in=['completed', 'approved']
        )
        
        total_recoveries = completed_recoveries.count()
        successful_recoveries = completed_recoveries.filter(status='Resolved').count()
        success_rate = (successful_recoveries / total_recoveries * 100) if total_recoveries > 0 else 0
        
        avg_delay = completed_recoveries.aggregate(
            avg=models.Avg('delay_minutes')
        )['avg'] or 0
        
        return Response({
            'totalRecoveries': total_recoveries,
            'successRate': round(success_rate, 1),
            'avgResolutionTime': round(avg_delay * 2),  # Convert to minutes
            'costEfficiency': 3.8,
            'passengerSatisfaction': 8.2,
            'avgRecoveryEfficiency': 92.5,
            'totalDelayReduction': int(avg_delay * 0.3),
            'cancellationsAvoided': total_recoveries,
            'totalCostSavings': total_recoveries * 50000,
        })
    
    @action(detail=False, methods=['get'])
    def past_recovery_logs(self, request):
        status_filter = request.query_params.get('status', 'all')
        category_filter = request.query_params.get('category', 'all')
        priority_filter = request.query_params.get('priority', 'all')
        date_range = request.query_params.get('dateRange', 'all')
        
        # Build query
        query = FlightDisruption.objects.filter(
            models.Q(recovery_status__isnull=False) | models.Q(status='Resolved')
        )
        
        # Apply filters
        if status_filter != 'all':
            if status_filter == 'Successful':
                query = query.filter(
                    models.Q(recovery_status__in=['completed', 'approved']) | 
                    models.Q(status='Resolved')
                )
            elif status_filter == 'Partial':
                query = query.filter(recovery_status='pending')
        
        if category_filter != 'all':
            query = query.filter(
                models.Q(categorization=category_filter) |
                models.Q(disruption_type=category_filter)
            )
        
        if priority_filter != 'all':
            query = query.filter(severity=priority_filter)
        
        if date_range == 'last7days':
            query = query.filter(created_at__gte=timezone.now() - timedelta(days=7))
        elif date_range == 'last30days':
            query = query.filter(created_at__gte=timezone.now() - timedelta(days=30))
        
        # Transform to expected format
        logs = []
        for disruption in query.order_by('-created_at')[:50]:
            delay_hours = disruption.delay_minutes // 60 if disruption.delay_minutes else 2
            delay_mins = disruption.delay_minutes % 60 if disruption.delay_minutes else 30
            
            logs.append({
                'solution_id': f'SOL-{disruption.id}',
                'disruption_id': str(disruption.id),
                'flight_number': disruption.flight_number,
                'route': disruption.route,
                'aircraft': disruption.aircraft,
                'disruption_type': disruption.disruption_type,
                'disruption_reason': disruption.disruption_reason,
                'priority': disruption.severity,
                'date_created': disruption.created_at.isoformat(),
                'date_executed': disruption.updated_at.isoformat(),
                'date_completed': disruption.updated_at.isoformat(),
                'duration': f'{delay_hours}h {delay_mins}m',
                'status': 'Successful' if disruption.recovery_status in ['completed', 'approved'] else 'Partial',
                'affected_passengers': disruption.passengers,
                'actual_cost': disruption.delay_minutes * 1000 if disruption.delay_minutes else 125000,
                'estimated_cost': disruption.delay_minutes * 1100 if disruption.delay_minutes else 130000,
                'cost_variance': -3.8,
                'otp_impact': 95.0 - (disruption.delay_minutes / 10) if disruption.delay_minutes else 92.5,
                'solution_chosen': 'Option A',
                'total_options': 3,
                'executed_by': 'Operations Manager',
                'approved_by': 'System Auto-approval',
                'passenger_satisfaction': 8.2,
                'rebooking_success': 94.1,
                'categorization': disruption.categorization or disruption.disruption_type,
                'cancellation_avoided': True,
                'potential_delay_minutes': disruption.delay_minutes + 100 if disruption.delay_minutes else 255,
                'actual_delay_minutes': disruption.delay_minutes or 155,
                'delay_reduction_minutes': max(0, (disruption.delay_minutes or 155) - 100),
                'disruption_category': disruption.disruption_type,
                'recovery_efficiency': 95.0 - (disruption.delay_minutes / 20) if disruption.delay_minutes else 92.5,
                'network_impact': 'High' if disruption.delay_minutes and disruption.delay_minutes > 300 else 'Medium' if disruption.delay_minutes and disruption.delay_minutes > 100 else 'Low',
                'downstream_flights_affected': 3 if disruption.delay_minutes and disruption.delay_minutes > 300 else 1 if disruption.delay_minutes and disruption.delay_minutes > 100 else 0,
                'details': {},
                'created_at': disruption.created_at.isoformat(),
            })
        
        return Response(logs)
```

### Pending Recovery Solutions (/api/pending-recovery-solutions/*)

**API Endpoints:**
- `GET /api/pending-recovery-solutions`
- `POST /api/pending-recovery-solutions`
- `PUT /api/pending-recovery-solutions/:solutionId/status`

#### Implementation Instructions

**Step 1: Pending Recovery Solutions Model**
```python
# aeron/models.py
class PendingRecoverySolution(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    option_id = models.CharField(max_length=255)
    option_title = models.TextField()
    option_description = models.TextField(blank=True)
    cost = models.CharField(max_length=255, blank=True)
    timeline = models.CharField(max_length=255, blank=True)
    confidence = models.IntegerField(null=True, blank=True)
    impact = models.TextField(blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    full_details = models.JSONField(default=dict)
    rotation_impact = models.JSONField(default=dict)
    submitted_by = models.CharField(max_length=255, default='system')
    approval_required = models.BooleanField(default=True)
    selected_aircraft = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Step 2: Pending Solutions ViewSet**
```python
# aeron/views/pending_solutions.py
class PendingRecoverySolutionViewSet(viewsets.ModelViewSet):
    queryset = PendingRecoverySolution.objects.all()
    serializer_class = PendingRecoverySolutionSerializer
    
    def list(self, request):
        solutions = self.get_queryset().select_related('disruption').order_by('-submitted_at')
        
        enhanced_solutions = []
        for solution in solutions:
            # Get recovery steps
            steps = RecoveryStep.objects.filter(disruption=solution.disruption)
            
            # Get crew information (mock data for now)
            crew_info = [
                {
                    'id': 1,
                    'name': 'Captain Mohammed Al-Zaabi',
                    'role': 'Captain',
                    'status': 'Available',
                    'dutyTime': '2 hours',
                    'restTime': '22 hours',
                    'location': 'Dubai Airport Hotel',
                    'experience': '15 years',
                    'qualifications': ['B737-800', 'B737-MAX8'],
                }
            ]
            
            # Transform solution data
            enhanced_solution = {
                **self.get_serializer(solution).data,
                'flight_number': solution.disruption.flight_number,
                'route': solution.disruption.route,
                'aircraft': solution.disruption.aircraft,
                'passengers': solution.disruption.passengers,
                'crew': solution.disruption.crew,
                'severity': solution.disruption.severity,
                'disruption_reason': solution.disruption.disruption_reason,
                'operations_user': 'Operations Manager',
                'crew_information': crew_info,
                'recovery_steps': [
                    {
                        'id': step.id,
                        'action': step.title,
                        'description': step.details,
                        'duration': '15-30 minutes',
                        'responsible': step.system or 'Operations Team',
                        'location': 'Operations Center',
                        'estimatedCost': 2500,
                        'criticalPath': True,
                        'status': step.status,
                    } for step in steps
                ],
                'cost_analysis': {
                    'totalCost': solution.cost or '$50,000',
                    'breakdown': {
                        'operations': 25000,
                        'crew': 10000,
                        'passengers': 8000,
                        'logistics': 7000,
                    },
                    'costPerPassenger': 287,
                    'comparison': {
                        'industryAverage': 287,
                        'savings': 15000,
                        'roi': '25%',
                    },
                },
            }
            enhanced_solutions.append(enhanced_solution)
        
        return Response(enhanced_solutions)
    
    def create(self, request, *args, **kwargs):
        data = request.data
        
        # Validate required fields
        required_fields = ['disruption_id', 'option_id', 'option_title']
        if not all(field in data for field in required_fields):
            return Response(
                {'error': 'Missing required fields'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for duplicates
        existing = PendingRecoverySolution.objects.filter(
            disruption_id=data['disruption_id'],
            option_id=data['option_id']
        ).first()
        
        if existing:
            return Response(
                {'error': 'Duplicate entry', 'message': 'This recovery solution is already pending'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Handle passenger rebooking data
        passenger_rebooking = data.get('passenger_rebooking', [])
        if passenger_rebooking:
            for rebooking in passenger_rebooking:
                PassengerRebooking.objects.update_or_create(
                    disruption_id=data['disruption_id'],
                    passenger_id=rebooking['passenger_id'],
                    pnr=rebooking['pnr'],
                    defaults={
                        'passenger_name': rebooking['passenger_name'],
                        'original_flight': rebooking.get('original_flight', ''),
                        'rebooked_flight': rebooking.get('rebooked_flight', ''),
                        'rebooked_cabin': rebooking.get('rebooked_cabin', ''),
                        'rebooked_seat': rebooking.get('rebooked_seat', ''),
                        'status': 'confirmed',
                        'rebooking_cost': rebooking.get('rebooking_cost', 0),
                    }
                )
        
        # Handle crew hotel assignments
        crew_hotel_assignments = data.get('crew_hotel_assignments', [])
        if crew_hotel_assignments:
            for assignment in crew_hotel_assignments:
                CrewHotelAssignment.objects.create(
                    disruption_id=data['disruption_id'],
                    crew_member=assignment['crew_member'],
                    hotel_name=assignment['hotel_name'],
                    hotel_location=assignment.get('hotel_location', ''),
                    check_in_date=assignment['check_in_date'],
                    check_out_date=assignment['check_out_date'],
                    room_number=assignment.get('room_number', ''),
                    assignment_status='assigned',
                    total_cost=assignment.get('total_cost', 0),
                    created_by=data.get('submitted_by', 'system'),
                )
        
        # Create pending solution
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        solution = serializer.save()
        
        # Update disruption recovery status
        FlightDisruption.objects.filter(id=data['disruption_id']).update(
            recovery_status='pending'
        )
        
        return Response({
            'success': True,
            **serializer.data,
            'processing_results': {
                'passenger_rebooking': {'processed': len(passenger_rebooking)},
                'crew_hotel_assignments': {'processed': len(crew_hotel_assignments)},
            }
        })
    
    @action(detail=True, methods=['put'], url_path='status')
    def update_status(self, request, pk=None):
        solution = self.get_object()
        status_value = request.data.get('status')
        
        if not status_value:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        solution.status = status_value
        solution.save()
        
        return Response(self.get_serializer(solution).data)
```

## URL Configuration

**Main URLs:**
```python
# aeron_project/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('aeron.urls')),
]

# aeron/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'settings', SettingViewSet)
router.register(r'screen-settings', ScreenSettingViewSet)
router.register(r'custom-rules', CustomRuleViewSet)
router.register(r'disruptions', FlightDisruptionViewSet)
router.register(r'recovery-options', RecoveryOptionViewSet)
router.register(r'passengers', PassengerViewSet)
router.register(r'passenger-rebookings', PassengerRebookingViewSet)
router.register(r'pending-recovery-solutions', PendingRecoverySolutionViewSet)

urlpatterns = [
    path('auth/', include('aeron.urls.auth')),
    path('analytics/', AnalyticsViewSet.as_view({'get': 'dashboard_analytics'}), name='dashboard-analytics'),
    path('analytics/kpi', AnalyticsViewSet.as_view({'get': 'kpi'}), name='analytics-kpi'),
    path('past-recovery-kpi', AnalyticsViewSet.as_view({'get': 'past_recovery_kpi'}), name='past-recovery-kpi'),
    path('past-recovery-logs', AnalyticsViewSet.as_view({'get': 'past_recovery_logs'}), name='past-recovery-logs'),
    path('', include(router.urls)),
]
```

## Migration Execution Phases

### Phase 1: Foundation and Core Services (Week 1-2)
- Complete Django project initialization and configuration
- Implement authentication services with JWT (/api/auth/*)
- Deploy settings management with all existing functionality (/api/settings/*)
- Create screen settings management (/api/screen-settings/*)
- Establish database connections and migration tools
- Set up logging, monitoring, and error tracking

### Phase 2: Disruption and Recovery Core (Week 3-4)
- Deploy flight disruption services (/api/disruptions/*)
- Implement custom rules engine (/api/custom-rules/*)
- Create recovery options generation (/api/recovery-options/*)
- Set up passenger services (/api/passengers/*, /api/passenger-rebookings/*)
- Integrate external API support for bulk operations
- Establish data validation and integrity checking

### Phase 3: Advanced Features and Analytics (Week 5-6)
- Implement analytics services (/api/analytics/*, /api/dashboard-analytics)
- Deploy pending recovery solutions (/api/pending-recovery-solutions/*)
- Create comprehensive dashboards and reporting
- Set up real-time monitoring and alerting
- Implement advanced reporting and business intelligence
- Establish performance optimization and tuning

### Phase 4: Testing and Deployment (Week 7-8)
- Execute end-to-end integration testing
- Perform load testing and performance validation
- Complete security testing and vulnerability assessment
- Execute data migration validation and integrity checking
- Deploy to Replit production environment
- Complete user training and support documentation

## Testing & Validation

### API Endpoint Testing
- Unit tests for all ViewSets and serializers
- Integration tests for API endpoints with authentication
- Performance tests for high-load scenarios
- Security tests for authentication and authorization
- End-to-end tests for complete business workflows

### Data Migration Validation
- Pre-migration data export and validation
- Migration process data integrity checking
- Post-migration data comparison and validation
- Business logic verification across all services
- Performance benchmark comparison with Express.js

## Deployment Strategy

### Replit Production Deployment
- Configure production settings with security hardening
- Set up database connection pooling and optimization
- Configure static file serving and media handling
- Implement caching strategies for performance
- Set up monitoring and logging for production
- Configure backup and disaster recovery procedures

This comprehensive migration strategy ensures a smooth transition from Express.js to Django REST Framework while maintaining all existing API endpoints and functionality.
