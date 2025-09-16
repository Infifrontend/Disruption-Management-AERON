
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()

# URL patterns for the aeron app
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/verify/', views.TokenVerifyView.as_view(), name='token-verify'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    
    # Settings endpoints
    path('settings/', views.SettingsListView.as_view(), name='settings-list'),
    path('settings/tabs/', views.SettingsTabsView.as_view(), name='settings-tabs'),
    path('settings/batch/', views.SettingsBatchUpdateView.as_view(), name='settings-batch'),
    
    # Screen settings endpoints
    path('screen-settings/', views.ScreenSettingsView.as_view(), name='screen-settings'),
    
    # Custom rules endpoints
    path('custom-rules/', views.CustomRulesView.as_view(), name='custom-rules'),
    
    # Flight disruption endpoints
    path('disruptions/', views.DisruptionsView.as_view(), name='disruptions'),
    path('disruptions/bulk/', views.DisruptionsBulkView.as_view(), name='disruptions-bulk'),
    
    # Recovery options endpoints
    path('recovery-options/', views.RecoveryOptionsView.as_view(), name='recovery-options'),
    path('recovery-options/generate/', views.RecoveryOptionsGenerateView.as_view(), name='recovery-options-generate'),
    
    # Passenger services endpoints
    path('passengers/', views.PassengerServicesView.as_view(), name='passengers'),
    path('passengers/lookup/', views.PassengerLookupView.as_view(), name='passenger-lookup'),
    
    # Crew management endpoints
    path('crew/', views.CrewManagementView.as_view(), name='crew'),
    path('crew/available/', views.CrewAvailabilityView.as_view(), name='crew-available'),
    
    # Aircraft management endpoints
    path('aircraft/', views.AircraftManagementView.as_view(), name='aircraft'),
    path('aircraft/available/', views.AircraftAvailabilityView.as_view(), name='aircraft-available'),
    
    # Analytics endpoints
    path('analytics/', views.AnalyticsView.as_view(), name='analytics'),
    path('analytics/dashboard/', views.DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    
    # LLM integration endpoints
    path('llm/', views.LLMIntegrationView.as_view(), name='llm-integration'),
]
