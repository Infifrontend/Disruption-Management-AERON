import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { FlightTracking } from './pages/FlightTracking'
import { DisruptionPage } from './pages/DisruptionPage'
import { RecoveryOptions } from './pages/RecoveryOptions'
import { ComparisonPage } from './pages/ComparisonPage'
import { DetailedPlan } from './pages/DetailedPlan'
import { PredictionDashboard } from './pages/PredictionDashboard'
import { PredictionAnalyticsPage } from './pages/PredictionAnalyticsPage'
import { RiskAssessmentPage } from './pages/RiskAssessmentPage'
import { PendingSolutionsPage } from './pages/PendingSolutionsPage'
import { PastLogsPage } from './pages/PastLogsPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { PassengerServicesPage } from './pages/PassengerServicesPage'
import { HOTACPage } from './pages/HOTACPage'
import { FuelOptimizationPage } from './pages/FuelOptimizationPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { AppProvider } from './context/AppContext'
import { useCustomAlert } from './hooks/useCustomAlert'
import { alertService } from './services/alertService';
import { CustomAlertDialog } from './components/CustomAlertDialog'
import './styles/globals.css'
import { LoginPage } from './pages/LoginPage' // Assuming LoginPage component is created
import { ProtectedRoute } from './components/ProtectedRoute' // Assuming ProtectedRoute component is created
import { useAirlineTheme } from './hooks/useAirlineTheme'

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading Flydubai AERON...</p>
    </div>
  </div>
)

export default function App() {
  const { alertState, showAlert, hideAlert, handleConfirm, handleCancel } = useCustomAlert();
  const { airlineConfig } = useAirlineTheme();

  // Initialize alert service
  React.useEffect(() => {
    alertService.setShowAlertCallback(showAlert);
  }, [showAlert]);

  // Update document title based on airline and inject theme
  React.useEffect(() => {
    document.title = `${airlineConfig.displayName} AERON - Airline Recovery Operations Network`;
    // Force theme injection to ensure variables are set
    import('./config/airlineConfig').then(({ injectAirlineTheme }) => {
      injectAirlineTheme();
    });
  }, [airlineConfig]);

  return (
    <AppProvider>
      <Router basename={import.meta.env.VITE_FRONTEND_BASE_URL || '/'}>
        <div className="min-h-screen bg-background">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flight-tracking"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <FlightTracking />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/disruption"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DisruptionPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recovery"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <RecoveryOptions />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comparison"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ComparisonPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/detailed"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DetailedPlan />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prediction-dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PredictionDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prediction-analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PredictionAnalyticsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/risk-assessment"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <RiskAssessmentPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pending"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PendingSolutionsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/past-logs"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PastLogsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <ProtectedRoute requiredUserType="super_admin">
                    <Layout>
                      <MaintenancePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/passengers"
                element={
                  <ProtectedRoute requiredUserType="passenger_manager">
                    <Layout>
                      <PassengerServicesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hotac"
                element={
                  <ProtectedRoute requiredUserType="crew_manager">
                    <Layout>
                      <HOTACPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fuel-optimization"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <FuelOptimizationPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ReportsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requiredUserType="super_admin">
                    <Layout>
                      <SettingsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
      <CustomAlertDialog
        isOpen={alertState.isOpen}
        onOpenChange={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        showCancel={alertState.showCancel}
      />
    </AppProvider>
  )
}