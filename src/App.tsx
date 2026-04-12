import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './auth/LoginPage'
import { AppLayout } from './components/layout/AppLayout'
import { AdminDashboard } from './modules/dashboard/AdminDashboard'
import { ManagerDashboard } from './modules/dashboard/ManagerDashboard'
import { EmployeeDashboard } from './modules/employee/EmployeeDashboard'
import { SalaryHistoryPage } from './modules/employee/SalaryHistoryPage'
import { SelfEvaluationPage } from './modules/employee/SelfEvaluationPage'
import { SuggestionsPage } from './modules/suggestions/SuggestionsPage'
import { TeamPage } from './modules/team/TeamPage'
import { EquipoSueldosPage } from './modules/team/EquipoSueldosPage'
import { EmployeeDetail } from './modules/team/EmployeeDetail'
import { EmployeeForm } from './modules/team/EmployeeForm'
import { SalariesPage } from './modules/salaries/SalariesPage'
import { PerformancePage } from './modules/performance/PerformancePage'
import { EvaluationForm } from './modules/performance/EvaluationForm'
import { MiLegajoPage } from './modules/milegajo/MiLegajoPage'
import { ImportPage } from './modules/team/ImportPage'
import { ComunicacionesPage } from './modules/comunicaciones/ComunicacionesPage'
import { CalendarioPage } from './modules/calendario/CalendarioPage'
import { CalendarioAdminPage } from './modules/calendario/CalendarioAdminPage'
import { MiCalendarioPage } from './modules/employee/MiCalendarioPage'
import { PresentacionesPage } from './modules/presentaciones/PresentacionesPage'
import { OnboardingAdminPage } from './modules/onboarding/OnboardingAdminPage'
import { OnboardingEmpleadoPage } from './modules/onboarding/OnboardingEmpleadoPage'
import { useRole } from './hooks/useRole'

function DashboardRouter() {
  const { isAdmin, isEmployee } = useRole()
  if (isAdmin) return <AdminDashboard />
  if (isEmployee) return <EmployeeDashboard />
  return <ManagerDashboard />
}

function TeamRouter() {
  // Admin usa /equipo, Manager usa /mi-equipo — ambas renderizan TeamPage
  return <TeamPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* App con layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard — se adapta al rol */}
            <Route path="/" element={<DashboardRouter />} />

            {/* ADMIN: Equipo */}
            <Route
              path="/equipo"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <TeamRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipo/nuevo"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipo/importar"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <ImportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipo/:id"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <EmployeeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipo/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />

            {/* ADMIN: Sueldos */}
            <Route
              path="/sueldos"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SalariesPage />
                </ProtectedRoute>
              }
            />

            {/* ADMIN: Calendario */}
            <Route
              path="/calendario"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <CalendarioAdminPage />
                </ProtectedRoute>
              }
            />

            {/* Comunicaciones — todos los roles */}
            <Route path="/comunicaciones" element={<ComunicacionesPage />} />

            {/* MANAGER: Mi Equipo + Sueldos (unificado) */}
            <Route
              path="/mi-equipo"
              element={
                <ProtectedRoute allowedRoles={['area_manager']}>
                  <EquipoSueldosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mi-equipo/nuevo"
              element={
                <ProtectedRoute allowedRoles={['area_manager']}>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mi-equipo/:id"
              element={
                <ProtectedRoute allowedRoles={['area_manager']}>
                  <EmployeeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mi-equipo/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['area_manager']}>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />

            {/* MANAGER: Mi Legajo */}
            <Route
              path="/mi-legajo"
              element={
                <ProtectedRoute allowedRoles={['area_manager']}>
                  <MiLegajoPage />
                </ProtectedRoute>
              }
            />

            {/* MANAGER: Calendario de licencias */}
            <Route
              path="/calendario"
              element={
                <ProtectedRoute allowedRoles={['area_manager']}>
                  <CalendarioPage />
                </ProtectedRoute>
              }
            />

            {/* MANAGER: Presentaciones */}
            <Route
              path="/presentaciones"
              element={
                <ProtectedRoute allowedRoles={['area_manager']}>
                  <PresentacionesPage />
                </ProtectedRoute>
              }
            />

            {/* Performance — ambos roles */}
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/performance/evaluar/:id" element={<EvaluationForm />} />
            <Route path="/performance/empleado/:id" element={<EmployeeDetail />} />

            {/* EMPLOYEE: Calendario */}
            <Route
              path="/mi-calendario"
              element={
                <ProtectedRoute allowedRoles={['empleado']}>
                  <MiCalendarioPage />
                </ProtectedRoute>
              }
            />

            {/* EMPLOYEE routes */}
            <Route
              path="/mi-sueldo"
              element={
                <ProtectedRoute allowedRoles={['empleado']}>
                  <SalaryHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mi-evaluacion"
              element={
                <ProtectedRoute allowedRoles={['empleado']}>
                  <SelfEvaluationPage />
                </ProtectedRoute>
              }
            />

            {/* ADMIN: Onboarding management */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <OnboardingAdminPage />
                </ProtectedRoute>
              }
            />

            {/* EMPLOYEE: Mi Onboarding */}
            <Route
              path="/mi-onboarding"
              element={
                <ProtectedRoute allowedRoles={['empleado']}>
                  <OnboardingEmpleadoPage />
                </ProtectedRoute>
              }
            />

            {/* Shared route (all roles) */}
            <Route path="/sugerencias" element={<SuggestionsPage />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
