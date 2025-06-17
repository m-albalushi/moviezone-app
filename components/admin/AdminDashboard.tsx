
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import AdminMovieList from './AdminMovieList'; // Ensured relative path
import PlusIcon from '../icons/PlusIcon';
import EyeIcon from '../icons/EyeIcon'; // For views
import DownloadIcon from '../icons/DownloadIcon'; // For downloads

const AdminDashboard: React.FC = () => {
  const { movies } = useContext(AppContext);

  const totalMovies = movies.length;
  const totalViews = movies.reduce((sum, movie) => sum + (movie.views || 0), 0);
  const totalDownloads = movies.reduce((sum, movie) => sum + (movie.downloads || 0), 0); 

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <Link
          to="/admin/add-movie"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Movie
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Total Movies</h3>
          <p className="text-4xl font-bold text-white">{totalMovies}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-400 mb-2 flex items-center">
            <EyeIcon className="w-5 h-5 mr-2 text-blue-400"/> Total Views
          </h3>
          <p className="text-4xl font-bold text-white">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-400 mb-2 flex items-center">
            <DownloadIcon className="w-5 h-5 mr-2 text-green-400"/> Total Downloads
          </h3>
          <p className="text-4xl font-bold text-white">{totalDownloads.toLocaleString()}</p>
        </div>
      </div>
      
      <AdminMovieList />
    </div>
  );
};

export default AdminDashboard;