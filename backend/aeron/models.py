from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()

class Settings(models.Model):
    """Settings management model matching PostgreSQL schema"""
    TYPE_CHOICES = [
        ('boolean', 'Boolean'),
        ('number', 'Number'),
        ('string', 'String'),
        ('object', 'Object'),
        ('array', 'Array'),
    ]
    
    category = models.CharField(max_length=100)
    key = models.CharField(max_length=100)
    value = models.JSONField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='string')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.CharField(max_length=100, default='system')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['category', 'key']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['key']),
            models.Index(fields=['category', 'key']),
        ]

class SettingsAudit(models.Model):
    """Settings audit log for tracking changes"""
    CHANGE_TYPES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'), 
        ('DELETE', 'Delete'),
    ]
    
    setting_id = models.IntegerField(blank=True, null=True)
    category = models.CharField(max_length=100)
    key = models.CharField(max_length=100)
    old_value = models.JSONField(blank=True, null=True)
    new_value = models.JSONField()
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPES)
    changed_by = models.CharField(max_length=100)
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, null=True)

class CustomRules(models.Model):
    """Custom rules for business logic management"""
    RULE_TYPES = [
        ('Hard', 'Hard Rule'),
        ('Soft', 'Soft Rule'),
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
    type = models.CharField(max_length=10, choices=RULE_TYPES, default='Soft')
    priority = models.IntegerField(default=3)
    overridable = models.BooleanField(default=True)
    conditions = models.TextField(blank=True, null=True)
    actions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_by = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.CharField(max_length=100, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

class CustomParameters(models.Model):
    """Custom parameters for recovery configuration"""
    parameter_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    weight = models.IntegerField(default=10)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

class DisruptionCategory(models.Model):
    """Disruption categories for flight issues"""
    category_code = models.CharField(max_length=50, unique=True)
    category_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    priority_level = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

class FlightDisruption(models.Model):
    """Flight disruptions with categorization support"""
    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Resolved', 'Resolved'),
        ('Expired', 'Expired'),
        ('Cancelled', 'Cancelled'),
    ]
    
    flight_number = models.CharField(max_length=10)
    route = models.CharField(max_length=50)
    origin = models.CharField(max_length=3)
    destination = models.CharField(max_length=3)
    origin_city = models.CharField(max_length=100, blank=True, null=True)
    destination_city = models.CharField(max_length=100, blank=True, null=True)
    aircraft = models.CharField(max_length=50)
    scheduled_departure = models.DateTimeField()
    estimated_departure = models.DateTimeField(blank=True, null=True)
    delay_minutes = models.IntegerField(default=0)
    passengers = models.IntegerField()
    crew = models.IntegerField()
    connection_flights = models.IntegerField(default=0)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    disruption_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    disruption_reason = models.TextField(blank=True, null=True)
    categorization = models.CharField(max_length=255, blank=True, null=True)
    category = models.ForeignKey(DisruptionCategory, on_delete=models.SET_NULL, blank=True, null=True, related_name='disruptions', db_column='category_id')
    recovery_status = models.CharField(max_length=50, default='none')
    
    def add_recovery_status_field(self):
        """Helper method to match Express.js recovery_status field behavior"""
        # This field tracks the current recovery progress state
        RECOVERY_STATUS_CHOICES = [
            ('none', 'No Recovery Initiated'),
            ('analyzing', 'Analyzing Options'),
            ('pending', 'Recovery Pending'),
            ('in-progress', 'Recovery In Progress'), 
            ('completed', 'Recovery Completed'),
            ('failed', 'Recovery Failed')
        ]
        return self.recovery_status
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['flight_number', 'scheduled_departure']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['disruption_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['flight_number', 'scheduled_departure', 'status']),
            models.Index(fields=['-updated_at']),
        ]

class RecoveryOptionTemplate(models.Model):
    """Templates for recovery options by category"""
    category = models.ForeignKey(DisruptionCategory, on_delete=models.CASCADE)
    template_code = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField()
    default_timeline = models.CharField(max_length=100, blank=True, null=True)
    default_confidence = models.IntegerField(default=80)
    default_impact = models.CharField(max_length=20, default='Medium')
    default_status = models.CharField(max_length=20, default='available')
    template_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['category', 'template_code']

class RecoveryOption(models.Model):
    """Recovery options for flight disruptions"""
    STATUS_CHOICES = [
        ('generated', 'Generated'),
        ('recommended', 'Recommended'),
        ('caution', 'Caution'),
        ('warning', 'Warning'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, related_name='recovery_options')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    cost = models.CharField(max_length=100, blank=True, null=True)
    timeline = models.CharField(max_length=100, blank=True, null=True)
    confidence = models.IntegerField(default=0)
    impact = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='generated')
    priority = models.IntegerField(default=0)
    advantages = models.JSONField(default=list)
    considerations = models.JSONField(default=list)
    resource_requirements = models.JSONField(default=list)
    cost_breakdown = models.JSONField(default=dict)
    timeline_details = models.JSONField(default=list)
    risk_assessment = models.JSONField(default=list)
    technical_specs = models.JSONField(default=dict)
    metrics = models.JSONField(default=dict)
    rotation_plan = models.JSONField(default=dict)
    detailed_cost_analysis = models.JSONField(default=dict)
    timeline_breakdown = models.JSONField(default=dict)
    resource_details = models.JSONField(default=dict)
    risk_details = models.JSONField(default=dict)
    technical_details = models.JSONField(default=dict)
    impact_area = models.JSONField(default=list)
    impact_summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'title']
        indexes = [
            models.Index(fields=['disruption']),
            models.Index(fields=['status']),
        ]

