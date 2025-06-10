import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  FileText,
  GraduationCap,
  Languages,
  Briefcase,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Edit
} from 'lucide-react';
import { candidatosAPI } from '../services/api';
import type { CandidatoEstado, StateTransition, Competencia, Idioma, Capacitacion, ExperienciaLaboral } from '../types';

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
    month: 'long',
    day: 'numeric'
  });
};

const getEstadoBadgeClass = (estado: CandidatoEstado) => {
  const classes = {
    'aplicado': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800',
    'en_revision': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800',
    'preseleccionado': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800',
    'entrevista_inicial': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800',
    'entrevista_tecnica': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800',
    'entrevista_final': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800',
    'aprobado': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800',
    'rechazado': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800',
    'contratado': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800',
  };
  
  return classes[estado] || classes.aplicado;
};

const getEstadoLabel = (estado: CandidatoEstado) => {
  const labels = {
    'aplicado': 'Aplicado',
    'en_revision': 'En Revisión',
    'preseleccionado': 'Preseleccionado',
    'entrevista_inicial': 'Entrevista Inicial',
    'entrevista_tecnica': 'Entrevista Técnica',
    'entrevista_final': 'Entrevista Final',
    'aprobado': 'Aprobado',
    'rechazado': 'Rechazado',
    'contratado': 'Contratado',
  };
  
  return labels[estado] || estado;
};

const getActionIcon = (event: string) => {
  const icons = {
    'REVIEW': <Clock className="h-4 w-4" />,
    'PRESELECT': <CheckCircle className="h-4 w-4" />,
    'SCHEDULE_INITIAL_INTERVIEW': <Calendar className="h-4 w-4" />,
    'PASS_INITIAL': <CheckCircle className="h-4 w-4" />,
    'FAIL_INITIAL': <XCircle className="h-4 w-4" />,
    'PASS_TECHNICAL': <CheckCircle className="h-4 w-4" />,
    'FAIL_TECHNICAL': <XCircle className="h-4 w-4" />,
    'APPROVE': <CheckCircle className="h-4 w-4" />,
    'REJECT_FINAL': <XCircle className="h-4 w-4" />,
    'HIRE': <UserCheck className="h-4 w-4" />,
    'REJECT': <XCircle className="h-4 w-4" />,
  };
  
  return icons[event as keyof typeof icons] || <CheckCircle className="h-4 w-4" />;
};

const getActionColor = (event: string) => {
  const colors = {
    'REVIEW': 'bg-blue-600 hover:bg-blue-700 text-white',
    'PRESELECT': 'bg-purple-600 hover:bg-purple-700 text-white',
    'SCHEDULE_INITIAL_INTERVIEW': 'bg-indigo-600 hover:bg-indigo-700 text-white',
    'PASS_INITIAL': 'bg-green-600 hover:bg-green-700 text-white',
    'FAIL_INITIAL': 'bg-red-600 hover:bg-red-700 text-white',
    'PASS_TECHNICAL': 'bg-green-600 hover:bg-green-700 text-white',
    'FAIL_TECHNICAL': 'bg-red-600 hover:bg-red-700 text-white',
    'APPROVE': 'bg-emerald-600 hover:bg-emerald-700 text-white',
    'REJECT_FINAL': 'bg-red-600 hover:bg-red-700 text-white',
    'HIRE': 'bg-emerald-600 hover:bg-emerald-700 text-white',
    'REJECT': 'bg-red-600 hover:bg-red-700 text-white',
  };
  
  return colors[event as keyof typeof colors] || 'btn-primary';
};

