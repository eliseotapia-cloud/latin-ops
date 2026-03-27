import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRole } from '../../hooks/useRole'
import type { Employee, Evaluation } from '../../types'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export function PerformancePage() {
  const { isAdmin, areaId } = useRole()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [evalMap, setEvalMap] = useState<Map<string, Evaluation>>(new Map())
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    let empQuery = supabase.from('empleados').select('*, areas(nombre)').eq('estado', 'activo').order('apellido')
    if (!isAdmin) empQuery = empQuery.eq('area_id', areaId!)

    const { data: emps } = await empQuery
    if (!emps) { setLoading(false); return }
    setEmployees(emps as any)

    const { data: evals } = await supabase
      .from('evaluaciones')
      .select('*')
      .eq('periodo_mes', mes)
      .eq('periodo_anio', anio)
      .in('empleado_id', emps.map((e) => e.id))

    const map = new Map((evals ?? []).map((e: any) => [e.empleado_id, e]))
    setEvalMap(map)
    setLoading(false)
  }

  const evaluated = employees.filter((e) => evalMap.has(e.id))
  const pending = employees.filter((e) => !evalMap.has(e.id))

  // Ranking por score (solo para manager: su equipo; para admin: todos)
  const ranking = [...evaluated].sort((a, b) => {
    const sa = evalMap.get(a.id)?.score_general ?? 0
    const sb = evalMap.get(b.id)?.score_general ?? 0
    return sb - sa
  })

  if (loading) return <Loader />

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Performance</h1>
        <p className="text-slate-400 text-sm mt-1">{MONTHS[now.getMonth()]} {anio}</p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <span className="text-xs text-slate-400">Total empleados</span>
          <p className="text-2xl font-semibold text-white">{employees.length}</p>
        </div>
        <div className="stat-card">
          <span className="text-xs text-slate-400">Evaluados</span>
          <p className="text-2xl font-semibold text-emerald-400">{evaluated.length}</p>
        </div>
        <div className="stat-card">
          <span className="text-xs text-slate-400">Pendientes</span>
          <p className="text-2xl font-semibold text-amber-400">{pending.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pendientes */}
        {pending.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ClipboardList size={16} className="text-amber-400" />
              Pendientes de evaluación
            </h2>
            <div className="flex flex-col gap-2">
              {pending.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm text-white">{emp.nombre} {emp.apellido}</p>
                    <p className="text-xs text-slate-500">{emp.puesto}</p>
                  </div>
                  <Link
                    to={`/performance/evaluar/${emp.id}`}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    Evaluar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranking */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-500" />
            Ranking {isAdmin ? 'global' : 'del equipo'}
          </h2>
          {ranking.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin evaluaciones este mes.</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {ranking.map((emp, i) => {
                const ev = evalMap.get(emp.id)!
                return (
                  <div key={emp.id} className="flex items-center gap-3 py-2.5">
                    <span className={`text-xs font-bold w-5 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{emp.nombre} {emp.apellido}</p>
                      {isAdmin && <p className="text-xs text-slate-500">{(emp as any).areas?.nombre}</p>}
                    </div>
                    <ScoreBadge score={ev.score_general} />
                    <Link to={`/performance/empleado/${emp.id}`} className="text-xs text-slate-500 hover:text-brand-500">
                      Ver →
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 4.5 ? 'text-emerald-400' : score >= 3.5 ? 'text-amber-400' : 'text-red-400'
  return <span className={`text-sm font-semibold ${color}`}>{score.toFixed(1)}</span>
}

function Loader() {
  return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
