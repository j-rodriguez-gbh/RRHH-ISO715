import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  User, 
  Save, 
  X, 
  Calendar,
  Building,
  DollarSign,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { empleadosAPI, candidatosAPI, puestosAPI } from '../services/api';
import type { Empleado, Candidato, Puesto } from '../types';

interface EmpleadoFormData {
  codigo_empleado: string;
  candidatoId: number | null;
  puestoId: number | null;
  fecha_ingreso: string;
  salario_acordado: number;
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia';
}

interface EmpleadoFormProps {
  empleadoId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EmpleadoForm: React.FC<EmpleadoFormProps> = ({
  empleadoId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!empleadoId;
  
  const [formData, setFormData] = useState<EmpleadoFormData>({
    codigo_empleado: '',
    candidatoId: null,
    puestoId: null,
    fecha_ingreso: new Date().toISOString().split('T')[0],
    salario_acordado: 0,
    estado: 'activo'
  });

  const [errors, setErrors] = useState<Partial<EmpleadoFormData>>({});

  // Fetch empleado data if editing
  const { data: empleado, isLoading: empleadoLoading } = useQuery({
    queryKey: ['empleado', empleadoId],
    queryFn: () => empleadosAPI.getById(empleadoId!),
    enabled: isEditing,
  });

  // Fetch candidatos aprobados para el dropdown
  const { data: candidatosData, isLoading: candidatosLoading, error: candidatosError } = useQuery({
    queryKey: ['candidatos', 'aprobados'],
    queryFn: () => candidatosAPI.getAll({ estado: 'aprobado', limit: 100 }),
  });

  // Fetch puestos activos
  const { data: puestosData } = useQuery({
    queryKey: ['puestos', 'activos'],
    queryFn: () => puestosAPI.getAll({ activo: true, limit: 100 }),
  });

  const candidatos = candidatosData?.candidatos || [];
  const puestos = puestosData?.puestos || [];

  // Load empleado data when editing
  useEffect(() => {
    if (empleado) {
      setFormData({
        codigo_empleado: empleado.codigo_empleado,
        candidatoId: empleado.candidatoId || null,
        puestoId: empleado.puestoId,
        fecha_ingreso: empleado.fecha_ingreso.split('T')[0],
        salario_acordado: empleado.salario_acordado,
        estado: empleado.estado
      });
    }
  }, [empleado]);

  // Generate employee code automatically
  useEffect(() => {
    if (!isEditing && !formData.codigo_empleado) {
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-4);
      setFormData(prev => ({
        ...prev,
        codigo_empleado: `EMP-${year}-${timestamp}`
      }));
    }
  }, [isEditing, formData.codigo_empleado]);

  const createMutation = useMutation({
    mutationFn: empleadosAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      onSuccess?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmpleadoFormData> }) => 
      empleadosAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['empleado', empleadoId] });
      onSuccess?.();
    },
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
    if (errors[name as keyof EmpleadoFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EmpleadoFormData> = {};

    if (!formData.codigo_empleado) {
      newErrors.codigo_empleado = 'El código de empleado es requerido';
    }

    if (!formData.candidatoId) {
      newErrors.candidatoId = 'Debe seleccionar un candidato';
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
      if (isEditing) {
        await updateMutation.mutateAsync({ 
          id: empleadoId!, 
          data: formData 
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error al guardar empleado:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/empleados');
    }
  };

  if (empleadoLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedCandidato = candidatos.find(c => c.id === formData.candidatoId);
  const selectedPuesto = puestos.find(p => p.id === formData.puestoId);

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h1>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Actualiza la información del empleado' : 'Crea un nuevo registro de empleado'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Candidato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Candidato *
                </label>
                <select
                  name="candidatoId"
                  value={formData.candidatoId || ''}
                  onChange={handleInputChange}
                  className={`input-field ${errors.candidatoId ? 'border-red-300' : ''}`}
                >
                  <option value="">Seleccionar candidato...</option>
                  {candidatos.map((candidato: Candidato) => (
                    <option key={candidato.id} value={candidato.id}>
                      {candidato.nombres} {candidato.apellidos} - {candidato.email}
                    </option>
                  ))}
                </select>
                {errors.candidatoId && (
                  <p className="mt-1 text-sm text-red-600">{errors.candidatoId}</p>
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
              <div>
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

          {/* Información del Candidato Seleccionado */}
          {selectedCandidato && (
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Información del Candidato</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{selectedCandidato.email}</span>
                  </div>
                  
                  {selectedCandidato.telefono && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Teléfono:</span>
                      <span className="text-sm font-medium">{selectedCandidato.telefono}</span>
                    </div>
                  )}
                  
                  {selectedCandidato.documento_identidad && (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Documento:</span>
                      <span className="text-sm font-medium">{selectedCandidato.documento_identidad}</span>
                    </div>
                  )}
                  
                  {selectedCandidato.salario_aspirado && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Salario Aspirado:</span>
                      <span className="text-sm font-medium">
                        {new Intl.NumberFormat('es-DO', {
                          style: 'currency',
                          currency: 'DOP'
                        }).format(selectedCandidato.salario_aspirado)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>
                {createMutation.isPending || updateMutation.isPending
                  ? 'Guardando...'
                  : isEditing
                  ? 'Actualizar'
                  : 'Crear Empleado'
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 