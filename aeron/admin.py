
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    UserAccount, Setting, ScreenSetting, CustomRule, DisruptionCategory,
    FlightDisruption, RecoveryOption, RecoveryStep, PassengerRebooking,
    PendingRecoverySolution, CrewMember, Aircraft, HotelBooking,
    DocumentRepository, CustomParameter
)

@admin.register(UserAccount)
class UserAccountAdmin(UserAdmin):
    list_display = ('username', 'full_name', 'user_code', 'user_type', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_active', 'date_joined')
    search_fields = ('username', 'full_name', 'user_code', 'email')
    fieldsets = UserAdmin.fieldsets + (
        ('AERON Profile', {'fields': ('user_type', 'user_code', 'full_name')}),
    )

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ('category', 'key', 'type', 'updated_by', 'is_active', 'updated_at')
    list_filter = ('category', 'type', 'is_active', 'updated_at')
    search_fields = ('category', 'key', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('category', 'key')

@admin.register(ScreenSetting)
class ScreenSettingAdmin(admin.ModelAdmin):
    list_display = ('screen_id', 'screen_name', 'category', 'enabled', 'required', 'updated_at')
    list_filter = ('category', 'enabled', 'required')
    search_fields = ('screen_id', 'screen_name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(CustomRule)
class CustomRuleAdmin(admin.ModelAdmin):
    list_display = ('rule_id', 'name', 'category', 'type', 'priority', 'status', 'updated_at')
    list_filter = ('category', 'type', 'status', 'overridable')
    search_fields = ('rule_id', 'name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('priority', 'name')

@admin.register(DisruptionCategory)
class DisruptionCategoryAdmin(admin.ModelAdmin):
    list_display = ('category_code', 'category_name', 'priority_level', 'is_active')
    list_filter = ('is_active', 'priority_level')
    search_fields = ('category_code', 'category_name', 'description')
    ordering = ('priority_level', 'category_name')

@admin.register(FlightDisruption)
class FlightDisruptionAdmin(admin.ModelAdmin):
    list_display = ('flight_number', 'route', 'scheduled_departure', 'severity', 'status', 'recovery_status', 'created_at')
    list_filter = ('severity', 'status', 'recovery_status', 'disruption_type', 'created_at')
    search_fields = ('flight_number', 'route', 'origin', 'destination', 'aircraft')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'scheduled_departure'
    ordering = ('-created_at',)

@admin.register(RecoveryOption)
class RecoveryOptionAdmin(admin.ModelAdmin):
    list_display = ('title', 'disruption', 'priority', 'confidence', 'status', 'created_at')
    list_filter = ('status', 'impact', 'confidence', 'created_at')
    search_fields = ('title', 'description', 'disruption__flight_number')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('disruption', 'priority')

@admin.register(RecoveryStep)
class RecoveryStepAdmin(admin.ModelAdmin):
    list_display = ('disruption', 'step_number', 'title', 'status', 'system', 'timestamp')
    list_filter = ('status', 'system', 'timestamp')
    search_fields = ('title', 'details', 'disruption__flight_number')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('disruption', 'step_number')

@admin.register(PassengerRebooking)
class PassengerRebookingAdmin(admin.ModelAdmin):
    list_display = ('passenger_name', 'pnr', 'original_flight', 'rebooked_flight', 'status', 'rebooking_date')
    list_filter = ('status', 'rebooking_date', 'rebooked_cabin')
    search_fields = ('passenger_name', 'pnr', 'original_flight', 'rebooked_flight')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-rebooking_date',)

@admin.register(PendingRecoverySolution)
class PendingRecoverySolutionAdmin(admin.ModelAdmin):
    list_display = ('option_title', 'disruption', 'status', 'submitted_by', 'submitted_at')
    list_filter = ('status', 'approval_required', 'submitted_at')
    search_fields = ('option_title', 'option_description', 'disruption__flight_number')
    readonly_fields = ('created_at', 'updated_at', 'submitted_at')
    ordering = ('-submitted_at',)

@admin.register(CrewMember)
class CrewMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'status', 'base_location', 'current_flight', 'duty_time_remaining')
    list_filter = ('role', 'status', 'base_location')
    search_fields = ('name', 'role', 'current_flight')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('name',)

@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display = ('registration', 'aircraft_type', 'status', 'location', 'maintenance_status')
    list_filter = ('aircraft_type', 'status', 'maintenance_status', 'location')
    search_fields = ('registration', 'aircraft_type', 'location')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('registration',)

@admin.register(HotelBooking)
class HotelBookingAdmin(admin.ModelAdmin):
    list_display = ('hotel_name', 'passenger_pnr', 'check_in', 'check_out', 'cost', 'status')
    list_filter = ('status', 'check_in', 'hotel_name')
    search_fields = ('hotel_name', 'passenger_pnr', 'booking_reference')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-check_in',)

@admin.register(DocumentRepository)
class DocumentRepositoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'file_type', 'file_size', 'uploaded_by', 'processing_status', 'upload_date')
    list_filter = ('file_type', 'processing_status', 'upload_date', 'is_active')
    search_fields = ('name', 'original_name', 'uploaded_by')
    readonly_fields = ('created_at', 'updated_at', 'upload_date')
    ordering = ('-upload_date',)

@admin.register(CustomParameter)
class CustomParameterAdmin(admin.ModelAdmin):
    list_display = ('parameter_id', 'name', 'category', 'weight', 'created_by', 'is_active')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('parameter_id', 'name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('category', 'name')

# Admin site customization
admin.site.site_header = "AERON Administration"
admin.site.site_title = "AERON Admin"
admin.site.index_title = "AERON Recovery Management System"
