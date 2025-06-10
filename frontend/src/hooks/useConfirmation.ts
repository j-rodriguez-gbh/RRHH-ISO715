import { useState } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loadingText?: string;
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
}

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    isDestructive: false,
    loadingText: 'Procesando...',
    isOpen: false,
    isLoading: false,
    onConfirm: () => {}
  });

  const showConfirmation = (options: ConfirmationOptions, onConfirm: () => void | Promise<void>) => {
    setConfirmation({
      ...options,
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmation(prev => ({ ...prev, isLoading: true }));
          await onConfirm();
          hideConfirmation();
        } catch (error) {
          setConfirmation(prev => ({ ...prev, isLoading: false }));
          throw error; // Re-throw to allow error handling in the calling component
        }
      }
    });
  };

  const hideConfirmation = () => {
    setConfirmation(prev => ({ 
      ...prev, 
      isOpen: false, 
      isLoading: false 
    }));
  };

  return {
    confirmation,
    showConfirmation,
    hideConfirmation
  };
}; 