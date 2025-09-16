
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import json

class TimeStampedModel(models.Model):
    """Abstract base model with timestamp fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class UserAccount(AbstractUser):
    """Custom user model for AERON system"""
    user_type = models.CharField(max_length=50, default='operator')
    user_code = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.full_name} ({self.user_code})"

class Setting(TimeStampedModel):
    """Settings storage model"""
    category = models.CharField(max_length=100)
    key = models.CharField(max_length=100)
    value = models.JSONField()
    type = models.CharField(max_length=50)  # string, number, boolean, object
    description = models.TextField(blank=True, null=True)
    updated_by = models.CharField(max_length=100, default='system')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['category', 'key']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['category', 'key']),
        ]
    
    def __str__(self):
        return f"{self.category}.{self.key}"

class ScreenSetting(TimeStampedModel):
    """Screen settings model"""
    screen_id = models.CharField(max_length=100, unique=True)
    screen_name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    enabled = models.BooleanField(default=True)
    required = models.BooleanField(default=False)
    icon = models.CharField(max_length=50, default='Settings')
    updated_by = models.CharField(max_length=100, default='system')
    
    def __str__(self):
        return f"{self.screen_name} ({self.screen_id})"

class CustomRule(TimeStampedModel):
    """Custom rules model"""
    rule_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    type = models.CharField(max_length=50)  # Hard, Soft
    priority = models.IntegerField(default=0)
    overridable = models.BooleanField(default=True)
    conditions = models.TextField()
    actions = models.TextField()
    status = models.CharField(max_length=50, default='Active')  # Active, Inactive, Draft
    created_by = models.CharField(max_length=100, default='system')
    updated_by = models.CharField(max_length=100, default='system')
    
    class Meta:
        ordering = ['priority', 'created_at']
    
    def __str__(self):
        return f"{self.name} ({self.rule_id})"

class DisruptionCategory(TimeStampedModel):
    """Disruption categories model"""
    category_code = models.CharField(max_length=50, unique=True)
    category_name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    priority_level = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['priority_level', 'category_name']
        verbose_name_plural = "Disruption Categories"
    
    def __str__(self):
        return f"{self.category_name} ({self.category_code})"

class FlightDisruption(TimeStampedModel):
    """Flight disruptions model"""
    flight_number = models.CharField(max_length=20)
    route = models.CharField(max_length=100)
    origin = models.CharField(max_length=10)
    destination = models.CharField(max_length=10)
    origin_city = models.CharField(max_length=100, default='Unknown')
    destination_city = models.CharField(max_length=100, default='Unknown')
    aircraft = models.CharField(max_length=50)
    scheduled_departure = models.DateTimeField()
    estimated_departure = models.DateTimeField(blank=True, null=True)
    delay_minutes = models.IntegerField(default=0)
    passengers = models.IntegerField(default=0)
    crew = models.IntegerField(default=6)
    connection_flights = models.IntegerField(default=0)
    severity = models.CharField(max_length=50, default='Medium')  # Low, Medium, High, Critical
    disruption_type = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default='Active')  # Active, Delayed, Resolved, Expired
    disruption_reason = models.TextField()
    recovery_status = models.CharField(max_length=50, blank=True, null=True)  # pending, approved, completed
    categorization = models.CharField(max_length=200, blank=True, null=True)
    category = models.ForeignKey(DisruptionCategory, on_delete=models.SET_NULL, blank=True, null=True)
    
    class Meta:
        unique_together = ['flight_number', 'scheduled_departure']
        indexes = [
            models.Index(fields=['flight_number']),
            models.Index(fields=['status']),
            models.Index(fields=['recovery_status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.flight_number} - {self.route} ({self.scheduled_departure.date()})"

class RecoveryOption(TimeStampedModel):
    """Recovery options model"""
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='recovery_options')
    title = models.CharField(max_length=200)
    description = models.TextField()
    cost = models.CharField(max_length=100, default='TBD')
    timeline = models.CharField(max_length=100, default='TBD')
    confidence = models.IntegerField(default=80, validators=[MinValueValidator(0), MaxValueValidator(100)])
    impact = models.CharField(max_length=50, default='Medium')
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
    
    class Meta:
        unique_together = ['disruption', 'title']
        ordering = ['priority', 'confidence']
    
    def __str__(self):
        return f"{self.title} for {self.disruption.flight_number}"

class RecoveryStep(TimeStampedModel):
    """Recovery steps model"""
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='recovery_steps')
    step_number = models.IntegerField()
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default='pending')
    timestamp = models.DateTimeField()
    system = models.CharField(max_length=100)
    details = models.TextField()
    step_data = models.JSONField(blank=True, null=True)
    
    class Meta:
        unique_together = ['disruption', 'step_number']
        ordering = ['step_number']
    
    def __str__(self):
        return f"Step {self.step_number}: {self.title}"

class PassengerRebooking(TimeStampedModel):
    """Passenger rebookings model"""
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='passenger_rebookings')
    pnr = models.CharField(max_length=20)
    passenger_id = models.CharField(max_length=50)
    passenger_name = models.CharField(max_length=200)
    original_flight = models.CharField(max_length=20)
    original_seat = models.CharField(max_length=10, blank=True, null=True)
    rebooked_flight = models.CharField(max_length=20)
    rebooked_cabin = models.CharField(max_length=20, blank=True, null=True)
    rebooked_seat = models.CharField(max_length=10, blank=True, null=True)
    rebooking_date = models.DateTimeField()
    additional_services = models.JSONField(default=list)
    status = models.CharField(max_length=50, default='confirmed')
    total_passengers_in_pnr = models.IntegerField(default=1)
    rebooking_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['disruption', 'passenger_id', 'pnr']
        indexes = [
            models.Index(fields=['pnr']),
            models.Index(fields=['passenger_id']),
        ]
    
    def __str__(self):
        return f"{self.passenger_name} ({self.pnr}) - {self.rebooked_flight}"

class PendingRecoverySolution(TimeStampedModel):
    """Pending recovery solutions model"""
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='pending_solutions')
    option_id = models.CharField(max_length=255)
    option_title = models.TextField()
    option_description = models.TextField(blank=True, null=True)
    cost = models.CharField(max_length=255, blank=True, null=True)
    timeline = models.CharField(max_length=255, blank=True, null=True)
    confidence = models.IntegerField(blank=True, null=True)
    impact = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Pending')
    full_details = models.JSONField(default=dict)
    rotation_impact = models.JSONField(default=dict)
    submitted_by = models.CharField(max_length=255, default='system')
    approval_required = models.BooleanField(default=True)
    selected_aircraft = models.JSONField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.option_title} for {self.disruption.flight_number}"

class CrewMember(TimeStampedModel):
    """Crew members model"""
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=100)  # Captain, First Officer, Flight Attendant, etc.
    status = models.CharField(max_length=50, default='Available')  # Available, On Duty, Off Duty
    base_location = models.CharField(max_length=100)
    current_flight = models.CharField(max_length=20, blank=True, null=True)
    duty_time_remaining = models.DecimalField(max_digits=5, decimal_places=2, default=14.0)
    qualifications = models.JSONField(default=list)
    contact_info = models.JSONField(default=dict)
    
    def __str__(self):
        return f"{self.name} - {self.role}"

class Aircraft(TimeStampedModel):
    """Aircraft model"""
    registration = models.CharField(max_length=20, unique=True)
    aircraft_type = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default='Available')  # Available, In Use, Maintenance
    location = models.CharField(max_length=100)
    fuel_level = models.DecimalField(max_digits=5, decimal_places=2, default=100.0)
    maintenance_status = models.CharField(max_length=100, default='Current')
    passenger_capacity = models.IntegerField(default=189)
    configuration = models.JSONField(default=dict)
    
    def __str__(self):
        return f"{self.registration} ({self.aircraft_type})"

class HotelBooking(TimeStampedModel):
    """Hotel bookings model"""
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='hotel_bookings')
    passenger_pnr = models.CharField(max_length=20)
    hotel_name = models.CharField(max_length=200)
    hotel_location = models.CharField(max_length=200, blank=True, null=True)
    check_in = models.DateTimeField()
    check_out = models.DateTimeField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='confirmed')
    booking_reference = models.CharField(max_length=100)
    room_details = models.JSONField(default=dict)
    
    def __str__(self):
        return f"{self.hotel_name} - {self.passenger_pnr}"

class DocumentRepository(TimeStampedModel):
    """Document repository model"""
    name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    file_size = models.IntegerField()
    content_base64 = models.TextField()
    upload_date = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.CharField(max_length=100, default='system')
    processing_status = models.CharField(max_length=50, default='uploaded')
    metadata = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.file_type})"

class CustomParameter(TimeStampedModel):
    """Custom parameters model"""
    parameter_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    created_by = models.CharField(max_length=100, default='system')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.parameter_id})"
