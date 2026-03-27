import { useEffect, useState } from 'react'
import { Users, BarChart2, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useRole } from '../../hooks/useRole'
import type { Employee } from '../../types'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export function ManagerDashboard() {
  const { areaId, user } = useRole()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [pendingEvals, setPendingEvals] = useState<Employee[]>([])
  const [teamScore, setTeamScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  useEffect(() => {
    if (areaId) loadData()
  }, [areaId])

  async function loadData() {
    setLoading(true)
    try {
      const { data: emps } = await supabase
        .from('empleados')
        .select('*')
        .eq('area_id', areaId!)
        .eq('estado', 'activo')
        .order('apellido')

      if (!emps) return

      setEmployees(emps)

      // Evaluaciones del mes actual
      const { data: evals } = await supabase
        .from('evaluaciones')
        .select('empleado_id, score_general')
        .eq('periodo_mes', mes)
        .eq('periodo_anio', anio)
        .in('empleado_id', emps.map((e) => e.id))

      const evalMap = new Map((evals ?? []).map((e: any) => [e.empleado_id, e.score_general]))

      const pending = emps.filter((e) => !evalMap.has(e.id))
      setPendingEvals(pending)

      const scores = Array.from(evalMap.values()) as number[]
      setTeamScore(scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null)
    } finally {
      setLoading(false)
    }
  }

  const nombre = user?.nombre?.split(' ')[0] ?? ''

  if (loading) return <PageLoader />

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Buen día, {nombre}.</h1>
        <p className="text-slate-400 text-sm mt-1">
          Área: <span className="text-white">{user?.area_nombre}</span> — {MONTHS[now.getMonth()]} {anio}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-brand-500" />
            <span className="text-xs text-slate-400">Empleados activos</span>
          </div>
          <p className="text-2xl font-semibold text-white">{employees.length}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={16} className="text-violet-400" />
            <span className="text-xs text-slate-400">Score del equipo</span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {teamScore ? `${teamScore.toFixed(1)} / 5` : '—'}
          </p>
          <p className="text-xs text-slate-500">{MONTHS[now.getMonth()]} {anio}</p>
        </div>
      </div>

      {/* Alerta evaluaciones pendientes */}
      {pendingEvals.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">
              {pendingEvals.length} {pendingEvals.length === 1 ? 'empleado sin evaluar' : 'empleados sin evaluar'} este mes
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {pendingEvals.map((e) => `${e.nombre} ${e.apellido}`).join(', ')}
            </p>
          </div>
          <Link to="/performance" className="text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap">
            Ir a evaluar →
          </Link>
        </div>
      )}

      {/* Equipo rápido */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Mi Equipo</h2>
          <Link to="/mi-equipo" className="text-xs text-brand-500 hover:text-brand-400">Ver todos →</Link>
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {employees.slice(0, 6).map((emp) => (
            <Link
              key={emp.id}
              to={`/mi-equipo/${emp.id}`}
              className="flex items-center gap-3 py-3 hover:bg-white/2 -mx-5 px-5 transition-colors"
            >
              <Avatar name={`${emp.nombre} ${emp.apellido}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{emp.nombre} {emp.apellido}</p>
                <p className="text-xs text-slate-500">{emp.puesto}</p>
              </div>
              <StatusBadge status={emp.estado} />
            </Link>
          ))}
          {employees.length === 0 && (
            <p className="text-slate-500 text-sm py-4">No hay empleados en tu equipo aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('')
  return (
    <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
      <span className="text-xs font-medium text-brand-500">{initials.toUpperCase()}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    activo: 'badge-active',
    baja: 'badge-inactive',
    licencia: 'badge-leave',
  }
  const labels: Record<string, string> = { activo: 'Activo', baja: 'Baja', licencia: 'Licencia' }
  return <span className={map[status] ?? ''}>{labels[status] ?? status}</span>
}

function PageLoader() {
  return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
