import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Eye, Calendar, User } from "lucide-react";
import { Publication } from "../App";

type CatalogTab = "recommendations" | "liked" | "viewed";

interface Recommendation extends Publication {
  score?: number;
  reasons?: string[];
}

type CatalogItem = Publication &
  Partial<Pick<Recommendation, "score" | "reasons">>;

interface PublicCatalogProps {
  publications: Publication[];
  currentUserId?: number;
  onViewDetails: (id: string) => void;
}

const recommendationEmptyMessage =
  "No personalized recommendations yet. View or like a few publications so the system can build your selection.";
const likedEmptyMessage = "You have no liked publications yet.";
const viewedEmptyMessage = "You have not viewed any publications yet.";

const loadingMessages: Record<CatalogTab, string> = {
  recommendations: "Loading recommendations...",
  liked: "Loading liked publications...",
  viewed: "Loading viewed publications...",
};

export function PublicCatalog({
  publications,
  currentUserId,
  onViewDetails,
}: PublicCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [activeTab, setActiveTab] = useState<CatalogTab>("recommendations");

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [likedPublications, setLikedPublications] = useState<CatalogItem[]>([]);
  const [viewedPublications, setViewedPublications] = useState<CatalogItem[]>(
    [],
  );

  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [isLoadingLiked, setIsLoadingLiked] = useState(false);
  const [isLoadingViewed, setIsLoadingViewed] = useState(false);

  const [recommendationsError, setRecommendationsError] = useState<
    string | null
  >(null);
  const [likedError, setLikedError] = useState<string | null>(null);
  const [viewedError, setViewedError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab("recommendations");
    setRecommendations([]);
    setLikedPublications([]);
    setViewedPublications([]);
    setRecommendationsError(null);
    setLikedError(null);
    setViewedError(null);
    setIsLoadingRecommendations(false);
    setIsLoadingLiked(false);
    setIsLoadingViewed(false);
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const loadActiveTab = async () => {
      if (activeTab === "recommendations") {
        setIsLoadingRecommendations(true);
        setRecommendationsError(null);

        try {
          const response = await fetch(
            `http://localhost:4000/api/recommendations/user/${currentUserId}`,
          );

          if (!response.ok) {
            throw new Error("Failed to fetch recommendations");
          }

          const data: Recommendation[] = await response.json();
          setRecommendations(Array.isArray(data) ? data : []);
        } catch {
          setRecommendationsError(
            "Failed to load personalized recommendations",
          );
        } finally {
          setIsLoadingRecommendations(false);
        }
        return;
      }

      if (activeTab === "liked") {
        setIsLoadingLiked(true);
        setLikedError(null);

        try {
          console.log("Fetching liked publications for user:", currentUserId);
          const response = await fetch(
            `http://localhost:4000/api/activity/liked/${currentUserId}`,
          );

          if (!response.ok) {
            throw new Error("Failed to fetch liked publications");
          }

          const data: CatalogItem[] = await response.json();
          setLikedPublications(Array.isArray(data) ? data : []);
        } catch {
          setLikedError("Failed to load liked publications");
        } finally {
          setIsLoadingLiked(false);
        }
        return;
      }

      setIsLoadingViewed(true);
      setViewedError(null);

      try {
        console.log("Fetching viewed publications for user:", currentUserId);
        const response = await fetch(
          `http://localhost:4000/api/activity/viewed/${currentUserId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch viewed publications");
        }

        const data: CatalogItem[] = await response.json();
        setViewedPublications(Array.isArray(data) ? data : []);
      } catch {
        setViewedError("Failed to load viewed publications");
      } finally {
        setIsLoadingViewed(false);
      }
    };

    loadActiveTab();
  }, [activeTab, currentUserId]);

  const isSearchMode =
    searchQuery.trim().length > 0 ||
    selectedFaculty !== "all" ||
    selectedYear !== "all" ||
    selectedType !== "all";

  const publicationTypes = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(publications.map((publication) => publication.publicationType)),
      ),
    ],
    [publications],
  );

  const faculties = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(publications.map((publication) => publication.faculty)),
      ),
    ],
    [publications],
  );

  const years = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(publications.map((publication) => publication.year)),
      ).sort((a, b) => parseInt(b, 10) - parseInt(a, 10)),
    ],
    [publications],
  );

  const currentSource = useMemo(() => {
    if (!currentUserId) {
      return publications;
    }

    if (activeTab === "recommendations") {
      return isSearchMode ? publications : recommendations;
    }

    if (activeTab === "liked") {
      return likedPublications;
    }

    return viewedPublications;
  }, [
    activeTab,
    currentUserId,
    isSearchMode,
    likedPublications,
    publications,
    recommendations,
    viewedPublications,
  ]);

  const filteredPublications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return currentSource.filter((publication) => {
      const matchesSearch =
        query === "" ||
        publication.title.toLowerCase().includes(query) ||
        publication.authors.toLowerCase().includes(query) ||
        publication.keywords.toLowerCase().includes(query);

      const matchesType =
        selectedType === "all" || publication.publicationType === selectedType;
      const matchesFaculty =
        selectedFaculty === "all" || publication.faculty === selectedFaculty;
      const matchesYear =
        selectedYear === "all" || publication.year === selectedYear;

      return matchesSearch && matchesType && matchesFaculty && matchesYear;
    });
  }, [currentSource, searchQuery, selectedFaculty, selectedType, selectedYear]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedFaculty("all");
    setSelectedYear("all");
  };

  const hasActiveFilters = isSearchMode;
  const isRecommendationsTab = currentUserId
    ? activeTab === "recommendations"
    : false;
  const isLikedTab = currentUserId ? activeTab === "liked" : false;
  const isViewedTab = currentUserId ? activeTab === "viewed" : false;

  const showRecommendationsLoading =
    isRecommendationsTab && !isSearchMode && isLoadingRecommendations;

  const renderPublicationCard = (
    publication: CatalogItem,
    showRecommendationMeta: boolean,
  ) => (
    <div
      key={publication.id}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded flex items-center justify-center text-sm flex-shrink-0">
              PDF
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-2">{publication.title}</h3>
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-2 flex-wrap">
                <User size={14} />
                <span>{publication.authors}</span>
                {showRecommendationMeta &&
                  typeof publication.score === "number" && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      Score: {publication.score}
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm flex-wrap">
                <Calendar size={14} />
                <span>{publication.year}</span>
                <span className="mx-2">•</span>
                <span>{publication.publicationType}</span>
                <span className="mx-2">•</span>
                <span>{publication.faculty}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {publication.annotation}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {publication.keywords
              .split(",")
              .slice(0, 5)
              .map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {keyword.trim()}
                </span>
              ))}
          </div>

          {showRecommendationMeta && publication.reasons?.length ? (
            <div className="text-sm text-gray-700 mb-3">
              <strong>Reasons:</strong> {publication.reasons.join(", ")}
            </div>
          ) : null}

          {publication.doi && (
            <p className="text-gray-500 text-sm">DOI: {publication.doi}</p>
          )}
        </div>

        <button
          onClick={() => onViewDetails(publication.id)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
        >
          <Eye size={18} />
          <span>View</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">
          {isSearchMode
            ? "Search Results"
            : currentUserId && !isSearchMode
              ? activeTab === "recommendations"
                ? "Recommended Publications"
                : activeTab === "liked"
                  ? "Liked Publications"
                  : "Viewed Publications"
              : "Publications Catalog"}
        </h2>
        <p className="text-gray-600">
          {isSearchMode
            ? "Found Publications"
            : currentUserId && !isSearchMode && activeTab === "recommendations"
              ? "Personalized selection based on your activity in the system"
              : "Browse and search scientific publications from our university"}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title, authors, or keywords..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter size={18} />
            <span>Filters:</span>
          </div>

          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            {publicationTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>

          <select
            value={selectedFaculty}
            onChange={(event) => setSelectedFaculty(event.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            {faculties.map((faculty) => (
              <option key={faculty} value={faculty}>
                {faculty === "all" ? "All Faculties" : faculty}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year === "all" ? "All Years" : year}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>

        {currentUserId && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={() => setActiveTab("recommendations")}
              className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                activeTab === "recommendations"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700"
              }`}
            >
              Recommendations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("liked")}
              className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                activeTab === "liked"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700"
              }`}
            >
              Liked
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("viewed")}
              className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                activeTab === "viewed"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700"
              }`}
            >
              Viewed
            </button>
          </div>
        )}
      </div>

      {currentUserId && showRecommendationsLoading && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded">
          {loadingMessages.recommendations}
        </div>
      )}

      {currentUserId && isLikedTab && isLoadingLiked && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded">
          {loadingMessages.liked}
        </div>
      )}

      {currentUserId && isViewedTab && isLoadingViewed && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded">
          {loadingMessages.viewed}
        </div>
      )}

      {currentUserId &&
        recommendationsError &&
        activeTab === "recommendations" &&
        !isSearchMode && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
            {recommendationsError}
          </div>
        )}

      {currentUserId && likedError && activeTab === "liked" && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          {likedError}
        </div>
      )}

      {currentUserId && viewedError && activeTab === "viewed" && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          {viewedError}
        </div>
      )}

      {!currentUserId && (
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredPublications.length} of {publications.length}{" "}
            publications
          </p>
        </div>
      )}

      {currentUserId &&
        !isSearchMode &&
        activeTab === "recommendations" &&
        !isLoadingRecommendations &&
        !recommendationsError &&
        recommendations.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">{recommendationEmptyMessage}</p>
          </div>
        )}

      {currentUserId &&
        !isSearchMode &&
        activeTab === "liked" &&
        !isLoadingLiked &&
        !likedError &&
        likedPublications.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">{likedEmptyMessage}</p>
          </div>
        )}

      {currentUserId &&
        !isSearchMode &&
        activeTab === "viewed" &&
        !isLoadingViewed &&
        !viewedError &&
        viewedPublications.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">{viewedEmptyMessage}</p>
          </div>
        )}

      {filteredPublications.length === 0 && (isSearchMode || !currentUserId) ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {isSearchMode
              ? "No publications found for your query."
              : "No publications found matching your criteria"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : null}

      {filteredPublications.length > 0 && (
        <div className="grid gap-4">
          {filteredPublications.map((publication) =>
            renderPublicationCard(
              publication,
              currentUserId !== undefined &&
                currentUserId !== null &&
                activeTab === "recommendations" &&
                !isSearchMode,
            ),
          )}
        </div>
      )}
    </div>
  );
}
