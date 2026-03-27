import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, CheckCircle, XCircle, AlertTriangle, FileText, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface ParsedRow {
  nombre: string
  apellido: string
  cuil: string
  email_corporativo: string
  area: string
  puesto: string
  fecha_ingreso: string
  estado: string
  sueldo_bruto: number
  tu_legajo: string
  _areaId?: string
  _error?: string
}

type ImportStatus = 'idle' | 'parsed' | 'importing' | 'done'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    const obj: any = {}
    headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
    return {
      nombre: obj.nombre ?? '',
      apellido: obj.apellido ?? '',
      cuil: obj.cuil ?? '',
      email_corporativo: obj.email_corporativo ?? '',
      area: obj.area ?? '',
      puesto: obj.puesto ?? '',
      fecha_ingreso: obj.fecha_ingreso ?? '',
      estado: obj.estado ?? 'activo',
      sueldo_bruto: parseFloat(obj.sueldo_bruto) || 0,
      tu_legajo: obj.tu_legajo ?? '',
    }
  }).filter((r) => r.nombre && r.apellido)
}

function parseDateArg(str: string): string {
  // Acepta DD/MM/YYYY → YYYY-MM-DD
  if (!str) return ''
  const parts = str.split('/')
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
  return str
}

export function ImportPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ ok: number; errors: string[] }>({ ok: 0, errors: [] })
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File) {
    const text = await file.text()
    const parsed = parseCSV(text)

    // Cargar áreas para mapear nombres → ids
    const { data: areas } = await supabase.from('areas').select('id, nombre')
    const areaMap = new Map((areas ?? []).map((a: any) => [a.nombre.toLowerCase().trim(), a.id]))

    const validated = parsed.map((row) => {
      const areaId = areaMap.get(row.area.toLowerCase().trim())
      return {
        ...row,
        _areaId: areaId,
        _error: !areaId ? `Área "${row.area}" no encontrada` :
                !row.email_corporativo ? 'Email faltante' :
                row.sueldo_bruto <= 0 ? 'Sueldo inválido' : undefined,
      }
    })

    setRows(validated)
    setStatus('parsed')
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  async function handleImport() {
    setStatus('importing')
    setProgress(0)
    const errors: string[] = []
    let ok = 0
    const validRows = rows.filter((r) => !r._error)

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      try {
        // Insertar empleado
        const { data: emp, error: empErr } = await supabase
          .from('empleados')
          .insert({
            nombre: row.nombre,
            apellido: row.apellido,
            email_corporativo: row.email_corporativo,
            area_id: row._areaId,
            puesto: row.puesto,
            fecha_ingreso: parseDateArg(row.fecha_ingreso),
            estado: row.estado,
            legajo_externo_id: row.tu_legajo || null,
            legajo_sincronizado: Boolean(row.tu_legajo),
          })
          .select('id')
          .single()

        if (empErr || !emp) {
          errors.push(`${row.nombre} ${row.apellido}: ${empErr?.message ?? 'Error al insertar'}`)
          continue
        }

        // Insertar sueldo si existe
        if (row.sueldo_bruto > 0) {
          await supabase.from('sueldos').insert({
            empleado_id: emp.id,
            monto_bruto: row.sueldo_bruto,
            moneda: 'ARS',
            fecha_desde: parseDateArg(row.fecha_ingreso),
            motivo_cambio: 'Importación Tu Legajo',
          })
        }

        ok++
      } catch (err: any) {
        errors.push(`${row.nombre} ${row.apellido}: Error inesperado`)
      }

      setProgress(Math.round(((i + 1) / validRows.length) * 100))
    }

    setResults({ ok, errors })
    setStatus('done')
  }

  const validCount = rows.filter((r) => !r._error).length
  const errorCount = rows.filter((r) => r._error).length

  return (
    <div className="p-6 max-w-5xl">
      <button onClick={() => navigate('/equipo')} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} />
        Volver al equipo
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Importar desde Tu Legajo</h1>
        <p className="text-slate-400 text-sm mt-1">
          Subí el CSV exportado desde Tu Legajo para cargar empleados y sueldos automáticamente.
        </p>
      </div>

      {/* Info columnas esperadas */}
      {status === 'idle' && (
        <div className="card mb-5">
          <p className="text-xs font-medium text-slate-400 mb-3">Columnas esperadas en el CSV</p>
          <div className="flex flex-wrap gap-2">
            {['nombre','apellido','cuil','email_corporativo','area','puesto','fecha_ingreso','estado','sueldo_bruto','tu_legajo'].map((col) => (
              <span key={col} className="bg-surface-3 text-slate-300 text-xs px-2 py-1 rounded font-mono">{col}</span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            La columna <span className="font-mono text-slate-400">tu_legajo</span> corresponde al ID del empleado en Tu Legajo (ej: TL-00891). Se usa para vincular el legajo digital automáticamente.
          </p>
        </div>
      )}

      {/* Upload zone */}
      {status === 'idle' && (
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
            dragging ? 'border-brand-500 bg-brand-500/5' : 'border-white/10 hover:border-white/20'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={32} className="text-slate-500 mx-auto mb-3" />
          <p className="text-white font-medium">Arrastrá tu CSV acá o cliqueá para seleccionar</p>
          <p className="text-slate-500 text-sm mt-1">Solo archivos .csv</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />
        </div>
      )}

      {/* Preview */}
      {status === 'parsed' && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle size={16} />
              <span>{validCount} empleados listos para importar</span>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertTriangle size={16} />
                <span>{errorCount} con errores (se omitirán)</span>
              </div>
            )}
          </div>

          <div className="card p-0 overflow-hidden mb-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Empleado</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Área</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Puesto</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Ingreso</th>
                    <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">Sueldo</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Tu Legajo</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row, i) => (
                    <tr key={i} className={`${row._error ? 'opacity-40' : 'hover:bg-white/2'} transition-colors`}>
                      <td className="px-4 py-2.5">
                        <p className="text-sm text-white">{row.nombre} {row.apellido}</p>
                        <p className="text-xs text-slate-500">{row.email_corporativo}</p>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-300">{row.area}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-400">{row.puesto}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-400">{row.fecha_ingreso}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-white">{formatCurrency(row.sueldo_bruto)}</td>
                      <td className="px-4 py-2.5">
                        {row.tu_legajo ? (
                          <span className="text-xs text-emerald-400 font-mono">{row.tu_legajo}</span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {row._error ? (
                          <span className="flex items-center gap-1 text-xs text-red-400">
                            <XCircle size={12} /> {row._error}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle size={12} /> OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleImport} className="btn-primary flex items-center gap-2" disabled={validCount === 0}>
              <Upload size={14} />
              Importar {validCount} empleados
            </button>
            <button onClick={() => { setRows([]); setStatus('idle') }} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </>
      )}

      {/* Importando */}
      {status === 'importing' && (
        <div className="card text-center py-12">
          <Loader size={32} className="text-brand-500 mx-auto mb-4 animate-spin" />
          <p className="text-white font-medium mb-3">Importando empleados...</p>
          <div className="w-64 mx-auto h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-slate-400 text-sm mt-2">{progress}%</p>
        </div>
      )}

      {/* Resultado */}
      {status === 'done' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <CheckCircle size={24} className="text-emerald-400" />
            <div>
              <p className="text-white font-semibold">Importación completada</p>
              <p className="text-slate-400 text-sm">{results.ok} empleados importados correctamente</p>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-5">
              <p className="text-red-400 text-sm font-medium mb-2">{results.errors.length} errores:</p>
              {results.errors.map((e, i) => (
                <p key={i} className="text-red-400/70 text-xs">{e}</p>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate('/equipo')} className="btn-primary">
              Ver equipo
            </button>
            <button onClick={() => { setRows([]); setStatus('idle'); setResults({ ok: 0, errors: [] }) }} className="btn-ghost">
              Importar otro archivo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
