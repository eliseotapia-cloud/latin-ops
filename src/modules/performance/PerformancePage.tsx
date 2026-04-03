import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, TrendingUp, AlignCenter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRole } from '../../hooks/useRole'
import { useDemoData } from '../../demo/demoData'
import type { Employee, Evaluation, PerformanceResult } from '../../types'
import {
  LEVEL_LABELS, LEVEL_SCORE, RESULT_LABELS, RESULT_COLORS,
  currentTrimestre, trimLabel,
} from '../../types'

const CATEGORIES = [
  { key: 'productividad' as const,   label: 'Productividad' },
  { key: 'calidad' as const,         label: 'Calidad' },
  { key: 'compromiso' as const,      label: 'Compromiso' },
  { key: 'autonomia' as const,       label: 'Autonomía' },
  { key: 'trabajo_equipo' as const,  label: 'Trabajo en equipo' },
]

export function PerformancePage() {
  const { isAdmin, areaId } = useRole()
  const demo = useDemoData()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [evalMap, setEvalMap] = useState<Map<string, Evaluation>>(new Map())
  const [loading, setLoading] = useState(true)

  const trimestre = currentTrimestre()
  const anio = new Date().getFullYear()
  const periodoLabel = trimLabel(trimestre, anio)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    if (demo) {
      // Admin: visualiza todos los empleados, pero la lista de "pendientes a evaluar" son solo los jefes
      setEmployees((isAdmin ? demo.allEmployees : demo.employees) as any)
      setEvalMap(demo.evaluations)
      setLoading(false)
      return
    }

    let empQuery = supabase.from('empleados').select('*, areas(nombre)').eq('estado', 'activo').order('apellido')
    if (!isAdmin) empQuery = empQuery.eq('area_id', areaId!)

    const { data: emps } = await empQuery
    if (!emps) { setLoading(false); return }
    setEmployees(emps as any)

    const { data: evals } = await supabase
      .from('evaluaciones')
      .select('*')
      .eq('trimestre', trimestre)
      .eq('anio', anio)
      .in('empleado_id', emps.map((e) => e.id))

    const map = new Map((evals ?? []).map((e: any) => [e.empleado_id, e]))
    setEvalMap(map)
    setLoading(false)
  }

  const evaluated = employees.filter((e) => evalMap.has(e.id))

  // Admin: pendientes son solo los jefes de área sin evaluación
  // Manager: pendientes son sus empleados sin evaluación
  const pendingSource = isAdmin && demo ? (demo.jefes as any[]) : employees
  const pending = pendingSource.filter((e: Employee) => !evalMap.has(e.id))

  // Ranking by score desc
  const ranking = [...evaluated].sort((a, b) => {
    const ea = evalMap.get(a.id)!
    const eb = evalMap.get(b.id)!
    const sa = [ea.productividad, ea.calidad, ea.compromiso, ea.autonomia, ea.trabajo_equipo]
      .map((l) => LEVEL_SCORE[l]).reduce((x, y) => x + y, 0)
    const sb = [eb.productividad, eb.calidad, eb.compromiso, eb.autonomia, eb.trabajo_equipo]
      .map((l) => LEVEL_SCORE[l]).reduce((x, y) => x + y, 0)
    return sb - sa
  })

  if (loading) return <Loader />

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Performance</h1>
        <p className="text-slate-400 text-sm mt-1">
          {periodoLabel}
          {isAdmin && <span className="ml-2 text-xs text-slate-500">— Evaluaciones de jefes de área a cargo del admin</span>}
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <span className="text-xs text-slate-400">{isAdmin ? 'Jefes a evaluar' : 'Total empleados'}</span>
          <p className="text-2xl font-semibold text-white">{isAdmin && demo ? demo.jefes.length : employees.length}</p>
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
              {isAdmin ? 'Jefes pendientes de evaluación' : 'Pendientes de evaluación'}
            </h2>
            <div className="flex flex-col gap-2">
              {pending.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm text-white">{emp.nombre} {emp.apellido}</p>
                    <p className="text-xs text-slate-500">
                      {emp.puesto}
                      {isAdmin && <span className="ml-1 text-slate-600">· {(emp as any).areas?.nombre}</span>}
                    </p>
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
            <p className="text-slate-500 text-sm">Sin evaluaciones este trimestre.</p>
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
                    <ResultBadge resultado={ev.resultado} />
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

      {/* Alignment analysis — admin only */}
      {isAdmin && demo && (
        <div className="mt-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <AlignCenter size={16} className="text-violet-400" />
            Análisis de Alineación Jefe / Empleado
          </h2>
          <div className="card mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/5">
                  <th className="pb-2 text-xs text-slate-400 font-medium">Empleado</th>
                  <th className="pb-2 text-xs text-slate-400 font-medium">Dimensión</th>
                  <th className="pb-2 text-xs text-slate-400 font-medium text-center">Eval Jefe</th>
                  <th className="pb-2 text-xs text-slate-400 font-medium text-center">Autoevaluación</th>
                  <th className="pb-2 text-xs text-slate-400 font-medium text-center">Gap</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const mgrEval = demo.evaluations.get('demo-emp-001')
                  const selfEval = demo.selfEval
                  if (!mgrEval || !selfEval) return null
                  return CATEGORIES.map(({ key, label }) => {
                    const mgrLevel = mgrEval[key]
                    const selfLevel = selfEval[key]
                    const mgrScore = LEVEL_SCORE[mgrLevel]
                    const selfScore = LEVEL_SCORE[selfLevel]
                    const gap = selfScore - mgrScore
                    const gapColor = gap > 1 ? 'text-red-400' : gap === 1 ? 'text-amber-400' : gap === 0 ? 'text-emerald-400' : 'text-blue-400'
                    const gapLabel = gap === 0 ? '✓ Alineado' : gap > 0 ? `↑ ${gap} nivel${gap > 1 ? 'es' : ''}` : `↓ ${Math.abs(gap)} nivel${Math.abs(gap) > 1 ? 'es' : ''}`
                    return (
                      <tr key={key} className="border-b border-white/3">
                        <td className="py-2.5 text-slate-400 text-xs">
                          {key === 'productividad' ? 'Pablo Rodríguez' : ''}
                        </td>
                        <td className="py-2.5 text-white">{label}</td>
                        <td className="py-2.5 text-center">
                          <span className="text-xs text-slate-300">{LEVEL_LABELS[mgrLevel]}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="text-xs text-white font-medium">{LEVEL_LABELS[selfLevel]}</span>
                        </td>
                        <td className={`py-2.5 text-center text-xs font-semibold ${gapColor}`}>{gapLabel}</td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>
          </div>
          <div className="card border-violet-500/20 bg-violet-500/5">
            <p className="text-sm text-slate-300">
              Pablo Rodríguez se autoevalúa con "Supera expectativas" en todas las dimensiones vs. la evaluación del jefe. Se recomienda una conversación de calibración.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultBadge({ resultado }: { resultado: PerformanceResult }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RESULT_COLORS[resultado]}`}>
      {RESULT_LABELS[resultado]}
    </span>
  )
}

function Loader() {
  return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
