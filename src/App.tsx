import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { LoginPage } from "./components/LoginPage";
import { AuthorDashboard } from "./components/AuthorDashboard";
import { CreatePublicationForm } from "./components/CreatePublicationForm";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminReviewScreen } from "./components/AdminReviewScreen";
import { PublicCatalog } from "./components/PublicCatalog";
import { PublicationDetails } from "./components/PublicationDetails";
import { SuccessDialog } from "./components/SuccessDialog";
export interface Publication {
  id: string;
  authors: string;
  title: string;
  publicationType: string;
  doi: string;
  issn: string;
  isbn: string;
  keywords: string;
  annotation: string;
  faculty: string;
  department: string;
  year: string;
  fileName: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

export type UserRole = "user" | "author" | "admin" | "guest";

export interface CurrentUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

type Screen =
  | "login"
  | "author-dashboard"
  | "create-publication"
  | "admin-dashboard"
  | "admin-review"
  | "public-catalog"
  | "publication-details";

const CURRENT_USER_STORAGE_KEY = "currentUser";

const readStoredUser = (): CurrentUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(savedUser) as CurrentUser;

    return parsedUser && parsedUser.role ? parsedUser : null;
  } catch {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    return null;
  }
};

const getInitialScreen = (user: CurrentUser | null): Screen => {
  if (!user) {
    return "login";
  }

  if (user.role === "admin") {
    return "admin-dashboard";
  }

  if (user.role === "author") {
    return "author-dashboard";
  }

  return "public-catalog";
};

function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    readStoredUser(),
  );
  const [currentScreen, setCurrentScreen] = useState<Screen>(() =>
    getInitialScreen(readStoredUser()),
  );
  const currentUserName = currentUser?.name || "";
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedPublicationId, setSelectedPublicationId] = useState<
    string | null
  >(null);

  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoadingPublications, setIsLoadingPublications] = useState(false);
  const [publicationsError, setPublicationsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchPublications = async () => {
      setIsLoadingPublications(true);
      setPublicationsError(null);

      try {
        const response = await fetch("http://localhost:4000/api/publications");

        if (!response.ok) {
          throw new Error("Failed to fetch publications");
        }

        const data: Publication[] = await response.json();
        setPublications(data);
      } catch {
        setPublicationsError("Не вдалося завантажити публікації з бази даних");
      } finally {
        setIsLoadingPublications(false);
      }
    };

    fetchPublications();
  }, []);

  const handleLogin = (user: CurrentUser): void => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));

    if (user.role === "author") setCurrentScreen("author-dashboard");
    else if (user.role === "admin") setCurrentScreen("admin-dashboard");
    else setCurrentScreen("public-catalog");
  };

  const handleLogout = (): void => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setSelectedPublicationId(null);
    setCurrentScreen("login");
  };

  const handleCreatePublication = (): void => {
    setCurrentScreen("create-publication");
  };

  const handleSubmitPublication = (
    publication: Omit<Publication, "id" | "status" | "submittedDate">,
  ): void => {
    const newPublication: Publication = {
      ...publication,
      id: Date.now().toString(),
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0],
      submittedBy: currentUserName,
    };

    setPublications((prevPublications) => [
      ...prevPublications,
      newPublication,
    ]);
    setShowSuccessDialog(true);
    setCurrentScreen("author-dashboard");
  };

  const handleNavigateToPublicCatalog = (): void => {
    setCurrentScreen("public-catalog");
  };

  // recommendations now displayed inside PublicCatalog

  const handleNavigateToDashboard = (): void => {
    if (currentUser?.role === "author") setCurrentScreen("author-dashboard");
    else if (currentUser?.role === "admin") setCurrentScreen("admin-dashboard");
    else setCurrentScreen("public-catalog");
  };

  const handleViewPublication = (id: string): void => {
    setSelectedPublicationId(id);
    setCurrentScreen("publication-details");
  };

  const handleReviewPublication = (id: string): void => {
    setSelectedPublicationId(id);
    setCurrentScreen("admin-review");
  };

  const handleApproveReject = (
    id: string,
    status: "approved" | "rejected",
    notes: string,
  ): void => {
    setPublications((prevPublications) =>
      prevPublications.map((publication) =>
        publication.id === id
          ? {
              ...publication,
              status,
              reviewedBy: currentUserName,
              reviewedDate: new Date().toISOString().split("T")[0],
              reviewNotes: notes,
            }
          : publication,
      ),
    );

    setCurrentScreen("admin-dashboard");
  };

  const selectedPublication = selectedPublicationId
    ? publications.find(
        (publication) => publication.id === selectedPublicationId,
      )
    : null;

  const userPublications = publications.filter(
    (publication) => publication.submittedBy === currentUserName,
  );

  const approvedPublications = publications.filter(
    (publication) => publication.status === "approved",
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen !== "login" && (
        <Header
          userRole={currentUser ? currentUser.role : null}
          userName={currentUser ? currentUser.name : ""}
          onLogout={handleLogout}
          onNavigateToCatalog={handleNavigateToPublicCatalog}
          onNavigateToDashboard={handleNavigateToDashboard}
        />
      )}

      <main>
        {isLoadingPublications && currentScreen !== "login" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded p-3">
              Завантаження публікацій з бази даних...
            </div>
          </div>
        )}

        {publicationsError && currentScreen !== "login" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3">
              {publicationsError}
            </div>
          </div>
        )}

        {currentScreen === "login" && <LoginPage onLogin={handleLogin} />}

        {currentScreen === "author-dashboard" && (
          <AuthorDashboard
            publications={userPublications}
            onCreateNew={handleCreatePublication}
            onViewDetails={handleViewPublication}
          />
        )}

        {currentScreen === "create-publication" && (
          <CreatePublicationForm
            onSubmit={handleSubmitPublication}
            onCancel={handleNavigateToDashboard}
          />
        )}

        {currentScreen === "admin-dashboard" && (
          <AdminDashboard
            publications={publications}
            onReview={handleReviewPublication}
          />
        )}

        {currentScreen === "admin-review" && selectedPublication && (
          <AdminReviewScreen
            publication={selectedPublication}
            onApprove={(notes) =>
              handleApproveReject(selectedPublication.id, "approved", notes)
            }
            onReject={(notes) =>
              handleApproveReject(selectedPublication.id, "rejected", notes)
            }
            onCancel={handleNavigateToDashboard}
          />
        )}

        {currentScreen === "public-catalog" && (
          <PublicCatalog
            publications={approvedPublications}
            currentUserId={currentUser?.userId}
            onViewDetails={handleViewPublication}
          />
        )}

        {currentScreen === "publication-details" && selectedPublication && (
          <PublicationDetails
            publication={selectedPublication}
            currentUserId={currentUser?.userId}
            onBack={() =>
              setCurrentScreen(
                currentUser == null
                  ? "public-catalog"
                  : currentUser.role === "author"
                    ? "author-dashboard"
                    : currentUser.role === "admin"
                      ? "admin-dashboard"
                      : "public-catalog",
              )
            }
          />
        )}

        {/* UserRecommendations removed; recommendations are shown inside PublicCatalog */}
      </main>

      {showSuccessDialog && (
        <SuccessDialog onClose={() => setShowSuccessDialog(false)} />
      )}
    </div>
  );
}

export default App;
