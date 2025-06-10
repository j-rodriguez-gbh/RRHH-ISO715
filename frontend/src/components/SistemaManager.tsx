import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Shield, 
  Mail, 
  Bell,
  Users,
  Calendar,
  FileText,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Server
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SystemConfig {
  // Configuración de la empresa
  company_name: string;
  company_logo?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  
  // Configuración de notificaciones
  email_notifications: boolean;
  sms_notifications: boolean;
  candidate_auto_email: boolean;
  interview_reminders: boolean;
  
  // Configuración de seguridad
  session_timeout: number; // en minutos
  password_min_length: number;
  require_special_chars: boolean;
  max_login_attempts: number;
  
  // Configuración de candidatos
  candidate_retention_days: number;
  auto_archive_inactive: boolean;
  require_cv_upload: boolean;
  allow_candidate_self_register: boolean;
  
  // Configuración de reportes
  default_date_range: number; // en días
  auto_generate_monthly_reports: boolean;
  report_email_recipients: string[];
  
  // Configuración de base de datos
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  backup_retention_days: number;
  maintenance_window: string;
}

const defaultConfig: SystemConfig = {
  company_name: 'Mi Empresa',
  company_address: '',
  company_phone: '',
  company_email: '',
  email_notifications: true,
  sms_notifications: false,
  candidate_auto_email: true,
  interview_reminders: true,
  session_timeout: 60,
  password_min_length: 8,
  require_special_chars: true,
  max_login_attempts: 3,
  candidate_retention_days: 365,
  auto_archive_inactive: true,
  require_cv_upload: false,
  allow_candidate_self_register: false,
  default_date_range: 30,
  auto_generate_monthly_reports: false,
  report_email_recipients: [],
  backup_frequency: 'daily',
  backup_retention_days: 30,
  maintenance_window: '02:00'
};

