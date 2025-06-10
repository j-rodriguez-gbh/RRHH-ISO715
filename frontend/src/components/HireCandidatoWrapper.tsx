import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HireCandidatoForm } from './HireCandidatoForm';

export const HireCandidatoWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const candidatoId = id ? parseInt(id, 10) : 0;

  if (!candidatoId || isNaN(candidatoId)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">ID de candidato inválido</p>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate('/empleados');
  };

  const handleCancel = () => {
    navigate('/candidatos');
  };

  return (
    <HireCandidatoForm
      candidatoId={candidatoId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}; 