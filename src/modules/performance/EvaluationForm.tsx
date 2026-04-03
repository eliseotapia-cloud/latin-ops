import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useDemoData } from '../../demo/demoData'
import type { Employee, PerformanceLevel } from '../../types'
import {
  LEVEL_LABELS, LEVEL_COLORS, LEVEL_SCORE,
  calcResult, RESULT_LABELS, RESULT_COLORS,
  currentTrimestre, trimLabel,
} from '../../types'

const CATEGORIES = [
  { key: 'productividad' as const,   label: 'Productividad',     desc: 'Cumplimiento de objetivos y tareas' },
  { key: 'calidad' as const,         label: 'Calidad de trabajo', desc: 'Precisión y prolijidad en resultados' },
  { key: 'compromiso' as const,      label: 'Compromiso',         desc: 'Actitud, puntualidad e iniciativa' },
  { key: 'autonomia' as const,       label: 'Autonomía',          desc: 'Capacidad de resolver sin supervisión' },
  { key: 'trabajo_equipo' as const,  label: 'Trabajo en equipo',  desc: 'Colaboración y comunicación' },
]

type CategoryKey = typeof CATEGORIES[number]['key']

const LEVELS: PerformanceLevel[] = ['supera', 'cumple', 'desarrollo', 'atencion']

