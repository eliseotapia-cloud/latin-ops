import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Edit2, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRole } from '../../hooks/useRole'
import type { Employee, Salary, Evaluation } from '../../types'
import { LEVEL_LABELS, LEVEL_COLORS, RESULT_LABELS, RESULT_COLORS, calcScore, trimLabel } from '../../types'

const EVAL_CATEGORIES = [
  { key: 'productividad' as const, label: 'Productividad' },
  { key: 'calidad' as const,       label: 'Calidad' },
  { key: 'compromiso' as const,    label: 'Compromiso' },
  { key: 'autonomia' as const,     label: 'Autonomía' },
  { key: 'trabajo_equipo' as const, label: 'Trabajo en equipo' },
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useRole()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [salary, setSalary] = useState<Salary | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [showSalary, setShowSalary] = useState(false)
  const [loading, setLoading] = useState(true)

  const basePath = isAdmin ? '/equipo' : '/mi-equipo'

  useEffect(() => {
    if (id) loadData(id)
  }, [id])

  async function loadData(empId: string) {
    setLoading(true)
    const [{ data: emp }, { data: sal }, { data: evals }] = await Promise.all([
      supabase.from('empleados').select('*, areas(nombre)').eq('id', empId).single(),
      supabase.from('sueldos').select('*').eq('empleado_id', empId).is('fecha_hasta', null).single(),
      supabase.from('evaluaciones').select('*').eq('empleado_id', empId)
        .order('anio', { ascending: false })
        .order('trimestre', { ascending: false })
        .limit(8),
    ])
    setEmployee(emp as any)
    setSalary(sal)
    setEvaluations(evals ?? [])
    setLoading(false)
  }

  if (loading) return <Loader />
  if (!employee) return <p className="p-6 text-slate-400">Empleado no encontrado.</p>

  const lastEval = evaluations[0]

  return (
    <div className="p-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate(basePath)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} />
        Volver al equipo
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={`${employee.nombre} ${employee.apellido}`} size="lg" />
          <div>
            <h1 className="text-xl font-semibold text-white">{employee.nombre} {employee.apellido}</h1>
            <p className="text-slate-400 text-sm">{employee.puesto} — {(employee as any).areas?.nombre}</p>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={employee.estado} />
              <span className="text-xs text-slate-500">
                Desde {new Date(employee.fecha_ingreso).toLocaleDateString('es-AR')}
              </span>
              {employee.legajo_sincronizado && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <ExternalLink size={11} /> Legajo #{employee.legajo_externo_id}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link to={`${basePath}/${id}/editar`} className="btn-ghost flex items-center gap-2">
          <Edit2 size={14} />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Sueldo */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Sueldo bruto vigente</h2>
            <button
              onClick={() => setShowSalary(!showSalary)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {showSalary ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {salary ? (
            <div>
              <p className="text-2xl font-semibold text-white">
                {showSalary ? formatCurrency(salary.monto_bruto) : '$ ••••••••'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Desde {new Date(salary.fecha_desde).toLocaleDateString('es-AR')}
                {salary.motivo_cambio && ` — ${salary.motivo_cambio}`}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Sin sueldo registrado</p>
          )}
        </div>

        {/* Última evaluación */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Última evaluación</h2>
            {lastEval && (
              <span className="text-xs text-slate-500">
                {trimLabel(lastEval.trimestre, lastEval.anio)}
              </span>
            )}
          </div>
          {lastEval ? (
            <div>
              <div className="mb-3">
                <span className={`text-sm px-3 py-1 rounded-full border font-semibold ${RESULT_COLORS[lastEval.resultado]}`}>
                  {RESULT_LABELS[lastEval.resultado]}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {EVAL_CATEGORIES.map(({ key, label }) => {
                  const lvl = lastEval[key]
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-28">{label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${LEVEL_COLORS[lvl]}`}>
                        {LEVEL_LABELS[lvl]}
                      </span>
                    </div>
                  )
                })}
              </div>
              {lastEval.comentarios && (
                <p className="text-xs text-slate-400 mt-3 italic">"{lastEval.comentarios}"</p>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Sin evaluaciones aún</p>
          )}
        </div>
      </div>

      {/* Historial de evaluaciones */}
      {evaluations.length > 1 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Historial de performance</h2>
          <div className="flex flex-col divide-y divide-white/5">
            {evaluations.map((ev) => {
              const score = calcScore(ev)
              return (
                <div key={ev.id} className="flex items-center gap-4 py-3">
                  <span className="text-xs text-slate-500 w-16">
                    {trimLabel(ev.trimestre, ev.anio)}
                  </span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-32">
                    <div
                      className={`h-full rounded-full ${score >= 3.6 ? 'bg-emerald-500' : score >= 3.0 ? 'bg-brand-500' : score >= 2.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${(score / 4) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RESULT_COLORS[ev.resultado]}`}>
                    {RESULT_LABELS[ev.resultado]}
                  </span>
                  {ev.comentarios && (
                    <span className="text-xs text-slate-500 flex-1 truncate italic">"{ev.comentarios}"</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('')
  const cls = size === 'lg' ? 'w-14 h-14 text-base' : 'w-8 h-8 text-xs'
  return (
    <div className={`${cls} rounded-full bg-brand-500/20 flex items-center justify-center shrink-0`}>
      <span className="font-medium text-brand-500">{initials.toUpperCase()}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { activo: 'badge-active', baja: 'badge-inactive', licencia: 'badge-leave' }
  const labels: Record<string, string> = { activo: 'Activo', baja: 'Baja', licencia: 'Licencia' }
  return <span className={map[status] ?? ''}>{labels[status] ?? status}</span>
}

function Loader() {
  return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
