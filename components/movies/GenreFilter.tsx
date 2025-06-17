
import React from 'react';
import { Genre } from '../../types';

interface GenreFilterProps {
  selectedGenre: Genre | null;
  onGenreChange: (genre: Genre | null) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ selectedGenre, onGenreChange }) => {
  const genres = Object.values(Genre);

  return (
    <div className="mb-6 flex flex-wrap gap-2 items-center">
      <span className="text-gray-300 font-medium mr-2">Filter by Genre:</span>
      <button
        onClick={() => onGenreChange(null)}
        className={`px-4 py-2 text-sm rounded-md transition-colors ${
          selectedGenre === null 
            ? 'bg-indigo-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        All
      </button>
      {genres.map(genre => (
        <button
          key={genre}
          onClick={() => onGenreChange(genre)}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            selectedGenre === genre 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;