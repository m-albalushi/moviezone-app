
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import EyeIcon from '../icons/EyeIcon';
import DownloadIcon from '../icons/DownloadIcon';

const AdminMovieList: React.FC = () => {
  const { movies, deleteMovie } = useContext(AppContext);

  if (movies.length === 0) {
    return <p className="text-center text-gray-400 py-6">No movies added yet. <Link to="/admin/add-movie" className="text-indigo-400 hover:underline">Add one now!</Link></p>;
  }

  const handleDeleteClick = (movieId: string, movieTitle: string) => {
    console.log(`[AdminMovieList] Delete button clicked for movie: "${movieTitle}" (ID: ${movieId})`);
    
    if (window.confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
      console.log(`[AdminMovieList] Confirmed deletion for "${movieTitle}". Calling deleteMovie from context.`);
      deleteMovie(movieId)
        .then(success => {
          if (success) {
            console.log(`[AdminMovieList] deleteMovie call for "${movieTitle}" reported success.`);
          } else {
            // Alert for failure is handled in AppContext's deleteMovie
            console.warn(`[AdminMovieList] deleteMovie call for "${movieTitle}" reported failure. Check previous logs from AppContext.`);
          }
        })
        .catch(error => {
          console.error(`[AdminMovieList] Error during deleteMovie call for "${movieTitle}":`, error);
          alert(`An error occurred while trying to delete "${movieTitle}". Please check the console.`);
        });
    } else {
      console.log(`[AdminMovieList] Deletion cancelled by user for "${movieTitle}".`);
    }
  };

  return (
    <div className="bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-750">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Genre</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Release Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stats (V/D)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {movies.map(movie => (
            <tr key={movie.id} className="hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-12">
                    <img 
                        className="h-16 w-12 rounded object-cover" 
                        src={movie.thumbnailUrl} 
                        alt={movie.title} 
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; 
                            target.src = 'https://picsum.photos/48/64?grayscale';
                        }}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">{movie.title}</div>
                    <div className="text-xs text-gray-400">ID: {movie.id.substring(0,8)}...</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.genre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.releaseDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                    <EyeIcon className="w-4 h-4 text-blue-400" /> <span>{movie.views || 0}</span>
                    <DownloadIcon className="w-4 h-4 text-green-400" /> <span>{movie.downloads || 0}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  <Link to={`/admin/edit-movie/${movie.id}`} className="text-indigo-400 hover:text-indigo-300" title="Edit">
                    <EditIcon className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleDeleteClick(movie.id, movie.title)} 
                    className="text-red-500 hover:text-red-400" title="Delete">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminMovieList;