export const CandidatoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const candidatoId = id ? parseInt(id, 10) : 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ['candidato', candidatoId],
    queryFn: () => candidatosAPI.getById(candidatoId),
    enabled: !!candidatoId,
  });

  const changeStateMutation = useMutation({
    mutationFn: ({ event, observaciones }: { event: string; observaciones?: string }) =>
      candidatosAPI.changeState(candidatoId, event, observaciones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidato', candidatoId] });
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
    },
  });

  if (!candidatoId || isNaN(candidatoId)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">ID de candidato inválido</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando candidato...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar el candidato</p>
        <button onClick={() => navigate('/candidatos')} className="mt-4 btn-primary">
          Volver a la lista
        </button>
      </div>
    );
  }

  const { candidato, validTransitions } = data;

  const handleStateChange = (event: string, description: string) => {
    const observaciones = prompt(`${description}\n\n¿Deseas agregar alguna observación?`);
    if (observaciones !== null) { // null means user cancelled
      changeStateMutation.mutate({ event, observaciones: observaciones || undefined });
    }
  };

  const handleHire = () => {
    navigate(`/candidatos/${candidatoId}/contratar`);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/candidatos')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {candidato.nombres} {candidato.apellidos}
              </h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className={getEstadoBadgeClass(candidato.estado)}>
                  {getEstadoLabel(candidato.estado)}
                </span>
                <span className="text-sm text-gray-500">
                  Aplicado el {formatDate(candidato.fecha_aplicacion)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link
              to={`/candidatos/${candidatoId}/editar`}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Link>
            
            {candidato.estado === 'aprobado' && (
              <button
                onClick={handleHire}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
              >
                <UserCheck className="h-4 w-4" />
                <span>Contratar</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información de Contacto
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{candidato.email}</p>
                    </div>
                  </div>
                  
                  {candidato.telefono && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-medium">{candidato.telefono}</p>
                      </div>
                    </div>
                  )}
                  
                  {candidato.documento_identidad && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Documento</p>
                        <p className="font-medium">{candidato.documento_identidad}</p>
                      </div>
                    </div>
                  )}
                  
                  {candidato.direccion && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Dirección</p>
                        <p className="font-medium">{candidato.direccion}</p>
                      </div>
                    </div>
                  )}
                  
                  {candidato.fecha_nacimiento && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                        <p className="font-medium">{formatDate(candidato.fecha_nacimiento)}</p>
                      </div>
                    </div>
                  )}
                  
                  {candidato.salario_aspirado && (
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Salario Aspirado</p>
                        <p className="font-medium">{formatCurrency(candidato.salario_aspirado)}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Disponibilidad</p>
                  <p className="font-medium capitalize">
                    {candidato.disponibilidad.replace('_', ' ')}
                  </p>
                </div>
                
                {candidato.observaciones && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Observaciones</p>
                    <p className="font-medium">{candidato.observaciones}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Competencias */}
            {candidato.Competencias && candidato.Competencias.length > 0 && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Competencias
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {candidato.Competencias.map((competencia: Competencia) => (
                      <span
                        key={competencia.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {competencia.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Idiomas */}
            {candidato.Idiomas && candidato.Idiomas.length > 0 && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Languages className="h-5 w-5 mr-2" />
                    Idiomas
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {candidato.Idiomas.map((idioma: Idioma) => (
                      <span
                        key={idioma.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {idioma.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Capacitaciones */}
            {candidato.Capacitacions && candidato.Capacitacions.length > 0 && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Capacitaciones
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {candidato.Capacitacions.map((capacitacion: Capacitacion) => (
                      <div key={capacitacion.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{capacitacion.descripcion}</h4>
                            <p className="text-sm text-gray-600">Nivel: {capacitacion.nivel}</p>
                            {capacitacion.institucion && (
                              <p className="text-sm text-gray-600">Institución: {capacitacion.institucion}</p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {capacitacion.fecha_desde && (
                              <p>{formatDate(capacitacion.fecha_desde)}</p>
                            )}
                            {capacitacion.fecha_hasta && (
                              <p>- {formatDate(capacitacion.fecha_hasta)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Experiencia Laboral */}
            {candidato.ExperienciaLaborals && candidato.ExperienciaLaborals.length > 0 && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Experiencia Laboral
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {candidato.ExperienciaLaborals.map((experiencia: ExperienciaLaboral) => (
                      <div key={experiencia.id} className="border-l-4 border-gray-300 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{experiencia.puesto}</h4>
                            <p className="text-lg text-gray-700">{experiencia.empresa}</p>
                            {experiencia.salario && (
                              <p className="text-sm text-gray-600">
                                Salario: {formatCurrency(experiencia.salario)}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{formatDate(experiencia.fecha_inicio)}</p>
                            <p>- {experiencia.fecha_fin ? formatDate(experiencia.fecha_fin) : 'Actual'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Acciones Disponibles</h3>
              </div>
              <div className="p-6 space-y-3">
                {validTransitions.map((transition: StateTransition) => (
                  <button
                    key={transition.event}
                    onClick={() => handleStateChange(transition.event, transition.description)}
                    disabled={changeStateMutation.isPending}
                    className={`w-full flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getActionColor(transition.event)}`}
                  >
                    {getActionIcon(transition.event)}
                    <span>{transition.description}</span>
                  </button>
                ))}
                
                {validTransitions.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay acciones disponibles para el estado actual
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 