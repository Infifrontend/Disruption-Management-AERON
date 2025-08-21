
type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

class AlertService {
  private static instance: AlertService;
  private showAlertCallback?: (title: string, message: string, type: AlertType, options?: AlertOptions) => void;

  static getInstance() {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  setShowAlertCallback(callback: (title: string, message: string, type: AlertType, options?: AlertOptions) => void) {
    this.showAlertCallback = callback;
  }

  success(title: string, message: string, onConfirm?: () => void) {
    this.showAlertCallback?.(title, message, 'success', { onConfirm });
  }

  error(title: string, message: string, onConfirm?: () => void) {
    this.showAlertCallback?.(title, message, 'error', { onConfirm });
  }

  warning(title: string, message: string, onConfirm?: () => void) {
    this.showAlertCallback?.(title, message, 'warning', { onConfirm });
  }

  info(title: string, message: string, onConfirm?: () => void) {
    this.showAlertCallback?.(title, message, 'info', { onConfirm });
  }

  confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void) {
    this.showAlertCallback?.(title, message, 'warning', { 
      onConfirm, 
      onCancel, 
      showCancel: true 
    });
  }
}

export const alertService = AlertService.getInstance();

// Global functions for easy access
export const showAlert = {
  success: (title: string, message: string, onConfirm?: () => void) => 
    alertService.success(title, message, onConfirm),
  error: (title: string, message: string, onConfirm?: () => void) => 
    alertService.error(title, message, onConfirm),
  warning: (title: string, message: string, onConfirm?: () => void) => 
    alertService.warning(title, message, onConfirm),
  info: (title: string, message: string, onConfirm?: () => void) => 
    alertService.info(title, message, onConfirm),
  confirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => 
    alertService.confirm(title, message, onConfirm, onCancel)
};
