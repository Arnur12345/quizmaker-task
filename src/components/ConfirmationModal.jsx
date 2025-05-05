import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Подтверждение', 
  message = 'Вы уверены, что хотите выполнить это действие?', 
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  type = 'danger' // 'danger' | 'warning' | 'info'
}) => {
  if (!isOpen) return null;
  
  const typeClasses = {
    danger: {
      icon: <AlertTriangle size={24} className="text-red-600" />,
      confirmButton: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: <AlertTriangle size={24} className="text-yellow-600" />,
      confirmButton: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: <AlertTriangle size={24} className="text-blue-600" />,
      confirmButton: "bg-blue-600 hover:bg-blue-700",
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex mb-4">
            <div className="mr-4 flex-shrink-0">
              {typeClasses[type].icon}
            </div>
            <div>
              {typeof message === 'string' ? <p className="text-gray-700">{message}</p> : message}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${typeClasses[type].confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 