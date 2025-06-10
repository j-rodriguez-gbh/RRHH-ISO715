import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { competenciasAPI, idiomasAPI, capacitacionesAPI } from '../services/api';
import type { Competencia, Idioma } from '../types';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CandidatoFormSimple({ onSuccess, onCancel }: Props) {
  // Test queries
  const { data: competenciasData, isLoading: loadingCompetencias, error: errorCompetencias } = useQuery({
    queryKey: ['competencias'],
    queryFn: () => competenciasAPI.getAll(),
  });
  const competencias = competenciasData?.competencias || [];

  const { data: idiomasData, isLoading: loadingIdiomas, error: errorIdiomas } = useQuery({
    queryKey: ['idiomas'],
    queryFn: () => idiomasAPI.getAll(),
  });
  const idiomas = idiomasData?.idiomas || [];

  const { data: capacitaciones, isLoading: loadingCapacitaciones, error: errorCapacitaciones } = useQuery({
    queryKey: ['capacitaciones'],
    queryFn: capacitacionesAPI.getAll,
  });

  console.log('Debug info:', {
    competencias,
    idiomas,
    capacitaciones,
    loadingCompetencias,
    loadingIdiomas,
    loadingCapacitaciones,
    errorCompetencias,
    errorIdiomas,
    errorCapacitaciones
  });

  if (loadingCompetencias || loadingIdiomas || loadingCapacitaciones) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  if (errorCompetencias || errorIdiomas || errorCapacitaciones) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
        <pre className="text-sm text-red-600 mt-2">
          {JSON.stringify({ errorCompetencias, errorIdiomas, errorCapacitaciones }, null, 2)}
        </pre>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Formulario de Candidato (Modo Debug)
        </h2>
        <p className="text-gray-600 mt-1">
          Diagnóstico de carga de datos
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-medium text-green-800">✅ Datos cargados correctamente</h3>
          <ul className="mt-2 text-sm text-green-700">
            <li>Competencias: {competencias?.length || 0} elementos</li>
            <li>Idiomas: {idiomas?.length || 0} elementos</li>
            <li>Capacitaciones: {capacitaciones?.length || 0} elementos</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Competencias:</h4>
          {competencias?.map((comp: Competencia) => (
            <div key={comp.id} className="text-sm text-gray-600">
              {comp.id}: {comp.nombre}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Idiomas:</h4>
          {idiomas?.map((idioma: Idioma) => (
            <div key={idioma.id} className="text-sm text-gray-600">
              {idioma.id}: {idioma.nombre}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Datos OK - Continuar
          </button>
        </div>
      </div>
    </div>
  );
} 