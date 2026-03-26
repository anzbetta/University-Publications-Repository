import { ArrowLeft, Download, Calendar, User, Building2, Hash, BookOpen, Link as LinkIcon } from 'lucide-react';
import { Publication } from '../App';

interface PublicationDetailsProps {
  publication: Publication;
  onBack: () => void;
}

export function PublicationDetails({ publication, onBack }: PublicationDetailsProps) {
  const handleDownload = () => {
    alert(`Downloading: ${publication.fileName}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Catalog</span>
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Title and Authors */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">{publication.title}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <User size={18} />
              <span>{publication.authors}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{publication.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{publication.publicationType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                <span>{publication.faculty}</span>
              </div>
            </div>
          </div>

          {/* Abstract */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-3">Abstract</h3>
            <p className="text-gray-700 leading-relaxed">{publication.annotation}</p>
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-3">Keywords</h3>
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

          {/* Department Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-3">Department Information</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Faculty</label>
                <p className="text-gray-900">{publication.faculty}</p>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Department</label>
                <p className="text-gray-900">{publication.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          {/* Download Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Download</h3>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download size={20} />
              <span>Download PDF</span>
            </button>
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-blue-900 text-sm">{publication.fileName}</p>
            </div>
          </div>

          {/* Identifiers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Identifiers</h3>
            <div className="space-y-3">
              {publication.doi && (
                <div>
                  <label className="block text-gray-600 text-sm mb-1">DOI</label>
                  <div className="flex items-center gap-2">
                    <LinkIcon size={14} className="text-gray-400" />
                    <a
                      href={`https://doi.org/${publication.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {publication.doi}
                    </a>
                  </div>
                </div>
              )}
              {publication.issn && (
                <div>
                  <label className="block text-gray-600 text-sm mb-1">ISSN</label>
                  <p className="text-gray-900 text-sm">{publication.issn}</p>
                </div>
              )}
              {publication.isbn && (
                <div>
                  <label className="block text-gray-600 text-sm mb-1">ISBN</label>
                  <p className="text-gray-900 text-sm">{publication.isbn}</p>
                </div>
              )}
            </div>
          </div>

          {/* Publication Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Publication Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Year</span>
                <span className="text-gray-900">{publication.year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Type</span>
                <span className="text-gray-900 text-sm">{publication.publicationType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Keywords</span>
                <span className="text-gray-900">{publication.keywords.split(',').length}</span>
              </div>
            </div>
          </div>

          {/* Citation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-3">Citation</h3>
            <div className="p-3 bg-gray-50 rounded text-sm text-gray-700">
              <p className="break-words">
                {publication.authors} ({publication.year}). {publication.title}.{' '}
                {publication.publicationType}.
                {publication.doi && ` DOI: ${publication.doi}`}
              </p>
            </div>
            <button className="w-full mt-3 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
              Copy Citation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
