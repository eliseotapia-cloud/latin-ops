import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { Employee } from '../../types'

const CATEGORIES = [
  { key: 'productividad', label: 'Productividad', desc: 'Cumplimiento de objetivos y tareas' },
  { key: 'calidad', label: 'Calidad de trabajo', desc: 'Precisión y prolijidad en resultados' },
  { key: 'compromiso', label: 'Compromiso', desc: 'Actitud, puntualidad e iniciativa' },
  { key: 'autonomia', label: 'Autonomía', desc: 'Capacidad de resolver sin supervisión' },
  { key: 'trabajo_equipo', label: 'Trabajo en equipo', desc: 'Colaboración y comunicación' },
] as const

type CategoryKey = typeof CATEGORIES[number]['key']

const SCORE_LABELS = ['', 'Muy bajo', 'Bajo', 'Regular', 'Bueno', 'Excelente']

export function EvaluationForm() {
  const { id: empleadoId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [scores, setScores] = useState<Record<CategoryKey, number>>({
    productividad: 0, calidad: 0, compromiso: 0, autonomia: 0, trabajo_equipo: 0,
  })
  const [comentarios, setComentarios] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyEvaluated, setAlreadyEvaluated] = useState(false)

  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  useEffect(() => {
    if (empleadoId) loadData(empleadoId)
  }, [empleadoId])

  async function loadData(id: string) {
    const { data: emp } = await supabase.from('empleados').select('*, areas(nombre)').eq('id', id).single()
    setEmployee(emp as any)

    // Verificar si ya existe evaluación este mes
    const { data: existing } = await supabase
      .from('evaluaciones')
      .select('*')
      .eq('empleado_id', id)
      .eq('periodo_mes', mes)
      .eq('periodo_anio', anio)
      .single()

    if (existing) {
      setAlreadyEvaluated(true)
      setScores({
        productividad: existing.productividad,
        calidad: existing.calidad,
        compromiso: existing.compromiso,
        autonomia: existing.autonomia,
        trabajo_equipo: existing.trabajo_equipo,
      })
      setComentarios(existing.comentarios ?? '')
    }
  }

  const scoreGeneral = Object.values(scores).every((v) => v > 0)
    ? (Object.values(scores).reduce((a, b) => a + b, 0) / 5)
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (Object.values(scores).some((v) => v === 0)) {
      setError('Completá todas las categorías.')
      return
    }
    setError(null)
    setSaving(true)

    const payload = {
      empleado_id: empleadoId,
      evaluador_id: user!.id,
      periodo_mes: mes,
      periodo_anio: anio,
      ...scores,
      score_general: parseFloat(scoreGeneral.toFixed(2)),
      comentarios: comentarios || null,
    }

    const { error: err } = alreadyEvaluated
      ? await supabase.from('evaluaciones').update(payload)
          .eq('empleado_id', empleadoId!).eq('periodo_mes', mes).eq('periodo_anio', anio)
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
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="card flex flex-col gap-5">
          {CATEGORIES.map(({ key, label, desc }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                {scores[key] > 0 && (
                  <span className="text-xs text-brand-500 font-medium">{SCORE_LABELS[scores[key]]}</span>
                )}
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, [key]: n }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      scores[key] === n
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'bg-surface-3 border-white/10 text-slate-400 hover:border-brand-500/50 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Score preview */}
        {scoreGeneral > 0 && (
          <div className="card bg-brand-500/10 border-brand-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Score general</span>
              <span className="text-2xl font-bold text-white">{scoreGeneral.toFixed(2)} / 5</span>
            </div>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(scoreGeneral / 5) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Comentarios */}
        <div className="card">
          <label className="text-xs font-medium text-slate-400 block mb-2">Comentarios (opcional)</label>
          <textarea
            className="input resize-none h-24"
            placeholder="Descripción del desempeño del mes, logros destacados, áreas a mejorar..."
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
