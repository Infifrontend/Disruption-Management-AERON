import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface CustomAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

const getIconAndColor = (type: string) => {
  switch (type) {
    case 'success':
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
        titleColor: 'text-green-800 dark:text-green-300',
        bgColor: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800/50'
      };
    case 'error':
      return {
        icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
        titleColor: 'text-red-800 dark:text-red-300',
        bgColor: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800/50'
      };
    case 'warning':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
        titleColor: 'text-yellow-800 dark:text-yellow-300',
        bgColor: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800/50'
      };
    default:
      return {
        icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        titleColor: 'text-blue-800 dark:text-blue-300',
        bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50'
      };
  }
};

export const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  message,
  type,
  onConfirm,
  onCancel,
  showCancel = false
}) => {
  const { icon, titleColor, bgColor } = getIconAndColor(type);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className={`${bgColor} max-w-md dark:bg-gray-800 dark:border-gray-700`}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {icon}
            <AlertDialogTitle className={`${titleColor} text-lg font-semibold dark:text-white`}>
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-700 dark:text-gray-300 mt-2">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 mt-4">
          {showCancel && (
            <AlertDialogCancel onClick={onCancel} className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};