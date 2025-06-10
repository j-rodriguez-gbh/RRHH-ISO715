import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmpleadoForm } from './EmpleadoForm';

export const EmpleadoFormWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const empleadoId = id ? parseInt(id, 10) : undefined;

  const handleSuccess = () => {
    navigate('/empleados');
  };

  const handleCancel = () => {
    navigate('/empleados');
  };

  return (
    <EmpleadoForm
      empleadoId={empleadoId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}; 