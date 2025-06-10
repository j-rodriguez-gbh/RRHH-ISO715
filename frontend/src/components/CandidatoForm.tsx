import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    candidatosAPI,
  competenciasAPI,
  idiomasAPI,
  capacitacionesAPI
} from '../services/api';
import type { CandidatoCreate } from '../types';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';


// Esquema de validación
const candidatoSchema = z.object({
  nombres: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  documento_identidad: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  direccion: z.string().optional(),
  salario_aspirado: z.union([z.coerce.number().min(0, 'El salario debe ser positivo'), z.literal('')]).optional(),
  disponibilidad: z.enum(['inmediata', '15_dias', '30_dias', 'a_convenir']).optional(),
  observaciones: z.string().optional(),
  competencias: z.array(z.number()).optional(),
  idiomas: z.array(z.number()).optional(),
  capacitaciones: z.array(z.number()).optional(),
  experiencias: z.array(z.object({
    empresa: z.string().min(1, 'La empresa es requerida'),
    puesto: z.string().min(1, 'El puesto es requerido'),
    fecha_desde: z.string().min(1, 'La fecha de inicio es requerida'),
    fecha_hasta: z.string().optional(),
    salario: z.union([z.coerce.number().min(0, 'El salario debe ser positivo'), z.literal('')]).optional(),
  })).optional(),
});

type CandidatoFormData = z.infer<typeof candidatoSchema>;

