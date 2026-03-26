import { User, LogOut, FileText, Home } from 'lucide-react';

type UserRole = 'author' | 'admin' | 'guest' | null;

interface HeaderProps {
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToDashboard: () => void;
}

export function Header({ userRole, userName, onLogout, onNavigateToCatalog, onNavigateToDashboard }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-gray-900">
              University Scientific Publications
            </h1>
            <nav className="flex gap-4">
              <button
                onClick={onNavigateToDashboard}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded"
              >
                <Home size={18} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={onNavigateToCatalog}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded"
              >
                <FileText size={18} />
                <span>Publications</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <User size={18} />
              <span>{userName}</span>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {userRole?.toUpperCase()}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
