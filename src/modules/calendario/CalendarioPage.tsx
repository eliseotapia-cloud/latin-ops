import { useState } from 'react'
import { ChevronLeft, ChevronRight, Cake } from 'lucide-react'
import { useDemoData } from '../../demo/demoData'
import type { LeaveType, LeaveStatus } from '../../types'

const LEAVE_TYPE_COLORS: Record<LeaveType, { bg: string; text: string; border: string }> = {
  vacaciones:          { bg: 'bg-blue-500/25',    text: 'text-blue-300',   border: 'border-blue-500/40' },
  licencia_medica:     { bg: 'bg-red-500/25',     text: 'text-red-300',    border: 'border-red-500/40' },
  licencia_personal:   { bg: 'bg-amber-500/25',   text: 'text-amber-300',  border: 'border-amber-500/40' },
  licencia_maternidad: { bg: 'bg-pink-500/25',    text: 'text-pink-300',   border: 'border-pink-500/40' },
  licencia_paternidad: { bg: 'bg-cyan-500/25',    text: 'text-cyan-300',   border: 'border-cyan-500/40' },
}

const LEAVE_TYPE_SHORT: Record<LeaveType, string> = {
  vacaciones:          'VAC',
  licencia_medica:     'MED',
  licencia_personal:   'PER',
  licencia_maternidad: 'MAT',
  licencia_paternidad: 'PAT',
}

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  vacaciones:          'Vacaciones',
  licencia_medica:     'Licencia médica',
  licencia_personal:   'Licencia personal',
  licencia_maternidad: 'Licencia maternidad',
  licencia_paternidad: 'Licencia paternidad',
}

