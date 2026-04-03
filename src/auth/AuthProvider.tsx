import { useEffect, useState } from 'react'
import { LayoutDashboard, Briefcase, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import {
  DemoContext, DEMO_AREA_ID,
  DEMO_EMPLOYEES, DEMO_ALL_EMPLOYEES, DEMO_JEFES, DEMO_AREAS, DEMO_EVALUATIONS, DEMO_ADMIN,
  DEMO_PABLO_SALARY_HISTORY, DEMO_PABLO_SELF_EVAL, DEMO_PABLO_WELLBEING, DEMO_SUGGESTIONS,
  DEMO_CURRENT_SALARIES, DEMO_LEAVES, DEMO_COMUNICACIONES,
} from '../demo/demoData'

// AUTH MOCKEADO — reemplazar por Supabase Auth cuando se implemente login real
const MOCK_AREA_ID = DEMO_AREA_ID

const MOCK_ADMIN = {
  id: '8dbae71c-28e2-44bf-808a-fe78a48bef6c',
  email: 'eliseo.tapia@latinsecurities.ar',
  nombre: 'Eliseo Tapia',
  rol: 'super_admin' as const,
  area_id: null,
  area_nombre: undefined,
}

const MOCK_MANAGER = {
  id: '8dbae71c-28e2-44bf-808a-fe78a48bef6c',
  email: 'eliseo.tapia@latinsecurities.ar',
  nombre: 'Eliseo Tapia',
  rol: 'area_manager' as const,
  area_id: MOCK_AREA_ID,
  area_nombre: 'Banca Privada',
}

const MOCK_EMPLOYEE = {
  id: 'demo-emp-001',
  email: 'p.rodriguez@latinsecurities.ar',
  nombre: 'Pablo Rodríguez',
  rol: 'empleado' as const,
  area_id: DEMO_AREA_ID,
  area_nombre: 'Banca Privada',
  empleado_id: 'demo-emp-001',
}

const USERS = [MOCK_ADMIN, MOCK_MANAGER, MOCK_EMPLOYEE]

const TOGGLE_CONFIG = [
  { label: 'Central Management', icon: LayoutDashboard, bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.35)',  color: '#a5b4fc' },
  { label: 'Jefe de Área', icon: Briefcase,        bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', color: '#6ee7b7' },
  { label: 'Empleado',     icon: User,             bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.35)', color: '#7dd3fc' },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()
  const [roleIdx, setRoleIdx] = useState(0)

  useEffect(() => {
    setUser(USERS[roleIdx])
    setLoading(false)
  }, [roleIdx])

  const demoValue = {
    employees: DEMO_EMPLOYEES,
    allEmployees: DEMO_ALL_EMPLOYEES,
    jefes: DEMO_JEFES,
    areas: DEMO_AREAS,
    evaluations: DEMO_EVALUATIONS,
    admin: DEMO_ADMIN,
    salaryHistory: DEMO_PABLO_SALARY_HISTORY,
    currentSalaries: DEMO_CURRENT_SALARIES,
    selfEval: DEMO_PABLO_SELF_EVAL,
    wellbeing: DEMO_PABLO_WELLBEING,
    suggestions: DEMO_SUGGESTIONS,
    leaves: DEMO_LEAVES,
    comunicaciones: DEMO_COMUNICACIONES,
  }

  const cfg = TOGGLE_CONFIG[roleIdx]
  const Icon = cfg.icon

  return (
    <DemoContext.Provider value={demoValue}>
      {children}
      <button
        onClick={() => setRoleIdx((v) => (v + 1) % 3)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium shadow-lg border transition-all"
        style={{
          background: cfg.bg,
          borderColor: cfg.border,
          color: cfg.color,
        }}
        title="Cambiar vista (demo)"
      >
        <Icon size={13} />
        Vista: {cfg.label}
      </button>
    </DemoContext.Provider>
  )
}
