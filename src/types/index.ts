export type UserRole = 'super_admin' | 'area_manager' | 'empleado'
export type EmployeeStatus = 'activo' | 'baja' | 'licencia'

export interface UserProfile {
  id: string
  email: string
  nombre: string
  rol: UserRole
  area_id: string | null
  area_nombre?: string
  empleado_id?: string
}

export interface Area {
  id: string
  nombre: string
  descripcion: string | null
  created_at: string
}

export interface Employee {
  id: string
  nombre: string
  apellido: string
  email_corporativo: string
  area_id: string
  area?: Area
  puesto: string
  fecha_ingreso: string
  fecha_nacimiento?: string | null
  es_jefe_area?: boolean
  estado: EmployeeStatus
  legajo_externo_id: string | null
  legajo_sincronizado: boolean
  created_at: string
}

export interface Salary {
  id: string
  empleado_id: string
  monto_bruto: number
  moneda: string
  fecha_desde: string
  fecha_hasta: string | null
  motivo_cambio: string | null
  created_at: string
}

// ─── Performance text-based levels ────────────────────────────────────────────

export type PerformanceLevel = 'supera' | 'cumple' | 'desarrollo' | 'atencion'
export type PerformanceResult = 'top_performer' | 'high_performer' | 'standard' | 'en_desarrollo' | 'bajo_rendimiento'
export type Trimestre = 1 | 2 | 3 | 4

export const LEVEL_SCORE: Record<PerformanceLevel, number> = {
  supera: 4,
  cumple: 3,
  desarrollo: 2,
  atencion: 1,
}

export const LEVEL_LABELS: Record<PerformanceLevel, string> = {
  supera: 'Supera expectativas',
  cumple: 'Cumple expectativas',
  desarrollo: 'En desarrollo',
  atencion: 'Requiere atención',
}

export const LEVEL_COLORS: Record<PerformanceLevel, string> = {
  supera:     'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
  cumple:     'text-brand-500 bg-brand-500/15 border-brand-500/25',
  desarrollo: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
  atencion:   'text-red-400 bg-red-500/15 border-red-500/25',
}

export const RESULT_LABELS: Record<PerformanceResult, string> = {
  top_performer:    'Top Performer',
  high_performer:   'High Performer',
  standard:         'Standard',
  en_desarrollo:    'En Desarrollo',
  bajo_rendimiento: 'Bajo Rendimiento',
}

export const RESULT_COLORS: Record<PerformanceResult, string> = {
  top_performer:    'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
  high_performer:   'text-brand-500 bg-brand-500/15 border-brand-500/25',
  standard:         'text-slate-300 bg-slate-500/15 border-slate-500/25',
  en_desarrollo:    'text-amber-400 bg-amber-500/15 border-amber-500/25',
  bajo_rendimiento: 'text-red-400 bg-red-500/15 border-red-500/25',
}

export function calcResult(levels: PerformanceLevel[]): PerformanceResult {
  const scores = levels.map((l) => LEVEL_SCORE[l])
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const hasAtencion = levels.includes('atencion')
  const superaCount = levels.filter((l) => l === 'supera').length
  if (!hasAtencion && avg >= 3.6 && superaCount >= 3) return 'top_performer'
  if (!hasAtencion && avg >= 3.0) return 'high_performer'
  if (avg >= 2.4) return 'standard'
  if (avg >= 1.6) return 'en_desarrollo'
  return 'bajo_rendimiento'
}

export function calcScore(ev: Pick<Evaluation, 'productividad' | 'calidad' | 'compromiso' | 'autonomia' | 'trabajo_equipo'>): number {
  return [ev.productividad, ev.calidad, ev.compromiso, ev.autonomia, ev.trabajo_equipo]
    .map((l) => LEVEL_SCORE[l])
    .reduce((a, b) => a + b, 0) / 5
}

export function currentTrimestre(): Trimestre {
  const m = new Date().getMonth() + 1
  return m <= 3 ? 1 : m <= 6 ? 2 : m <= 9 ? 3 : 4
}

export function trimLabel(t: Trimestre, anio: number): string {
  return `Q${t} ${anio}`
}

// ─── Evaluation (text-based) ───────────────────────────────────────────────

type EvalDim = 'productividad' | 'calidad' | 'compromiso' | 'autonomia' | 'trabajo_equipo'

export interface Evaluation {
  id: string
  empleado_id: string
  evaluador_id: string
  trimestre: Trimestre
  anio: number
  productividad: PerformanceLevel
  calidad: PerformanceLevel
  compromiso: PerformanceLevel
  autonomia: PerformanceLevel
  trabajo_equipo: PerformanceLevel
  justificaciones?: Partial<Record<EvalDim, string>>
  comentarios: string | null
  resultado: PerformanceResult
  created_at: string
  updated_at: string
}

export interface EmployeeWithSalary extends Employee {
  salary?: Salary
}

export interface SelfEvaluation {
  id: string
  empleado_id: string
  trimestre: Trimestre
  anio: number
  productividad: PerformanceLevel
  calidad: PerformanceLevel
  compromiso: PerformanceLevel
  autonomia: PerformanceLevel
  trabajo_equipo: PerformanceLevel
  resultado: PerformanceResult
  logros: string | null
  obstaculos: string | null
  necesidades: string | null
  motivacion: number | null
  motivacion_comentario: string | null
  created_at: string
  updated_at: string
}

export interface Wellbeing {
  id: string
  empleado_id: string
  periodo_mes: number
  periodo_anio: number
  enps: number
  energia: number
  motivacion: number
  carga_laboral: number
  comentario: string | null
  created_at: string
}

export interface Suggestion {
  id: string
  autor_nombre: string | null
  area_nombre: string | null
  categoria: 'procesos' | 'cultura' | 'herramientas' | 'beneficios' | 'otro'
  titulo: string
  descripcion: string
  es_anonima: boolean
  estado: 'nueva' | 'en_revision' | 'implementada' | 'descartada'
  created_at: string
}

export interface AreaCostSummary {
  area_id: string
  area_nombre: string
  cantidad_empleados: number
  masa_salarial: number
  score_promedio: number | null
}

// ─── Licencias ─────────────────────────────────────────────────────────────

export type LeaveType = 'vacaciones' | 'licencia_medica' | 'licencia_personal' | 'licencia_maternidad' | 'licencia_paternidad'
export type LeaveStatus = 'aprobada' | 'pendiente' | 'rechazada'

export interface Leave {
  id: string
  empleado_id: string
  empleado_nombre: string
  tipo: LeaveType
  fecha_inicio: string
  fecha_fin: string
  dias: number
  estado: LeaveStatus
  observacion: string | null
}

// ─── Comunicaciones ────────────────────────────────────────────────────────

export type ComunicacionTipo = 'pago' | 'evaluacion' | 'general'

export interface Comunicacion {
  id: string
  tipo: ComunicacionTipo
  titulo: string
  cuerpo: string
  fecha_programada: string
  destinatarios: 'todos' | 'managers' | 'empleados'
  enviada: boolean
}
