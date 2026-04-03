import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDemoData } from '../../demo/demoData'
import type { PerformanceLevel } from '../../types'
import {
  LEVEL_LABELS, LEVEL_COLORS, LEVEL_SCORE,
  RESULT_LABELS, RESULT_COLORS,
  currentTrimestre, trimLabel,
} from '../../types'

const CATEGORIES = [
  { key: 'productividad' as const,   label: 'Productividad' },
  { key: 'calidad' as const,         label: 'Calidad de trabajo' },
  { key: 'compromiso' as const,      label: 'Compromiso' },
  { key: 'autonomia' as const,       label: 'Autonomía' },
  { key: 'trabajo_equipo' as const,  label: 'Trabajo en equipo' },
]

const LEVEL_BAR_PCT: Record<PerformanceLevel, number> = {
  supera: 100,
  cumple: 75,
  desarrollo: 50,
  atencion: 25,
}

const LEVEL_BAR_COLORS: Record<PerformanceLevel, string> = {
  supera:     'bg-emerald-500',
  cumple:     'bg-brand-500',
  desarrollo: 'bg-amber-500',
  atencion:   'bg-red-500',
}

const SLIDES = ['Resumen', 'Competencias y Alineación', 'Desarrollo']

function levelGapLabel(mgrScore: number, selfScore: number) {
  const gap = selfScore - mgrScore
  if (gap === 0) return { label: '✓ Alineado', color: 'text-emerald-400' }
  if (gap === 1) return { label: '↑ 1 nivel', color: 'text-amber-400' }
  if (gap >= 2) return { label: `↑ ${gap} niveles`, color: 'text-red-400' }
  return { label: `↓ ${Math.abs(gap)} nivel${Math.abs(gap) > 1 ? 'es' : ''}`, color: 'text-blue-400' }
}

