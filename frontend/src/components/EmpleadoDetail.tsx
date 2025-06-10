import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  ArrowLeft,
  Edit,
  Badge,
  Building,
  UserX,
  UserCheck,
  Shield,
  IdCard,
  MapPin,
  Cake,
  Clock,
  FileUser
} from 'lucide-react';
import { empleadosAPI } from '../services/api';

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

const getEstadoBadgeClass = (estado: string) => {
  const classes = {
    'activo': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800',
    'inactivo': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800',
    'vacaciones': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800',
    'licencia': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800',
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

const getEstadoIcon = (estado: string) => {
  const icons = {
    'activo': <UserCheck className="h-4 w-4" />,
    'inactivo': <UserX className="h-4 w-4" />,
    'vacaciones': <Calendar className="h-4 w-4" />,
    'licencia': <Shield className="h-4 w-4" />,
  };
  
  return icons[estado as keyof typeof icons] || <UserCheck className="h-4 w-4" />;
};

export const EmpleadoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const empleadoId = id ? parseInt(id, 10) : 0;

  const { data: empleado, isLoading, error } = useQuery({
    queryKey: ['empleado', empleadoId],
    queryFn: () => empleadosAPI.getById(empleadoId),
    enabled: !!empleadoId,
  });

  if (!empleadoId || isNaN(empleadoId)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">ID de empleado inválido</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando empleado...</p>
        </div>
      </div>
    );
  }

  if (error || !empleado) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar el empleado</p>
        <button onClick={() => navigate('/empleados')} className="mt-4 btn-primary">
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/empleados')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver a empleados
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to={`/empleados/${empleado.id}/editar`}
                className="btn-secondary flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </div>
          </div>

          {/* Employee Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {empleado.Candidato ? `${empleado.Candidato.nombres} ${empleado.Candidato.apellidos}` : 'Empleado'}
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-gray-600">
                  <div className="flex items-center">
                    <IdCard className="h-4 w-4 mr-1" />
                    <span className="font-mono text-sm">{empleado.codigo_empleado}</span>
                  </div>
                  {empleado.Candidato?.documento_identidad && (
                    <div className="flex items-center">
                      <Badge className="h-4 w-4 mr-1" />
                      <span className="text-sm">{empleado.Candidato.documento_identidad}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={getEstadoBadgeClass(empleado.estado)}>
                {getEstadoIcon(empleado.estado)}
                <span className="ml-1">{getEstadoLabel(empleado.estado)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Información de Contacto
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {empleado.Candidato?.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{empleado.Candidato.email}</p>
                    </div>
                  </div>
                )}
                
                {empleado.Candidato?.telefono && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{empleado.Candidato.telefono}</p>
                    </div>
                  </div>
                )}

                {empleado.Candidato?.direccion && (
                  <div className="flex items-start md:col-span-2">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium">{empleado.Candidato.direccion}</p>
                    </div>
                  </div>
                )}

                {empleado.Candidato?.fecha_nacimiento && (
                  <div className="flex items-center">
                    <Cake className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                      <p className="font-medium">{formatDate(empleado.Candidato.fecha_nacimiento)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Información Laboral
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                    <p className="font-medium">{formatDate(empleado.fecha_ingreso)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Salario Acordado</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(empleado.salario_acordado)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FileUser className="h-4 w-4 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Contrato</p>
                    <p className="font-medium capitalize">{empleado.tipo_contrato?.replace('_', ' ')}</p>
                  </div>
                </div>

                {empleado.fecha_fin_contrato && (
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha Fin de Contrato</p>
                      <p className="font-medium">{formatDate(empleado.fecha_fin_contrato)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Position Information */}
            {empleado.Puesto && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Badge className="h-5 w-5 mr-2 text-blue-600" />
                  Información del Puesto
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Puesto</p>
                    <p className="font-medium text-lg">{empleado.Puesto.nombre}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nivel de Riesgo</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        empleado.Puesto.nivel_riesgo === 'Alto' 
                          ? 'bg-red-100 text-red-800'
                          : empleado.Puesto.nivel_riesgo === 'Medio'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {empleado.Puesto.nivel_riesgo}
                      </span>
                    </div>
                    
                    {(empleado.Puesto.salario_min || empleado.Puesto.salario_max) && (
                      <div>
                        <p className="text-sm text-gray-500">Rango Salarial</p>
                        <p className="font-medium">
                          {empleado.Puesto.salario_min && formatCurrency(empleado.Puesto.salario_min)}
                          {empleado.Puesto.salario_min && empleado.Puesto.salario_max && ' - '}
                          {empleado.Puesto.salario_max && formatCurrency(empleado.Puesto.salario_max)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Candidate Information */}
            {empleado.Candidato && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Información del Candidato Original
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Aplicación</p>
                      <p className="font-medium">{formatDate(empleado.Candidato.fecha_aplicacion)}</p>
                    </div>
                    
                    {empleado.Candidato.salario_aspirado && (
                      <div>
                        <p className="text-sm text-gray-500">Salario Aspirado</p>
                        <p className="font-medium">{formatCurrency(empleado.Candidato.salario_aspirado)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Disponibilidad</p>
                    <p className="font-medium capitalize">
                      {empleado.Candidato.disponibilidad?.replace('_', ' ')}
                    </p>
                  </div>
                  
                  {empleado.Candidato.observaciones && (
                    <div>
                      <p className="text-sm text-gray-500">Observaciones del Proceso</p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{empleado.Candidato.observaciones}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Link
                      to={`/candidatos/${empleado.candidatoId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver perfil completo del candidato →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Rápida</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ID Empleado</span>
                  <span className="text-sm font-medium">{empleado.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Código</span>
                  <span className="text-sm font-medium font-mono">{empleado.codigo_empleado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Estado</span>
                  <span className={`text-sm font-medium ${
                    empleado.estado === 'activo' ? 'text-green-600' : 
                    empleado.estado === 'inactivo' ? 'text-red-600' : 
                    'text-yellow-600'
                  }`}>
                    {getEstadoLabel(empleado.estado)}
                  </span>
                </div>
                {empleado.Puesto && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Puesto ID</span>
                    <span className="text-sm font-medium">{empleado.puestoId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <Link
                  to={`/empleados/${empleado.id}/editar`}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Empleado
                </Link>
                
                {empleado.candidatoId && (
                  <Link
                    to={`/candidatos/${empleado.candidatoId}`}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Ver Candidato Original
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};