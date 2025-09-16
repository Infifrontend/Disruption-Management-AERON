
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, Settings, ScreenSettings, CustomRules, 
    DisruptionCategory, FlightDisruption, RecoveryOption,
    Passenger, CrewMember, Aircraft, AnalyticsMetric
)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'full_name', 'user_type', 'is_active')
    list_filter = ('user_type', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'full_name')
    ordering = ('email',)

@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    list_display = ('category', 'key', 'type', 'is_active', 'updated_at')
    list_filter = ('category', 'type', 'is_active')
    search_fields = ('category', 'key')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ScreenSettings)
class ScreenSettingsAdmin(admin.ModelAdmin):
    list_display = ('screen_id', 'screen_name', 'category', 'enabled', 'required')
    list_filter = ('category', 'enabled', 'required')
    search_fields = ('screen_id', 'screen_name')

@admin.register(CustomRules)
class CustomRulesAdmin(admin.ModelAdmin):
    list_display = ('rule_id', 'name', 'category', 'type', 'priority', 'status')
    list_filter = ('category', 'type', 'status')
    search_fields = ('rule_id', 'name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(DisruptionCategory)
class DisruptionCategoryAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('code', 'name')

@admin.register(FlightDisruption)
class FlightDisruptionAdmin(admin.ModelAdmin):
    list_display = ('flight_number', 'route', 'category', 'severity', 'status', 'passengers')
    list_filter = ('category', 'severity', 'status')
    search_fields = ('flight_number', 'route')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(RecoveryOption)
class RecoveryOptionAdmin(admin.ModelAdmin):
    list_display = ('title', 'disruption', 'cost', 'confidence', 'priority', 'status')
    list_filter = ('status', 'priority')
    search_fields = ('title', 'disruption__flight_number')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    list_display = ('pnr', 'name', 'ticket_class', 'loyalty_tier', 'rebooking_status')
    list_filter = ('ticket_class', 'loyalty_tier', 'rebooking_status')
    search_fields = ('pnr', 'name', 'email')

@admin.register(CrewMember)
class CrewMemberAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'name', 'role', 'base_location', 'availability_status')
    list_filter = ('role', 'base_location', 'availability_status')
    search_fields = ('employee_id', 'name')

@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display = ('registration', 'aircraft_type', 'status', 'location', 'operational_readiness')
    list_filter = ('aircraft_type', 'status', 'operational_readiness')
    search_fields = ('registration', 'aircraft_type')

@admin.register(AnalyticsMetric)
class AnalyticsMetricAdmin(admin.ModelAdmin):
    list_display = ('metric_name', 'metric_type', 'metric_value', 'date_recorded')
    list_filter = ('metric_name', 'metric_type', 'date_recorded')
    search_fields = ('metric_name',)
    readonly_fields = ('created_at',)
