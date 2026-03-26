import { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Publication } from '../App';

interface CreatePublicationFormProps {
  onSubmit: (publication: Omit<Publication, 'id' | 'status' | 'submittedDate'>) => void;
  onCancel: () => void;
}

export function CreatePublicationForm({ onSubmit, onCancel }: CreatePublicationFormProps) {
  const [formData, setFormData] = useState({
    authors: '',
    title: '',
    publicationType: 'Journal Article',
    doi: '',
    issn: '',
    isbn: '',
    keywords: '',
    annotation: '',
    faculty: '',
    department: '',
    year: new Date().getFullYear().toString(),
    fileName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, file: 'Only PDF files are allowed' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
        return;
      }
      setUploadedFile(file);
      setFormData(prev => ({ ...prev, fileName: file.name }));
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({ ...prev, fileName: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.authors.trim()) {
      newErrors.authors = 'Authors field is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.keywords.trim()) {
      newErrors.keywords = 'At least one keyword is required';
    }
    if (!formData.annotation.trim()) {
      newErrors.annotation = 'Annotation is required';
    }
    if (formData.annotation.length < 50) {
      newErrors.annotation = 'Annotation must be at least 50 characters';
    }
    if (!formData.faculty.trim()) {
      newErrors.faculty = 'Faculty is required';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!formData.year || parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    if (!formData.fileName) {
      newErrors.file = 'Please upload a PDF file';
    }

    // Validate based on publication type
    if (formData.publicationType === 'Journal Article' && !formData.issn.trim()) {
      newErrors.issn = 'ISSN is required for journal articles';
    }
    if (formData.publicationType === 'Book Chapter' && !formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required for book chapters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        ...formData,
        submittedBy: ''
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Create New Publication Submission</h2>
        <p className="text-gray-600">Fill in the form below to submit your scientific publication for review</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Authors */}
          <div>
            <label htmlFor="authors" className="block text-gray-700 mb-2">
              Authors <span className="text-red-600">*</span>
            </label>
            <input
              id="authors"
              name="authors"
              type="text"
              value={formData.authors}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="e.g., Dr. John Smith, Prof. Jane Doe"
            />
            {errors.authors && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.authors}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-gray-700 mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter publication title"
            />
            {errors.title && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.title}</span>
              </div>
            )}
          </div>

          {/* Publication Type */}
          <div>
            <label htmlFor="publicationType" className="block text-gray-700 mb-2">
              Publication Type <span className="text-red-600">*</span>
            </label>
            <select
              id="publicationType"
              name="publicationType"
              value={formData.publicationType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="Journal Article">Journal Article</option>
              <option value="Conference Paper">Conference Paper</option>
              <option value="Book Chapter">Book Chapter</option>
              <option value="Thesis">Thesis</option>
              <option value="Technical Report">Technical Report</option>
            </select>
          </div>

          {/* DOI, ISSN, ISBN Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="doi" className="block text-gray-700 mb-2">
                DOI
              </label>
              <input
                id="doi"
                name="doi"
                type="text"
                value={formData.doi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="10.1234/example"
              />
            </div>

            <div>
              <label htmlFor="issn" className="block text-gray-700 mb-2">
                ISSN {formData.publicationType === 'Journal Article' && <span className="text-red-600">*</span>}
              </label>
              <input
                id="issn"
                name="issn"
                type="text"
                value={formData.issn}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="1234-5678"
              />
              {errors.issn && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.issn}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="isbn" className="block text-gray-700 mb-2">
                ISBN {formData.publicationType === 'Book Chapter' && <span className="text-red-600">*</span>}
              </label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                value={formData.isbn}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="978-3-16-148410-0"
              />
              {errors.isbn && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.isbn}</span>
                </div>
              )}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="keywords" className="block text-gray-700 mb-2">
              Keywords <span className="text-red-600">*</span>
            </label>
            <input
              id="keywords"
              name="keywords"
              type="text"
              value={formData.keywords}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="e.g., machine learning, data analysis, neural networks"
            />
            <p className="text-gray-500 text-sm mt-1">Separate keywords with commas</p>
            {errors.keywords && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.keywords}</span>
              </div>
            )}
          </div>

          {/* Annotation */}
          <div>
            <label htmlFor="annotation" className="block text-gray-700 mb-2">
              Annotation / Abstract <span className="text-red-600">*</span>
            </label>
            <textarea
              id="annotation"
              name="annotation"
              value={formData.annotation}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Enter a detailed abstract of your publication (minimum 50 characters)"
            />
            <p className="text-gray-500 text-sm mt-1">{formData.annotation.length} characters</p>
            {errors.annotation && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.annotation}</span>
              </div>
            )}
          </div>

          {/* Faculty and Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="faculty" className="block text-gray-700 mb-2">
                Faculty <span className="text-red-600">*</span>
              </label>
              <input
                id="faculty"
                name="faculty"
                type="text"
                value={formData.faculty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="e.g., Faculty of Computer Science"
              />
              {errors.faculty && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.faculty}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-gray-700 mb-2">
                Department <span className="text-red-600">*</span>
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="e.g., Department of Artificial Intelligence"
              />
              {errors.department && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.department}</span>
                </div>
              )}
            </div>
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year" className="block text-gray-700 mb-2">
              Publication Year <span className="text-red-600">*</span>
            </label>
            <input
              id="year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
            {errors.year && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.year}</span>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-gray-700 mb-2">
              Upload PDF File <span className="text-red-600">*</span>
            </label>
            
            {!uploadedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 bg-gray-50">
                <div className="flex flex-col items-center justify-center">
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to upload PDF file</p>
                  <p className="text-gray-500 text-sm">Maximum file size: 10MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded flex items-center justify-center">
                    PDF
                  </div>
                  <div>
                    <p className="text-gray-900">{uploadedFile.name}</p>
                    <p className="text-gray-500 text-sm">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            {errors.file && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.file}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Publication
          </button>
        </div>
      </form>
    </div>
  );
}
