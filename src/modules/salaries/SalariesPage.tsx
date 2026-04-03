import { useEffect, useState } from 'react'
import { Eye, EyeOff, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRole } from '../../hooks/useRole'
import { useDemoData } from '../../demo/demoData'
import type { Area } from '../../types'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

interface SalaryRow {
  emp_id: string
  nombre: string
  apellido: string
  puesto: string
  area_nombre: string
  monto_bruto: number
  fecha_desde: string
  motivo_cambio: string | null
}

export function SalariesPage() {
  const { isAdmin, isManager, areaId } = useRole()
  const demo = useDemoData()
  const [rows, setRows] = useState<SalaryRow[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [filterArea, setFilterArea] = useState('all')
  const [showAmounts, setShowAmounts] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)

    if (demo) {
      const empMap = new Map(demo.allEmployees.map((e) => [e.id, e]))
      const demoRows: SalaryRow[] = demo.currentSalaries
        .map((s) => {
          const emp = empMap.get(s.empleado_id)
          if (!emp) return null
          if (isManager && emp.area_id !== areaId) return null
          return {
            emp_id: emp.id,
            nombre: emp.nombre,
            apellido: emp.apellido,
            puesto: emp.puesto,
            area_nombre: emp.areas.nombre,
            monto_bruto: s.monto_bruto,
            fecha_desde: s.fecha_desde,
            motivo_cambio: s.motivo_cambio,
          } satisfies SalaryRow
        })
        .filter(Boolean) as SalaryRow[]
      demoRows.sort((a, b) => b.monto_bruto - a.monto_bruto)
      setRows(demoRows)
      if (isAdmin) setAreas(demo.areas)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('sueldos')
      .select(`id, monto_bruto, fecha_desde, motivo_cambio, empleados(id, nombre, apellido, puesto, estado, area_id, areas(id, nombre))`)
      .is('fecha_hasta', null)
      .order('monto_bruto', { ascending: false })

    let formatted: SalaryRow[] = (data ?? [])
      .filter((d: any) => d.empleados?.estado === 'activo')
      .map((d: any) => ({
        emp_id: d.empleados.id,
        nombre: d.empleados.nombre,
        apellido: d.empleados.apellido,
        puesto: d.empleados.puesto,
        area_nombre: d.empleados.areas?.nombre ?? '—',
        monto_bruto: d.monto_bruto,
        fecha_desde: d.fecha_desde,
        motivo_cambio: d.motivo_cambio,
      }))

    if (isManager) {
      const { data: areaData } = await supabase.from('areas').select('nombre').eq('id', areaId!).single()
      formatted = formatted.filter((r) => r.area_nombre === areaData?.nombre)
    }

    setRows(formatted)
    if (isAdmin) {
      const { data: areasData } = await supabase.from('areas').select('*').order('nombre')
      setAreas(areasData ?? [])
    }
    setLoading(false)
  }

  const filtered = isAdmin && filterArea !== 'all'
    ? rows.filter((r) => r.area_nombre === areas.find((a) => a.id === filterArea)?.nombre)
    : rows

  const masaTotal = filtered.reduce((s, r) => s + r.monto_bruto, 0)

  const byArea = isAdmin ? areas
    .map((a) => ({
      nombre: a.nombre,
      total: rows.filter((r) => r.area_nombre === a.nombre).reduce((s, r) => s + r.monto_bruto, 0),
      count: rows.filter((r) => r.area_nombre === a.nombre).length,
    }))
    .filter((a) => a.count > 0)
    .sort((a, b) => b.total - a.total) : []

  if (loading) return <Loader />

  // ── MANAGER: panel unificado ──────────────────────────────────────────────
  if (isManager) {
    return (
      <div className="p-6 max-w-4xl">
        <h1 className="text-xl font-semibold text-white mb-1">Sueldos del equipo</h1>
        <p className="text-slate-400 text-sm mb-5">Sueldos vigentes — Banca Privada</p>

        <div className="card p-0 overflow-hidden">
          {/* Resumen inline */}
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
                    <p className="text-xs text-slate-400 mb-0.5">Promedio por empleado</p>
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
      </div>
    )
  }

  // ── ADMIN: layout original con stats separadas ────────────────────────────
  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Sueldos</h1>
          <p className="text-slate-400 text-sm mt-1">Sueldos vigentes — solo visible para Admin</p>
        </div>
        <button onClick={() => setShowAmounts(!showAmounts)} className="btn-ghost flex items-center gap-2">
          {showAmounts ? <EyeOff size={16} /> : <Eye size={16} />}
          {showAmounts ? 'Ocultar montos' : 'Mostrar montos'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-xs text-slate-400">Masa salarial bruta total</span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {showAmounts ? formatCurrency(masaTotal) : '$ ••••••••'}
          </p>
          <p className="text-xs text-slate-500">{filtered.length} empleados activos</p>
        </div>
        {byArea.length > 0 && (
          <div className="card">
            <p className="text-xs text-slate-400 mb-3">Por área</p>
            <div className="flex flex-col gap-2">
              {byArea.map((a) => (
                <div key={a.nombre} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{a.nombre}</span>
                  <span className="text-sm text-white">
                    {showAmounts ? formatCurrency(a.total) : '••••••'} ({a.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-5">
        <select className="input w-auto" value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
          <option value="all">Todas las áreas</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Empleado</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Área</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Puesto</th>
              <th className="text-right text-xs text-slate-500 font-medium px-5 py-3">Sueldo bruto</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((row) => (
              <tr key={row.emp_id} className="hover:bg-white/2 transition-colors">
                <td className="px-5 py-3"><p className="text-sm text-white">{row.nombre} {row.apellido}</p></td>
                <td className="px-5 py-3 text-sm text-slate-300">{row.area_nombre}</td>
                <td className="px-5 py-3 text-sm text-slate-400">{row.puesto}</td>
                <td className="px-5 py-3 text-right">
                  <span className="text-sm font-medium text-white">
                    {showAmounts ? formatCurrency(row.monto_bruto) : '$ ••••••'}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">
                  {new Date(row.fecha_desde).toLocaleDateString('es-AR')}
                  {row.motivo_cambio && <span className="text-xs text-slate-600 ml-1">({row.motivo_cambio})</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">Sin datos</td></tr>
            )}
          </tbody>
        </table>
      </div>
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
