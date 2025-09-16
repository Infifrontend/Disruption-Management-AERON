
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets
router = DefaultRouter()

# API URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Health and debug endpoints
    path('health/', views.health_check, name='api_health'),
    path('debug/', views.debug_info, name='api_debug'),
    
    # Authentication endpoints
    path('auth/login/', views.login_view, name='auth_login'),
    path('auth/verify/', views.verify_token, name='auth_verify'),
    path('auth/logout/', views.logout_view, name='auth_logout'),
    
    # Settings endpoints
    path('settings/', views.settings_list, name='settings_list'),
    path('settings/tabs/', views.settings_tabs, name='settings_tabs'),
    path('settings/batch/', views.settings_batch, name='settings_batch'),
    path('settings/reset/', views.settings_reset, name='settings_reset'),
    path('settings/<str:category>/<str:key>/', views.settings_detail, name='settings_detail'),
    path('settings/category/<str:category>/', views.settings_by_category, name='settings_by_category'),
    
    # Screen settings endpoints
    path('screen-settings/', views.screen_settings_list, name='screen_settings_list'),
    path('screen-settings/batch/', views.screen_settings_batch, name='screen_settings_batch'),
    path('screen-settings/<str:screen_id>/', views.screen_settings_detail, name='screen_settings_detail'),
    
    # Custom rules endpoints
    path('custom-rules/', views.custom_rules_list, name='custom_rules_list'),
    path('custom-rules/batch/', views.custom_rules_batch, name='custom_rules_batch'),
    path('custom-rules/<str:rule_id>/', views.custom_rules_detail, name='custom_rules_detail'),
    
    # Flight disruptions endpoints
    path('disruptions/', views.disruptions_list, name='disruptions_list'),
    path('disruptions/bulk-update/', views.disruptions_bulk_update, name='disruptions_bulk_update'),
    path('disruptions/update-expired/', views.disruptions_update_expired, name='disruptions_update_expired'),
    path('disruptions/<int:disruption_id>/', views.disruptions_detail, name='disruptions_detail'),
    path('disruptions/<int:disruption_id>/recovery-status/', views.disruptions_recovery_status, name='disruptions_recovery_status'),
    
    # Recovery options endpoints
    path('recovery-options/<int:disruption_id>/', views.recovery_options_list, name='recovery_options_list'),
    path('recovery-options/generate/<int:disruption_id>/', views.recovery_options_generate, name='recovery_options_generate'),
    path('recovery-options/generate-llm/<int:disruption_id>/', views.recovery_options_generate_llm, name='recovery_options_generate_llm'),
    path('recovery-option/<int:option_id>/', views.recovery_option_detail, name='recovery_option_detail'),
    path('recovery-option/<int:option_id>/rotation-plan/', views.recovery_option_rotation_plan, name='recovery_option_rotation_plan'),
    path('recovery-option/<int:option_id>/cost-analysis/', views.recovery_option_cost_analysis, name='recovery_option_cost_analysis'),
    path('recovery-option/<int:option_id>/timeline/', views.recovery_option_timeline, name='recovery_option_timeline'),
    path('recovery-option/<int:option_id>/resources/', views.recovery_option_resources, name='recovery_option_resources'),
    path('recovery-option/<int:option_id>/technical/', views.recovery_option_technical, name='recovery_option_technical'),
    
    # Passenger services endpoints
    path('passengers/pnr/<str:pnr>/', views.passenger_by_pnr, name='passenger_by_pnr'),
    path('passengers/<str:pnr>/rebooking/', views.passenger_rebooking, name='passenger_rebooking'),
    path('passenger-rebookings/', views.passenger_rebookings_list, name='passenger_rebookings_list'),
    path('passenger-rebookings/disruption/<int:disruption_id>/', views.passenger_rebookings_by_disruption, name='passenger_rebookings_by_disruption'),
    path('passenger-rebookings/pnr/<str:pnr>/', views.passenger_rebookings_by_pnr, name='passenger_rebookings_by_pnr'),
    
    # Crew and aircraft endpoints
    path('crew/available/', views.crew_available, name='crew_available'),
    path('crew/flight/<str:flight_number>/', views.crew_by_flight, name='crew_by_flight'),
    path('aircraft/', views.aircraft_list, name='aircraft_list'),
    path('aircraft/available/', views.aircraft_available, name='aircraft_available'),
    path('aircraft/<int:aircraft_id>/status/', views.aircraft_status, name='aircraft_status'),
    
    # Analytics and dashboard endpoints
    path('dashboard-analytics/', views.dashboard_analytics, name='dashboard_analytics'),
    path('analytics/kpi/', views.analytics_kpi, name='analytics_kpi'),
    path('kpi-data/', views.kpi_data, name='kpi_data'),
    path('passenger-impact/', views.passenger_impact, name='passenger_impact'),
    path('disrupted-stations/', views.disrupted_stations, name='disrupted_stations'),
    path('operational-insights/', views.operational_insights, name='operational_insights'),
    
    # Recovery logs and past performance
    path('past-recovery-kpi/', views.past_recovery_kpi, name='past_recovery_kpi'),
    path('past-recovery-trends/', views.past_recovery_trends, name='past_recovery_trends'),
    path('past-recovery-logs/', views.past_recovery_logs, name='past_recovery_logs'),
    path('recovery-logs/', views.recovery_logs, name='recovery_logs'),
    
    # Pending solutions endpoints
    path('pending-recovery-solutions/', views.pending_recovery_solutions_list, name='pending_recovery_solutions_list'),
    path('pending-recovery-solutions/<int:solution_id>/status/', views.pending_recovery_solutions_status, name='pending_recovery_solutions_status'),
    
    # LLM service endpoints
    path('llm-recovery/health/', views.llm_recovery_health, name='llm_recovery_health'),
    path('llm-recovery/health/all/', views.llm_recovery_health_all, name='llm_recovery_health_all'),
    path('llm-recovery/providers/', views.llm_recovery_providers, name='llm_recovery_providers'),
    path('llm-recovery/provider/switch/', views.llm_recovery_provider_switch, name='llm_recovery_provider_switch'),
    
    # Document repository endpoints
    path('documents/', views.documents_list, name='documents_list'),
    path('documents/<int:document_id>/', views.documents_detail, name='documents_detail'),
    
    # Recovery categories and templates
    path('recovery-categories/', views.recovery_categories, name='recovery_categories'),
    path('disruption-categories/', views.disruption_categories, name='disruption_categories'),
    path('recovery-templates/<int:category_id>/', views.recovery_templates, name='recovery_templates'),
    path('recovery-option-templates/', views.recovery_option_templates, name='recovery_option_templates'),
    
    # Recovery steps
    path('recovery-steps/<int:disruption_id>/', views.recovery_steps, name='recovery_steps'),
    path('recovery-steps-detailed/<int:disruption_id>/', views.recovery_steps_detailed, name='recovery_steps_detailed'),
    
    # Hotel bookings
    path('hotel-bookings/', views.hotel_bookings_list, name='hotel_bookings_list'),
    path('hotel-bookings/disruption/<int:disruption_id>/', views.hotel_bookings_by_disruption, name='hotel_bookings_by_disruption'),
    
    # Manual knowledge entries
    path('manual-knowledge-entries/', views.manual_knowledge_entries_list, name='manual_knowledge_entries_list'),
    path('manual-knowledge-entries/<str:entry_id>/', views.manual_knowledge_entries_detail, name='manual_knowledge_entries_detail'),
    
    # Custom parameters
    path('custom-parameters/', views.custom_parameters_list, name='custom_parameters_list'),
    path('custom-parameters/<str:parameter_id>/', views.custom_parameters_detail, name='custom_parameters_detail'),
    
    # Utility endpoints
    path('map-disruption-category/', views.map_disruption_category, name='map_disruption_category'),
    path('recovery-options/category/<str:category_code>/', views.recovery_options_by_category, name='recovery_options_by_category'),
    path('test-logging/', views.test_logging, name='test_logging'),
]