export const SistemaManager: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<'company' | 'notifications' | 'security' | 'candidates' | 'reports' | 'database'>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Aquí iría la llamada a la API para guardar la configuración
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient && !config.report_email_recipients.includes(newRecipient)) {
      setConfig({
        ...config,
        report_email_recipients: [...config.report_email_recipients, newRecipient]
      });
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setConfig({
      ...config,
      report_email_recipients: config.report_email_recipients.filter(e => e !== email)
    });
  };

  const tabs = [
    { id: 'company', name: 'Empresa', icon: FileText },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'candidates', name: 'Candidatos', icon: Users },
    { id: 'reports', name: 'Reportes', icon: FileText },
    { id: 'database', name: 'Base de Datos', icon: Database }
  ];

  const renderCompanyTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Información de la Empresa</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Empresa *
          </label>
          <input
            type="text"
            required
            value={config.company_name}
            onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Corporativo
          </label>
          <input
            type="email"
            value={config.company_email}
            onChange={(e) => setConfig({ ...config, company_email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={config.company_phone}
            onChange={(e) => setConfig({ ...config, company_phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <textarea
            rows={3}
            value={config.company_address}
            onChange={(e) => setConfig({ ...config, company_address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Bell className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Notificaciones por Email
            </label>
            <p className="text-sm text-gray-500">Enviar notificaciones por correo electrónico</p>
          </div>
          <input
            type="checkbox"
            checked={config.email_notifications}
            onChange={(e) => setConfig({ ...config, email_notifications: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Notificaciones SMS
            </label>
            <p className="text-sm text-gray-500">Enviar notificaciones por mensaje de texto</p>
          </div>
          <input
            type="checkbox"
            checked={config.sms_notifications}
            onChange={(e) => setConfig({ ...config, sms_notifications: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Automático a Candidatos
            </label>
            <p className="text-sm text-gray-500">Enviar confirmación automática al registrar candidatos</p>
          </div>
          <input
            type="checkbox"
            checked={config.candidate_auto_email}
            onChange={(e) => setConfig({ ...config, candidate_auto_email: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Recordatorios de Entrevistas
            </label>
            <p className="text-sm text-gray-500">Enviar recordatorios antes de las entrevistas</p>
          </div>
          <input
            type="checkbox"
            checked={config.interview_reminders}
            onChange={(e) => setConfig({ ...config, interview_reminders: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiempo de Sesión (minutos)
          </label>
          <input
            type="number"
            min="15"
            max="480"
            value={config.session_timeout}
            onChange={(e) => setConfig({ ...config, session_timeout: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitud Mínima de Contraseña
          </label>
          <input
            type="number"
            min="6"
            max="32"
            value={config.password_min_length}
            onChange={(e) => setConfig({ ...config, password_min_length: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Máximo Intentos de Login
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={config.max_login_attempts}
            onChange={(e) => setConfig({ ...config, max_login_attempts: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={config.require_special_chars}
            onChange={(e) => setConfig({ ...config, require_special_chars: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Requerir caracteres especiales en contraseñas
          </label>
        </div>
      </div>
    </div>
  );

  const renderCandidatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Configuración de Candidatos</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Días de Retención de Candidatos
          </label>
          <input
            type="number"
            min="30"
            max="3650"
            value={config.candidate_retention_days}
            onChange={(e) => setConfig({ ...config, candidate_retention_days: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Tiempo antes de archivar candidatos inactivos</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Auto-archivar Candidatos Inactivos
            </label>
            <p className="text-sm text-gray-500">Archivar automáticamente candidatos sin actividad</p>
          </div>
          <input
            type="checkbox"
            checked={config.auto_archive_inactive}
            onChange={(e) => setConfig({ ...config, auto_archive_inactive: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Requerir Carga de CV
            </label>
            <p className="text-sm text-gray-500">Hacer obligatoria la carga de hoja de vida</p>
          </div>
          <input
            type="checkbox"
            checked={config.require_cv_upload}
            onChange={(e) => setConfig({ ...config, require_cv_upload: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Permitir Auto-registro de Candidatos
            </label>
            <p className="text-sm text-gray-500">Los candidatos pueden registrarse directamente</p>
          </div>
          <input
            type="checkbox"
            checked={config.allow_candidate_self_register}
            onChange={(e) => setConfig({ ...config, allow_candidate_self_register: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Configuración de Reportes</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rango de Fechas Por Defecto (días)
          </label>
          <input
            type="number"
            min="7"
            max="365"
            value={config.default_date_range}
            onChange={(e) => setConfig({ ...config, default_date_range: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Generar Reportes Mensuales Automáticamente
            </label>
            <p className="text-sm text-gray-500">Crear reportes automáticos cada mes</p>
          </div>
          <input
            type="checkbox"
            checked={config.auto_generate_monthly_reports}
            onChange={(e) => setConfig({ ...config, auto_generate_monthly_reports: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinatarios de Reportes por Email
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="email"
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            placeholder="email@empresa.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddRecipient}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Agregar
          </button>
        </div>
        <div className="space-y-1">
          {config.report_email_recipients.map((email, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
              <span className="text-sm">{email}</span>
              <button
                type="button"
                onClick={() => handleRemoveRecipient(email)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDatabaseTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Configuración de Base de Datos</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frecuencia de Respaldo
          </label>
          <select
            value={config.backup_frequency}
            onChange={(e) => setConfig({ ...config, backup_frequency: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Días de Retención de Respaldos
          </label>
          <input
            type="number"
            min="7"
            max="365"
            value={config.backup_retention_days}
            onChange={(e) => setConfig({ ...config, backup_retention_days: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ventana de Mantenimiento
          </label>
          <input
            type="time"
            value={config.maintenance_window}
            onChange={(e) => setConfig({ ...config, maintenance_window: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Hora para realizar tareas de mantenimiento</p>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Información Importante
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Los respaldos se realizan automáticamente según la configuración. 
                Asegúrate de que el espacio de almacenamiento sea suficiente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
              <p className="text-gray-600 mt-1">
                Parámetros generales y configuraciones avanzadas del sistema
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Guardar Configuración</span>
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'company' && renderCompanyTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'candidates' && renderCandidatesTab()}
          {activeTab === 'reports' && renderReportsTab()}
          {activeTab === 'database' && renderDatabaseTab()}
        </div>
      </div>
    </div>
  );
}; 