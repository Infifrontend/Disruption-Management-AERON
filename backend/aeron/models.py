
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import json

class CustomUser(AbstractUser):
    """Custom user model to match existing database schema"""
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=50, default='operator')
    user_code = models.CharField(max_length=20, blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class Settings(models.Model):
    """Settings management model"""
    category = models.CharField(max_length=100)
    key = models.CharField(max_length=100)
    value = models.JSONField()
    type = models.CharField(max_length=50, default='string')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['category', 'key']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['key']),
        ]

class ScreenSettings(models.Model):
    """Screen settings model"""
    screen_id = models.CharField(max_length=100, unique=True)
    screen_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    enabled = models.BooleanField(default=True)
    required = models.BooleanField(default=False)
    icon = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

class CustomRules(models.Model):
    """Custom rules model"""
    RULE_TYPES = [
        ('Hard', 'Hard Rule'),
        ('Soft', 'Soft Rule'),
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
    type = models.CharField(max_length=10, choices=RULE_TYPES, default='Soft')
    priority = models.IntegerField(default=1)
    overridable = models.BooleanField(default=True)
    conditions = models.TextField()
    actions = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

class DisruptionCategory(models.Model):
    """Disruption categories model"""
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

class FlightDisruption(models.Model):
    """Flight disruptions model"""
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Resolved', 'Resolved'),
        ('Expired', 'Expired'),
        ('Cancelled', 'Cancelled'),
    ]
    
    flight_number = models.CharField(max_length=20)
    route = models.CharField(max_length=100)
    aircraft = models.CharField(max_length=50)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    passengers = models.IntegerField()
    crew = models.IntegerField()
    category = models.ForeignKey(DisruptionCategory, on_delete=models.CASCADE)
    severity = models.CharField(max_length=20, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    recovery_status = models.CharField(max_length=50, default='Pending')
    delay_minutes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(blank=True, null=True)

class RecoveryOption(models.Model):
    """Recovery options model"""
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='recovery_options')
    title = models.CharField(max_length=255)
    description = models.TextField()
    cost = models.DecimalField(max_digits=12, decimal_places=2)
    timeline = models.CharField(max_length=100)
    confidence = models.FloatField(default=0.8)
    impact_assessment = models.JSONField(default=dict)
    priority = models.IntegerField(default=1)
    status = models.CharField(max_length=50, default='Generated')
    detailed_analysis = models.JSONField(default=dict)
    resource_requirements = models.JSONField(default=dict)
    technical_specs = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Passenger(models.Model):
    """Passenger model"""
    pnr = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    ticket_class = models.CharField(max_length=20, default='Economy')
    loyalty_tier = models.CharField(max_length=20, blank=True, null=True)
    special_needs = models.TextField(blank=True, null=True)
    rebooking_status = models.CharField(max_length=50, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CrewMember(models.Model):
    """Crew member model"""
    employee_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=50)
    qualifications = models.JSONField(default=list)
    base_location = models.CharField(max_length=100)
    availability_status = models.CharField(max_length=50, default='Available')
    current_duty_time = models.FloatField(default=0.0)
    max_duty_time = models.FloatField(default=14.0)
    last_rest_start = models.DateTimeField(blank=True, null=True)
    contact_info = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Aircraft(models.Model):
    """Aircraft model"""
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('In Use', 'In Use'),
        ('Maintenance', 'Maintenance'),
        ('Out of Service', 'Out of Service'),
    ]
    
    registration = models.CharField(max_length=20, unique=True)
    aircraft_type = models.CharField(max_length=50)
    configuration = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    location = models.CharField(max_length=100)
    maintenance_status = models.CharField(max_length=100, default='Serviceable')
    fuel_level = models.FloatField(default=0.0)
    operational_readiness = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class AnalyticsMetric(models.Model):
    """Analytics metrics model"""
    metric_name = models.CharField(max_length=100)
    metric_value = models.FloatField()
    metric_type = models.CharField(max_length=50)
    date_recorded = models.DateField()
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['metric_name', 'metric_type', 'date_recorded']
        indexes = [
            models.Index(fields=['metric_name']),
            models.Index(fields=['date_recorded']),
        ]
