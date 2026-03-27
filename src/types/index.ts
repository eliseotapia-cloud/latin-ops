export type UserRole = 'super_admin' | 'area_manager'
export type EmployeeStatus = 'activo' | 'baja' | 'licencia'

export interface UserProfile {
  id: string
  email: string
  nombre: string
  rol: UserRole
  area_id: string | null
  area_nombre?: string
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

export interface Evaluation {
  id: string
  empleado_id: string
  evaluador_id: string
  periodo_mes: number
  periodo_anio: number
  productividad: number
  calidad: number
  compromiso: number
  autonomia: number
  trabajo_equipo: number
  score_general: number
  comentarios: string | null
  created_at: string
  updated_at: string
}

export interface EmployeeWithSalary extends Employee {
  salary?: Salary
}

export interface AreaCostSummary {
  area_id: string
  area_nombre: string
  cantidad_empleados: number
  masa_salarial: number
  score_promedio: number | null
}
