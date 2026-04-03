import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Cake, Mail, X, Check, Edit2, Upload, CalendarDays, LayoutList, Search,
} from 'lucide-react'
import { useDemoData } from '../../demo/demoData'
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
  vacaciones: 'Vacaciones', licencia_medica: 'Licencia médica', licencia_personal: 'Licencia personal',
  licencia_maternidad: 'Licencia maternidad', licencia_paternidad: 'Licencia paternidad',
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES = ['D','L','M','X','J','V','S']
const TABLE_PAGE_SIZE = 8

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function calcAge(birthIso: string, year: number) { return year - parseInt(birthIso.slice(0,4)) }
function dateInRange(ds: string, s: string, e: string) { return ds >= s && ds <= e }
function getMondayOfWeek(anchor: Date): Date {
  const d = new Date(anchor)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return d
}
function daysUntilBirthday(birthIso: string, from: Date): number {
  const [, mm, dd] = birthIso.split('-')
  const midnight = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const thisYear  = new Date(from.getFullYear(),   parseInt(mm)-1, parseInt(dd))
  const nextYear  = new Date(from.getFullYear()+1, parseInt(mm)-1, parseInt(dd))
  const target = thisYear >= midnight ? thisYear : nextYear
  return (target.getTime() - midnight.getTime()) / 86400000
}

type ViewMode   = 'month' | 'week'
type BdFilter   = 'mes' | 'semana'
type SortField  = 'nombre' | 'edad' | 'fecha'
type SortDir    = 'asc' | 'desc'

