import { Clock, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import { Publication } from '../App';

interface AdminDashboardProps {
  publications: Publication[];
  onReview: (id: string) => void;
}

export function AdminDashboard({ publications, onReview }: AdminDashboardProps) {
  const pendingPublications = publications.filter(p => p.status === 'pending');
  const approvedPublications = publications.filter(p => p.status === 'approved');
  const rejectedPublications = publications.filter(p => p.status === 'rejected');

  const getStatusIcon = (status: Publication['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={18} className="text-red-600" />;
      case 'pending':
        return <Clock size={18} className="text-yellow-600" />;
    }
  };

  const getStatusText = (status: Publication['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: Publication['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Moderation Dashboard</h2>
        <p className="text-gray-600">Review and manage publication submissions</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600">Total Submissions</p>
              <p className="text-gray-900">{publications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-600">Pending Review</p>
              <p className="text-gray-900">{pendingPublications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-600">Approved</p>
              <p className="text-gray-900">{approvedPublications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-600">Rejected</p>
              <p className="text-gray-900">{rejectedPublications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Review Queue */}
      {pendingPublications.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-900 mb-4">Pending Review Queue</h3>
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Title</th>
                    <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Authors</th>
                    <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Type</th>
                    <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Submitted By</th>
                    <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Date</th>
                    <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPublications.map((pub) => (
                    <tr key={pub.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{pub.title}</td>
                      <td className="px-6 py-4 text-gray-600">{pub.authors}</td>
                      <td className="px-6 py-4 text-gray-600">{pub.publicationType}</td>
                      <td className="px-6 py-4 text-gray-600">{pub.submittedBy}</td>
                      <td className="px-6 py-4 text-gray-600">{pub.submittedDate}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onReview(pub.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* All Submissions */}
      <div>
        <h3 className="text-gray-900 mb-4">All Submissions</h3>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Title</th>
                  <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Authors</th>
                  <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Type</th>
                  <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Submitted Date</th>
                  <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Status</th>
                  <th className="text-left px-6 py-3 text-gray-700 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {publications.map((pub) => (
                  <tr key={pub.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{pub.title}</td>
                    <td className="px-6 py-4 text-gray-600">{pub.authors}</td>
                    <td className="px-6 py-4 text-gray-600">{pub.publicationType}</td>
                    <td className="px-6 py-4 text-gray-600">{pub.submittedDate}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${getStatusColor(pub.status)}`}>
                        {getStatusIcon(pub.status)}
                        <span>{getStatusText(pub.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onReview(pub.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
