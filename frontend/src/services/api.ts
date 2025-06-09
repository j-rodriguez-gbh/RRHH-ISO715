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
  Empleado
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
  getAll: async (): Promise<Competencia[]> => {
    const response = await api.get('/competencias');
    return response.data.competencias || response.data;
  },
  
  create: async (competencia: { nombre: string; descripcion?: string }): Promise<Competencia> => {
    const response = await api.post('/competencias', competencia);
    return response.data;
  },
  
  update: async (id: number, competencia: { nombre?: string; descripcion?: string; activo?: boolean }): Promise<Competencia> => {
    const response = await api.put(`/competencias/${id}`, competencia);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/competencias/${id}`);
    return response.data;
  },
};

export const idiomasAPI = {
  getAll: async (): Promise<Idioma[]> => {
    const response = await api.get('/idiomas');
    return response.data.idiomas || response.data;
  },
  
  create: async (idioma: { nombre: string }): Promise<Idioma> => {
    const response = await api.post('/idiomas', idioma);
    return response.data;
  },
  
  update: async (id: number, idioma: { nombre?: string; activo?: boolean }): Promise<Idioma> => {
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
  getAll: async (): Promise<Puesto[]> => {
    const response = await api.get('/puestos');
    return response.data;
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
  getAll: async (): Promise<Empleado[]> => {
    const response = await api.get('/empleados');
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
};

export { getToken, setToken, removeToken }; 