import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowUpDown
} from 'lucide-react';
import { candidatosAPI } from '../services/api';
import type { Candidato, CandidatoEstado } from '../types';

const ESTADOS_OPTIONS: { value: CandidatoEstado | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'aplicado', label: 'Aplicado' },
  { value: 'en_revision', label: 'En Revisión' },
  { value: 'preseleccionado', label: 'Preseleccionado' },
  { value: 'entrevista_inicial', label: 'Entrevista Inicial' },
  { value: 'entrevista_tecnica', label: 'Entrevista Técnica' },
  { value: 'entrevista_final', label: 'Entrevista Final' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'contratado', label: 'Contratado' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getEstadoBadgeClass = (estado: CandidatoEstado) => {
  const baseClasses = 'status-badge';
  const stateClasses = {
    aplicado: 'status-aplicado',
    en_revision: 'status-en_revision',
    preseleccionado: 'status-preseleccionado',
    entrevista_inicial: 'status-entrevista_inicial',
    entrevista_tecnica: 'status-entrevista_tecnica',
    entrevista_final: 'status-entrevista_final',
    aprobado: 'status-aprobado',
    rechazado: 'status-rechazado',
    contratado: 'status-contratado',
  };
  
  return `${baseClasses} ${stateClasses[estado] || ''}`;
};

const getEstadoLabel = (estado: CandidatoEstado) => {
  const labels = {
    aplicado: 'Aplicado',
    en_revision: 'En Revisión',
    preseleccionado: 'Preseleccionado',
    entrevista_inicial: 'Entrevista Inicial',
    entrevista_tecnica: 'Entrevista Técnica',
    entrevista_final: 'Entrevista Final',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    contratado: 'Contratado',
  };
  
  return labels[estado] || estado;
};

export const CandidatosList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<CandidatoEstado | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const limit = 10;

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
    queryKey: ['candidatos', page, debouncedSearch, estadoFilter],
    queryFn: () => candidatosAPI.getAll({ 
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

  const candidatos = data?.candidatos || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // No need to do anything here, the useEffect will handle the debounced search
  };

  const clearFilters = () => {
    setSearch('');
    setEstadoFilter('');
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando candidatos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error al cargar los candidatos</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
                <p className="text-sm text-gray-600">
                  {total} candidato{total !== 1 ? 's' : ''} en total
                </p>
              </div>
            </div>
            
            <Link to="/candidatos/nuevo" className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Candidato</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
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
                       placeholder="Buscar por nombre o email..."
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
                        onChange={(e) => setEstadoFilter(e.target.value as CandidatoEstado | '')}
                        className="input-field"
                      >
                        {ESTADOS_OPTIONS.map((option) => (
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
                        className="btn-secondary w-full"
                      >
                        Limpiar Filtros
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Candidato</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salario Aspirado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Aplicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disponibilidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidatos.map((candidato: Candidato) => (
                    <tr key={candidato.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {candidato.nombres} {candidato.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">
                            {candidato.email}
                          </div>
                          {candidato.telefono && (
                            <div className="text-xs text-gray-400">
                              {candidato.telefono}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getEstadoBadgeClass(candidato.estado)}>
                          {getEstadoLabel(candidato.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidato.salario_aspirado 
                          ? formatCurrency(candidato.salario_aspirado)
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(candidato.fecha_aplicacion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="capitalize">
                          {candidato.disponibilidad.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/candidatos/${candidato.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/candidatos/${candidato.id}/editar`}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Eliminar"
                            onClick={() => {
                              if (confirm('¿Estás seguro de eliminar este candidato?')) {
                                // TODO: Implement delete
                                console.log('Delete candidato:', candidato.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {candidatos.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay candidatos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || estadoFilter ? 'No se encontraron candidatos con los filtros aplicados.' : 'Comienza agregando un nuevo candidato.'}
                </p>
                {!search && !estadoFilter && (
                  <div className="mt-6">
                    <Link to="/candidatos/nuevo" className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Candidato
                    </Link>
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
      </main>
    </div>
  );
}; 