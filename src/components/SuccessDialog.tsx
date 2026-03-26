import { CheckCircle, X } from 'lucide-react';

interface SuccessDialogProps {
  onClose: () => void;
}

export function SuccessDialog({ onClose }: SuccessDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-900">Submission Successful</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Your publication has been successfully submitted for review. You will be notified once the administrator has reviewed your submission.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="text-blue-900 mb-2">What happens next?</p>
            <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
              <li>Administrator will review your submission</li>
              <li>You can track the status in your dashboard</li>
              <li>You will receive a notification of the decision</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
