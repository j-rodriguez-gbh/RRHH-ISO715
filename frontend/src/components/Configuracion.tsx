import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Briefcase, 
  Globe, 
  Building, 
  Award,
  Shield,
  Database,
  ChevronRight
} from 'lucide-react';
import { PuestosManager } from './PuestosManager';
import { CompetenciasManager } from './CompetenciasManager';
import { IdiomasManager } from './IdiomasManager';
import { DepartamentosManager } from './DepartamentosManager';
import { SistemaManager } from './SistemaManager';

type ConfigSection = 'puestos' | 'competencias' | 'idiomas' | 'departamentos' | 'sistema';

interface ConfigItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  section: ConfigSection;
}

const configItems: ConfigItem[] = [
  {
    id: 'puestos',
    title: 'Puestos de Trabajo',
    description: 'Gestiona los puestos disponibles, requisitos y niveles salariales',
    icon: <Briefcase className="h-6 w-6" />,
    section: 'puestos'
  },
  {
    id: 'competencias',
    title: 'Competencias',
    description: 'Define las competencias técnicas y operativas del sistema',
    icon: <Award className="h-6 w-6" />,
    section: 'competencias'
  },
  {
    id: 'idiomas',
    title: 'Idiomas',
    description: 'Configura los idiomas disponibles para candidatos y empleados',
    icon: <Globe className="h-6 w-6" />,
    section: 'idiomas'
  },
  {
    id: 'departamentos',
    title: 'Departamentos',
    description: 'Administra la estructura departamental de la organización',
    icon: <Building className="h-6 w-6" />,
    section: 'departamentos'
  },
  {
    id: 'sistema',
    title: 'Configuración del Sistema',
    description: 'Parámetros generales y configuraciones avanzadas',
    icon: <Settings className="h-6 w-6" />,
    section: 'sistema'
  }
];

interface ConfiguracionProps {
  defaultSection?: ConfigSection;
}

export const Configuracion: React.FC<ConfiguracionProps> = ({ defaultSection }) => {
  const [selectedSection, setSelectedSection] = useState<ConfigSection | null>(defaultSection || null);

  if (selectedSection) {
    return <ConfigSectionDetail section={selectedSection} onBack={() => setSelectedSection(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center space-x-3 mb-8">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los parámetros y componentes del sistema RRHH
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedSection(item.section)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4 border-l-blue-500 hover:border-l-blue-600"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                        {item.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8" />
              <div>
                <p className="text-blue-100 text-sm">Sistema</p>
                <p className="text-xl font-bold">Activo</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8" />
              <div>
                <p className="text-green-100 text-sm">Seguridad</p>
                <p className="text-xl font-bold">JWT</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8" />
              <div>
                <p className="text-purple-100 text-sm">Usuarios</p>
                <p className="text-xl font-bold">Multi-rol</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8" />
              <div>
                <p className="text-orange-100 text-sm">Base de Datos</p>
                <p className="text-xl font-bold">PostgreSQL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConfigSectionDetailProps {
  section: ConfigSection;
  onBack: () => void;
}

const ConfigSectionDetail: React.FC<ConfigSectionDetailProps> = ({ section, onBack }) => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronRight className="h-5 w-5 transform rotate-180" />
            <span>Volver a Configuración</span>
          </button>
        </div>

        {section === 'puestos' && <PuestosManager />}
        {section === 'competencias' && <CompetenciasManager />}
        {section === 'idiomas' && <IdiomasManager />}
        {section === 'departamentos' && <DepartamentosManager />}
        {section === 'sistema' && <SistemaManager />}
      </div>
    </div>
  );
}; 