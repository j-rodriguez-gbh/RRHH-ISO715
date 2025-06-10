import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { competenciasAPI } from '../services/api';
import type { Competencia } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';

export const CompetenciasManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompetencia, setSelectedCompetencia] = useState<Competencia | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const queryClient = useQueryClient();
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();

  // Query para obtener competencias - obtener TODAS para poder filtrar en UI
  const { data: competenciasData, isLoading } = useQuery({
    queryKey: ['competencias', { search: searchTerm }],
    queryFn: () => competenciasAPI.getAll({ 
      search: searchTerm || undefined
      // No filtrar por activa aquí - lo haremos en el frontend
    })
  });

  // Aplicar filtros en el frontend
  const allCompetencias = competenciasData?.competencias || [];
  const competencias = allCompetencias.filter(competencia => {
    if (filterActive === null) return true;
    return competencia.activa === filterActive;
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: competenciasAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencias'] });
      toast.success('Competencia creada exitosamente');
      setShowModal(false);
      setSelectedCompetencia(null);
    },
    onError: () => {
      toast.error('Error al crear la competencia');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Competencia> }) =>
      competenciasAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencias'] });
      toast.success('Competencia actualizada exitosamente');
      setShowModal(false);
      setSelectedCompetencia(null);
    },
    onError: () => {
      toast.error('Error al actualizar la competencia');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: competenciasAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencias'] });
      toast.success('Competencia eliminada exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar la competencia');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) =>
      competenciasAPI.update(id, { activa }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencias'] });
      toast.success('Estado actualizado exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    }
  });

  // Handlers
  const handleCreate = () => {
    setSelectedCompetencia(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (competencia: Competencia) => {
    setSelectedCompetencia(competencia);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (competencia: Competencia) => {
    setSelectedCompetencia(competencia);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = (competencia: Competencia) => {
    showConfirmation(
      {
        title: 'Eliminar Competencia',
        message: `¿Estás seguro de que deseas eliminar la competencia <strong>"${competencia.nombre}"</strong>?<br/>Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
        loadingText: 'Eliminando...'
      },
      () => deleteMutation.mutateAsync(competencia.id)
    );
  };

  const handleToggleActive = (competencia: Competencia) => {
    toggleActiveMutation.mutate({
      id: competencia.id,
      activa: !competencia.activa
    });
  };

  // Estadísticas - basadas en TODOS los datos, no en los filtrados
  const totalCompetencias = allCompetencias.length;
  const competenciasActivas = allCompetencias.filter(c => c.activa).length;
  const competenciasInactivas = allCompetencias.filter(c => !c.activa).length;

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
            <Award className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Competencias</h1>
              <p className="text-gray-600 mt-1">
                Administra las competencias técnicas y operativas del sistema
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nueva Competencia</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Competencias</p>
                <p className="text-2xl font-bold text-gray-900">{totalCompetencias}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">{competenciasActivas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-gray-900">{competenciasInactivas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa de Actividad</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCompetencias > 0 ? Math.round((competenciasActivas / totalCompetencias) * 100) : 0}%
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
                  placeholder="Buscar competencias..."
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
                Todas
              </button>
              <button
                onClick={() => setFilterActive(true)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filterActive === true
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setFilterActive(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filterActive === false
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Inactivas
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
                    Competencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
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
                {competencias.map((competencia) => (
                  <tr key={competencia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="flex-shrink-0 h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {competencia.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {competencia.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(competencia)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          competencia.activa
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors cursor-pointer`}
                      >
                        {competencia.activa ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activa
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactiva
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(competencia)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(competencia)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(competencia)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
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

            {competencias.length === 0 && (
              <div className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay competencias</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza creando una nueva competencia.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Competencia
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <CompetenciaModal
            competencia={selectedCompetencia}
            mode={modalMode}
            onClose={() => {
              setShowModal(false);
              setSelectedCompetencia(null);
            }}
            onSave={(data) => {
              if (modalMode === 'create') {
                createMutation.mutate({
                  nombre: data.nombre!,
                  descripcion: data.descripcion
                });
              } else if (modalMode === 'edit' && selectedCompetencia) {
                updateMutation.mutate({ id: selectedCompetencia.id, data });
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
    </div>
  );
};

// Modal Component
interface CompetenciaModalProps {
  competencia: Competencia | null;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSave: (data: Partial<Competencia>) => void;
}

const CompetenciaModal: React.FC<CompetenciaModalProps> = ({
  competencia,
  mode,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nombre: competencia?.nombre || '',
    descripcion: competencia?.descripcion || '',
    activa: competencia?.activa ?? true
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
              {mode === 'create' && 'Nueva Competencia'}
              {mode === 'edit' && 'Editar Competencia'}
              {mode === 'view' && 'Detalles de Competencia'}
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
                placeholder="Nombre de la competencia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                readOnly={isReadOnly}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isReadOnly ? 'bg-gray-50' : ''
                }`}
                placeholder="Descripción de la competencia"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                disabled={isReadOnly}
                checked={formData.activa}
                onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Competencia activa
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