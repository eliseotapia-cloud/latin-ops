import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Check, Cake, CalendarDays } from 'lucide-react'
import { useDemoData } from '../../demo/demoData'
import { useRole } from '../../hooks/useRole'
import type { LeaveType } from '../../types'

const LEAVE_TYPE_COLORS: Record<LeaveType, { bg: string; text: string; border: string }> = {
  vacaciones:          { bg: 'bg-blue-500/25',    text: 'text-blue-300',   border: 'border-blue-500/40' },
  licencia_medica:     { bg: 'bg-red-500/25',     text: 'text-red-300',    border: 'border-red-500/40' },
  licencia_personal:   { bg: 'bg-amber-500/25',   text: 'text-amber-300',  border: 'border-amber-500/40' },
  licencia_maternidad: { bg: 'bg-pink-500/25',    text: 'text-pink-300',   border: 'border-pink-500/40' },
  licencia_paternidad: { bg: 'bg-cyan-500/25',    text: 'text-cyan-300',   border: 'border-cyan-500/40' },
}

const LEAVE_TYPE_SHORT: Record<LeaveType, string> = {
  vacaciones: 'VAC', licencia_medica: 'MED', licencia_personal: 'PER',
  licencia_maternidad: 'MAT', licencia_paternidad: 'PAT',
}

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  vacaciones:          'Vacaciones',
  licencia_medica:     'Licencia médica',
  licencia_personal:   'Licencia personal',
  licencia_maternidad: 'Licencia maternidad',
  licencia_paternidad: 'Licencia paternidad',
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DAY_NAMES = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

