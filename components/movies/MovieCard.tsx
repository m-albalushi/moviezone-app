
import React from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../../types';
import PlayIcon from '../icons/PlayIcon';
import StarIcon from '../icons/StarIcon';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out group">
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative">
          <img 
            src={movie.thumbnailUrl} 
            alt={movie.title} 
            className="w-full h-96 object-cover" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // prevent infinite loop if fallback also fails
              target.src = 'https://picsum.photos/400/600?grayscale'; // Fallback image
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center">
            <PlayIcon className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">{movie.title}</h3>
          <p className="text-sm text-gray-400">{movie.genre}</p>
          <div className="flex items-center mt-2">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span className="text-sm text-gray-300">{movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;