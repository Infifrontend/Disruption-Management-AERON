import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppProvider } from './context/AppContext'
import { Dashboard } from './pages/Dashboard'
import { DisruptionPage } from './pages/DisruptionPage'
import { RecoveryOptions } from './pages/RecoveryOptions'
import { DetailedPlan } from './pages/DetailedPlan'
import { ComparisonPage } from './pages/ComparisonPage'
import { FlightDisruptionListPage } from './pages/FlightDisruptionListPage'
import { FlightTracking } from './pages/FlightTracking'
import { PredictionDashboard } from './pages/PredictionDashboard'
import { PredictionAnalyticsPage } from './pages/PredictionAnalyticsPage'
import { PassengerServicesPage } from './pages/PassengerServicesPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { FuelOptimizationPage } from './pages/FuelOptimizationPage'
import { HOTACPage } from './pages/HOTACPage'
import { PastLogsPage } from './pages/PastLogsPage'
import { PendingSolutionsPage } from './pages/PendingSolutionsPage'
import { ReportsPage } from './pages/ReportsPage'
import { RiskAssessmentPage } from './pages/RiskAssessmentPage'
import { SettingsPage } from './pages/SettingsPage'
import './styles/globals.css'

function App() {
  return (
    <div id="app-root" className="h-screen overflow-hidden">
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/disruption" element={<DisruptionPage />} />
              <Route path="/recovery-options" element={<RecoveryOptions />} />
              <Route path="/detailed-plan" element={<DetailedPlan />} />
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/flight-disruptions" element={<FlightDisruptionListPage />} />
              <Route path="/flight-tracking" element={<FlightTracking />} />
              <Route path="/prediction-dashboard" element={<PredictionDashboard />} />
              <Route path="/prediction-analytics" element={<PredictionAnalyticsPage />} />
              <Route path="/passenger-services" element={<PassengerServicesPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/fuel-optimization" element={<FuelOptimizationPage />} />
              <Route path="/hotac" element={<HOTACPage />} />
              <Route path="/past-logs" element={<PastLogsPage />} />
              <Route path="/pending-solutions" element={<PendingSolutionsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </div>
  )
}

export default App