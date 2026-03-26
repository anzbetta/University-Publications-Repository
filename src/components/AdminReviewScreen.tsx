import { useState } from 'react';
import { CheckCircle, XCircle, FileText, Calendar, User, Building2, Hash, BookOpen } from 'lucide-react';
import { Publication } from '../App';
import { ConfirmDialog } from './ConfirmDialog';

interface AdminReviewScreenProps {
  publication: Publication;
  onApprove: (notes: string) => void;
  onReject: (notes: string) => void;
  onCancel: () => void;
}

export function AdminReviewScreen({ publication, onApprove, onReject, onCancel }: AdminReviewScreenProps) {
  const [notes, setNotes] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleRejectClick = () => {
    if (!notes.trim()) {
      alert('Please provide rejection notes before rejecting');
      return;
    }
    setShowRejectDialog(true);
  };

  const handleConfirmApprove = () => {
    onApprove(notes);
    setShowApproveDialog(false);
  };

  const handleConfirmReject = () => {
    onReject(notes);
    setShowRejectDialog(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Publication Review</h2>
        <p className="text-gray-600">Review submission details and approve or reject</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="col-span-2 space-y-6">
          {/* Publication Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Publication Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1">Title</label>
                <p className="text-gray-900">{publication.title}</p>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Authors</label>
                <p className="text-gray-900">{publication.authors}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1">Publication Type</label>
                  <p className="text-gray-900">{publication.publicationType}</p>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Year</label>
                  <p className="text-gray-900">{publication.year}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {publication.doi && (
                  <div>
                    <label className="block text-gray-600 mb-1">DOI</label>
                    <p className="text-gray-900">{publication.doi}</p>
                  </div>
                )}
                {publication.issn && (
                  <div>
                    <label className="block text-gray-600 mb-1">ISSN</label>
                    <p className="text-gray-900">{publication.issn}</p>
                  </div>
                )}
                {publication.isbn && (
                  <div>
                    <label className="block text-gray-600 mb-1">ISBN</label>
                    <p className="text-gray-900">{publication.isbn}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {publication.keywords.split(',').map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Abstract / Annotation</label>
                <p className="text-gray-900 leading-relaxed">{publication.annotation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1">Faculty</label>
                  <p className="text-gray-900">{publication.faculty}</p>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Department</label>
                  <p className="text-gray-900">{publication.department}</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Attached File</label>
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded flex items-center justify-center text-sm">
                    PDF
                  </div>
                  <div>
                    <p className="text-gray-900">{publication.fileName}</p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Review Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Enter your review notes here. Required for rejection, optional for approval."
            />
            <p className="text-gray-500 text-sm mt-2">
              These notes will be visible to the author
            </p>
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="col-span-1 space-y-6">
          {/* Submission Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Submission Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <User size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-600 text-sm">Submitted By</p>
                  <p className="text-gray-900">{publication.submittedBy}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-600 text-sm">Submission Date</p>
                  <p className="text-gray-900">{publication.submittedDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-600 text-sm">Current Status</p>
                  <p className="text-gray-900">{publication.status.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-gray-400" />
                <p className="text-gray-600 text-sm">{publication.faculty}</p>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-gray-400" />
                <p className="text-gray-600 text-sm">{publication.publicationType}</p>
              </div>
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-gray-400" />
                <p className="text-gray-600 text-sm">
                  {publication.keywords.split(',').length} keywords
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {publication.status === 'pending' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-gray-900 mb-4">Review Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleApproveClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <CheckCircle size={20} />
                  <span>Approve Publication</span>
                </button>
                <button
                  onClick={handleRejectClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <XCircle size={20} />
                  <span>Reject Publication</span>
                </button>
                <button
                  onClick={onCancel}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {publication.status !== 'pending' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-gray-900 mb-4">Review Complete</h3>
              <p className="text-gray-600 mb-4">
                This publication has already been reviewed.
              </p>
              {publication.reviewedBy && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Reviewed by: {publication.reviewedBy}</p>
                  <p>Review date: {publication.reviewedDate}</p>
                </div>
              )}
              {publication.reviewNotes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-gray-600 text-sm mb-1">Review Notes:</p>
                  <p className="text-gray-900 text-sm">{publication.reviewNotes}</p>
                </div>
              )}
              <button
                onClick={onCancel}
                className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {showApproveDialog && (
        <ConfirmDialog
          title="Approve Publication"
          message="Are you sure you want to approve this publication? It will be published to the public catalog."
          confirmText="Approve"
          confirmStyle="success"
          onConfirm={handleConfirmApprove}
          onCancel={() => setShowApproveDialog(false)}
        />
      )}

      {showRejectDialog && (
        <ConfirmDialog
          title="Reject Publication"
          message="Are you sure you want to reject this publication? The author will be notified with your review notes."
          confirmText="Reject"
          confirmStyle="danger"
          onConfirm={handleConfirmReject}
          onCancel={() => setShowRejectDialog(false)}
        />
      )}
    </div>
  );
}
