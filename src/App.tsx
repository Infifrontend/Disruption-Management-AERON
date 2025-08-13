import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { FlightTracking } from './pages/FlightTracking'
import { DisruptionPage } from './pages/DisruptionPage'
import { RecoveryOptions } from './pages/RecoveryOptions'
import { ComparisonPage } from './pages/ComparisonPage'
import { DetailedPlan } from './pages/DetailedPlan'
import { PredictionDashboard } from './pages/PredictionDashboard'
import { FlightDisruptionListPage } from './pages/FlightDisruptionListPage'
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
import { CustomAlertDialog } from './components/CustomAlertDialog'
import './styles/globals.css'

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

  // Connect the alert service to our custom alert hook
  React.useEffect(() => {
    // The alertService needs to be imported here or made available in context if it's not global.
    // Assuming alertService is imported or globally available.
    // If alertService is not directly importable, you might need to adjust how it's accessed.
    // For demonstration, let's assume it's available.
    // If you encounter issues, ensure 'alertService' is correctly imported or provided.
    // Example: import { alertService } from './services/alertService';
    // For now, we'll use a placeholder to avoid runtime errors if alertService isn't defined.
    // In a real scenario, you would ensure alertService is properly set up.

    // Placeholder for alertService connection, replace with actual import if needed
    const alertService = {
      setShowAlertCallback: (callback: any) => {
        console.log("Alert callback set");
        // In a real implementation, this would store the callback to trigger alerts
        // Example: alertService.onAlert = callback;
      }
    };

    // This part assumes alertService has a method to set a callback for showing alerts.
    // If your alertService works differently, this needs adjustment.
    // For the provided thinking, it seems alertService is intended to be used to trigger alerts from anywhere.
    // The original thought process suggests making alert functions globally available.
    // This useEffect is intended to bridge the global availability of alerts with the custom hook's state management.

    // If you have a global alertService instance, you might do:
    // alertService.onShowAlert = (type, message, title, onConfirm, onCancel) => {
    //   showAlert(title, message, type, { onConfirm, onCancel });
    // };
    // Or, as per the thought process:
    // (window as any).customAlert = {
    //   success: (title: string, message: string, onConfirm?: () => void) => {
    //     showAlert(title, message, 'success', { onConfirm });
    //   }
    // };
    // The provided changes indicate a specific way to connect the service.
    // Let's adhere to the provided changes' intent:
    if (typeof window !== 'undefined') {
      (window as any).customAlert = {
        success: (title: string, message: string, onConfirm?: () => void) => {
          showAlert(title, message, 'success', { onConfirm });
        },
        error: (title: string, message: string, onConfirm?: () => void) => {
          showAlert(title, message, 'error', { onConfirm });
        },
        warning: (title: string, message: string, onConfirm?: () => void) => {
          showAlert(title, message, 'warning', { onConfirm });
        },
        info: (title: string, message: string, onConfirm?: () => void) => {
          showAlert(title, message, 'info', { onConfirm });
        }
        // Add other types as needed
      };
    }
  }, [showAlert]); // Dependency array includes showAlert to ensure it's up-to-date

  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/flight-tracking" element={<FlightTracking />} />
                <Route path="/disruption" element={<DisruptionPage />} />
                <Route path="/recovery" element={<RecoveryOptions />} />
                <Route path="/comparison" element={<ComparisonPage />} />
                <Route path="/detailed" element={<DetailedPlan />} />
                <Route path="/prediction-dashboard" element={<PredictionDashboard />} />
                <Route path="/flight-disruption-list" element={<FlightDisruptionListPage />} />
                <Route path="/prediction-analytics" element={<PredictionAnalyticsPage />} />
                <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
                <Route path="/pending" element={<PendingSolutionsPage />} />
                <Route path="/past-logs" element={<PastLogsPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/passengers" element={<PassengerServicesPage />} />
                <Route path="/hotac" element={<HOTACPage />} />
                <Route path="/fuel-optimization" element={<FuelOptimizationPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
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