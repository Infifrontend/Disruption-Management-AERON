
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets with optional trailing slash
router = DefaultRouter()
router.trailing_slash = '/?'

# URL patterns for the aeron app with optional trailing slash support
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints - both with and without trailing slash
    re_path(r'^auth/login/?$', views.LoginView.as_view(), name='login'),
    re_path(r'^auth/verify/?$', views.TokenVerifyView.as_view(), name='token-verify'),
    re_path(r'^auth/logout/?$', views.LogoutView.as_view(), name='logout'),
    
    # Settings endpoints
    re_path(r'^settings/?$', views.SettingsListView.as_view(), name='settings-list'),
    re_path(r'^settings/tabs/?$', views.SettingsTabsView.as_view(), name='settings-tabs'),
    re_path(r'^settings/batch/?$', views.SettingsBatchUpdateView.as_view(), name='settings-batch'),
    
    # Screen settings endpoints
    re_path(r'^screen-settings/?$', views.ScreenSettingsView.as_view(), name='screen-settings'),
    
    # Custom rules endpoints
    re_path(r'^custom-rules/?$', views.CustomRulesView.as_view(), name='custom-rules'),
    
    # Flight disruption endpoints
    re_path(r'^disruptions/?$', views.DisruptionsView.as_view(), name='disruptions'),
    re_path(r'^disruptions/bulk/?$', views.DisruptionsBulkView.as_view(), name='disruptions-bulk'),
    
    # Recovery options endpoints
    re_path(r'^recovery-options/?$', views.RecoveryOptionsView.as_view(), name='recovery-options'),
    re_path(r'^recovery-options/generate/?$', views.RecoveryOptionsGenerateView.as_view(), name='recovery-options-generate'),
    
    # Passenger services endpoints
    re_path(r'^passengers/?$', views.PassengerServicesView.as_view(), name='passengers'),
    re_path(r'^passengers/lookup/?$', views.PassengerLookupView.as_view(), name='passenger-lookup'),
    
    # Crew management endpoints
    re_path(r'^crew/?$', views.CrewManagementView.as_view(), name='crew'),
    re_path(r'^crew/available/?$', views.CrewAvailabilityView.as_view(), name='crew-available'),
    
    # Aircraft management endpoints
    re_path(r'^aircraft/?$', views.AircraftManagementView.as_view(), name='aircraft'),
    re_path(r'^aircraft/available/?$', views.AircraftAvailabilityView.as_view(), name='aircraft-available'),
    
    # Analytics endpoints
    re_path(r'^analytics/?$', views.AnalyticsView.as_view(), name='analytics'),
    re_path(r'^analytics/dashboard/?$', views.DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    
    # LLM integration endpoints
    re_path(r'^llm/?$', views.LLMIntegrationView.as_view(), name='llm-integration'),
]
