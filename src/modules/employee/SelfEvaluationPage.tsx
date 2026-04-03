import { useState } from 'react'
import { Edit2, Save } from 'lucide-react'
import { useDemoData } from '../../demo/demoData'
import type { PerformanceLevel } from '../../types'
import {
  LEVEL_LABELS, LEVEL_COLORS,
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


export function SelfEvaluationPage() {
  const demo = useDemoData()
  const [showForm, setShowForm] = useState(false)
  const [levels, setLevels] = useState<Record<CategoryKey, PerformanceLevel | null>>({
    productividad: null, calidad: null, compromiso: null, autonomia: null, trabajo_equipo: null,
  })
  const [justificaciones, setJustificaciones] = useState<Record<CategoryKey, string>>({
    productividad: '', calidad: '', compromiso: '', autonomia: '', trabajo_equipo: '',
  })
  const [motivacion, setMotivacion] = useState<number | null>(null)
  const [motivacionComentario, setMotivacionComentario] = useState('')
  const [logros, setLogros] = useState('')
  const [obstaculos, setObstaculos] = useState('')
  const [necesidades, setNecesidades] = useState('')
  const [error, setError] = useState<string | null>(null)

  const trimestre = currentTrimestre()
  const anio = new Date().getFullYear()
  const periodoLabel = trimLabel(trimestre, anio)

  if (!demo) return null

  const selfEval = demo.selfEval

  const allFilled = Object.values(levels).every((v) => v !== null)

  const computedResult = allFilled
    ? calcResult(Object.values(levels) as PerformanceLevel[])
    : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allFilled) {
      setError('Completá todas las categorías.')
      return
    }
    for (const cat of CATEGORIES) {
      if (levels[cat.key] === 'supera' && justificaciones[cat.key].trim().length < 30) {
        setError(`Completá la justificación de "${cat.label}" (mín. 30 caracteres).`)
        return
      }
    }
    setShowForm(false)
    setError(null)
  }

  if (!showForm && selfEval) {
    return (
      <div className="p-6 max-w-3xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Mi Evaluación</h1>
            <p className="text-slate-400 text-sm mt-1">{periodoLabel} — Mi autoevaluación</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-ghost flex items-center gap-2 text-xs">
            <Edit2 size={13} />
            Editar autoevaluación
          </button>
        </div>

        {/* Result badge */}
        <div className="mb-4">
          <div className="card inline-block">
            <p className="text-xs text-slate-400 mb-2">Tu autoevaluación</p>
            <span className={`text-sm px-3 py-1 rounded-full border font-semibold ${RESULT_COLORS[selfEval.resultado]}`}>
              {RESULT_LABELS[selfEval.resultado]}
            </span>
          </div>
        </div>

        {/* Self-evaluation table */}
        <div className="card mb-4">
          <h2 className="text-sm font-semibold text-white mb-4">Dimensiones</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-2 text-xs text-slate-400 font-medium">Dimensión</th>
                <th className="pb-2 text-xs text-slate-400 font-medium text-center">Tu evaluación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {CATEGORIES.map(({ key, label }) => {
                const selfLevel = selfEval[key]
                return (
                  <tr key={key}>
                    <td className="py-3 text-white">{label}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[selfLevel]}`}>
                        {LEVEL_LABELS[selfLevel]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Motivación */}
        {selfEval.motivacion != null && (
          <div className="card mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Nivel de motivación</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                      n === selfEval.motivacion
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                        : n < selfEval.motivacion!
                        ? 'bg-sky-500/10 border-sky-500/20 text-sky-500'
                        : 'bg-white/4 border-white/10 text-slate-600'
                    }`}>{n}</span>
                  ))}
                </div>
              </div>
              <span className="text-2xl font-bold text-sky-400">{selfEval.motivacion}<span className="text-slate-500 text-sm font-normal"> / 5</span></span>
            </div>
            {selfEval.motivacion_comentario && (
              <p className="text-xs text-slate-400 mt-3 italic">"{selfEval.motivacion_comentario}"</p>
            )}
          </div>
        )}

        {/* Self-eval narrative */}
        <div className="card flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Logros del período</p>
            <p className="text-sm text-white">{selfEval.logros}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Obstáculos encontrados</p>
            <p className="text-sm text-white">{selfEval.obstaculos}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Necesidades / solicitudes</p>
            <p className="text-sm text-white">{selfEval.necesidades}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        {selfEval && (
          <button onClick={() => { setShowForm(false); setError(null) }} className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Volver
          </button>
        )}
        <div>
          <h1 className="text-xl font-semibold text-white">Autoevaluación</h1>
          <p className="text-slate-400 text-sm mt-1">Evaluá tu propio desempeño — <span className="text-brand-500 font-medium">{periodoLabel}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="card flex flex-col gap-6">
          {CATEGORIES.map(({ key, label, desc }) => (
            <div key={key}>
              <div className="mb-2">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {LEVELS.map((lvl) => {
                  const isSelected = levels[key] === lvl
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevels((s) => ({ ...s, [key]: lvl }))}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all text-center ${
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
              {levels[key] === 'supera' && (
                <div className="mt-3">
                  <label className="text-xs font-medium text-emerald-400 block mb-1">
                    Ejemplo concreto que justifica "Supera expectativas" *
                  </label>
                  <textarea
                    className="input resize-none h-16 text-xs"
                    placeholder="Describí un ejemplo concreto (mín. 30 caracteres)"
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

        {/* Motivación */}
        <div className="card">
          <p className="text-sm font-medium text-white mb-1">Nivel de motivación</p>
          <p className="text-xs text-slate-500 mb-3">¿Qué tan motivado/a te sentís este trimestre? (1 = poco, 5 = muy motivado/a)</p>
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMotivacion(n)}
                className={`w-10 h-10 rounded-full text-sm font-bold border transition-all ${
                  motivacion === n
                    ? 'bg-sky-500/25 border-sky-500/60 text-sky-300'
                    : 'bg-surface-3 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <textarea
            className="input resize-none h-16 text-xs w-full"
            placeholder="Comentario opcional — ¿qué está influyendo en tu motivación?"
            value={motivacionComentario}
            onChange={(e) => setMotivacionComentario(e.target.value)}
          />
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
          </div>
        )}

        <div className="card flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Logros del período</label>
            <textarea
              className="input resize-none h-20"
              placeholder="¿Qué lograste este trimestre?"
              value={logros}
              onChange={(e) => setLogros(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Obstáculos encontrados</label>
            <textarea
              className="input resize-none h-20"
              placeholder="¿Qué dificultades tuviste?"
              value={obstaculos}
              onChange={(e) => setObstaculos(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Necesidades / solicitudes</label>
            <textarea
              className="input resize-none h-20"
              placeholder="¿Qué necesitás para rendir mejor?"
              value={necesidades}
              onChange={(e) => setNecesidades(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={14} />
            Guardar autoevaluación
          </button>
          {selfEval && (
            <button type="button" onClick={() => { setShowForm(false); setError(null) }} className="btn-ghost">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
