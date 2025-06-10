import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Save, 
  X, 
  Calendar,
  Building,
  DollarSign,
  Mail,
  Phone,
  FileText,
  UserCheck
} from 'lucide-react';
import { empleadosAPI, candidatosAPI, puestosAPI } from '../services/api';
import type { Candidato, Puesto } from '../types';

interface HireCandidatoFormData {
  codigo_empleado: string;
  puestoId: number | null;
  fecha_ingreso: string;
  salario_acordado: number;
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia';
}

interface HireCandidatoFormProps {
  candidatoId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const HireCandidatoForm: React.FC<HireCandidatoFormProps> = ({
  candidatoId,
  onSuccess,
  onCancel
}) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<HireCandidatoFormData>({
    codigo_empleado: '',
    puestoId: null,
    fecha_ingreso: new Date().toISOString().split('T')[0],
    salario_acordado: 0,
    estado: 'activo'
  });

  const [errors, setErrors] = useState<Partial<HireCandidatoFormData>>({});

  // Fetch candidato data
  const { data: candidatoData, isLoading: candidatoLoading } = useQuery({
    queryKey: ['candidato', candidatoId],
    queryFn: () => candidatosAPI.getById(candidatoId),
  });

  // Fetch puestos activos
  const { data: puestosData } = useQuery({
    queryKey: ['puestos', 'activos'],
    queryFn: () => puestosAPI.getAll({ activo: true, limit: 100 }),
  });

  const candidato = candidatoData?.candidato;
  const puestos = puestosData?.puestos || [];

  // Generate employee code automatically
  useEffect(() => {
    if (!formData.codigo_empleado && candidato) {
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-4);
      setFormData(prev => ({
        ...prev,
        codigo_empleado: `EMP-${year}-${timestamp}`,
        salario_acordado: candidato.salario_aspirado || 0
      }));
    }
  }, [candidato, formData.codigo_empleado]);

  const hireMutation = useMutation({
    mutationFn: (data: HireCandidatoFormData) => 
      empleadosAPI.fromCandidato(candidatoId, {
        codigo_empleado: data.codigo_empleado,
        puestoId: data.puestoId!,
        fecha_ingreso: data.fecha_ingreso,
        salario_acordado: data.salario_acordado,
        estado: data.estado
      }),
    onSuccess: (empleadoCreado) => {
      // Invalidate all related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
      queryClient.invalidateQueries({ queryKey: ['candidato', candidatoId] });
      
      // Small delay to ensure queries are invalidated before navigation
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    },
    onError: (error) => {
      console.error('Error al contratar candidato:', error);
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salario_acordado' ? parseFloat(value) || 0 : value === '' ? null : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof HireCandidatoFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<HireCandidatoFormData> = {};

    if (!formData.codigo_empleado) {
      newErrors.codigo_empleado = 'El código de empleado es requerido';
    }

    if (!formData.puestoId) {
      newErrors.puestoId = 'Debe seleccionar un puesto';
    }

    if (!formData.fecha_ingreso) {
      newErrors.fecha_ingreso = 'La fecha de ingreso es requerida';
    }

    if (!formData.salario_acordado || formData.salario_acordado <= 0) {
      newErrors.salario_acordado = 'El salario debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await hireMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error al contratar candidato:', error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  if (candidatoLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidato) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Candidato no encontrado</p>
      </div>
    );
  }

  if (candidato.estado !== 'aprobado') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Solo candidatos aprobados pueden ser contratados</p>
      </div>
    );
  }

  const selectedPuesto = puestos.find(p => p.id === formData.puestoId);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contratar Candidato</h1>
              <p className="text-sm text-gray-600">
                Convierte al candidato en empleado
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Candidato */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Información del Candidato</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Nombre:</span>
                  <span className="text-sm font-medium">
                    {candidato.nombres} {candidato.apellidos}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">{candidato.email}</span>
                </div>
                
                {candidato.telefono && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    <span className="text-sm font-medium">{candidato.telefono}</span>
                  </div>
                )}
                
                {candidato.documento_identidad && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Documento:</span>
                    <span className="text-sm font-medium">{candidato.documento_identidad}</span>
                  </div>
                )}
                
                {candidato.salario_aspirado && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Salario Aspirado:</span>
                    <span className="text-sm font-medium">
                      {new Intl.NumberFormat('es-DO', {
                        style: 'currency',
                        currency: 'DOP'
                      }).format(candidato.salario_aspirado)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información del Empleado */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Información del Empleado</h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código de Empleado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Empleado *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="codigo_empleado"
                    value={formData.codigo_empleado}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.codigo_empleado ? 'border-red-300' : ''}`}
                    placeholder="EMP-2024-0001"
                  />
                </div>
                {errors.codigo_empleado && (
                  <p className="mt-1 text-sm text-red-600">{errors.codigo_empleado}</p>
                )}
              </div>

              {/* Puesto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puesto *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="puestoId"
                    value={formData.puestoId || ''}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.puestoId ? 'border-red-300' : ''}`}
                  >
                    <option value="">Seleccionar puesto...</option>
                    {puestos.map((puesto: Puesto) => (
                      <option key={puesto.id} value={puesto.id}>
                        {puesto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.puestoId && (
                  <p className="mt-1 text-sm text-red-600">{errors.puestoId}</p>
                )}
              </div>

              {/* Fecha de Ingreso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={formData.fecha_ingreso}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.fecha_ingreso ? 'border-red-300' : ''}`}
                  />
                </div>
                {errors.fecha_ingreso && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_ingreso}</p>
                )}
              </div>

              {/* Salario Acordado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salario Acordado (DOP) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="salario_acordado"
                    value={formData.salario_acordado}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.salario_acordado ? 'border-red-300' : ''}`}
                    placeholder="50000"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.salario_acordado && (
                  <p className="mt-1 text-sm text-red-600">{errors.salario_acordado}</p>
                )}
              </div>

              {/* Estado */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="vacaciones">En vacaciones</option>
                  <option value="licencia">En licencia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Información del Puesto Seleccionado */}
          {selectedPuesto && (
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Información del Puesto</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Nivel de Riesgo:</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedPuesto.nivel_riesgo === 'Alto' ? 'bg-red-100 text-red-800' :
                        selectedPuesto.nivel_riesgo === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedPuesto.nivel_riesgo}
                      </span>
                    </div>
                  </div>
                  
                  {selectedPuesto.salario_min && (
                    <div>
                      <span className="text-sm text-gray-600">Salario Mínimo:</span>
                      <div className="mt-1 text-sm font-medium">
                        {new Intl.NumberFormat('es-DO', {
                          style: 'currency',
                          currency: 'DOP'
                        }).format(selectedPuesto.salario_min)}
                      </div>
                    </div>
                  )}
                  
                  {selectedPuesto.salario_max && (
                    <div>
                      <span className="text-sm text-gray-600">Salario Máximo:</span>
                      <div className="mt-1 text-sm font-medium">
                        {new Intl.NumberFormat('es-DO', {
                          style: 'currency',
                          currency: 'DOP'
                        }).format(selectedPuesto.salario_max)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </button>
            
            <button
              type="submit"
              disabled={hireMutation.isPending}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>
                {hireMutation.isPending
                  ? 'Contratando...'
                  : 'Contratar Empleado'
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 