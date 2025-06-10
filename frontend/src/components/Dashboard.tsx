import React from 'react';
import { 
  Users, 
  FileText, 
  Settings,
  BarChart3,
  Search,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {

  const menuItems = [
    {
      title: 'Candidatos',
      description: 'Gestionar candidatos y procesos de selección',
      icon: Users,
      href: '/candidatos',
      color: 'bg-blue-500',
    },
    {
      title: 'Búsqueda Avanzada',
      description: 'Buscar candidatos por competencias',
      icon: Search,
      href: '/candidatos/buscar',
      color: 'bg-purple-500',
    },
    {
      title: 'Empleados',
      description: 'Gestionar empleados contratados',
      icon: CheckCircle,
      href: '/empleados',
      color: 'bg-emerald-500',
    },
    {
      title: 'Puestos de Trabajo',
      description: 'Gestionar puestos y vacantes disponibles',
      icon: Briefcase,
      href: '/puestos',
      color: 'bg-indigo-500',
    },
    {
      title: 'Reportes',
      description: 'Generar reportes y estadísticas',
      icon: BarChart3,
      href: '/reportes',
      color: 'bg-orange-500',
    },
    {
      title: 'Configuración',
      description: 'Competencias, idiomas y capacitaciones',
      icon: Settings,
      href: '/configuracion',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-2 text-gray-600">
              Bienvenido al sistema de reclutamiento y selección de recursos humanos
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Candidatos</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">En Proceso</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Aprobados</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Empleados</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group block"
                >
                  <div className="card hover:shadow-lg transition-shadow duration-200 group-hover:border-gray-300">
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 p-3 rounded-lg ${item.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
  );
}; 