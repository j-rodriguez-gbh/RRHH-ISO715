import React, { useState } from 'react';
import { 
  Building, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { departamentosAPI } from '../services/api';
import type { Departamento } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';

export const DepartamentosManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const queryClient = useQueryClient();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();

  // Query para obtener departamentos - obtener TODOS para poder filtrar en UI
  const { data: departamentosData, isLoading } = useQuery({
    queryKey: ['departamentos', { search: searchTerm }],
    queryFn: () => departamentosAPI.getAll({ 
      search: searchTerm || undefined
      // No filtrar por activo aquí - lo haremos en el frontend
    })
  });

  // Aplicar filtros en el frontend
  const allDepartamentos = departamentosData?.departamentos || [];
  const departamentos = allDepartamentos.filter(departamento => {
    if (filterActive === null) return true;
    return departamento.activo === filterActive;
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: departamentosAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] });
      toast.success('Departamento creado exitosamente');
      setShowModal(false);
      setSelectedDepartamento(null);
    },
    onError: () => {
      toast.error('Error al crear el departamento');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Departamento> }) =>
      departamentosAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] });
      toast.success('Departamento actualizado exitosamente');
      setShowModal(false);
      setSelectedDepartamento(null);
    },
    onError: () => {
      toast.error('Error al actualizar el departamento');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: departamentosAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] });
      toast.success('Departamento eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar el departamento');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      departamentosAPI.update(id, { activo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] });
      toast.success('Estado actualizado exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    }
  });

  // Handlers
  const handleCreate = () => {
    setSelectedDepartamento(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = (departamento: Departamento) => {
    showConfirmation(
      {
        title: 'Eliminar Departamento',
        message: `¿Estás seguro de que deseas eliminar el departamento <strong>"${departamento.nombre}"</strong>?<br/>Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
        loadingText: 'Eliminando...'
      },
      () => deleteMutation.mutateAsync(departamento.id)
    );
  };

  const handleToggleActive = (departamento: Departamento) => {
    toggleActiveMutation.mutate({
      id: departamento.id,
      activo: !departamento.activo
    });
  };

  const handleSave = (data: Partial<Departamento>) => {
    if (modalMode === 'create') {
      createMutation.mutate(data as Omit<Departamento, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (modalMode === 'edit' && selectedDepartamento) {
      updateMutation.mutate({ id: selectedDepartamento.id, data });
    }
  };

  // Estadísticas - basadas en TODOS los datos, no en los filtrados
  const totalDepartamentos = allDepartamentos.length;
  const departamentosActivos = allDepartamentos.filter(d => d.activo).length;
  const departamentosInactivos = allDepartamentos.filter(d => !d.activo).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Departamentos</h1>
              <p className="text-gray-600 mt-1">
                Administra la estructura departamental de la organización
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Departamento</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Building className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Departamentos</p>
                <p className="text-2xl font-bold text-gray-900">{totalDepartamentos}</p>
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
                <p className="text-2xl font-bold text-gray-900">{departamentosActivos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">{departamentosInactivos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa de Actividad</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDepartamentos > 0 ? Math.round((departamentosActivos / totalDepartamentos) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Buscar departamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterActive(null)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filterActive === null
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterActive(true)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filterActive === true
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setFilterActive(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filterActive === false
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Inactivos
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gerente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departamentos.map((departamento) => (
                  <tr key={departamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="flex-shrink-0 h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {departamento.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {departamento.codigo && `(${departamento.codigo})`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {departamento.gerente || 'Sin asignar'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {departamento.empleados_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(departamento)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          departamento.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors cursor-pointer`}
                      >
                        {departamento.activo ? (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(departamento)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(departamento)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(departamento)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {departamentos.length === 0 && (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay departamentos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza creando un nuevo departamento.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Departamento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <DepartamentoModal
            departamento={selectedDepartamento}
            mode={modalMode}
            onClose={() => {
              setShowModal(false);
              setSelectedDepartamento(null);
            }}
            onSave={handleSave}
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
    </div>
  );
};

// Modal Component
interface DepartamentoModalProps {
  departamento: Departamento | null;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSave: (data: Partial<Departamento>) => void;
}

const DepartamentoModal: React.FC<DepartamentoModalProps> = ({
  departamento,
  mode,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nombre: departamento?.nombre || '',
    codigo: departamento?.codigo || '',
    gerente: departamento?.gerente || '',
    activo: departamento?.activo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSave(formData);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === 'create' && 'Nuevo Departamento'}
              {mode === 'edit' && 'Editar Departamento'}
              {mode === 'view' && 'Detalles de Departamento'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                readOnly={isReadOnly}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isReadOnly ? 'bg-gray-50' : ''
                }`}
                placeholder="Nombre del departamento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código
              </label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isReadOnly ? 'bg-gray-50' : ''
                }`}
                placeholder="Código (ej: RRHH, TI, VEN)"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gerente
              </label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={formData.gerente}
                onChange={(e) => setFormData({ ...formData, gerente: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isReadOnly ? 'bg-gray-50' : ''
                }`}
                placeholder="Nombre del gerente"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                disabled={isReadOnly}
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Departamento activo
              </label>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {mode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}; 