import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText: string;
  confirmStyle: 'success' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ 
  title, 
  message, 
  confirmText, 
  confirmStyle, 
  onConfirm, 
  onCancel 
}: ConfirmDialogProps) {
  const icon = confirmStyle === 'success' ? (
    <CheckCircle size={24} className="text-green-600" />
  ) : (
    <AlertCircle size={24} className="text-red-600" />
  );

  const iconBg = confirmStyle === 'success' ? 'bg-green-100' : 'bg-red-100';
  const buttonStyle = confirmStyle === 'success' 
    ? 'bg-green-600 hover:bg-green-700' 
    : 'bg-red-600 hover:bg-red-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
                {icon}
              </div>
              <div>
                <h3 className="text-gray-900">{title}</h3>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-gray-600 mb-6 ml-15">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded ${buttonStyle}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
