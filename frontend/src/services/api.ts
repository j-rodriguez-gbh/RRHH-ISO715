import axios from 'axios';
import type { 
  AuthResponse, 
  LoginCredentials, 
  Candidato, 
  CandidatoCreate, 
  CandidatoWithTransitions,
  Competencia,
  Idioma,
  Capacitacion,
  Puesto,
  Empleado,
  Departamento
} from '../types';

const API_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    const { token } = response.data;
    setToken(token);
    return response.data;
  },
  
  logout: () => {
    removeToken();
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const candidatosAPI = {
  getAll: async (params?: { page?: number; limit?: number; estado?: string; search?: string }) => {
    const response = await api.get('/candidatos', { params });
    return response.data;
  },
  
  getById: async (id: number): Promise<CandidatoWithTransitions> => {
    const response = await api.get(`/candidatos/${id}`);
    return response.data;
  },
  
  create: async (candidato: CandidatoCreate): Promise<Candidato> => {
    const response = await api.post('/candidatos', candidato);
    return response.data;
  },
  
  update: async (id: number, candidato: Partial<CandidatoCreate>): Promise<Candidato> => {
    const response = await api.put(`/candidatos/${id}`, candidato);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/candidatos/${id}`);
    return response.data;
  },
  
  changeState: async (id: number, event: string, observaciones?: string) => {
    const response = await api.post(`/candidatos/${id}/change-state`, {
      event,
      observaciones,
    });
    return response.data;
  },
  
  search: async (params: {
    puestoId?: number;
    competencias?: string;
    idiomas?: string;
    capacitaciones?: string;
    experiencia_min?: number;
  }) => {
    const response = await api.get('/candidatos/search', { params });
    return response.data;
  },
};

export const competenciasAPI = {
  getAll: async (params?: { search?: string; activa?: boolean }): Promise<{ competencias: Competencia[] }> => {
    const response = await api.get('/competencias', { params });
    return response.data.competencias ? response.data : { competencias: response.data };
  },
  
  create: async (competencia: { nombre: string; descripcion?: string }): Promise<Competencia> => {
    const response = await api.post('/competencias', competencia);
    return response.data;
  },
  
  update: async (id: number, competencia: { nombre?: string; descripcion?: string; activa?: boolean }): Promise<Competencia> => {
    const response = await api.put(`/competencias/${id}`, competencia);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/competencias/${id}`);
    return response.data;
  },
};

export const idiomasAPI = {
  getAll: async (params?: { search?: string; activo?: boolean }): Promise<{ idiomas: Idioma[] }> => {
    const response = await api.get('/idiomas', { params });
    return response.data.idiomas ? response.data : { idiomas: response.data };
  },
  
  create: async (idioma: { nombre: string; codigo_iso?: string }): Promise<Idioma> => {
    const response = await api.post('/idiomas', idioma);
    return response.data;
  },
  
  update: async (id: number, idioma: { nombre?: string; codigo_iso?: string; activo?: boolean }): Promise<Idioma> => {
    const response = await api.put(`/idiomas/${id}`, idioma);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/idiomas/${id}`);
    return response.data;
  },
};

export const capacitacionesAPI = {
  getAll: async (): Promise<Capacitacion[]> => {
    const response = await api.get('/capacitaciones');
    return response.data;
  },
  
  create: async (capacitacion: Omit<Capacitacion, 'id'>): Promise<Capacitacion> => {
    const response = await api.post('/capacitaciones', capacitacion);
    return response.data;
  },
  
  update: async (id: number, capacitacion: Partial<Omit<Capacitacion, 'id'>>): Promise<Capacitacion> => {
    const response = await api.put(`/capacitaciones/${id}`, capacitacion);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/capacitaciones/${id}`);
    return response.data;
  },
};

export const puestosAPI = {
  getAll: async (params?: { activo?: boolean; limit?: number }): Promise<{ puestos: Puesto[] }> => {
    const response = await api.get('/puestos', { params });
    return response.data.puestos ? response.data : { puestos: response.data };
  },
  
  create: async (puesto: Omit<Puesto, 'id'>): Promise<Puesto> => {
    const response = await api.post('/puestos', puesto);
    return response.data;
  },
  
  update: async (id: number, puesto: Partial<Omit<Puesto, 'id'>>): Promise<Puesto> => {
    const response = await api.put(`/puestos/${id}`, puesto);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/puestos/${id}`);
    return response.data;
  },
};

export const empleadosAPI = {
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    estado?: string; 
    search?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) => {
    const response = await api.get('/empleados', { params });
    return response.data;
  },
  
  getById: async (id: number): Promise<Empleado> => {
    const response = await api.get(`/empleados/${id}`);
    return response.data;
  },
  
  create: async (empleado: Omit<Empleado, 'id'>): Promise<Empleado> => {
    const response = await api.post('/empleados', empleado);
    return response.data;
  },
  
  update: async (id: number, empleado: Partial<Omit<Empleado, 'id'>>): Promise<Empleado> => {
    const response = await api.put(`/empleados/${id}`, empleado);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/empleados/${id}`);
    return response.data;
  },

  fromCandidato: async (candidatoId: number, data: {
    codigo_empleado: string;
    puestoId: number;
    fecha_ingreso: string;
    salario_acordado: number;
    estado?: 'activo' | 'inactivo' | 'vacaciones' | 'licencia';
  }): Promise<Empleado> => {
    const response = await api.post(`/empleados/from-candidato/${candidatoId}`, data);
    return response.data;
  },
};



// Nota: departamentosAPI será implementado cuando se cree el backend correspondiente
export const departamentosAPI = {
  getAll: async (params?: { search?: string; activo?: boolean }): Promise<{ departamentos: Departamento[] }> => {
    // Mock API - reemplazar con implementación real
    console.log('Parámetros:', params);
    throw new Error('API de departamentos no implementada aún');
  },
  
  create: async (departamento: Omit<Departamento, 'id' | 'createdAt' | 'updatedAt'>): Promise<Departamento> => {
    console.log('Crear departamento:', departamento);
    throw new Error('API de departamentos no implementada aún');
  },
  
  update: async (id: number, departamento: Partial<Omit<Departamento, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Departamento> => {
    console.log('Actualizar departamento:', id, departamento);
    throw new Error('API de departamentos no implementada aún');
  },
  
  delete: async (id: number) => {
    console.log('Eliminar departamento:', id);
    throw new Error('API de departamentos no implementada aún');
  },
};

export const reportesAPI = {
  newEmployeesReport: async (fechaInicio: string, fechaFin: string): Promise<Blob> => {
    const response = await api.get('/reports/new-employees', {
      params: { fechaInicio, fechaFin },
      responseType: 'blob'
    });
    return response.data;
  },
  
  candidatesSummaryReport: async (): Promise<Blob> => {
    const response = await api.get('/reports/candidates-summary', {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Vista previa de datos del reporte sin generar PDF
  newEmployeesReportData: async (fechaInicio: string, fechaFin: string) => {
    const response = await api.get('/empleados', {
      params: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        limit: 1000 // Alto límite para obtener todos los empleados del período
      }
    });
    return response.data;
  },
};

export { getToken, setToken, removeToken }; 