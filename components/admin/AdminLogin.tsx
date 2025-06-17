import React, { useState, useContext } from 'react';
import { AppContext, AppContextType }  from '../../App'; 
import LoadingSpinner from '../common/LoadingSpinner';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState(''); // Default or let user type
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginAdmin } = useContext<AppContextType>(AppContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await loginAdmin(password, email);
    if (!success) {
      setError('Login failed. Please check your email and password.');
    }
    // Successful login is handled by AppContext's onAuthStateChange
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email_admin" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email_admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              required
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password_admin" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password_admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading && <LoadingSpinner size="w-5 h-5 mr-2" />}
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
