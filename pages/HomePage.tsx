
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { Genre } from '../types';
import MovieGrid from '../components/movies/MovieGrid';
import SearchBar from '../components/movies/SearchBar';
import GenreFilter from '../components/movies/GenreFilter';

const HomePage: React.FC = () => {
  const { movies } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  const filteredMovies = useMemo(() => {
    return movies
      .filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(movie => 
        selectedGenre ? movie.genre === selectedGenre : true
      );
  }, [movies, searchTerm, selectedGenre]);

  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          Discover Your Next Favorite Movie
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Browse our collection, find hidden gems, and enjoy cinema from home.
        </p>
      </header>
      
      <div className="sticky top-0 z-10 bg-gray-900 bg-opacity-80 backdrop-blur-md py-4 -mx-4 px-4 rounded-b-lg shadow-md">
        <SearchBar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
        <GenreFilter selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />
      </div>
      
      <MovieGrid movies={filteredMovies} />
    </div>
  );
};

export default HomePage;