interface Props {
  candidatoId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CandidatoForm({ candidatoId, onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!candidatoId;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CandidatoFormData>({
    resolver: zodResolver(candidatoSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      documento_identidad: '',
      fecha_nacimiento: '',
      direccion: '',
      salario_aspirado: undefined,
      disponibilidad: 'inmediata',
      observaciones: '',
      competencias: [],
      idiomas: [],
      capacitaciones: [],
      experiencias: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiencias'
  });

  // Queries para obtener datos de referencia
  const { data: competencias = [] } = useQuery({
    queryKey: ['competencias'],
    queryFn: competenciasAPI.getAll,
  });

  const { data: idiomas = [] } = useQuery({
    queryKey: ['idiomas'],
    queryFn: idiomasAPI.getAll,
  });

  const { data: capacitaciones = [] } = useQuery({
    queryKey: ['capacitaciones'],
    queryFn: capacitacionesAPI.getAll,
  });

  // Query para cargar candidato existente
  const { data: candidato, isLoading } = useQuery({
    queryKey: ['candidato', candidatoId],
    queryFn: () => candidatosAPI.getById(candidatoId!),
    enabled: !!candidatoId,
  });

  // Mutation para crear/actualizar
  const mutation = useMutation({
    mutationFn: (data: CandidatoFormData) => {
      // Limpiar y procesar los datos antes de enviar
      const submitData: CandidatoCreate = {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono || undefined,
        documento_identidad: data.documento_identidad || undefined,
        fecha_nacimiento: data.fecha_nacimiento || undefined,
        direccion: data.direccion || undefined,
        salario_aspirado: (data.salario_aspirado && String(data.salario_aspirado) !== '') ? Number(data.salario_aspirado) : undefined,
        disponibilidad: data.disponibilidad,
        observaciones: data.observaciones || undefined,
        competencias: data.competencias && data.competencias.length > 0 ? data.competencias : undefined,
        idiomas: data.idiomas && data.idiomas.length > 0 ? data.idiomas : undefined,
        capacitaciones: data.capacitaciones && data.capacitaciones.length > 0 ? data.capacitaciones : undefined,
        experiencias: data.experiencias && data.experiencias.length > 0 ? data.experiencias.map(exp => ({
          empresa: exp.empresa,
          puesto: exp.puesto,
          fecha_desde: exp.fecha_desde,
          fecha_hasta: exp.fecha_hasta || null,
          salario: (exp.salario && String(exp.salario) !== '') ? Number(exp.salario) : undefined
        })) : undefined,
      };

      // Filtrar campos undefined para evitar enviar campos vacíos
      const cleanedData = Object.fromEntries(
        Object.entries(submitData).filter(([, value]) => value !== undefined)
      ) as CandidatoCreate;

      return isEditing 
        ? candidatosAPI.update(candidatoId, cleanedData)
        : candidatosAPI.create(cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
      onSuccess?.();
    },
  });

  // Cargar datos del candidato al editar
  useEffect(() => {
    if (candidato && isEditing) {
      const candidatoData = candidato.candidato || candidato;
      
      // Formatear fecha para input date (YYYY-MM-DD)
      const formatDateForInput = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      reset({
        nombres: candidatoData.nombres,
        apellidos: candidatoData.apellidos,
        email: candidatoData.email,
        telefono: candidatoData.telefono || '',
        documento_identidad: candidatoData.documento_identidad || '',
        fecha_nacimiento: formatDateForInput(candidatoData.fecha_nacimiento),
        direccion: candidatoData.direccion || '',
        salario_aspirado: candidatoData.salario_aspirado,
        disponibilidad: candidatoData.disponibilidad || 'inmediata',
        observaciones: candidatoData.observaciones || '',
        competencias: candidatoData.Competencias?.map(c => c.id) || [],
        idiomas: candidatoData.Idiomas?.map(i => i.id) || [],
        capacitaciones: candidatoData.Capacitacions?.map(c => c.id) || [],
        experiencias: candidatoData.ExperienciaLaborals?.map(exp => ({
          empresa: exp.empresa,
          puesto: exp.puesto,
          fecha_desde: formatDateForInput(exp.fecha_inicio),
          fecha_hasta: formatDateForInput(exp.fecha_fin),
          salario: exp.salario,
        })) || [],
      });
    }
  }, [candidato, isEditing, reset]);

  const onSubmit = (data: CandidatoFormData) => {
    mutation.mutate(data);
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link
              to="/candidatos"
              className="mr-4 flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Volver a Candidatos
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Candidato' : 'Nuevo Candidato'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 'Actualiza la información del candidato' : 'Completa la información del nuevo candidato'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Información Personal */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres *
                </label>
                <input
                  {...register('nombres')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.nombres && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombres.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  {...register('apellidos')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.apellidos && (
                  <p className="text-red-500 text-sm mt-1">{errors.apellidos.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  {...register('telefono')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documento de Identidad
                </label>
                <input
                  {...register('documento_identidad')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  {...register('fecha_nacimiento')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  {...register('direccion')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salario Aspirado
                </label>
                <input
                  type="number"
                  {...register('salario_aspirado', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                {errors.salario_aspirado && (
                  <p className="text-red-500 text-sm mt-1">{errors.salario_aspirado.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponibilidad
                </label>
                <select
                  {...register('disponibilidad')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="inmediata">Inmediata</option>
                  <option value="15_dias">15 días</option>
                  <option value="30_dias">30 días</option>
                  <option value="a_convenir">A convenir</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  {...register('observaciones')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Competencias */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competencias</h3>
            <Controller
              name="competencias"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {competencias.filter(c => c.activa).map((competencia) => (
                    <label key={competencia.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.value?.includes(competencia.id) || false}
                        onChange={(e) => {
                          const currentValue = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...currentValue, competencia.id]);
                          } else {
                            field.onChange(currentValue.filter(id => id !== competencia.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{competencia.nombre}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Idiomas */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Idiomas</h3>
            <Controller
              name="idiomas"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {idiomas.filter(i => i.activo).map((idioma) => (
                    <label key={idioma.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.value?.includes(idioma.id) || false}
                        onChange={(e) => {
                          const currentValue = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...currentValue, idioma.id]);
                          } else {
                            field.onChange(currentValue.filter(id => id !== idioma.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{idioma.nombre}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Capacitaciones */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacitaciones</h3>
            <Controller
              name="capacitaciones"
              control={control}
              render={({ field }) => (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {capacitaciones.map((capacitacion) => (
                    <label key={capacitacion.id} className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={field.value?.includes(capacitacion.id) || false}
                        onChange={(e) => {
                          const currentValue = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...currentValue, capacitacion.id]);
                          } else {
                            field.onChange(currentValue.filter(id => id !== capacitacion.id));
                          }
                        }}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-sm text-gray-700">
                        <div className="font-medium">{capacitacion.descripcion}</div>
                        <div className="text-gray-500">
                          {capacitacion.nivel} - {capacitacion.institucion}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Experiencia Laboral */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Experiencia Laboral</h3>
              <button
                type="button"
                onClick={() => append({ empresa: '', puesto: '', fecha_desde: '', fecha_hasta: '', salario: undefined })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Agregar Experiencia
              </button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Experiencia #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa *
                    </label>
                    <input
                      {...register(`experiencias.${index}.empresa`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.experiencias?.[index]?.empresa && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiencias[index]?.empresa?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Puesto *
                    </label>
                    <input
                      {...register(`experiencias.${index}.puesto`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.experiencias?.[index]?.puesto && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiencias[index]?.puesto?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Desde *
                    </label>
                    <input
                      type="date"
                      {...register(`experiencias.${index}.fecha_desde`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.experiencias?.[index]?.fecha_desde && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiencias[index]?.fecha_desde?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Hasta
                    </label>
                    <input
                      type="date"
                      {...register(`experiencias.${index}.fecha_hasta`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salario
                    </label>
                    <input
                      type="number"
                      {...register(`experiencias.${index}.salario`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    {errors.experiencias?.[index]?.salario && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiencias[index]?.salario?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting || mutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </div>
              ) : (
                isEditing ? 'Actualizar Candidato' : 'Crear Candidato'
              )}
            </button>
          </div>

          {mutation.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">
                Error al {isEditing ? 'actualizar' : 'crear'} el candidato. Por favor, intenta nuevamente.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};