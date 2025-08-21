
import { useState } from 'react';

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const useCustomAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options?: {
      onConfirm?: () => void;
      onCancel?: () => void;
      showCancel?: boolean;
    }
  ) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
      showCancel: options?.showCancel || false
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    alertState.onConfirm?.();
    hideAlert();
  };

  const handleCancel = () => {
    alertState.onCancel?.();
    hideAlert();
  };

  return {
    alertState,
    showAlert,
    hideAlert,
    handleConfirm,
    handleCancel
  };
};
