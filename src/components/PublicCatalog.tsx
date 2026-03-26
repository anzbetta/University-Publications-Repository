import { useState } from 'react';
import { Search, Filter, Eye, Calendar, User } from 'lucide-react';
import { Publication } from '../App';

interface PublicCatalogProps {
  publications: Publication[];
  onViewDetails: (id: string) => void;
}

export function PublicCatalog({ publications, onViewDetails }: PublicCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  // Get unique values for filters
  const publicationTypes = ['all', ...Array.from(new Set(publications.map(p => p.publicationType)))];
  const faculties = ['all', ...Array.from(new Set(publications.map(p => p.faculty)))];
  const years = ['all', ...Array.from(new Set(publications.map(p => p.year))).sort((a, b) => parseInt(b) - parseInt(a))];

  // Filter publications
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = searchQuery === '' || 
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.keywords.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || pub.publicationType === selectedType;
    const matchesFaculty = selectedFaculty === 'all' || pub.faculty === selectedFaculty;
    const matchesYear = selectedYear === 'all' || pub.year === selectedYear;

    return matchesSearch && matchesType && matchesFaculty && matchesYear;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedFaculty('all');
    setSelectedYear('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Publications Catalog</h2>
        <p className="text-gray-600">Browse and search scientific publications from our university</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, authors, or keywords..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter size={18} />
            <span>Filters:</span>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            {publicationTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>

          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            {faculties.map(faculty => (
              <option key={faculty} value={faculty}>
                {faculty === 'all' ? 'All Faculties' : faculty}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year === 'all' ? 'All Years' : year}
              </option>
            ))}
          </select>

          {(searchQuery || selectedType !== 'all' || selectedFaculty !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredPublications.length} of {publications.length} publications
        </p>
      </div>

      {/* Publications Grid */}
      {filteredPublications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No publications found matching your criteria</p>
          {(searchQuery || selectedType !== 'all' || selectedFaculty !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPublications.map((pub) => (
            <div
              key={pub.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded flex items-center justify-center text-sm flex-shrink-0">
                      PDF
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-2">{pub.title}</h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        <User size={14} />
                        <span>{pub.authors}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={14} />
                        <span>{pub.year}</span>
                        <span className="mx-2">•</span>
                        <span>{pub.publicationType}</span>
                        <span className="mx-2">•</span>
                        <span>{pub.faculty}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {pub.annotation}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {pub.keywords.split(',').slice(0, 5).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>

                  {pub.doi && (
                    <p className="text-gray-500 text-sm">
                      DOI: {pub.doi}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onViewDetails(pub.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
                >
                  <Eye size={18} />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
