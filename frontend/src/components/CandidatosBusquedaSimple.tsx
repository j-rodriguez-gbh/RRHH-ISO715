import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Award,
  Globe,
  Briefcase,
  Eye,
  Mail,
  User,
  Star,
  ArrowRight,
  Loader
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { candidatosAPI, competenciasAPI, idiomasAPI, puestosAPI } from '../services/api';
import type { Candidato } from '../types';

interface SearchFilters {
  puestoId?: number;
  competencias?: number[];
  idiomas?: number[];
  experiencia_min?: number;
}

interface CandidatoConScore extends Candidato {
  score: number;
}

export const CandidatosBusquedaSimple: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchExecuted, setSearchExecuted] = useState(false);

  // Queries para obtener datos de filtros
  const { data: competenciasData } = useQuery({
    queryKey: ['competencias'],
    queryFn: () => competenciasAPI.getAll({ activa: true })
  });

  const { data: idiomasData } = useQuery({
    queryKey: ['idiomas'],
    queryFn: () => idiomasAPI.getAll({ activo: true })
  });

  const { data: puestosData } = useQuery({
    queryKey: ['puestos'],
    queryFn: () => puestosAPI.getAll({ activo: true })
  });

  // Query para búsqueda de candidatos
  const { data: searchResults, isLoading: isSearching, refetch: executeSearch } = useQuery({
    queryKey: ['candidatos-search', filters],
    queryFn: () => candidatosAPI.search({
      puestoId: filters.puestoId,
      competencias: filters.competencias?.join(','),
      idiomas: filters.idiomas?.join(','),
      experiencia_min: filters.experiencia_min
    }),
    enabled: false // Solo ejecutar manualmente
  });

  const competencias = competenciasData?.competencias || [];
  const idiomas = idiomasData?.idiomas || [];
  const puestos = puestosData?.puestos || [];

  // Función simple para calcular score
  const calculateCandidateScore = (candidato: Candidato): CandidatoConScore => {
    let score = 50; // Base score

    // Score por competencias
    if (filters.competencias && filters.competencias.length > 0) {
      const candidatoCompetencias = candidato.Competencias?.map(c => c.id) || [];
      const matches = filters.competencias.filter(c => candidatoCompetencias.includes(c)).length;
      score += (matches / filters.competencias.length) * 30;
    }

    // Score por idiomas
    if (filters.idiomas && filters.idiomas.length > 0) {
      const candidatoIdiomas = candidato.Idiomas?.map(i => i.id) || [];
      const matches = filters.idiomas.filter(i => candidatoIdiomas.includes(i)).length;
      score += (matches / filters.idiomas.length) * 20;
    }

    return {
      ...candidato,
      score: Math.round(score)
    };
  };

  const candidatosConScore: CandidatoConScore[] = searchResults?.candidatos 
    ? searchResults.candidatos.map(calculateCandidateScore).sort((a: CandidatoConScore, b: CandidatoConScore) => b.score - a.score)
    : [];

  const handleSearch = () => {
    if (Object.keys(filters).length === 0) {
      return;
    }
    setSearchExecuted(true);
    executeSearch();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayFilterChange = (key: 'competencias' | 'idiomas', id: number, checked: boolean) => {
    setFilters(prev => {
      const currentArray = prev[key] || [];
      if (checked) {
        return {
          ...prev,
          [key]: [...currentArray, id]
        };
      } else {
        return {
          ...prev,
          [key]: currentArray.filter(item => item !== id)
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchExecuted(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      'aplicado': 'bg-blue-100 text-blue-800',
      'en_revision': 'bg-yellow-100 text-yellow-800',
      'preseleccionado': 'bg-purple-100 text-purple-800',
      'entrevista_inicial': 'bg-indigo-100 text-indigo-800',
      'entrevista_tecnica': 'bg-orange-100 text-orange-800',
      'entrevista_final': 'bg-pink-100 text-pink-800',
      'aprobado': 'bg-green-100 text-green-800',
      'rechazado': 'bg-red-100 text-red-800',
      'contratado': 'bg-emerald-100 text-emerald-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Search className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Búsqueda de Candidatos</h1>
              <p className="text-gray-600">Encuentra candidatos usando filtros específicos</p>
            </div>
          </div>
          {searchExecuted && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros de Búsqueda</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Puesto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Puesto Específico
              </label>
              <select
                value={filters.puestoId || ''}
                onChange={(e) => handleFilterChange('puestoId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los puestos</option>
                {puestos.map(puesto => (
                  <option key={puesto.id} value={puesto.id}>
                    {puesto.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Experiencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Experiencia Mínima (trabajos previos)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={filters.experiencia_min || ''}
                onChange={(e) => handleFilterChange('experiencia_min', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 3"
              />
            </div>
          </div>

          {/* Competencias */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="h-4 w-4 inline mr-1" />
              Competencias Requeridas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-3">
              {competencias.map(competencia => (
                <label key={competencia.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.competencias?.includes(competencia.id) || false}
                    onChange={(e) => handleArrayFilterChange('competencias', competencia.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{competencia.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Idiomas */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              Idiomas Requeridos
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {idiomas.map(idioma => (
                <label key={idioma.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.idiomas?.includes(idioma.id) || false}
                    onChange={(e) => handleArrayFilterChange('idiomas', idioma.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{idioma.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSearch}
              disabled={Object.keys(filters).length === 0}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar Candidatos
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Results */}
        {searchExecuted && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Resultados ({candidatosConScore.length} candidatos encontrados)
              </h3>
            </div>

            {isSearching ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : candidatosConScore.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron candidatos</h3>
                <p className="mt-1 text-gray-500">
                  Intenta ajustar los filtros para obtener más resultados
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {candidatosConScore.map((candidato) => (
                  <div key={candidato.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <User className="h-6 w-6 text-gray-400" />
                          <h4 className="text-lg font-semibold text-gray-900">
                            {candidato.nombres} {candidato.apellidos}
                          </h4>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(candidato.score)}`}>
                            <Star className="h-3 w-3 mr-1" />
                            {candidato.score}%
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(candidato.estado)}`}>
                            {candidato.estado.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {candidato.email}
                          </div>
                          {candidato.salario_aspirado && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="text-gray-400 mr-2">💰</span>
                              ${candidato.salario_aspirado.toLocaleString()}
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {candidato.Competencias?.slice(0, 3).map(competencia => (
                            <span key={competencia.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Award className="h-3 w-3 mr-1" />
                              {competencia.nombre}
                            </span>
                          ))}
                          {candidato.Idiomas?.slice(0, 2).map(idioma => (
                            <span key={idioma.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Globe className="h-3 w-3 mr-1" />
                              {idioma.nombre}
                            </span>
                          ))}
                          {candidato.ExperienciaLaborals && candidato.ExperienciaLaborals.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Users className="h-3 w-3 mr-1" />
                              {candidato.ExperienciaLaborals.length} trabajos
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        <Link
                          to={`/candidatos/${candidato.id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 