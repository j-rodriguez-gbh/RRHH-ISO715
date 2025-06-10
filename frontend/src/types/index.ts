export interface User {
  id: number;
  email: string;
  role: 'admin' | 'hr_manager' | 'recruiter';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Competencia {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo?: 'tecnica' | 'blanda' | 'gerencial';
  nivel_requerido?: 'basico' | 'intermedio' | 'avanzado' | 'experto';
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Idioma {
  id: number;
  nombre: string;
  codigo_iso?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Capacitacion {
  id: number;
  descripcion: string;
  nivel: 'Grado' | 'Post-grado' | 'Maestría' | 'Doctorado' | 'Técnico' | 'Gestión';
  fecha_desde?: string;
  fecha_hasta?: string;
  institucion?: string;
}

export interface Departamento {
  id: number;
  nombre: string;
  descripcion?: string;
  gerente?: string;
  codigo?: string;
  activo: boolean;
  empleados_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienciaLaboral {
  id: number;
  empresa: string;
  puesto: string;
  fecha_inicio: string;
  fecha_fin?: string;
  salario?: number;
  candidatoId: number;
}

export interface Puesto {
  id: number;
  nombre: string;
  descripcion?: string;
  departamento?: string;
  nivel: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director';
  salario_min?: number;
  salario_max?: number;
  requisitos?: string;
  experiencia_minima: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CandidatoEstado = 
  | 'aplicado'
  | 'en_revision'
  | 'preseleccionado'
  | 'entrevista_inicial'
  | 'entrevista_tecnica'
  | 'entrevista_final'
  | 'aprobado'
  | 'rechazado'
  | 'contratado';

export interface Candidato {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  documento_identidad?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  cv_path?: string;
  estado: CandidatoEstado;
  fecha_aplicacion: string;
  salario_aspirado?: number;
  disponibilidad: 'inmediata' | '15_dias' | '30_dias' | 'a_convenir';
  observaciones?: string;
  Competencias?: Competencia[];
  Idiomas?: Idioma[];
  Capacitacions?: Capacitacion[];
  ExperienciaLaborals?: ExperienciaLaboral[];
}

export interface CandidatoCreate {
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  documento_identidad?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  salario_aspirado?: number;
  disponibilidad?: 'inmediata' | '15_dias' | '30_dias' | 'a_convenir';
  observaciones?: string;
  competencias?: number[];
  idiomas?: number[];
  capacitaciones?: number[];
  experiencias?: {
    empresa: string;
    puesto: string;
    fecha_desde: string;
    fecha_hasta?: string | null;
    salario?: number;
  }[];
}

export interface StateTransition {
  event: string;
  nextState: string;
  description: string;
}

export interface CandidatoWithTransitions {
  candidato: Candidato;
  validTransitions: StateTransition[];
}

export interface Empleado {
  id: number;
  codigo_empleado: string;
  fecha_ingreso: string;
  salario_acordado: number;
  tipo_contrato: 'indefinido' | 'temporal' | 'practicas' | 'consultoria';
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia';
  fecha_fin_contrato?: string;
  supervisor_id?: number;
  candidatoId?: number;
  puestoId: number;
  Puesto?: Puesto;
  Candidato?: Candidato;
} 