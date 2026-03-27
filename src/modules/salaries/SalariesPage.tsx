import { useEffect, useState } from 'react'
import { Eye, EyeOff, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
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
  const [rows, setRows] = useState<SalaryRow[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [filterArea, setFilterArea] = useState('all')
  const [showAmounts, setShowAmounts] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data } = await supabase
      .from('sueldos')
      .select(`
        id, monto_bruto, fecha_desde, motivo_cambio,
        empleados(id, nombre, apellido, puesto, estado, areas(id, nombre))
      `)
      .is('fecha_hasta', null)
      .order('monto_bruto', { ascending: false })

    const formatted: SalaryRow[] = (data ?? [])
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

    setRows(formatted)

    const { data: areasData } = await supabase.from('areas').select('*').order('nombre')
    setAreas(areasData ?? [])
    setLoading(false)
  }

  const filtered = filterArea === 'all' ? rows : rows.filter((r) => r.area_nombre === areas.find((a) => a.id === filterArea)?.nombre)

  const masaTotal = filtered.reduce((s, r) => s + r.monto_bruto, 0)

  // Totales por área
  const byArea = areas.map((a) => ({
    nombre: a.nombre,
    total: rows.filter((r) => r.area_nombre === a.nombre).reduce((s, r) => s + r.monto_bruto, 0),
    count: rows.filter((r) => r.area_nombre === a.nombre).length,
  })).filter((a) => a.count > 0).sort((a, b) => b.total - a.total)

  if (loading) return <Loader />

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Sueldos</h1>
          <p className="text-slate-400 text-sm mt-1">Sueldos vigentes — solo visible para Admin</p>
        </div>
        <button
          onClick={() => setShowAmounts(!showAmounts)}
          className="btn-ghost flex items-center gap-2"
        >
          {showAmounts ? <EyeOff size={16} /> : <Eye size={16} />}
          {showAmounts ? 'Ocultar montos' : 'Mostrar montos'}
        </button>
      </div>

      {/* Resumen */}
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
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5">
        <select className="input w-auto" value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
          <option value="all">Todas las áreas</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      {/* Tabla */}
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
                <td className="px-5 py-3">
                  <p className="text-sm text-white">{row.nombre} {row.apellido}</p>
                </td>
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