function isoToStr(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function dateInRange(dateStr: string, start: string, end: string) {
  return dateStr >= start && dateStr <= end
}

function calcAge(birthIso: string, year: number) {
  return year - parseInt(birthIso.slice(0, 4))
}

interface LocalLeave {
  id: string
  tipo: LeaveType
  fecha_inicio: string
  fecha_fin: string
  observacion: string
  estado: 'pendiente'
}

export function MiCalendarioPage() {
  const demo = useDemoData()
  const { empleadoId } = useRole()
  const [viewYear, setViewYear] = useState(2026)
  const [viewMonth, setViewMonth] = useState(3)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Nuevas licencias locales (solo demo)
  const [localLeaves, setLocalLeaves] = useState<LocalLeave[]>([])

  // Form state
  const [formTipo, setFormTipo] = useState<LeaveType>('vacaciones')
  const [formInicio, setFormInicio] = useState('')
  const [formFin, setFormFin] = useState('')
  const [formObs, setFormObs] = useState('')

  if (!demo || !empleadoId) return null

  const { leaves, employees } = demo

  // Solo las licencias propias (demo + locales)
  const myLeaves = [
    ...leaves.filter((l) => l.empleado_id === empleadoId),
    ...localLeaves,
  ]

  // Cumpleaños del equipo (read-only)
  const teamBirthdays = employees
    .filter((e) => e.id !== empleadoId && e.fecha_nacimiento)
    .map((emp) => {
      const [, mm, dd] = emp.fecha_nacimiento!.split('-')
      if (parseInt(mm) !== viewMonth) return null
      return { emp, day: parseInt(dd), age: calcAge(emp.fecha_nacimiento!, viewYear) }
    })
    .filter(Boolean) as { emp: typeof employees[0]; day: number; age: number }[]

  teamBirthdays.sort((a, b) => a.day - b.day)

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const today = new Date()
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1
  const isToday = (day: number) => isCurrentMonth && day === today.getDate()

  function getLeavesForDay(day: number) {
    const dateStr = isoToStr(viewYear, viewMonth, day)
    return myLeaves.filter((l) => dateInRange(dateStr, l.fecha_inicio, l.fecha_fin))
  }

  function handleSubmit() {
    if (!formInicio || !formFin) return
    const newLeave: LocalLeave = {
      id: `local-${Date.now()}`,
      tipo: formTipo,
      fecha_inicio: formInicio,
      fecha_fin: formFin,
      observacion: formObs,
      estado: 'pendiente',
    }
    setLocalLeaves((prev) => [...prev, newLeave])
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setShowForm(false)
      setFormInicio('')
      setFormFin('')
      setFormObs('')
    }, 1800)
  }

  // Mis licencias de este mes
  const monthStart = isoToStr(viewYear, viewMonth, 1)
  const monthEnd = isoToStr(viewYear, viewMonth, daysInMonth)
  const myMonthLeaves = myLeaves.filter((l) => l.fecha_inicio <= monthEnd && l.fecha_fin >= monthStart)


  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Mi Calendario</h1>
          <p className="text-slate-400 text-sm mt-1">{MONTHS[viewMonth - 1]} {viewYear}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Solicitar licencia
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-3 border border-white/10 text-slate-400 hover:text-white hover:border-white/25 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-base font-semibold text-white min-w-[180px] text-center">{MONTHS[viewMonth - 1]} {viewYear}</h2>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-3 border border-white/10 text-slate-400 hover:text-white hover:border-white/25 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendario mensual (grilla simple) */}
      <div className="card mb-6">
        {/* Cabecera días de la semana */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Días */}
        <div className="grid grid-cols-7 gap-1">
          {/* Espacios vacíos antes del primer día */}
          {Array.from({ length: new Date(viewYear, viewMonth - 1, 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((d) => {
            const dow = new Date(viewYear, viewMonth - 1, d).getDay()
            const wkend = dow === 0 || dow === 6
            const tod = isToday(d)
            const dayLeaves = getLeavesForDay(d)
            const bdayTeam = teamBirthdays.filter((b) => b.day === d)
            const hasLeave = dayLeaves.length > 0

            return (
              <div
                key={d}
                className={`relative min-h-[44px] rounded-lg flex flex-col items-center pt-1 pb-1 text-xs transition-colors
                  ${tod ? 'bg-brand-500/15 border border-brand-500/30' : wkend ? 'bg-white/2' : 'hover:bg-white/3'}
                  ${hasLeave ? '' : ''}`}
              >
                {/* Número del día */}
                <div className={`w-5 h-5 flex items-center justify-center rounded-full font-medium ${
                  tod ? 'bg-brand-500 text-white text-[10px]' : wkend ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  {d}
                </div>

                {/* Licencias */}
                {dayLeaves.slice(0, 1).map((lv) => {
                  const colors = LEAVE_TYPE_COLORS[lv.tipo]
                  return (
                    <div key={lv.id} className={`text-[8px] font-bold rounded px-0.5 border mt-0.5 ${colors.bg} ${colors.text} ${colors.border} ${'estado' in lv && lv.estado === 'pendiente' ? 'opacity-70' : ''}`}>
                      {LEAVE_TYPE_SHORT[lv.tipo]}
                    </div>
                  )
                })}

                {/* Cumpleaños compañeros */}
                {bdayTeam.length > 0 && (
                  <div className="flex flex-col items-center gap-0.5 mt-0.5">
                    {bdayTeam.map((b) => (
                      <div key={b.emp.id} className="flex items-center gap-0.5">
                        <span className="text-[10px]">🎂</span>
                        <span className="text-[8px] text-pink-300 leading-none font-medium truncate max-w-[36px]">
                          {b.emp.nombre}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Mis licencias del mes */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CalendarDays size={15} className="text-brand-500" />
            Mis licencias en {MONTHS[viewMonth - 1]}
          </h3>
          {myMonthLeaves.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-slate-500 text-sm">Sin licencias este mes.</p>
              <button onClick={() => setShowForm(true)} className="text-xs text-brand-500 hover:text-brand-400 mt-2">
                + Solicitar licencia
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {myMonthLeaves.map((lv, i) => {
                const colors = LEAVE_TYPE_COLORS[lv.tipo]
                const estado = 'estado' in lv ? lv.estado : (lv as any).estado
                return (
                  <div key={lv.id ?? i} className="card flex items-center gap-3 py-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold ${colors.bg} ${colors.text} ${colors.border}`}>
                      {LEAVE_TYPE_SHORT[lv.tipo]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{LEAVE_TYPE_LABELS[lv.tipo]}</p>
                      <p className="text-xs text-slate-500">{lv.fecha_inicio} → {lv.fecha_fin}</p>
                    </div>
                    <span className={`text-xs font-semibold capitalize ${
                      estado === 'aprobada' ? 'text-emerald-400' : estado === 'pendiente' ? 'text-amber-400' : 'text-red-400'
                    }`}>{estado}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cumpleaños del equipo */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Cake size={15} className="text-pink-400" />
            Cumpleaños del equipo en {MONTHS[viewMonth - 1]}
          </h3>
          {teamBirthdays.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-slate-500 text-sm">Sin cumpleaños este mes.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {teamBirthdays.map(({ emp, day, age }) => {
                const isActualToday = isToday(day)
                return (
                  <div key={emp.id} className={`card flex items-center gap-3 py-3 ${isActualToday ? 'border border-pink-500/30 bg-pink-500/5' : ''}`}>
                    <span className="text-xl">🎂</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">
                        {emp.nombre} {emp.apellido}
                        {isActualToday && <span className="ml-1.5 text-xs text-pink-400 font-semibold">¡Hoy!</span>}
                      </p>
                      <p className="text-xs text-slate-500">{day} de {MONTHS[viewMonth - 1]} · {age} años</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <span className="text-xs text-slate-500">Leyenda:</span>
        {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((tipo) => {
          const colors = LEAVE_TYPE_COLORS[tipo]
          return (
            <div key={tipo} className="flex items-center gap-1.5">
              <div className={`w-6 h-4 rounded text-[9px] font-bold flex items-center justify-center border ${colors.bg} ${colors.text} ${colors.border}`}>{LEAVE_TYPE_SHORT[tipo]}</div>
              <span className="text-xs text-slate-400">{LEAVE_TYPE_LABELS[tipo]}</span>
            </div>
          )
        })}
      </div>

      {/* Modal de solicitud */}
      {showForm && (
        <LeaveRequestModal
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
          submitted={submitted}
          tipo={formTipo} setTipo={setFormTipo}
          inicio={formInicio} setInicio={setFormInicio}
          fin={formFin} setFin={setFormFin}
          obs={formObs} setObs={setFormObs}
        />
      )}
    </div>
  )
}

// ─── Modal de solicitud de licencia ──────────────────────────────────────────

function LeaveRequestModal({
  onClose, onSubmit, submitted,
  tipo, setTipo, inicio, setInicio, fin, setFin, obs, setObs,
}: {
  onClose: () => void
  onSubmit: () => void
  submitted: boolean
  tipo: LeaveType
  setTipo: (v: LeaveType) => void
  inicio: string
  setInicio: (v: string) => void
  fin: string
  setFin: (v: string) => void
  obs: string
  setObs: (v: string) => void
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const canSubmit = inicio && fin && fin >= inicio

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-2 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <p className="text-sm font-semibold text-white">Solicitar licencia</p>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Tipo de licencia</label>
            <select
              className="input w-full"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as LeaveType)}
            >
              {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((t) => (
                <option key={t} value={t}>{LEAVE_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Fecha inicio</label>
              <input type="date" className="input w-full" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Fecha fin</label>
              <input type="date" className="input w-full" value={fin} onChange={(e) => setFin(e.target.value)} min={inicio} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Observación (opcional)</label>
            <textarea
              className="input w-full resize-none"
              rows={2}
              placeholder="Ej: certificado médico adjunto..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>

          <div className="bg-brand-500/8 border border-brand-500/20 rounded-lg px-3 py-2">
            <p className="text-xs text-brand-400">
              La solicitud quedará <span className="font-semibold">pendiente de aprobación</span> por tu jefe de área.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitted}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {submitted ? (
              <><Check size={14} />¡Enviada!</>
            ) : (
              'Enviar solicitud'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
