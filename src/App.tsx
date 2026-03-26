import { useState } from 'react';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { AuthorDashboard } from './components/AuthorDashboard';
import { CreatePublicationForm } from './components/CreatePublicationForm';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminReviewScreen } from './components/AdminReviewScreen';
import { PublicCatalog } from './components/PublicCatalog';
import { PublicationDetails } from './components/PublicationDetails';
import { SuccessDialog } from './components/SuccessDialog';

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
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

type UserRole = 'author' | 'admin' | 'guest' | null;
type Screen = 'login' | 'author-dashboard' | 'create-publication' | 'admin-dashboard' | 'admin-review' | 'public-catalog' | 'publication-details';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(null);

  // Mock data for publications
  const [publications, setPublications] = useState<Publication[]>([
    {
      id: '1',
      authors: 'Dr. Sarah Johnson, Prof. Michael Chen',
      title: 'Advanced Machine Learning Techniques for Medical Diagnosis',
      publicationType: 'Journal Article',
      doi: '10.1234/jml.2024.001',
      issn: '2156-7890',
      isbn: '',
      keywords: 'machine learning, medical diagnosis, neural networks, healthcare',
      annotation: 'This paper presents novel machine learning approaches for improving medical diagnosis accuracy. We introduce a new neural network architecture that achieves 95% accuracy in early disease detection.',
      faculty: 'Faculty of Computer Science',
      department: 'Department of Artificial Intelligence',
      year: '2024',
      fileName: 'ml-medical-diagnosis.pdf',
      status: 'approved',
      submittedBy: 'sarah.johnson@university.edu',
      submittedDate: '2024-11-15',
      reviewedBy: 'admin@university.edu',
      reviewedDate: '2024-11-20'
    },
    {
      id: '2',
      authors: 'Prof. Emily Roberts',
      title: 'Quantum Computing Applications in Cryptography',
      publicationType: 'Conference Paper',
      doi: '10.5678/qc.2024.042',
      issn: '',
      isbn: '978-1-234-56789-0',
      keywords: 'quantum computing, cryptography, security, algorithms',
      annotation: 'An exploration of quantum computing principles applied to modern cryptographic systems. This research discusses potential vulnerabilities and new protection mechanisms.',
      faculty: 'Faculty of Physics',
      department: 'Department of Quantum Physics',
      year: '2024',
      fileName: 'quantum-crypto.pdf',
      status: 'pending',
      submittedBy: 'emily.roberts@university.edu',
      submittedDate: '2024-12-01'
    },
    {
      id: '3',
      authors: 'Dr. James Wilson, Dr. Anna Martinez, Dr. Thomas Lee',
      title: 'Sustainable Urban Development: Case Studies from European Cities',
      publicationType: 'Book Chapter',
      doi: '10.9012/sud.2023.156',
      issn: '',
      isbn: '978-0-987-65432-1',
      keywords: 'urban development, sustainability, environmental policy, smart cities',
      annotation: 'This chapter examines sustainable development practices in major European cities, analyzing policy frameworks, implementation challenges, and measurable outcomes over the past decade.',
      faculty: 'Faculty of Architecture and Urban Planning',
      department: 'Department of Urban Studies',
      year: '2023',
      fileName: 'sustainable-urban-dev.pdf',
      status: 'approved',
      submittedBy: 'james.wilson@university.edu',
      submittedDate: '2023-10-20',
      reviewedBy: 'admin@university.edu',
      reviewedDate: '2023-10-25'
    }
  ]);

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setUserName(name);
    
    if (role === 'author') {
      setCurrentScreen('author-dashboard');
    } else if (role === 'admin') {
      setCurrentScreen('admin-dashboard');
    } else if (role === 'guest') {
      setCurrentScreen('public-catalog');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName('');
    setCurrentScreen('login');
  };

  const handleCreatePublication = () => {
    setCurrentScreen('create-publication');
  };

  const handleSubmitPublication = (publication: Omit<Publication, 'id' | 'status' | 'submittedDate'>) => {
    const newPublication: Publication = {
      ...publication,
      id: Date.now().toString(),
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      submittedBy: userName
    };
    
    setPublications([...publications, newPublication]);
    setShowSuccessDialog(true);
    setCurrentScreen('author-dashboard');
  };

  const handleNavigateToPublicCatalog = () => {
    setCurrentScreen('public-catalog');
  };

  const handleNavigateToDashboard = () => {
    if (userRole === 'author') {
      setCurrentScreen('author-dashboard');
    } else if (userRole === 'admin') {
      setCurrentScreen('admin-dashboard');
    } else {
      setCurrentScreen('public-catalog');
    }
  };

  const handleViewPublication = (id: string) => {
    setSelectedPublicationId(id);
    setCurrentScreen('publication-details');
  };

  const handleReviewPublication = (id: string) => {
    setSelectedPublicationId(id);
    setCurrentScreen('admin-review');
  };

  const handleApproveReject = (id: string, status: 'approved' | 'rejected', notes: string) => {
    setPublications(publications.map(pub => 
      pub.id === id 
        ? { 
            ...pub, 
            status, 
            reviewedBy: userName,
            reviewedDate: new Date().toISOString().split('T')[0],
            reviewNotes: notes
          }
        : pub
    ));
    setCurrentScreen('admin-dashboard');
  };

  const selectedPublication = selectedPublicationId 
    ? publications.find(p => p.id === selectedPublicationId)
    : null;

  const userPublications = publications.filter(p => p.submittedBy === userName);
  const approvedPublications = publications.filter(p => p.status === 'approved');

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen !== 'login' && (
        <Header 
          userRole={userRole}
          userName={userName}
          onLogout={handleLogout}
          onNavigateToCatalog={handleNavigateToPublicCatalog}
          onNavigateToDashboard={handleNavigateToDashboard}
        />
      )}

      <main>
        {currentScreen === 'login' && (
          <LoginPage onLogin={handleLogin} />
        )}

        {currentScreen === 'author-dashboard' && (
          <AuthorDashboard 
            publications={userPublications}
            onCreateNew={handleCreatePublication}
            onViewDetails={handleViewPublication}
          />
        )}

        {currentScreen === 'create-publication' && (
          <CreatePublicationForm 
            onSubmit={handleSubmitPublication}
            onCancel={handleNavigateToDashboard}
          />
        )}

        {currentScreen === 'admin-dashboard' && (
          <AdminDashboard 
            publications={publications}
            onReview={handleReviewPublication}
          />
        )}

        {currentScreen === 'admin-review' && selectedPublication && (
          <AdminReviewScreen 
            publication={selectedPublication}
            onApprove={(notes) => handleApproveReject(selectedPublication.id, 'approved', notes)}
            onReject={(notes) => handleApproveReject(selectedPublication.id, 'rejected', notes)}
            onCancel={handleNavigateToDashboard}
          />
        )}

        {currentScreen === 'public-catalog' && (
          <PublicCatalog 
            publications={approvedPublications}
            onViewDetails={handleViewPublication}
          />
        )}

        {currentScreen === 'publication-details' && selectedPublication && (
          <PublicationDetails 
            publication={selectedPublication}
            onBack={() => setCurrentScreen(userRole === 'guest' ? 'public-catalog' : userRole === 'author' ? 'author-dashboard' : 'admin-dashboard')}
          />
        )}
      </main>

      {showSuccessDialog && (
        <SuccessDialog 
          onClose={() => setShowSuccessDialog(false)}
        />
      )}
    </div>
  );
}

export default App;
