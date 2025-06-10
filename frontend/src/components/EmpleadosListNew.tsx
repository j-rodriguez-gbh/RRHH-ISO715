import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
  UserMinus
} from 'lucide-react';
import { empleadosAPI } from '../services/api';
import type { Empleado } from '../types';
import { EmpleadoForm } from './EmpleadoForm';

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'vacaciones', label: 'En vacaciones' },
  { value: 'licencia', label: 'En licencia' },
] as const;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getEstadoBadgeClass = (estado: string) => {
  const classes = {
    'activo': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    'inactivo': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    'vacaciones': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    'licencia': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
  };
  
  return classes[estado as keyof typeof classes] || classes.activo;
};

const getEstadoLabel = (estado: string) => {
  const labels = {
    'activo': 'Activo',
    'inactivo': 'Inactivo',
    'vacaciones': 'En vacaciones',
    'licencia': 'En licencia',
  };
  
  return labels[estado as keyof typeof labels] || estado;
};

export const EmpleadosList: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<number | undefined>(undefined);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [empleadoToDeactivate, setEmpleadoToDeactivate] = useState<{id: number, name: string} | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const limit = 10;

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => empleadosAPI.update(id, { estado: 'inactivo' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
    onError: (error) => {
      console.error('Error deactivating empleado:', error);
      alert('Error al desactivar el empleado. Por favor, intenta nuevamente.');
    }
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, estadoFilter]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['empleados', page, debouncedSearch, estadoFilter],
    queryFn: () => empleadosAPI.getAll({ 
      page, 
      limit, 
      search: debouncedSearch || undefined,
      estado: estadoFilter || undefined 
    }),
  });

  // Maintain focus on search input after query completes
  useEffect(() => {
    if (searchInputRef.current && !isLoading && search) {
      const activeElement = document.activeElement;
      if (activeElement !== searchInputRef.current && 
          activeElement?.tagName !== 'INPUT' && 
          activeElement?.tagName !== 'SELECT') {
        searchInputRef.current.focus();
      }
    }
  }, [isLoading, search]);

  const empleados = data?.empleados || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setSearch('');
    setEstadoFilter('');
    setPage(1);
  };

  const handleNewEmpleado = () => {
    setEditingEmpleado(undefined);
    setShowForm(true);
  };

  const handleEditEmpleado = (id: number) => {
    setEditingEmpleado(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmpleado(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEmpleado(undefined);
    refetch();
  };

  const handleDeactivateEmpleado = (id: number, empleadoName: string) => {
    setEmpleadoToDeactivate({ id, name: empleadoName });
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = () => {
    if (empleadoToDeactivate) {
      deactivateMutation.mutate(empleadoToDeactivate.id);
      setShowDeactivateModal(false);
      setEmpleadoToDeactivate(null);
    }
  };

  const handleCancelDeactivate = () => {
    setShowDeactivateModal(false);
    setEmpleadoToDeactivate(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error al cargar los empleados</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
                <p className="text-sm text-gray-600">
                  {total} empleado{total !== 1 ? 's' : ''} en total
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleNewEmpleado}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Empleado</span>
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="card mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar por nombre, código o email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                </button>
                
                <button type="submit" className="btn-primary">
                  Buscar
                </button>
              </div>

              {showFilters && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={estadoFilter}
                        onChange={(e) => setEstadoFilter(e.target.value)}
                        className="input-field"
                      >
                        {ESTADO_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="btn-secondary text-sm"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Employees Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puesto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Ingreso
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {empleados.map((empleado: Empleado) => (
                    <tr key={empleado.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {empleado.Candidato?.nombres} {empleado.Candidato?.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">
                            {empleado.Candidato?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empleado.codigo_empleado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {empleado.Puesto?.nombre}
                        </div>
                        {empleado.Puesto?.departamento && (
                          <div className="text-sm text-gray-500">
                            {empleado.Puesto.departamento}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getEstadoBadgeClass(empleado.estado)}>
                          {getEstadoLabel(empleado.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(empleado.salario_acordado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(empleado.fecha_ingreso)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/empleados/${empleado.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleEditEmpleado(empleado.id)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {empleado.estado === 'activo' && (
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Desactivar empleado"
                              onClick={() => {
                                handleDeactivateEmpleado(
                                  empleado.id, 
                                  `${empleado.Candidato?.nombres} ${empleado.Candidato?.apellidos}`
                                );
                              }}
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {empleados.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empleados</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || estadoFilter 
                    ? 'No se encontraron empleados con los filtros aplicados.' 
                    : 'Comienza contratando empleados desde candidatos aprobados.'
                  }
                </p>
                {!search && !estadoFilter && (
                  <div className="mt-6">
                    <button onClick={handleNewEmpleado} className="btn-primary inline-flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Empleado
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{(page - 1) * limit + 1}</span>
                    {' '} a{' '}
                    <span className="font-medium">
                      {Math.min(page * limit, total)}
                    </span>
                    {' '} de{' '}
                    <span className="font-medium">{total}</span>
                    {' '} resultados
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pageNum === page
                            ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseForm}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
                  </h3>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <EmpleadoForm
                  empleadoId={editingEmpleado}
                  onSuccess={handleFormSuccess}
                  onCancel={handleCloseForm}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && empleadoToDeactivate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCancelDeactivate}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                  <UserMinus className="h-6 w-6 text-orange-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Desactivar Empleado
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro de que deseas desactivar al empleado{' '}
                      <span className="font-semibold text-gray-900">{empleadoToDeactivate.name}</span>?{' '}
                      El empleado será marcado como inactivo pero se conservarán todos sus datos y historial.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  disabled={deactivateMutation.isPending}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deactivateMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Desactivando...
                    </div>
                  ) : (
                    'Desactivar'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelDeactivate}
                  disabled={deactivateMutation.isPending}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 