export function PresentacionesPage() {
  const demo = useDemoData()
  if (!demo) return null

  const trimestre = currentTrimestre()
  const anio = new Date().getFullYear()
  const periodoLabel = trimLabel(trimestre, anio)

  // Empleados evaluados — solo los que tienen autoevaluación aparecen primero en la lista
  const withSelfEval = demo.employees.filter(
    (e) => demo.evaluations.has(e.id) && e.id === demo.selfEval.empleado_id
  )
  const withoutSelfEval = demo.employees.filter(
    (e) => demo.evaluations.has(e.id) && e.id !== demo.selfEval.empleado_id
  )
  const selectorEmps = [...withSelfEval, ...withoutSelfEval]

  // Default: primer empleado con autoevaluación, slide Alineación
  const defaultEmpId = withSelfEval[0]?.id ?? selectorEmps[0]?.id ?? ''
  const defaultSlide = withSelfEval.length > 0 ? 2 : 0

  const [selectedEmpId, setSelectedEmpId] = useState<string>(defaultEmpId)
  const [slideIdx, setSlideIdx] = useState(defaultSlide)

  const selectedEmp = selectedEmpId
    ? demo.allEmployees.find((e) => e.id === selectedEmpId) ?? null
    : null

  const managerEval = selectedEmpId ? demo.evaluations.get(selectedEmpId) ?? null : null
  const selfEval = selectedEmpId === 'demo-emp-001' ? demo.selfEval : null

  function prevSlide() {
    setSlideIdx((i) => Math.max(0, i - 1))
  }

  function nextSlide() {
    setSlideIdx((i) => Math.min(SLIDES.length - 1, i + 1))
  }

  function handleSelectEmp(id: string) {
    setSelectedEmpId(id)
    setSlideIdx(0)
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Presentaciones</h1>
        <p className="text-slate-400 text-sm mt-1">Vista de desempeño por empleado — {periodoLabel}</p>
      </div>

      {/* Employee selector */}
      <div className="mb-6">
        <label className="text-xs font-medium text-slate-400 block mb-2">Seleccioná un empleado</label>
        <select
          className="input w-full max-w-xs"
          value={selectedEmpId}
          onChange={(e) => handleSelectEmp(e.target.value)}
        >
          <option value="">— Elegí un empleado —</option>
          {selectorEmps.map((emp) => {
            const hasSelf = emp.id === demo.selfEval.empleado_id
            return (
              <option key={emp.id} value={emp.id}>
                {hasSelf ? '★ ' : ''}{emp.nombre} {emp.apellido} · {emp.puesto}
              </option>
            )
          })}
        </select>
        <p className="text-xs text-slate-500 mt-1.5">★ Con autoevaluación completa — el análisis de alineación estará disponible</p>
      </div>

      {/* Presentation */}
      {selectedEmp && managerEval ? (
        <div className="card" style={{ minHeight: 440 }}>
          {/* Slide header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setSlideIdx(i)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    slideIdx === i
                      ? 'bg-brand-500/15 text-brand-500 border-brand-500/25'
                      : 'bg-surface-3 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium tabular-nums">
              {slideIdx + 1} / {SLIDES.length}
            </span>
          </div>

          {/* Slide content */}
          <div className="flex-1">
            {/* SLIDE 1: Resumen */}
            {slideIdx === 0 && (
              <div className="flex flex-col items-center text-center py-6 gap-5">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-brand-500">
                    {selectedEmp.nombre[0]}{selectedEmp.apellido[0]}
                  </span>
                </div>
                {/* Result badge */}
                <span className={`text-lg font-bold px-5 py-2 rounded-xl border ${RESULT_COLORS[managerEval.resultado]}`}>
                  {RESULT_LABELS[managerEval.resultado]}
                </span>
                {/* Name */}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedEmp.nombre} {selectedEmp.apellido}
                  </h2>
                  <p className="text-base text-slate-400 mt-1">{selectedEmp.puesto}</p>
                  <p className="text-sm text-slate-500">{(selectedEmp as any).areas?.nombre}</p>
                </div>
                {/* Period */}
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="px-3 py-1 rounded-lg bg-surface-3 border border-white/10">
                    Período: <span className="text-white font-medium">{periodoLabel}</span>
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-surface-3 border border-white/10">
                    Ingreso: <span className="text-white font-medium">{selectedEmp.fecha_ingreso}</span>
                  </span>
                </div>
                {/* Profile line */}
                <p className="text-sm text-slate-400 max-w-md">
                  {selectedEmp.nombre} forma parte del equipo de {(selectedEmp as any).areas?.nombre} desde {new Date(selectedEmp.fecha_ingreso).getFullYear()}.
                  {managerEval.resultado === 'top_performer' && ' Destaca consistentemente en sus objetivos y es un referente del área.'}
                  {managerEval.resultado === 'high_performer' && ' Cumple y supera expectativas en la mayoría de las dimensiones.'}
                  {managerEval.resultado === 'standard' && ' Cumple con los estándares esperados para su posición.'}
                  {managerEval.resultado === 'en_desarrollo' && ' Se encuentra en etapa de crecimiento hacia su potencial.'}
                  {managerEval.resultado === 'bajo_rendimiento' && ' Requiere atención y acompañamiento para mejorar su desempeño.'}
                </p>
              </div>
            )}

            {/* SLIDE 2: Competencias + Alineación unificadas */}
            {slideIdx === 1 && (
              <div className="py-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white">Competencias</h2>
                  {selfEval && (
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" /> Evaluación jefe
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Autoevaluación
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  {CATEGORIES.map(({ key, label }) => {
                    const mgrLevel = managerEval[key]
                    const selfLevel = selfEval ? selfEval[key] : null
                    const mgrScore = LEVEL_SCORE[mgrLevel]
                    const selfScore = selfLevel ? LEVEL_SCORE[selfLevel] : null
                    const gap = selfScore !== null ? levelGapLabel(mgrScore, selfScore) : null
                    return (
                      <div key={key}>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-sm text-white w-36 shrink-0">{label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${LEVEL_COLORS[mgrLevel]}`}>
                            {LEVEL_LABELS[mgrLevel]}
                          </span>
                          {selfLevel && (
                            <>
                              <span className="text-xs text-slate-600">vs</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${LEVEL_COLORS[selfLevel]} opacity-70`}>
                                {LEVEL_LABELS[selfLevel]}
                              </span>
                              {gap && (
                                <span className={`text-xs font-semibold ml-auto ${gap.color}`}>{gap.label}</span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="relative h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${LEVEL_BAR_COLORS[mgrLevel]}`}
                            style={{ width: `${LEVEL_BAR_PCT[mgrLevel]}%` }}
                          />
                          {selfLevel && selfScore !== mgrScore && (
                            <div
                              className="absolute top-0 h-full w-0.5 bg-slate-400/60 rounded-full"
                              style={{ left: `${LEVEL_BAR_PCT[selfLevel]}%` }}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {!selfEval && (
                  <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
                    <span className="text-slate-600">—</span>
                    Sin autoevaluación disponible. Solo se muestra la evaluación del jefe.
                  </p>
                )}
              </div>
            )}

            {/* SLIDE 3: Desarrollo */}
            {slideIdx === 2 && (
              <div className="py-2">
                <h2 className="text-lg font-bold text-white mb-5">Plan de desarrollo</h2>
                {selfEval ? (
                  <div className="flex flex-col gap-4">
                    <div className="card bg-emerald-500/5 border-emerald-500/20">
                      <p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wide">Logros del período</p>
                      <p className="text-sm text-slate-200">{selfEval.logros ?? 'No especificado.'}</p>
                    </div>
                    <div className="card bg-amber-500/5 border-amber-500/20">
                      <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wide">Obstáculos encontrados</p>
                      <p className="text-sm text-slate-200">{selfEval.obstaculos ?? 'No especificado.'}</p>
                    </div>
                    <div className="card bg-brand-500/5 border-brand-500/20">
                      <p className="text-xs font-semibold text-brand-500 mb-2 uppercase tracking-wide">Necesidades y solicitudes</p>
                      <p className="text-sm text-slate-200">{selfEval.necesidades ?? 'No especificado.'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-500/15 flex items-center justify-center">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <p className="text-base font-medium text-slate-300">Sin datos de desarrollo disponibles</p>
                    <p className="text-sm text-slate-500 max-w-xs">
                      {selectedEmp.nombre} no completó su autoevaluación de {periodoLabel}. Logros, obstáculos y necesidades estarán disponibles cuando la complete.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
            <button
              onClick={prevSlide}
              disabled={slideIdx === 0}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === slideIdx ? 'bg-brand-500 w-5' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              disabled={slideIdx === SLIDES.length - 1}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-base font-medium text-slate-300">Seleccioná un empleado para ver la presentación</p>
          <p className="text-sm text-slate-500">La presentación muestra el resumen de desempeño de {periodoLabel}</p>
        </div>
      )}
    </div>
  )
}
