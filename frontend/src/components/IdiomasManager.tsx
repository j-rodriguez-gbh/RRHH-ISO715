import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Languages
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { idiomasAPI } from '../services/api';
import type { Idioma } from '../types';

export const IdiomasManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedIdioma, setSelectedIdioma] = useState<Idioma | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const queryClient = useQueryClient();

  // Query para obtener idiomas
  const { data: idiomasData, isLoading } = useQuery({
    queryKey: ['idiomas', { search: searchTerm, activo: filterActive }],
    queryFn: () => idiomasAPI.getAll({ 
      search: searchTerm || undefined,
      activo: filterActive ?? undefined 
    })
  });

  const idiomas = idiomasData?.idiomas || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: idiomasAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idiomas'] });
      toast.success('Idioma creado exitosamente');
      setShowModal(false);
      setSelectedIdioma(null);
    },
    onError: () => {
      toast.error('Error al crear el idioma');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Idioma> }) =>
      idiomasAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idiomas'] });
      toast.success('Idioma actualizado exitosamente');
      setShowModal(false);
      setSelectedIdioma(null);
    },
    onError: () => {
      toast.error('Error al actualizar el idioma');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: idiomasAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idiomas'] });
      toast.success('Idioma eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar el idioma');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      idiomasAPI.update(id, { activo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idiomas'] });
      toast.success('Estado actualizado exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    }
  });

  // Handlers
  const handleCreate = () => {
    setSelectedIdioma(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (idioma: Idioma) => {
    setSelectedIdioma(idioma);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (idioma: Idioma) => {
    setSelectedIdioma(idioma);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = (idioma: Idioma) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el idioma "${idioma.nombre}"?`)) {
      deleteMutation.mutate(idioma.id);
    }
  };

  const handleToggleActive = (idioma: Idioma) => {
    toggleActiveMutation.mutate({
      id: idioma.id,
      activo: !idioma.activo
    });
  };

  // Estadísticas
  const totalIdiomas = idiomas.length;
  const idiomasActivos = idiomas.filter(i => i.activo).length;
  const idiomasInactivos = idiomas.filter(i => !i.activo).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Globe className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Idiomas</h2>
            <p className="text-gray-600">Administra los idiomas disponibles en el sistema</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Idioma
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Idiomas</p>
              <p className="text-2xl font-semibold text-gray-900">{totalIdiomas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{idiomasActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactivos</p>
              <p className="text-2xl font-semibold text-gray-900">{idiomasInactivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tasa de Actividad</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalIdiomas > 0 ? Math.round((idiomasActivos / totalIdiomas) * 100) : 0}%
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
                placeholder="Buscar idiomas..."
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
                  Idioma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código ISO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {idiomas.map((idioma) => (
                <tr key={idioma.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Languages className="flex-shrink-0 h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {idioma.nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {idioma.codigo_iso || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(idioma)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        idioma.activo
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors cursor-pointer`}
                    >
                      {idioma.activo ? (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(idioma.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(idioma)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(idioma)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(idioma)}
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

          {idiomas.length === 0 && (
            <div className="text-center py-12">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay idiomas</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando un nuevo idioma.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Idioma
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <IdiomaModal
          idioma={selectedIdioma}
          mode={modalMode}
          onClose={() => {
            setShowModal(false);
            setSelectedIdioma(null);
          }}
          onSave={(data) => {
            if (modalMode === 'create') {
              createMutation.mutate(data);
            } else if (modalMode === 'edit' && selectedIdioma) {
              updateMutation.mutate({ id: selectedIdioma.id, data });
            }
          }}
        />
      )}
    </div>
  );
};

// Modal Component
interface IdiomaModalProps {
  idioma: Idioma | null;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSave: (data: Partial<Idioma>) => void;
}

const COMMON_LANGUAGES = [
  { nombre: 'Español', codigo: 'es' },
  { nombre: 'Inglés', codigo: 'en' },
  { nombre: 'Francés', codigo: 'fr' },
  { nombre: 'Portugués', codigo: 'pt' },
  { nombre: 'Italiano', codigo: 'it' },
  { nombre: 'Alemán', codigo: 'de' },
  { nombre: 'Chino Mandarín', codigo: 'zh' },
  { nombre: 'Japonés', codigo: 'ja' },
  { nombre: 'Coreano', codigo: 'ko' },
  { nombre: 'Árabe', codigo: 'ar' },
  { nombre: 'Ruso', codigo: 'ru' },
  { nombre: 'Hindi', codigo: 'hi' }
];

const IdiomaModal: React.FC<IdiomaModalProps> = ({
  idioma,
  mode,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nombre: idioma?.nombre || '',
    codigo_iso: idioma?.codigo_iso || '',
    activo: idioma?.activo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSave(formData);
    }
  };

  const handleQuickSelect = (language: { nombre: string; codigo: string }) => {
    setFormData({
      ...formData,
      nombre: language.nombre,
      codigo_iso: language.codigo
    });
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === 'create' && 'Nuevo Idioma'}
              {mode === 'edit' && 'Editar Idioma'}
              {mode === 'view' && 'Detalles de Idioma'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idiomas Comunes
                </label>
                <div className="grid grid-cols-2 gap-1 mb-4">
                  {COMMON_LANGUAGES.map((lang) => (
                    <button
                      key={lang.codigo}
                      type="button"
                      onClick={() => handleQuickSelect(lang)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                    >
                      {lang.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                placeholder="Nombre del idioma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código ISO
              </label>
              <input
                type="text"
                readOnly={isReadOnly}
                value={formData.codigo_iso}
                onChange={(e) => setFormData({ ...formData, codigo_iso: e.target.value })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isReadOnly ? 'bg-gray-50' : ''
                }`}
                placeholder="Código ISO (ej: es, en, fr)"
                maxLength={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Código de 2-5 caracteres para identificar el idioma
              </p>
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
                Idioma activo
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