const STATUS_COLORS: Record<LeaveStatus, string> = {
  aprobada:  'text-emerald-400',
  pendiente: 'text-amber-400',
  rechazada: 'text-red-400',
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DAY_NAMES = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

function isoDateToStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function dateInRange(dateStr: string, startStr: string, endStr: string): boolean {
  return dateStr >= startStr && dateStr <= endStr
}

function birthdayMonthDay(isoDate: string): string {
  return isoDate.slice(5)
}

function calcAge(birthIso: string, year: number): number {
  return year - parseInt(birthIso.slice(0, 4))
}

export function CalendarioPage() {
  const demo = useDemoData()
  const [viewYear, setViewYear] = useState(2026)
  const [viewMonth, setViewMonth] = useState(3)

  if (!demo) return null

  const { employees, leaves } = demo

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

  function getLeavesForDay(empleadoId: string, day: number) {
    const dateStr = isoDateToStr(viewYear, viewMonth, day)
    return leaves.filter(
      (l) => l.empleado_id === empleadoId && dateInRange(dateStr, l.fecha_inicio, l.fecha_fin)
    )
  }

  function isBirthday(emp: typeof employees[0], day: number): boolean {
    if (!emp.fecha_nacimiento) return false
    const monthDay = `${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return birthdayMonthDay(emp.fecha_nacimiento) === monthDay
  }

  function totalAbsentDays(empleadoId: string): number {
    let count = 0
    for (let d = 1; d <= daysInMonth; d++) {
      if (getLeavesForDay(empleadoId, d).length > 0) count++
    }
    return count
  }

  const isWeekend = (day: number) => {
    const dow = new Date(viewYear, viewMonth - 1, day).getDay()
    return dow === 0 || dow === 6
  }

  const today = new Date()
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1
  const isToday = (day: number) => isCurrentMonth && day === today.getDate()

  const colWidth = 32

  // Cumpleaños del equipo este mes (read-only para manager)
  const birthdaysThisMonth = employees
    .map((emp) => {
      if (!emp.fecha_nacimiento) return null
      const [, mm, dd] = emp.fecha_nacimiento.split('-')
      if (parseInt(mm) !== viewMonth) return null
      return { emp, day: parseInt(dd), age: calcAge(emp.fecha_nacimiento, viewYear) }
    })
    .filter(Boolean) as { emp: typeof employees[0]; day: number; age: number }[]

  birthdaysThisMonth.sort((a, b) => a.day - b.day)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Calendario del Equipo</h1>
        <p className="text-slate-400 text-sm mt-1">Ausencias y cumpleaños — {MONTHS[viewMonth - 1]} {viewYear}</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-3 border border-white/10 text-slate-400 hover:text-white hover:border-white/25 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-base font-semibold text-white min-w-[180px] text-center">
          {MONTHS[viewMonth - 1]} {viewYear}
        </h2>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-3 border border-white/10 text-slate-400 hover:text-white hover:border-white/25 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-x-auto mb-6">
        <table className="w-full" style={{ minWidth: `${200 + daysInMonth * colWidth}px` }}>
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 pr-4 text-xs font-medium text-slate-400 w-48 whitespace-nowrap sticky left-0 bg-surface-2 z-10">
                Empleado
              </th>
              {days.map((d) => {
                const dow = new Date(viewYear, viewMonth - 1, d).getDay()
                const wkend = dow === 0 || dow === 6
                const tod = isToday(d)
                return (
                  <th key={d} className={`text-center py-2 text-xs font-medium ${tod ? 'bg-brand-500/8' : ''}`} style={{ width: colWidth, minWidth: colWidth }}>
                    <div className={tod ? 'text-brand-400' : wkend ? 'text-slate-600' : 'text-slate-500'}>{DAY_NAMES[dow]}</div>
                    <div className="mt-0.5 flex items-center justify-center">
                      {tod ? (
                        <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                          <span className="text-white font-bold text-[10px]">{d}</span>
                        </div>
                      ) : (
                        <span className={wkend ? 'text-slate-600' : 'text-slate-300'}>{d}</span>
                      )}
                    </div>
                  </th>
                )
              })}
              <th className="text-center py-2 text-xs font-medium text-slate-400 pl-2 whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const absent = totalAbsentDays(emp.id)
              return (
                <tr key={emp.id} className="border-b border-white/3 hover:bg-white/2">
                  <td className="py-2 pr-4 text-sm text-white whitespace-nowrap sticky left-0 bg-surface-2 z-10">
                    <p className="font-medium">{emp.nombre} {emp.apellido}</p>
                    <p className="text-xs text-slate-500">{emp.puesto}</p>
                  </td>
                  {days.map((d) => {
                    const wkend = isWeekend(d)
                    const tod = isToday(d)
                    const dayLeaves = getLeavesForDay(emp.id, d)
                    const bday = isBirthday(emp, d)
                    return (
                      <td key={d} className={`text-center py-1.5 ${tod ? 'bg-brand-500/5 border-x border-brand-500/15' : wkend ? 'bg-white/2' : ''}`} style={{ width: colWidth, minWidth: colWidth }}>
                        {bday && (
                          <div title={`Cumpleaños de ${emp.nombre}`} className="text-[10px] rounded mx-auto w-fit mb-0.5">🎂</div>
                        )}
                        {dayLeaves.map((lv) => {
                          const colors = LEAVE_TYPE_COLORS[lv.tipo]
                          return (
                            <div key={lv.id} title={`${LEAVE_TYPE_LABELS[lv.tipo]} · ${lv.estado}`}
                              className={`text-[9px] font-bold rounded px-0.5 py-0.5 border mx-auto w-fit ${colors.bg} ${colors.text} ${colors.border} ${lv.estado === 'pendiente' ? 'opacity-60' : ''}`}>
                              {LEAVE_TYPE_SHORT[lv.tipo]}
                              {lv.estado === 'pendiente' && <span className="text-amber-400">*</span>}
                            </div>
                          )
                        })}
                      </td>
                    )
                  })}
                  <td className="text-center py-2 pl-2">
                    {absent > 0 ? <span className="text-xs font-semibold text-amber-400">{absent}d</span> : <span className="text-xs text-slate-600">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cumpleaños del equipo este mes (solo lectura) */}
      {birthdaysThisMonth.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Cake size={15} className="text-pink-400" />
            Cumpleaños en {MONTHS[viewMonth - 1]}
          </h3>
          <div className="flex flex-col gap-2">
            {birthdaysThisMonth.map(({ emp, day, age }) => {
              const isActualToday = isToday(day)
              return (
                <div key={emp.id} className={`card flex items-center gap-3 py-3 ${isActualToday ? 'border border-pink-500/30 bg-pink-500/5' : ''}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-500/15 border border-pink-500/30 text-sm">🎂</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">
                      {emp.nombre} {emp.apellido}
                      {isActualToday && <span className="ml-2 text-xs text-pink-400 font-semibold">¡Hoy!</span>}
                    </p>
                    <p className="text-xs text-slate-500">{emp.puesto} · {day} de {MONTHS[viewMonth - 1]} · {age} años</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 items-center">
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
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">🎂</span>
          <span className="text-xs text-slate-400">Cumpleaños</span>
        </div>
        <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
          <span className="text-amber-400 text-xs font-bold">*</span>
          <span className="text-xs text-slate-400">Pendiente de aprobación</span>
        </div>
      </div>

      {/* Lista de licencias */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-white mb-3">Licencias en {MONTHS[viewMonth - 1]} {viewYear}</h3>
        {(() => {
          const monthStart = isoDateToStr(viewYear, viewMonth, 1)
          const monthEnd = isoDateToStr(viewYear, viewMonth, daysInMonth)
          const monthLeaves = leaves.filter((l) => l.fecha_inicio <= monthEnd && l.fecha_fin >= monthStart)
          if (monthLeaves.length === 0) return <p className="text-slate-500 text-sm">No hay licencias este mes.</p>
          return (
            <div className="flex flex-col gap-2">
              {monthLeaves.map((lv) => {
                const colors = LEAVE_TYPE_COLORS[lv.tipo]
                return (
                  <div key={lv.id} className="card flex items-center gap-3 py-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold ${colors.bg} ${colors.text} ${colors.border}`}>{LEAVE_TYPE_SHORT[lv.tipo]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{lv.empleado_nombre}</p>
                      <p className="text-xs text-slate-500">{LEAVE_TYPE_LABELS[lv.tipo]} · {lv.fecha_inicio} → {lv.fecha_fin} ({lv.dias} días)</p>
                    </div>
                    <span className={`text-xs font-semibold capitalize ${STATUS_COLORS[lv.estado]}`}>{lv.estado}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