export function CalendarioAdminPage() {
  const demo = useDemoData()

  // Calendar state — default to current real month so "today" column is visible
  const now = new Date()
  const [viewMode,    setViewMode]    = useState<ViewMode>('month')
  const [viewYear,    setViewYear]    = useState(now.getFullYear())
  const [viewMonth,   setViewMonth]   = useState(now.getMonth() + 1)
  const [weekAnchor,  setWeekAnchor]  = useState(() => new Date())
  const [filterArea,  setFilterArea]  = useState<string>('all')

  // Birthday panel
  const [bdFilter, setBdFilter] = useState<BdFilter>('mes')

  // Birth date table
  const [sortField,  setSortField]  = useState<SortField>('nombre')
  const [sortDir,    setSortDir]    = useState<SortDir>('asc')
  const [tablePage,  setTablePage]  = useState(0)

  // Calendar type filters (legend toggles)
  const [calFilter, setCalFilter] = useState<string[]>([])

  // Birthday editing
  const [birthdays,    setBirthdays]    = useState<Record<string, string>>(() => {
    if (!demo) return {}
    const map: Record<string, string> = {}
    for (const emp of [...demo.allEmployees, ...demo.jefes]) {
      if (emp.fecha_nacimiento) map[emp.id] = emp.fecha_nacimiento
    }
    return map
  })
  const [editingId,    setEditingId]    = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  // Modals
  const [emailPreview, setEmailPreview] = useState<{ nombre: string; apellido: string } | null>(null)
  const [showUpload,   setShowUpload]   = useState(false)

  // Reset table page when sort or area filter changes
  useEffect(() => { setTablePage(0) }, [filterArea, sortField, sortDir])

  if (!demo) return null

  const { allEmployees, jefes, areas, leaves } = demo
  const allPeople = [...allEmployees, ...jefes]
  const today = new Date()
  const todayIso = toIso(today)

  // ── Global area filter ───────────────────────────────────────
  const filteredEmployees = filterArea === 'all' ? allEmployees : allEmployees.filter((e) => e.area_id === filterArea)
  const filteredPeople    = filterArea === 'all' ? allPeople    : allPeople.filter((e) => e.area_id === filterArea)

  // ── Visible days ─────────────────────────────────────────────
  const visibleDays: Date[] = viewMode === 'month'
    ? Array.from({ length: new Date(viewYear, viewMonth, 0).getDate() }, (_, i) => new Date(viewYear, viewMonth-1, i+1))
    : (() => {
        const mon = getMondayOfWeek(weekAnchor)
        return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate()+i); return d })
      })()

  const visibleStart = toIso(visibleDays[0])
  const visibleEnd   = toIso(visibleDays[visibleDays.length - 1])

  const isToday   = (d: Date) => toIso(d) === todayIso
  const isWeekend = (d: Date) => { const dow = d.getDay(); return dow === 0 || dow === 6 }

  // ── Navigation ───────────────────────────────────────────────
  function prevPeriod() {
    if (viewMode === 'month') {
      if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y-1) } else setViewMonth((m) => m-1)
    } else {
      const d = new Date(weekAnchor); d.setDate(d.getDate()-7); setWeekAnchor(d)
    }
  }
  function nextPeriod() {
    if (viewMode === 'month') {
      if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y+1) } else setViewMonth((m) => m+1)
    } else {
      const d = new Date(weekAnchor); d.setDate(d.getDate()+7); setWeekAnchor(d)
    }
  }
  function switchToWeek()  { setWeekAnchor(new Date(viewYear, viewMonth-1, 1)); setViewMode('week') }
  function switchToMonth() { setViewYear(weekAnchor.getFullYear()); setViewMonth(weekAnchor.getMonth()+1); setViewMode('month') }

  const periodLabel = viewMode === 'month'
    ? `${MONTHS[viewMonth-1]} ${viewYear}`
    : (() => {
        const mon = getMondayOfWeek(weekAnchor)
        const sun = new Date(mon); sun.setDate(mon.getDate()+6)
        if (mon.getMonth() === sun.getMonth())
          return `${mon.getDate()}–${sun.getDate()} de ${MONTHS[mon.getMonth()]} ${mon.getFullYear()}`
        return `${mon.getDate()} ${MONTHS[mon.getMonth()].slice(0,3)} – ${sun.getDate()} ${MONTHS[sun.getMonth()].slice(0,3)} ${sun.getFullYear()}`
      })()

  // ── Calendar helpers ─────────────────────────────────────────
  function getLeavesForDay(empId: string, d: Date) {
    const ds = toIso(d)
    return leaves.filter((l) => l.empleado_id === empId && dateInRange(ds, l.fecha_inicio, l.fecha_fin))
  }
  function isBirthday(emp: typeof allPeople[0], d: Date) {
    const bday = birthdays[emp.id]
    return bday ? bday.slice(5) === toIso(d).slice(5) : false
  }
  function totalAbsentDays(empId: string) {
    return visibleDays.filter((d) => getLeavesForDay(empId, d).length > 0).length
  }

  // ── Calendar: only relevant employees ────────────────────────
  // Base: employees with at least one leave OR birthday in visible period
  // Additionally: if calFilter active, only those matching selected types
  const relevantEmployees = filteredEmployees.filter((emp) => {
    const hasLeave    = leaves.some((l) => l.empleado_id === emp.id && l.fecha_inicio <= visibleEnd && l.fecha_fin >= visibleStart)
    const hasBirthday = visibleDays.some((d) => isBirthday(emp, d))
    if (!hasLeave && !hasBirthday) return false
    if (calFilter.length === 0) return true
    // Filter by selected types
    const matchesBirthday = calFilter.includes('cumpleanos') && hasBirthday
    const matchesLeave    = leaves.some((l) =>
      l.empleado_id === emp.id &&
      l.fecha_inicio <= visibleEnd &&
      l.fecha_fin >= visibleStart &&
      calFilter.includes(l.tipo)
    )
    return matchesBirthday || matchesLeave
  })

  function toggleCalFilter(key: string) {
    setCalFilter((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  // ── Birthday panel ───────────────────────────────────────────
  const birthdaysThisMonth = filteredPeople
    .map((emp) => {
      const bday = birthdays[emp.id]; if (!bday) return null
      const [, mm, dd] = bday.split('-')
      if (parseInt(mm) !== viewMonth) return null
      return { emp, day: parseInt(dd), age: calcAge(bday, viewYear) }
    })
    .filter(Boolean).sort((a, b) => a!.day - b!.day) as { emp: typeof allPeople[0]; day: number; age: number }[]

  const weekMon = getMondayOfWeek(today)
  const weekSun = new Date(weekMon); weekSun.setDate(weekMon.getDate()+6)
  const birthdaysThisWeek = filteredPeople
    .map((emp) => {
      const bday = birthdays[emp.id]; if (!bday) return null
      const [, mm, dd] = bday.split('-')
      const bdThisYear = new Date(today.getFullYear(), parseInt(mm)-1, parseInt(dd))
      const target = bdThisYear >= weekMon ? bdThisYear : new Date(today.getFullYear()+1, parseInt(mm)-1, parseInt(dd))
      if (target < weekMon || target > weekSun) return null
      return { emp, day: parseInt(dd), month: parseInt(mm), age: calcAge(bday, target.getFullYear()), target }
    })
    .filter(Boolean).sort((a, b) => a!.target.getTime() - b!.target.getTime()) as
    { emp: typeof allPeople[0]; day: number; month: number; age: number; target: Date }[]

  const shownBirthdays = bdFilter === 'mes' ? birthdaysThisMonth : birthdaysThisWeek

  // ── Birth date table ─────────────────────────────────────────
  const withBirthday     = filteredPeople.filter((e) => birthdays[e.id])
  const missingBirthdays = filteredPeople.filter((e) => !birthdays[e.id])
  const avgAge = withBirthday.length > 0
    ? Math.round(withBirthday.reduce((s, e) => s + calcAge(birthdays[e.id], viewYear), 0) / withBirthday.length)
    : null

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sortedPeople = [...filteredPeople].sort((a, b) => {
    if (sortField === 'nombre') {
      const cmp = `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es')
      return sortDir === 'asc' ? cmp : -cmp
    }
    if (sortField === 'edad') {
      const ageA = birthdays[a.id] ? calcAge(birthdays[a.id], viewYear) : -1
      const ageB = birthdays[b.id] ? calcAge(birthdays[b.id], viewYear) : -1
      return sortDir === 'asc' ? ageA - ageB : ageB - ageA
    }
    if (sortField === 'fecha') {
      if (!birthdays[a.id] && !birthdays[b.id]) return 0
      if (!birthdays[a.id]) return 1
      if (!birthdays[b.id]) return -1
      const dA = daysUntilBirthday(birthdays[a.id], new Date(today))
      const dB = daysUntilBirthday(birthdays[b.id], new Date(today))
      return sortDir === 'asc' ? dA - dB : dB - dA
    }
    return 0
  })

  const totalPages = Math.ceil(sortedPeople.length / TABLE_PAGE_SIZE)
  const pagedPeople = sortedPeople.slice(tablePage * TABLE_PAGE_SIZE, (tablePage + 1) * TABLE_PAGE_SIZE)

  // ── Editing ──────────────────────────────────────────────────
  function startEdit(empId: string) { setEditingId(empId); setEditingValue(birthdays[empId] ?? '') }
  function saveBirthday(empId: string) {
    if (editingValue) setBirthdays((prev) => ({ ...prev, [empId]: editingValue }))
    setEditingId(null); setEditingValue('')
  }

  const colWidth = viewMode === 'week' ? 100 : 30

  function SortHeader({ field, label }: { field: SortField; label: string }) {
    const active = sortField === field
    return (
      <button onClick={() => toggleSort(field)}
        className={`flex items-center gap-1 group transition-colors ${active ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
      >
        {label}
        <span className="flex flex-col -space-y-0.5 ml-0.5">
          <ChevronUp   size={9} className={active && sortDir === 'asc'  ? 'text-brand-400' : 'text-slate-600 group-hover:text-slate-500'} />
          <ChevronDown size={9} className={active && sortDir === 'desc' ? 'text-brand-400' : 'text-slate-600 group-hover:text-slate-500'} />
        </span>
      </button>
    )
  }

  return (
    <div className="p-6 pb-24 max-w-7xl">

      {/* ── Header principal ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Calendario</h1>
          <p className="text-slate-400 text-sm mt-1">
            Ausencias y cumpleaños — {filterArea === 'all' ? 'toda la empresa' : areas.find((a) => a.id === filterArea)?.nombre}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <select
            className="input text-sm w-48"
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
          >
            <option value="all">Todas las áreas</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3 border border-white/15 text-sm text-slate-300 hover:text-white hover:border-white/30 transition-colors whitespace-nowrap"
          >
            <Upload size={14} />
            Cargar cumpleaños
          </button>
        </div>
      </div>

      {/* ── Paneles: cumpleaños + tabla ────────────────────────── */}
      <div className="grid grid-cols-5 gap-6 mb-6">

        {/* Panel cumpleaños */}
        <div className="col-span-2">
          <div className="card h-full flex flex-col">
            <div className="flex items-center gap-0 border-b border-white/5 mb-4 -mx-5 px-5">
              {(['mes','semana'] as BdFilter[]).map((f) => (
                <button key={f} onClick={() => setBdFilter(f)}
                  className={`pb-2.5 mr-5 text-xs font-medium border-b-2 transition-colors ${bdFilter === f ? 'border-pink-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                  {f === 'mes' ? `Este mes (${MONTHS[viewMonth-1]})` : 'Esta semana'}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {shownBirthdays.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  Sin cumpleaños {bdFilter === 'mes' ? `en ${MONTHS[viewMonth-1]}` : 'esta semana'}{filterArea !== 'all' ? ' en esta área' : ''}.
                </p>
              ) : (
                <div className="flex flex-col">
                  {shownBirthdays.map(({ emp, day, age, ...rest }) => {
                    const month = bdFilter === 'mes' ? viewMonth : (rest as any).month ?? viewMonth
                    const isActualToday = isToday(new Date(viewYear, month-1, day))
                    return (
                      <div key={emp.id} className={`flex items-center gap-2.5 py-2 rounded ${isActualToday ? 'bg-pink-500/8 -mx-2 px-2' : ''}`}>
                        <span className="text-base">🎂</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium leading-none">
                            {emp.nombre} {emp.apellido}
                            {isActualToday && <span className="ml-1.5 text-[10px] text-pink-400 font-semibold">¡Hoy!</span>}
                            {(emp as any).es_jefe_area && <span className="ml-1.5 text-[10px] text-violet-400">Jefe</span>}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{(emp as any).areas?.nombre} · {day}/{month} · {age} años</p>
                        </div>
                        <button onClick={() => setEmailPreview({ nombre: emp.nombre, apellido: emp.apellido })}
                          className="text-slate-500 hover:text-brand-500 transition-colors shrink-0">
                          <Mail size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla fechas de nacimiento */}
        <div className="col-span-3">
          <div className="card h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 shrink-0">
                  <Edit2 size={14} className="text-slate-400" />
                  Fechas de nacimiento
                  <span className="text-slate-500 font-normal text-xs">— {filteredPeople.length}</span>
                </h3>
                {avgAge !== null && (
                  <span className="text-xs text-slate-300 bg-surface-3 border border-white/8 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Edad prom. <span className="text-white font-semibold">{avgAge} a</span>
                  </span>
                )}
              </div>
              {missingBirthdays.length > 0 && (
                <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0 ml-2">
                  {missingBirthdays.length} sin cargar
                </span>
              )}
            </div>

            {/* Tabla */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface-2 z-10">
                  <tr className="border-b border-white/8">
                    <th className="text-left pb-2 pr-3 text-xs font-medium w-full"><SortHeader field="nombre" label="Nombre" /></th>
                    <th className="text-left pb-2 pr-3 text-xs font-medium whitespace-nowrap hidden lg:table-cell"><span className="text-slate-400">Área</span></th>
                    <th className="text-left pb-2 pr-3 text-xs font-medium whitespace-nowrap"><SortHeader field="fecha" label="Fecha" /></th>
                    <th className="text-right pb-2 text-xs font-medium whitespace-nowrap"><SortHeader field="edad" label="Edad" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {pagedPeople.map((emp) => {
                    const bday = birthdays[emp.id]
                    const isEditing = editingId === emp.id
                    return (
                      <tr key={emp.id} className="group hover:bg-white/2 transition-colors">
                        <td className="py-2 pr-3">
                          <p className="text-white font-medium leading-none">
                            {emp.nombre} {emp.apellido}
                            {(emp as any).es_jefe_area && <span className="ml-1.5 text-[10px] text-violet-400 font-semibold">JEFE</span>}
                          </p>
                          {isEditing && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <input type="date" className="input text-xs py-0.5 px-2 h-7 w-36"
                                value={editingValue} onChange={(e) => setEditingValue(e.target.value)} autoFocus />
                              <button onClick={() => saveBirthday(emp.id)} className="text-emerald-400 hover:text-emerald-300"><Check size={13} /></button>
                              <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-300"><X size={13} /></button>
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-3 hidden lg:table-cell">
                          <span className="text-xs text-slate-500">{(emp as any).areas?.nombre}</span>
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {bday ? (
                            <span className="text-xs text-slate-300">
                              🎂 {new Date(bday+'T00:00:00').toLocaleDateString('es-AR',{day:'2-digit',month:'short'})}
                            </span>
                          ) : (
                            <button onClick={() => startEdit(emp.id)}
                              className="text-xs text-amber-400 hover:text-amber-300 border border-amber-500/25 rounded px-2 py-0.5 transition-colors">
                              + Cargar
                            </button>
                          )}
                        </td>
                        <td className="py-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {bday && (
                              <span className="text-xs font-semibold text-slate-200">
                                {calcAge(bday, viewYear)} <span className="text-slate-500 font-normal">años</span>
                              </span>
                            )}
                            {bday && (
                              <button onClick={() => startEdit(emp.id)}
                                className="text-slate-700 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
                                <Edit2 size={11} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5 shrink-0">
                <span className="text-xs text-slate-500">
                  {tablePage * TABLE_PAGE_SIZE + 1}–{Math.min((tablePage+1) * TABLE_PAGE_SIZE, sortedPeople.length)} de {sortedPeople.length} personas
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTablePage((p) => p-1)} disabled={tablePage === 0}
                    className="w-7 h-7 flex items-center justify-center rounded bg-surface-3 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-xs text-slate-400 px-2">{tablePage+1} / {totalPages}</span>
                  <button onClick={() => setTablePage((p) => p+1)} disabled={tablePage >= totalPages-1}
                    className="w-7 h-7 flex items-center justify-center rounded bg-surface-3 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sección calendario ─────────────────────────────────── */}
      <div>
        {/* Header del calendario */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
            <button onClick={switchToMonth}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode === 'month' ? 'bg-surface-3 text-white' : 'text-slate-400 hover:text-white'}`}>
              <LayoutList size={13} /> Mensual
            </button>
            <button onClick={switchToWeek}
              className={`flex items-center gap-1.5 px-3 py-1.5 border-l border-white/10 transition-colors ${viewMode === 'week' ? 'bg-surface-3 text-white' : 'text-slate-400 hover:text-white'}`}>
              <CalendarDays size={13} /> Semanal
            </button>
          </div>
          <button onClick={prevPeriod} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-3 border border-white/10 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-semibold text-white min-w-[160px] text-center">{periodLabel}</span>
          <button onClick={nextPeriod} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-3 border border-white/10 text-slate-400 hover:text-white transition-colors">
            <ChevronRight size={15} />
          </button>
          {relevantEmployees.length > 0 && (
            <span className="text-xs text-slate-500 ml-1">
              {relevantEmployees.length} persona{relevantEmployees.length !== 1 ? 's' : ''} con actividad
            </span>
          )}
        </div>

        {/* Grilla */}
        <div className="card overflow-x-auto mb-4">
          {relevantEmployees.length === 0 ? (
            <p className="text-slate-500 text-sm py-6 text-center">
              Sin licencias ni cumpleaños{calFilter.length > 0 ? ' del tipo seleccionado' : ''} en {periodLabel}.
            </p>
          ) : (
            <table className="w-full" style={viewMode === 'month' ? { minWidth: `${200 + visibleDays.length * colWidth}px` } : undefined}>
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-slate-400 whitespace-nowrap sticky left-0 bg-surface-2 z-10" style={{ width: 176 }}>
                    Empleado
                  </th>
                  {visibleDays.map((d, i) => {
                    const wkend = isWeekend(d)
                    const tod   = isToday(d)
                    return (
                      <th key={i}
                        className={`text-center py-2 text-xs font-medium ${tod ? 'bg-white/8' : ''}`}
                        style={{ width: colWidth, minWidth: colWidth }}
                      >
                        <div className={tod ? 'text-slate-300' : wkend ? 'text-slate-600' : 'text-slate-500'}>{DAY_NAMES[d.getDay()]}</div>
                        <div className="mt-0.5 flex items-center justify-center">
                          {tod ? (
                            <div className="w-5 h-5 rounded-full bg-slate-500 flex items-center justify-center">
                              <span className="text-white font-bold text-[10px]">{d.getDate()}</span>
                            </div>
                          ) : (
                            <span className={wkend ? 'text-slate-600' : 'text-slate-300'}>{d.getDate()}</span>
                          )}
                        </div>
                        {viewMode === 'week' && (
                          <div className={`text-[10px] mt-0.5 ${tod ? 'text-slate-400' : 'text-slate-600'}`}>{MONTHS[d.getMonth()].slice(0,3)}</div>
                        )}
                      </th>
                    )
                  })}
                  <th className="text-center py-2 text-xs font-medium text-slate-400 pl-2 whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody>
                {relevantEmployees.map((emp) => {
                  const absent = totalAbsentDays(emp.id)
                  return (
                    <tr key={emp.id} className="border-b border-white/3 hover:bg-white/2">
                      <td className="py-2 pr-4 whitespace-nowrap sticky left-0 bg-surface-2 z-10">
                        <p className="text-sm text-white font-medium">{emp.nombre} {emp.apellido}</p>
                        <p className="text-xs text-slate-500">{(emp as any).areas?.nombre}</p>
                      </td>
                      {visibleDays.map((d, i) => {
                        const wkend    = isWeekend(d)
                        const tod      = isToday(d)
                        const dayLeaves = getLeavesForDay(emp.id, d)
                        const bday     = isBirthday(emp, d)
                        return (
                          <td key={i}
                            className={`text-center py-1.5 ${tod ? 'bg-white/8 border-x border-white/10' : wkend ? 'bg-white/2' : ''}`}
                            style={{ width: colWidth, minWidth: colWidth }}
                          >
                            {bday && <div title={`Cumpleaños de ${emp.nombre}`} className="text-[11px] mx-auto w-fit mb-0.5">🎂</div>}
                            {dayLeaves.map((lv) => {
                              const colors = LEAVE_TYPE_COLORS[lv.tipo]
                              return (
                                <div key={lv.id} title={`${LEAVE_TYPE_LABELS[lv.tipo]} · ${lv.estado}`}
                                  className={`text-[9px] font-bold rounded px-0.5 py-0.5 border mx-auto w-fit ${colors.bg} ${colors.text} ${colors.border} ${lv.estado === 'pendiente' ? 'opacity-60' : ''}`}
                                >
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
          )}
        </div>

        {/* Filtros / leyenda */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 mr-1">Filtrar por:</span>
          {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((tipo) => {
            const colors  = LEAVE_TYPE_COLORS[tipo]
            const active  = calFilter.includes(tipo)
            return (
              <button key={tipo} onClick={() => toggleCalFilter(tipo)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-xs font-medium transition-all ${
                  active
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : 'bg-transparent border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
                }`}
              >
                <span className={`inline-flex w-5 h-3.5 rounded text-[8px] font-bold items-center justify-center border ${colors.bg} ${colors.text} ${colors.border}`}>
                  {LEAVE_TYPE_SHORT[tipo]}
                </span>
                {LEAVE_TYPE_LABELS[tipo]}
              </button>
            )
          })}
          <button onClick={() => toggleCalFilter('cumpleanos')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-xs font-medium transition-all ${
              calFilter.includes('cumpleanos')
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                : 'bg-transparent border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
            }`}
          >
            🎂 Cumpleaños
          </button>
          {calFilter.length > 0 && (
            <button onClick={() => setCalFilter([])} className="text-xs text-slate-500 hover:text-slate-300 ml-1 transition-colors">
              × Limpiar
            </button>
          )}
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 ml-1">
            <span className="w-4 h-4 rounded bg-white/8 border border-white/10 inline-block shrink-0" />
            <span className="text-xs text-slate-500">Hoy</span>
          </div>
          {calFilter.length === 0 && (
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 ml-1">
              <span className="text-amber-400 text-xs font-bold">*</span>
              <span className="text-xs text-slate-500">Pendiente</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ────────────────────────────────────────────── */}
      {showUpload && (
        <UploadModal
          people={allPeople}
          existingBirthdays={birthdays}
          onClose={() => setShowUpload(false)}
          onSave={(updates) => { setBirthdays((prev) => ({ ...prev, ...updates })); setShowUpload(false) }}
        />
      )}
      {emailPreview && (
        <EmailPreviewModal
          nombre={emailPreview.nombre}
          apellido={emailPreview.apellido}
          onClose={() => setEmailPreview(null)}
        />
      )}
    </div>
  )
}

// ─── Modal: cargar cumpleaños ─────────────────────────────────────────────────

type UploadTab = 'individual' | 'csv'

function UploadModal({
  people, existingBirthdays, onClose, onSave,
}: {
  people: { id: string; nombre: string; apellido: string; area_id: string; areas?: { nombre: string } }[]
  existingBirthdays: Record<string, string>
  onClose: () => void
  onSave: (updates: Record<string, string>) => void
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [tab, setTab]         = useState<UploadTab>('individual')
  const [search, setSearch]   = useState('')
  const [pending, setPending] = useState<Record<string, string>>({})
  const [csv, setCsv]         = useState('')
  const [csvPreview, setCsvPreview] = useState<{ id: string; nombre: string; apellido: string; fecha: string }[]>([])
  const [csvError, setCsvError]     = useState<string | null>(null)

  const filtered = people.filter((p) => {
    if (!search) return true
    return `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase())
  })

  function parseCsv() {
    setCsvError(null)
    const lines = csv.trim().split('\n').filter(Boolean)
    const results: typeof csvPreview = []
    for (const line of lines) {
      const parts = line.split(',')
      if (parts.length < 2) continue
      const id    = parts[0].trim()
      const fecha = parts[parts.length-1].trim()
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { setCsvError(`Fecha inválida: "${fecha}" — usar AAAA-MM-DD`); return }
      const person = people.find((p) => p.id === id)
      if (!person) { setCsvError(`ID no encontrado: ${id}`); return }
      results.push({ id, nombre: person.nombre, apellido: person.apellido, fecha })
    }
    setCsvPreview(results)
  }

  const pendingCount = Object.values(pending).filter((v) => /^\d{4}-\d{2}-\d{2}$/.test(v)).length
  const csvTemplate  = people.map((p) => `${p.id},${p.nombre} ${p.apellido},AAAA-MM-DD`).join('\n')

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-2 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Cake size={15} className="text-pink-400" />
            <span className="text-sm font-semibold text-white">Cargar cumpleaños</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="flex border-b border-white/5 shrink-0">
          {(['individual','csv'] as UploadTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-xs font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              {t === 'individual' ? 'Individual' : 'Importar CSV'}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {tab === 'individual' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Buscá la persona y seleccioná su fecha de nacimiento.</p>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input className="input w-full pl-8 text-sm" placeholder="Buscar empleado..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex flex-col divide-y divide-white/5">
                {filtered.map((emp) => {
                  const current = pending[emp.id] ?? existingBirthdays[emp.id] ?? ''
                  const changed = pending[emp.id] && pending[emp.id] !== existingBirthdays[emp.id]
                  return (
                    <div key={emp.id} className="flex items-center gap-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium leading-none">{emp.nombre} {emp.apellido}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{emp.areas?.nombre}</p>
                      </div>
                      <input type="date"
                        className={`input text-xs py-1 px-2 h-8 w-36 shrink-0 ${changed ? 'border-emerald-500/40 text-emerald-300' : ''}`}
                        value={current}
                        onChange={(e) => setPending((prev) => ({ ...prev, [emp.id]: e.target.value }))}
                      />
                    </div>
                  )
                })}
                {filtered.length === 0 && <p className="text-slate-500 text-sm py-4">Sin resultados.</p>}
              </div>
            </div>
          )}
          {tab === 'csv' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Pegá el CSV con el formato <code className="bg-surface-3 px-1 py-0.5 rounded text-slate-300">empleado_id,nombre,AAAA-MM-DD</code>. Una fila por persona.
              </p>
              <details className="text-xs">
                <summary className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors select-none">Ver plantilla ({people.length} personas)</summary>
                <pre className="mt-2 bg-surface-3 rounded-lg p-3 text-slate-400 overflow-x-auto max-h-36 text-[11px] leading-relaxed">{csvTemplate}</pre>
              </details>
              <textarea className="input w-full h-36 text-xs font-mono resize-none"
                placeholder={`demo-emp-001,Pablo Rodríguez,1995-03-15\ndemo-emp-002,Valentina Gómez,1994-07-22`}
                value={csv}
                onChange={(e) => { setCsv(e.target.value); setCsvPreview([]); setCsvError(null) }}
              />
              {csvError && <p className="text-xs text-red-400">{csvError}</p>}
              {csvPreview.length > 0 && (
                <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-xs text-emerald-400 font-semibold mb-2">{csvPreview.length} registros listos para importar</p>
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {csvPreview.map((r) => (
                      <p key={r.id} className="text-xs text-slate-300">{r.nombre} {r.apellido} → <span className="text-white">{r.fecha}</span></p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-white/5 shrink-0">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          {tab === 'individual' ? (
            <button onClick={() => onSave(Object.fromEntries(Object.entries(pending).filter(([,v]) => /^\d{4}-\d{2}-\d{2}$/.test(v))))}
              disabled={pendingCount === 0} className="btn-primary flex items-center gap-2">
              <Check size={14} />Guardar {pendingCount > 0 ? `${pendingCount} cambios` : 'cambios'}
            </button>
          ) : csvPreview.length === 0 ? (
            <button onClick={parseCsv} disabled={!csv.trim()} className="btn-primary">Verificar</button>
          ) : (
            <button onClick={() => { const u: Record<string,string> = {}; csvPreview.forEach((r) => { u[r.id] = r.fecha }); onSave(u) }}
              className="btn-primary flex items-center gap-2"><Check size={14} />Importar {csvPreview.length} registros</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Modal: email preview ─────────────────────────────────────────────────────

function EmailPreviewModal({ nombre, apellido, onClose }: { nombre: string; apellido: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  const [sent, setSent] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-2 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-brand-500" />
            <span className="text-sm font-semibold text-white">Vista previa — mail de cumpleaños</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <div className="flex flex-col gap-1.5 mb-4 text-xs text-slate-500">
            <div className="flex gap-2"><span className="w-12 text-slate-600 shrink-0">Para:</span><span className="text-slate-400">todos@latinsecurities.ar (excepto {nombre} {apellido})</span></div>
            <div className="flex gap-2"><span className="w-12 text-slate-600 shrink-0">Asunto:</span><span className="text-white">🎉 ¡Hoy cumple años {nombre} {apellido}!</span></div>
            <div className="flex gap-2"><span className="w-12 text-slate-600 shrink-0">Envío:</span><span className="text-emerald-400">Automático diario · 09:00 AM</span></div>
          </div>
          <div className="bg-surface-3 border border-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
            <p className="mb-3">Hola equipo,</p>
            <p className="mb-3">Hoy es el cumpleaños de <span className="text-white font-semibold">{nombre} {apellido}</span>. Les pedimos que se tomen un momento para felicitarle.</p>
            <p className="mb-3">¡Un gran día para todo el equipo!</p>
            <p className="text-slate-500 text-xs mt-4 border-t border-white/5 pt-3">Recursos Humanos — Latin Securities Argentina · Maipú 267, CABA</p>
          </div>
          <div className="flex items-center gap-2 mt-4 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2">
            <span className="text-xs text-amber-400">En producción este mail se envía automáticamente cada mañana cuando alguien cumple años.</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 shrink-0">
          <button onClick={onClose} className="btn-ghost">Cerrar</button>
          <button onClick={() => { setSent(true); setTimeout(() => { setSent(false); onClose() }, 1800) }} disabled={sent}
            className="btn-primary flex items-center gap-2">
            {sent ? <><Check size={14} />¡Enviado!</> : <><Mail size={14} />Enviar ahora (demo)</>}
          </button>
        </div>
      </div>
    </div>
  )
}
