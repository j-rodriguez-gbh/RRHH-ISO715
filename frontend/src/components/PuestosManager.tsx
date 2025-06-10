import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { puestosAPI } from '../services/api';
import type { Puesto } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';

type ModalType = 'create' | 'edit' | 'view' | null;

const NIVELES_PUESTO = [
  { value: 'junior', label: 'Junior', color: 'bg-green-100 text-green-800' },
  { value: 'mid', label: 'Mid-Level', color: 'bg-blue-100 text-blue-800' },
  { value: 'senior', label: 'Senior', color: 'bg-purple-100 text-purple-800' },
  { value: 'lead', label: 'Tech Lead', color: 'bg-orange-100 text-orange-800' },
  { value: 'manager', label: 'Manager', color: 'bg-red-100 text-red-800' },
  { value: 'director', label: 'Director', color: 'bg-gray-100 text-gray-800' }
];

export const PuestosManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedPuesto, setSelectedPuesto] = useState<Puesto | null>(null);

  const queryClient = useQueryClient();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();

  // Query para obtener puestos - obtener TODOS para poder filtrar en UI
  const { data: puestosData, isLoading, error } = useQuery({
    queryKey: ['puestos'],
    queryFn: () => puestosAPI.getAll()
  });

  const puestos = puestosData?.puestos || [];

  // Mutation para crear puesto
  const createPuestoMutation = useMutation({
    mutationFn: (data: Partial<Puesto>) => puestosAPI.create(data as Omit<Puesto, 'id'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puestos'] });
      toast.success('Puesto creado exitosamente');
      setModalType(null);
    },
    onError: () => {
      toast.error('Error al crear el puesto');
    }
  });

  // Mutation para actualizar puesto
  const updatePuestoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Puesto> }) => 
      puestosAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puestos'] });
      toast.success('Puesto actualizado exitosamente');
      setModalType(null);
    },
    onError: () => {
      toast.error('Error al actualizar el puesto');
    }
  });

  // Mutation para eliminar puesto
  const deletePuestoMutation = useMutation({
    mutationFn: (id: number) => puestosAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puestos'] });
      toast.success('Puesto eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar el puesto');
    }
  });

  // Mutation para toggle estado del puesto
  const togglePuestoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      puestosAPI.update(id, { activo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puestos'] });
      toast.success('Estado actualizado exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    }
  });

  // Filtros
  const filteredPuestos = puestos.filter((puesto: Puesto) => {
    const matchesSearch = puesto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         puesto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !selectedLevel || puesto.nivel === selectedLevel;
    const matchesDepartment = !selectedDepartment || puesto.departamento === selectedDepartment;
    const matchesActive = filterActive === null || puesto.activo === filterActive;
    
    return matchesSearch && matchesLevel && matchesDepartment && matchesActive;
  });

  // Obtener departamentos únicos
  const departments = [...new Set(puestos.map((p: Puesto) => p.departamento).filter(Boolean))];

  const handleCreate = () => {
    setSelectedPuesto(null);
    setModalType('create');
  };

  const handleEdit = (puesto: Puesto) => {
    setSelectedPuesto(puesto);
    setModalType('edit');
  };

  const handleView = (puesto: Puesto) => {
    setSelectedPuesto(puesto);
    setModalType('view');
  };

  const handleDelete = async (id: number) => {
    const puesto = puestos.find((p: Puesto) => p.id === id);
    const puestoName = puesto?.nombre || 'este puesto';
    
    showConfirmation(
      {
        title: 'Eliminar Puesto',
        message: `¿Estás seguro de que deseas eliminar <strong>"${puestoName}"</strong>?<br/>Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
        loadingText: 'Eliminando...'
      },
      () => deletePuestoMutation.mutateAsync(id)
    );
  };

  const handleToggleActive = (puesto: Puesto) => {
    togglePuestoMutation.mutate({
      id: puesto.id,
      activo: !puesto.activo
    });
  };

  const getLevelInfo = (nivel: string) => {
    return NIVELES_PUESTO.find(n => n.value === nivel) || 
           { value: nivel, label: nivel, color: 'bg-gray-100 text-gray-800' };
  };

  const formatSalary = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar los puestos</h3>
          <p className="text-gray-600">Por favor, intenta nuevamente más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Puestos</h1>
              <p className="text-gray-600 mt-1">
                Administra los puestos de trabajo de la organización
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Puesto</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Puestos</p>
                <p className="text-2xl font-bold text-gray-900">{puestos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {puestos.filter((p: Puesto) => p.activo).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Building className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departamentos</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Star className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Niveles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(puestos.map((p: Puesto) => p.nivel))].length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar puestos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los niveles</option>
              {NIVELES_PUESTO.map(nivel => (
                <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los departamentos</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={filterActive === null ? '' : filterActive.toString()}
              onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Puestos List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredPuestos.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay puestos</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedLevel || selectedDepartment || filterActive !== null
                  ? 'No se encontraron puestos con los filtros aplicados.'
                  : 'Comienza creando tu primer puesto de trabajo.'}
              </p>
              {!searchTerm && !selectedLevel && !selectedDepartment && filterActive === null && (
                <button 
                  onClick={handleCreate} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Primer Puesto
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Puesto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Nivel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Salario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Experiencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPuestos.map((puesto: Puesto) => {
                    const levelInfo = getLevelInfo(puesto.nivel);
                    return (
                      <tr key={puesto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {puesto.nombre}
                            </div>
                            {puesto.descripcion && (
                              <div className="text-sm text-gray-500 truncate max-w-[180px]">
                                {puesto.descripcion}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center min-w-0">
                            <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate">
                              {puesto.departamento || 'No especificado'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${levelInfo.color}`}>
                            {levelInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {puesto.salario_min && puesto.salario_max ? (
                              <div>
                                <div>{formatSalary(puesto.salario_min)}</div>
                                <div className="text-xs text-gray-500">
                                  - {formatSalary(puesto.salario_max)}
                                </div>
                              </div>
                            ) : (
                              'No especificado'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {puesto.experiencia_minima} año{puesto.experiencia_minima !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(puesto)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              puesto.activo
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } transition-colors cursor-pointer`}
                          >
                            {puesto.activo ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(puesto)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(puesto)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(puesto.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <PuestoModal
          type={modalType}
          puesto={selectedPuesto}
          onClose={() => setModalType(null)}
          onSave={(data) => {
            if (modalType === 'create') {
              createPuestoMutation.mutate(data);
            } else if (modalType === 'edit' && selectedPuesto) {
              updatePuestoMutation.mutate({ id: selectedPuesto.id, data });
            }
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        isDestructive={confirmation.isDestructive}
        isLoading={confirmation.isLoading}
        loadingText={confirmation.loadingText}
      />
    </div>
  );
};

// Modal Component
interface PuestoModalProps {
  type: 'create' | 'edit' | 'view';
  puesto: Puesto | null;
  onClose: () => void;
  onSave: (data: Partial<Puesto>) => void;
}

const PuestoModal: React.FC<PuestoModalProps> = ({ type, puesto, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: puesto?.nombre || '',
    descripcion: puesto?.descripcion || '',
    departamento: puesto?.departamento || '',
    nivel: puesto?.nivel || 'junior',
    salario_min: puesto?.salario_min || '',
    salario_max: puesto?.salario_max || '',
    requisitos: puesto?.requisitos || '',
    experiencia_minima: puesto?.experiencia_minima || 0,
    activo: puesto?.activo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      salario_min: formData.salario_min ? Number(formData.salario_min) : undefined,
      salario_max: formData.salario_max ? Number(formData.salario_max) : undefined,
      experiencia_minima: Number(formData.experiencia_minima)
    };

    onSave(dataToSave);
  };

  const isReadOnly = type === 'view';
  const title = type === 'create' ? 'Crear Puesto' : type === 'edit' ? 'Editar Puesto' : 'Detalles del Puesto';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre del Puesto *
              </label>
              <input
                type="text"
                required
                readOnly={isReadOnly}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Departamento
              </label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nivel *
              </label>
              <select
                required
                disabled={isReadOnly}
                value={formData.nivel}
                onChange={(e) => setFormData({ ...formData, nivel: e.target.value as 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {NIVELES_PUESTO.map(nivel => (
                  <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experiencia Mínima (años)
              </label>
              <input
                type="number"
                min="0"
                readOnly={isReadOnly}
                value={formData.experiencia_minima}
                onChange={(e) => setFormData({ ...formData, experiencia_minima: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salario Mínimo
              </label>
              <input
                type="number"
                min="0"
                readOnly={isReadOnly}
                value={formData.salario_min}
                onChange={(e) => setFormData({ ...formData, salario_min: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ejemplo: 2500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salario Máximo
              </label>
              <input
                type="number"
                min="0"
                readOnly={isReadOnly}
                value={formData.salario_max}
                onChange={(e) => setFormData({ ...formData, salario_max: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ejemplo: 4000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              rows={3}
              readOnly={isReadOnly}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción detallada del puesto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Requisitos
            </label>
            <textarea
              rows={4}
              readOnly={isReadOnly}
              value={formData.requisitos}
              onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Requisitos y cualificaciones necesarias..."
            />
          </div>

          {type !== 'create' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                disabled={isReadOnly}
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                Puesto activo
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {isReadOnly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {type === 'create' ? 'Crear Puesto' : 'Guardar Cambios'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}; 