class RecoveryStep(models.Model):
    """Recovery implementation steps"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    step_number = models.IntegerField()
    title = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    timestamp = models.CharField(max_length=100, blank=True, null=True)
    system = models.CharField(max_length=100, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    step_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'step_number']
        indexes = [
            models.Index(fields=['disruption']),
            models.Index(fields=['status']),
        ]

class Passenger(models.Model):
    """Passenger information and rebooking"""
    TICKET_CLASSES = [
        ('Economy', 'Economy'),
        ('Premium', 'Premium Economy'),
        ('Business', 'Business'),
        ('First', 'First Class'),
    ]
    
    LOYALTY_TIERS = [
        ('Bronze', 'Bronze'),
        ('Silver', 'Silver'), 
        ('Gold', 'Gold'),
        ('Platinum', 'Platinum'),
    ]
    
    pnr = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    flight_number = models.CharField(max_length=10)
    seat_number = models.CharField(max_length=10, blank=True, null=True)
    ticket_class = models.CharField(max_length=20, choices=TICKET_CLASSES)
    loyalty_tier = models.CharField(max_length=20, choices=LOYALTY_TIERS, default='Bronze')
    special_needs = models.TextField(blank=True, null=True)
    contact_info = models.JSONField(default=dict)
    rebooking_status = models.CharField(max_length=50, blank=True, null=True)
    new_flight_number = models.CharField(max_length=10, blank=True, null=True)
    new_seat_number = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['flight_number']),
            models.Index(fields=['pnr']),
        ]

class PassengerRebooking(models.Model):
    """Passenger rebooking records"""
    STATUS_CHOICES = [
        ('Confirmed', 'Confirmed'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    pnr = models.CharField(max_length=10)
    passenger_id = models.CharField(max_length=50)
    passenger_name = models.CharField(max_length=255)
    original_flight = models.CharField(max_length=10)
    original_seat = models.CharField(max_length=10, blank=True, null=True)
    rebooked_flight = models.CharField(max_length=10)
    rebooked_cabin = models.CharField(max_length=20)
    rebooked_seat = models.CharField(max_length=10)
    additional_services = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    total_passengers_in_pnr = models.IntegerField()
    rebooking_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'passenger_id', 'pnr']

class CrewMember(models.Model):
    """Crew member information and availability"""
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('On Duty', 'On Duty'),
        ('Rest', 'Rest'),
        ('Unavailable', 'Unavailable'),
    ]
    
    employee_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=50)
    qualifications = models.JSONField(default=list)  # Array of qualification codes
    duty_time_remaining = models.IntegerField()
    base_location = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    current_flight = models.CharField(max_length=10, blank=True, null=True)
    contact_info = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['employee_id']),
        ]

class CrewDisruptionMapping(models.Model):
    """Links crew members to flight disruptions"""
    RESOLUTION_STATUS = [
        ('Pending', 'Pending'),
        ('Resolved', 'Resolved'),
        ('Escalated', 'Escalated'),
    ]
    
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    crew_member = models.ForeignKey(CrewMember, on_delete=models.CASCADE, related_name='disruptions')
    disruption_reason = models.TextField(blank=True, null=True)
    affected_date = models.DateTimeField(auto_now_add=True)
    resolution_status = models.CharField(max_length=50, choices=RESOLUTION_STATUS, default='Pending')
    replacement_crew = models.ForeignKey(CrewMember, on_delete=models.SET_NULL, blank=True, null=True, related_name='replacement_assignments')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'crew_member']
        indexes = [
            models.Index(fields=['disruption']),
            models.Index(fields=['crew_member']),
        ]

class Aircraft(models.Model):
    """Aircraft information and status"""
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('In Use', 'In Use'),
        ('Maintenance', 'Maintenance'),
        ('Out of Service', 'Out of Service'),
    ]
    
    MAINTENANCE_STATUS = [
        ('Operational', 'Operational'),
        ('Due', 'Due'),
        ('In Progress', 'In Progress'),
    ]
    
    registration = models.CharField(max_length=20, unique=True)
    aircraft_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    location = models.CharField(max_length=50)
    maintenance_status = models.CharField(max_length=20, choices=MAINTENANCE_STATUS)
    fuel_level = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    next_maintenance = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['status']),
        ]

class HotelBooking(models.Model):
    """Hotel accommodation bookings for passengers"""
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]
    
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE, blank=True, null=True)
    passenger_pnr = models.CharField(max_length=10, blank=True, null=True)
    hotel_name = models.CharField(max_length=255, blank=True, null=True)
    check_in = models.DateTimeField(blank=True, null=True)
    check_out = models.DateTimeField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    booking_reference = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['disruption']),
        ]

class RecoveryLog(models.Model):
    """Historical recovery data for analytics"""
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    solution_id = models.CharField(max_length=50, unique=True)
    disruption_id = models.CharField(max_length=50)
    flight_number = models.CharField(max_length=10)
    route = models.CharField(max_length=50)
    aircraft = models.CharField(max_length=50)
    disruption_type = models.CharField(max_length=50)
    disruption_reason = models.TextField(blank=True, null=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    date_created = models.DateTimeField()
    date_executed = models.DateTimeField(blank=True, null=True)
    date_completed = models.DateTimeField(blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    affected_passengers = models.IntegerField(blank=True, null=True)
    actual_cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    cost_variance = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    otp_impact = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    solution_chosen = models.TextField(blank=True, null=True)
    total_options = models.IntegerField(blank=True, null=True)
    executed_by = models.CharField(max_length=255, blank=True, null=True)
    approved_by = models.CharField(max_length=255, blank=True, null=True)
    passenger_satisfaction = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    rebooking_success = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    categorization = models.CharField(max_length=100, blank=True, null=True)
    cancellation_avoided = models.BooleanField(default=False)
    potential_delay_minutes = models.IntegerField(blank=True, null=True)
    actual_delay_minutes = models.IntegerField(blank=True, null=True)
    delay_reduction_minutes = models.IntegerField(blank=True, null=True)
    disruption_category = models.CharField(max_length=50, blank=True, null=True)
    recovery_efficiency = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    network_impact = models.CharField(max_length=20, blank=True, null=True)
    downstream_flights_affected = models.IntegerField(blank=True, null=True)
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

class PendingRecoverySolution(models.Model):
    """Solutions awaiting approval"""
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Implemented', 'Implemented'),
    ]
    
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    option_id = models.CharField(max_length=100, blank=True, null=True)
    option_title = models.CharField(max_length=255, blank=True, null=True)
    option_description = models.TextField(blank=True, null=True)
    cost = models.CharField(max_length=50, blank=True, null=True)
    timeline = models.CharField(max_length=100, blank=True, null=True)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    impact = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    full_details = models.JSONField(default=dict)
    rotation_impact = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)
    submitted_by = models.CharField(max_length=100, default='system')
    approval_required = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Note: Screen settings are managed through the main Settings table
# with category='screenSettings' to match the PostgreSQL schema and Express.js endpoints

class RecoveryOptionsDetailed(models.Model):
    """Detailed recovery options with enhanced metadata"""
    option_id = models.CharField(max_length=50, unique=True)
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    category = models.ForeignKey(DisruptionCategory, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    cost_estimate = models.CharField(max_length=100)
    timeline = models.CharField(max_length=100)
    confidence_score = models.IntegerField()
    impact_level = models.CharField(max_length=20)
    status = models.CharField(max_length=50)
    priority = models.IntegerField()
    advantages = models.JSONField(default=list)
    considerations = models.JSONField(default=list)
    timeline_steps = models.JSONField(default=list)
    resources = models.JSONField(default=list)
    risk_assessment = models.JSONField(default=list)
    technical_details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class RecoveryStepsDetailed(models.Model):
    """Detailed recovery implementation steps"""
    disruption = models.ForeignKey(FlightDisruption, on_delete=models.CASCADE)
    option_id = models.CharField(max_length=50)
    step_number = models.IntegerField()
    step_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    duration = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, default='pending')
    timestamp_start = models.DateTimeField(blank=True, null=True)
    timestamp_end = models.DateTimeField(blank=True, null=True)
    system = models.CharField(max_length=255, blank=True, null=True)
    step_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['disruption', 'option_id', 'step_number']

class RotationPlanDetails(models.Model):
    """Rotation plan details for recovery options"""
    recovery_option = models.OneToOneField(RecoveryOption, on_delete=models.CASCADE)
    aircraft_options = models.JSONField(default=list)
    crew_data = models.JSONField(default=list)
    next_sectors = models.JSONField(default=list)
    operational_constraints = models.JSONField(default=dict)
    cost_breakdown = models.JSONField(default=dict)
    recommendation = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CostAnalysisDetails(models.Model):
    """Cost analysis details for recovery options"""
    recovery_option = models.OneToOneField(RecoveryOption, on_delete=models.CASCADE)
    cost_categories = models.JSONField(default=list)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cost_comparison = models.JSONField(default=dict)
    savings_analysis = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class TimelineDetails(models.Model):
    """Timeline details for recovery options"""
    recovery_option = models.OneToOneField(RecoveryOption, on_delete=models.CASCADE)
    timeline_steps = models.JSONField(default=list)
    critical_path = models.JSONField(default=dict)
    dependencies = models.JSONField(default=list)
    milestones = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ResourceDetails(models.Model):
    """Resource details for recovery options"""
    recovery_option = models.OneToOneField(RecoveryOption, on_delete=models.CASCADE)
    personnel_requirements = models.JSONField(default=list)
    equipment_requirements = models.JSONField(default=list)
    facility_requirements = models.JSONField(default=list)
    availability_status = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class TechnicalSpecifications(models.Model):
    """Technical specifications for recovery options"""
    recovery_option = models.OneToOneField(RecoveryOption, on_delete=models.CASCADE)
    aircraft_specs = models.JSONField(default=dict)
    operational_constraints = models.JSONField(default=dict)
    regulatory_requirements = models.JSONField(default=list)
    weather_limitations = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class DocumentRepository(models.Model):
    """Document repository for uploaded files"""
    DOCUMENT_TYPES = [
        ('manual', 'Manual'),
        ('policy', 'Policy'),
        ('procedure', 'Procedure'),
        ('report', 'Report'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    description = models.TextField(blank=True, null=True)
    uploaded_by = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

class UserAccount(models.Model):
    """User accounts for authentication"""
    USER_TYPES = [
        ('admin', 'Administrator'),
        ('operator', 'Operations Staff'),
        ('manager', 'Manager'),
        ('viewer', 'View Only'),
    ]
    
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='operator')
    user_code = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)