import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Eye, EyeOff, Briefcase, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRole } from '../../hooks/useRole'
import { useDemoData } from '../../demo/demoData'
import type { Employee } from '../../types'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

interface SalaryRow {
  emp_id: string
  nombre: string
  apellido: string
  puesto: string
  monto_bruto: number
  fecha_desde: string
  motivo_cambio: string | null
}

export function EquipoSueldosPage() {
  const { areaId } = useRole()
  const demo = useDemoData()
  const [tab, setTab] = useState<'equipo' | 'sueldos'>('equipo')

  // ── Equipo state ──
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('activo')

  // ── Sueldos state ──
  const [salaryRows, setSalaryRows] = useState<SalaryRow[]>([])
  const [showAmounts, setShowAmounts] = useState(false)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [areaId])

  async function loadData() {
    setLoading(true)

    if (demo) {
      setEmployees(demo.employees as any)

      const empMap = new Map(demo.allEmployees.map((e) => [e.id, e]))
      const rows: SalaryRow[] = demo.currentSalaries
        .filter((s) => {
          const emp = empMap.get(s.empleado_id)
          return emp && emp.area_id === areaId
        })
        .map((s) => {
          const emp = empMap.get(s.empleado_id)!
          return {
            emp_id: emp.id,
            nombre: emp.nombre,
            apellido: emp.apellido,
            puesto: emp.puesto,
            monto_bruto: s.monto_bruto,
            fecha_desde: s.fecha_desde,
            motivo_cambio: s.motivo_cambio,
          }
        })
        .sort((a, b) => b.monto_bruto - a.monto_bruto)
      setSalaryRows(rows)
      setLoading(false)
      return
    }

    const { data: emps } = await supabase
      .from('empleados')
      .select('*')
      .eq('area_id', areaId!)
      .order('apellido')
    setEmployees((emps ?? []) as any)

    const { data: salaries } = await supabase
      .from('sueldos')
      .select('monto_bruto, fecha_desde, motivo_cambio, empleados(id, nombre, apellido, puesto)')
      .is('fecha_hasta', null)
      .in('empleado_id', (emps ?? []).map((e: any) => e.id))
      .order('monto_bruto', { ascending: false })

    setSalaryRows(
      (salaries ?? []).map((s: any) => ({
        emp_id: s.empleados.id,
        nombre: s.empleados.nombre,
        apellido: s.empleados.apellido,
        puesto: s.empleados.puesto,
        monto_bruto: s.monto_bruto,
        fecha_desde: s.fecha_desde,
        motivo_cambio: s.motivo_cambio,
      }))
    )
    setLoading(false)
  }

  const filteredEmps = employees.filter((e) => {
    const matchSearch = `${e.nombre} ${e.apellido} ${e.puesto}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || e.estado === filterStatus
    return matchSearch && matchStatus
  })

  const masaTotal = salaryRows.reduce((s, r) => s + r.monto_bruto, 0)

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Mi Equipo</h1>
          <p className="text-slate-400 text-sm mt-1">
            {employees.length} empleados — Banca Privada
          </p>
        </div>
        <Link to="/mi-equipo/nuevo" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nuevo empleado
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-3 p-1 rounded-lg w-fit border border-white/5">
        <button
          onClick={() => setTab('equipo')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'equipo'
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase size={14} />
          Equipo
        </button>
        <button
          onClick={() => setTab('sueldos')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'sueldos'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign size={14} />
          Sueldos
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : tab === 'equipo' ? (
        <EquipoTab
          employees={filteredEmps}
          search={search}
          setSearch={setSearch}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      ) : (
        <SueldosTab
          rows={salaryRows}
          masaTotal={masaTotal}
          showAmounts={showAmounts}
          setShowAmounts={setShowAmounts}
        />
      )}
    </div>
  )
}

// ── Equipo tab ────────────────────────────────────────────────────────────────

function EquipoTab({
  employees,
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
}: {
  employees: Employee[]
  search: string
  setSearch: (v: string) => void
  filterStatus: string
  setFilterStatus: (v: string) => void
}) {
  return (
    <>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-8"
            placeholder="Buscar por nombre o puesto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="baja">Baja</option>
          <option value="licencia">Licencia</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Empleado</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Puesto</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Ingreso</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Estado</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Legajo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <Link to={`/mi-equipo/${emp.id}`} className="flex items-center gap-2.5 group">
                    <Avatar name={`${emp.nombre} ${emp.apellido}`} />
                    <div>
                      <p className="text-sm text-white group-hover:text-brand-500 transition-colors">
                        {emp.nombre} {emp.apellido}
                      </p>
                      <p className="text-xs text-slate-500">{emp.email_corporativo}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3 text-sm text-slate-300">{emp.puesto}</td>
                <td className="px-5 py-3 text-sm text-slate-400">
                  {new Date(emp.fecha_ingreso).toLocaleDateString('es-AR')}
                </td>
                <td className="px-5 py-3"><StatusBadge status={emp.estado} /></td>
                <td className="px-5 py-3">
                  {emp.legajo_sincronizado ? (
                    <span className="text-xs text-emerald-400">✓ Vinculado</span>
                  ) : (
                    <span className="text-xs text-slate-500">Sin vincular</span>
                  )}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">
                  No se encontraron empleados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Sueldos tab ───────────────────────────────────────────────────────────────

function SueldosTab({
  rows,
  masaTotal,
  showAmounts,
  setShowAmounts,
}: {
  rows: SalaryRow[]
  masaTotal: number
  showAmounts: boolean
  setShowAmounts: (v: boolean) => void
}) {
  return (
    <div className="card p-0 overflow-hidden">
      {/* Header resumen */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Masa salarial bruta</p>
            <p className="text-2xl font-semibold text-white">
              {showAmounts ? formatCurrency(masaTotal) : '$ ••••••••'}
            </p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Empleados activos</p>
            <p className="text-2xl font-semibold text-white">{rows.length}</p>
          </div>
          {rows.length > 0 && showAmounts && (
            <>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Promedio</p>
                <p className="text-2xl font-semibold text-white">
                  {formatCurrency(masaTotal / rows.length)}
                </p>
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => setShowAmounts(!showAmounts)}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          {showAmounts ? <EyeOff size={15} /> : <Eye size={15} />}
          {showAmounts ? 'Ocultar' : 'Mostrar montos'}
        </button>
      </div>

      {/* Tabla */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Empleado</th>
            <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Puesto</th>
            <th className="text-right text-xs text-slate-500 font-medium px-5 py-3">Sueldo bruto</th>
            <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Vigente desde</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, i) => (
            <tr key={row.emp_id} className="hover:bg-white/2 transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-brand-500">
                      {row.nombre[0]}{row.apellido[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-white">{row.nombre} {row.apellido}</p>
                    {showAmounts && masaTotal > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="h-1 rounded-full bg-brand-500/30 overflow-hidden" style={{ width: 60 }}>
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${(row.monto_bruto / rows[0].monto_bruto) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {((row.monto_bruto / masaTotal) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-sm text-slate-400">{row.puesto}</td>
              <td className="px-5 py-3 text-right">
                <span className={`text-sm font-semibold ${i === 0 ? 'text-emerald-400' : 'text-white'}`}>
                  {showAmounts ? formatCurrency(row.monto_bruto) : '$ ••••••'}
                </span>
              </td>
              <td className="px-5 py-3 text-sm text-slate-500">
                {new Date(row.fecha_desde).toLocaleDateString('es-AR')}
                {row.motivo_cambio && (
                  <span className="block text-xs text-slate-600 mt-0.5">{row.motivo_cambio}</span>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm">Sin datos</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('')
  return (
    <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
      <span className="text-xs font-medium text-brand-500">{initials.toUpperCase()}</span>
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
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
