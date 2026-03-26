import { useState } from 'react';
import { User, Lock, BookOpen } from 'lucide-react';

type UserRole = 'author' | 'admin' | 'guest' | null;

interface LoginPageProps {
  onLogin: (role: UserRole, name: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Mock authentication logic
    if (email.includes('admin')) {
      onLogin('admin', email);
    } else if (email.includes('@')) {
      onLogin('author', email);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleGuestLogin = () => {
    onLogin('guest', 'Guest User');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-gray-900 mb-2">
            University Publications System
          </h1>
          <p className="text-gray-600">
            Sign in to manage scientific publications
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="your.email@university.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleGuestLogin}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Continue as Guest
            </button>
            <p className="text-center text-gray-500 mt-3 text-sm">
              Browse publications without signing in
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
            <p className="mb-2">Demo credentials:</p>
            <p>Author: author@university.edu</p>
            <p>Admin: admin@university.edu</p>
            <p className="mt-2 text-xs">Any password works for demo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
