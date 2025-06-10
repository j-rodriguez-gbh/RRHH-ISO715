import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  Download, 
  FileText, 
  Users, 
  Eye,
  Building,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { reportesAPI, empleadosAPI } from '../services/api';
import type { Empleado } from '../types';
import { toast } from 'react-hot-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const ReporteNuevosEmpleados: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Query para vista previa de datos
  const { data: empleadosData, isLoading: loadingPreview, refetch } = useQuery({
    queryKey: ['empleados-reporte', fechaInicio, fechaFin],
    queryFn: () => empleadosAPI.getAll({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      limit: 1000
    }),
    enabled: false, // Solo ejecutar cuando se solicite explícitamente
  });

  // Mutation para generar PDF
  const generatePDFMutation = useMutation({
    mutationFn: ({ fechaInicio, fechaFin }: { fechaInicio: string; fechaFin: string }) =>
      reportesAPI.newEmployeesReport(fechaInicio, fechaFin),
    onSuccess: (blob) => {
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_nuevos_empleados_${fechaInicio}_${fechaFin}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Reporte generado y descargado exitosamente');
    },
    onError: (error) => {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    },
  });

  const handlePreview = () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Por favor selecciona ambas fechas');
      return;
    }
    
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha fin');
      return;
    }

    setShowPreview(true);
    refetch();
  };

  const handleGeneratePDF = () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Por favor selecciona ambas fechas');
      return;
    }
    
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha fin');
      return;
    }

    generatePDFMutation.mutate({ fechaInicio, fechaFin });
  };

  const empleados = empleadosData?.empleados || [];
  const totalEmpleados = empleados.length;
  const totalSalarios = empleados.reduce((sum: number, emp: Empleado) => sum + (emp.salario_acordado || 0), 0);
  const promedioSalario = totalEmpleados > 0 ? totalSalarios / totalEmpleados : 0;

  // Agrupar por departamento
  const empleadosPorDepartamento = empleados.reduce((acc: Record<string, number>, emp: Empleado) => {
    const dept = emp.Puesto?.departamento || 'Sin departamento';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reporte de Empleados de Nuevo Ingreso
              </h1>
              <p className="text-gray-600">
                Genera reportes de empleados contratados en un rango de fechas específico
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configuración del Reporte
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePreview}
              disabled={!fechaInicio || !fechaFin || loadingPreview}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="h-4 w-4" />
              <span>{loadingPreview ? 'Cargando...' : 'Vista Previa'}</span>
            </button>

            <button
              onClick={handleGeneratePDF}
              disabled={!fechaInicio || !fechaFin || generatePDFMutation.isPending}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>{generatePDFMutation.isPending ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
          </div>
        </div>

        {/* Vista previa de resultados */}
        {showPreview && !loadingPreview && (
          <div className="space-y-6">
            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Empleados</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalEmpleados}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Inversión Total</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(totalSalarios)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Salario Promedio</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(promedioSalario)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Departamentos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Object.keys(empleadosPorDepartamento).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribución por departamento */}
            {Object.keys(empleadosPorDepartamento).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Distribución por Departamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                       {Object.entries(empleadosPorDepartamento).map(([dept, count]) => (
                       <div key={dept} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                         <span className="text-sm font-medium text-gray-900">{dept}</span>
                         <span className="text-sm text-gray-600">{count as number} empleado{(count as number) !== 1 ? 's' : ''}</span>
                       </div>
                     ))}
                </div>
              </div>
            )}

            {/* Tabla de empleados */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Empleados del Período ({formatDate(fechaInicio)} - {formatDate(fechaFin)})
                </h3>
              </div>
              
              {empleados.length > 0 ? (
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
                          Departamento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Ingreso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {empleados.map((empleado: Empleado) => (
                        <tr key={empleado.id} className="hover:bg-gray-50">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {empleado.codigo_empleado}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {empleado.Puesto?.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {empleado.Puesto?.departamento || 'Sin departamento'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {empleado.fecha_ingreso ? formatDate(empleado.fecha_ingreso) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(empleado.salario_acordado || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              empleado.estado === 'activo' 
                                ? 'bg-green-100 text-green-800'
                                : empleado.estado === 'inactivo'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {empleado.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay empleados en este período
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron empleados contratados entre {formatDate(fechaInicio)} y {formatDate(fechaFin)}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 