export function EvaluationForm() {
  const { id: empleadoId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const demo = useDemoData()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [levels, setLevels] = useState<Record<CategoryKey, PerformanceLevel | null>>({
    productividad: null, calidad: null, compromiso: null, autonomia: null, trabajo_equipo: null,
  })
  const [justificaciones, setJustificaciones] = useState<Record<CategoryKey, string>>({
    productividad: '', calidad: '', compromiso: '', autonomia: '', trabajo_equipo: '',
  })
  const [comentarios, setComentarios] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyEvaluated, setAlreadyEvaluated] = useState(false)

  const trimestre = currentTrimestre()
  const anio = new Date().getFullYear()
  const periodoLabel = trimLabel(trimestre, anio)

  useEffect(() => {
    if (empleadoId) loadData(empleadoId)
  }, [empleadoId])

  async function loadData(id: string) {
    if (demo) {
      const emp = demo.allEmployees.find((e) => e.id === id)
      if (emp) setEmployee(emp as any)
      const existing = demo.evaluations.get(id)
      if (existing) {
        setAlreadyEvaluated(true)
        setLevels({
          productividad: existing.productividad,
          calidad: existing.calidad,
          compromiso: existing.compromiso,
          autonomia: existing.autonomia,
          trabajo_equipo: existing.trabajo_equipo,
        })
        setJustificaciones({
          productividad: existing.justificaciones?.productividad ?? '',
          calidad: existing.justificaciones?.calidad ?? '',
          compromiso: existing.justificaciones?.compromiso ?? '',
          autonomia: existing.justificaciones?.autonomia ?? '',
          trabajo_equipo: existing.justificaciones?.trabajo_equipo ?? '',
        })
        setComentarios(existing.comentarios ?? '')
      }
      return
    }

    const { data: emp } = await supabase.from('empleados').select('*, areas(nombre)').eq('id', id).single()
    setEmployee(emp as any)

    const { data: existing } = await supabase
      .from('evaluaciones')
      .select('*')
      .eq('empleado_id', id)
      .eq('trimestre', trimestre)
      .eq('anio', anio)
      .single()

    if (existing) {
      setAlreadyEvaluated(true)
      setLevels({
        productividad: existing.productividad,
        calidad: existing.calidad,
        compromiso: existing.compromiso,
        autonomia: existing.autonomia,
        trabajo_equipo: existing.trabajo_equipo,
      })
      setComentarios(existing.comentarios ?? '')
    }
  }

  const allFilled = Object.values(levels).every((v) => v !== null)

  const computedResult = allFilled
    ? calcResult(Object.values(levels) as PerformanceLevel[])
    : null

  // Anti-gaming: check if >40% of team would be top_performer
  const teamSize = demo?.employees.length ?? 0
  const currentTopPerformers = demo
    ? Array.from(demo.evaluations.values()).filter((ev) => {
        // exclude the current employee from count so we don't double count
        if (ev.empleado_id === empleadoId) return false
        return ev.resultado === 'top_performer'
      }).length
    : 0
  // If this eval would be top_performer, would that make >40% of team top?
  const wouldBeTop = computedResult === 'top_performer'
  const newTopCount = currentTopPerformers + (wouldBeTop ? 1 : 0)
  const topPercentage = teamSize > 0 ? (newTopCount / teamSize) * 100 : 0
  const showCalibrationWarning = wouldBeTop && topPercentage > 40

  // Justification validation: supera requires 30+ chars
  function justifRequired(key: CategoryKey) {
    return levels[key] === 'supera'
  }

  function justifValid(key: CategoryKey) {
    if (!justifRequired(key)) return true
    return justificaciones[key].trim().length >= 30
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allFilled) {
      setError('Completá todas las categorías.')
      return
    }
    // Validate justifications
    for (const cat of CATEGORIES) {
      if (justifRequired(cat.key) && !justifValid(cat.key)) {
        setError(`Completá la justificación de "${cat.label}" (mín. 30 caracteres).`)
        return
      }
    }
    setError(null)
    setSaving(true)

    if (demo) {
      navigate('/performance')
      return
    }

    const filledLevels = levels as Record<CategoryKey, PerformanceLevel>
    const resultado = calcResult(Object.values(filledLevels))

    const payload = {
      empleado_id: empleadoId,
      evaluador_id: user!.id,
      trimestre,
      anio,
      ...filledLevels,
      justificaciones,
      comentarios: comentarios || null,
      resultado,
    }

    const { error: err } = alreadyEvaluated
      ? await supabase.from('evaluaciones').update(payload)
          .eq('empleado_id', empleadoId!).eq('trimestre', trimestre).eq('anio', anio)
      : await supabase.from('evaluaciones').insert(payload)

    if (err) setError('Error al guardar la evaluación.')
    else navigate('/performance')
    setSaving(false)
  }

  if (!employee) return <Loader />

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => navigate('/performance')} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} />
        Volver a Performance
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">
          {alreadyEvaluated ? 'Editar evaluación' : 'Evaluar empleado'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {employee.nombre} {employee.apellido} — {(employee as any).areas?.nombre}
        </p>
        <p className="text-xs text-brand-500 mt-1 font-medium">{periodoLabel}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="card flex flex-col gap-6">
          {CATEGORIES.map(({ key, label, desc }) => (
            <div key={key}>
              <div className="mb-2">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              {/* Level selector — big pills */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {LEVELS.map((lvl) => {
                  const isSelected = levels[key] === lvl
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevels((s) => ({ ...s, [key]: lvl }))}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                        isSelected
                          ? LEVEL_COLORS[lvl]
                          : 'bg-surface-3 border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {LEVEL_LABELS[lvl]}
                    </button>
                  )
                })}
              </div>
              {/* Justification field for 'supera' */}
              {levels[key] === 'supera' && (
                <div className="mt-3">
                  <label className="text-xs font-medium text-emerald-400 block mb-1">
                    Ejemplo concreto que justifica "Supera expectativas" *
                  </label>
                  <textarea
                    className="input resize-none h-16 text-xs"
                    placeholder="Describí un ejemplo concreto que justifique esta calificación (mín. 30 caracteres)"
                    value={justificaciones[key]}
                    onChange={(e) => setJustificaciones((s) => ({ ...s, [key]: e.target.value }))}
                  />
                  <p className={`text-xs mt-0.5 ${justificaciones[key].trim().length >= 30 ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {justificaciones[key].trim().length}/30 mín.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Result preview */}
        {computedResult && (
          <div className={`card border ${RESULT_COLORS[computedResult]}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Resultado calculado</span>
              <span className={`text-base font-bold px-3 py-1 rounded-full border ${RESULT_COLORS[computedResult]}`}>
                {RESULT_LABELS[computedResult]}
              </span>
            </div>
            {allFilled && (
              <div className="mt-2 text-xs text-slate-400">
                Promedio: {(Object.values(levels).map((l) => LEVEL_SCORE[l!]).reduce((a, b) => a + b, 0) / 5).toFixed(2)} / 4
              </div>
            )}
          </div>
        )}

        {/* Anti-gaming calibration warning */}
        {showCalibrationWarning && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-1">Calibración requerida</p>
              <p className="text-sm text-amber-400/80">
                Más del 40% de tu equipo sería Top Performer. El estándar del mercado es 15-20%. Revisá tus evaluaciones.
              </p>
            </div>
          </div>
        )}

        {/* Comentarios */}
        <div className="card">
          <label className="text-xs font-medium text-slate-400 block mb-2">Comentarios (opcional)</label>
          <textarea
            className="input resize-none h-24"
            placeholder="Descripción del desempeño del trimestre, logros destacados, áreas a mejorar..."
            maxLength={500}
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1 text-right">{comentarios.length}/500</p>
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            <Save size={14} />
            {saving ? 'Guardando...' : 'Guardar evaluación'}
          </button>
          <button type="button" onClick={() => navigate('/performance')} className="btn-ghost">Cancelar</button>
        </div>
      </form>
    </div>
  )
}

function Loader() {
  return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
