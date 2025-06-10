import React from 'react';
import { useNavigate } from 'react-router-dom';
import CandidatoForm from './CandidatoForm';

export const CandidatoFormWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/candidatos');
  };

  const handleCancel = () => {
    navigate('/candidatos');
  };

  return (
    <CandidatoForm 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}; 