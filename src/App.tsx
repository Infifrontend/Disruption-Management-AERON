
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
    </AppProvider>
  )
}
