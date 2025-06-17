
import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../App';
import { Movie } from '../types';
import VideoPlayer from '../components/movies/VideoPlayer';
import DownloadIcon from '../components/icons/DownloadIcon';
import EyeIcon from '../components/icons/EyeIcon';
import StarIcon from '../components/icons/StarIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    movies: contextMovies, 
    incrementMovieViews, 
    incrementMovieDownloads, 
    isLoading: isAppContextLoading // This is now stable after initial app load
  } = useContext<AppContextType>(AppContext);
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [viewIncremented, setViewIncremented] = useState<boolean>(false);


  useEffect(() => {
    // Reset movie state and viewIncremented flag if the ID changes
    // This ensures that navigating from one movie detail page to another correctly reloads and re-increments views.
    // console.log(`Movie ID changed to: ${id}. Resetting movie state and viewIncremented flag.`); // Debug log
    setMovie(undefined); 
    setViewIncremented(false);
    setIsLoadingPage(true); // Start loading for the new ID
  }, [id]);

  useEffect(() => {
    if (!id) {
      // console.log("No ID in params, navigating to home."); // Debug log
      navigate('/'); 
      setIsLoadingPage(false); 
      return;
    }

    // console.log(`Effect for ID: ${id}. AppContextLoading: ${isAppContextLoading}, ViewIncremented: ${viewIncremented}`); // Debug log

    if (!isAppContextLoading) { // Only proceed if initial app data (including movies) is loaded
      // console.log(`AppContext is loaded. Searching for movie ID: ${id} in contextMovies (count: ${contextMovies.length})`); // Debug log
      const foundMovie = contextMovies.find(m => m.id === id);
      
      if (foundMovie) {
        // console.log(`Movie found: ${foundMovie.title}. Current local movie state ID: ${movie?.id}`); // Debug log
        // Set movie state if it's not already set or if it's a different movie
        if (movie?.id !== foundMovie.id) {
          // console.log(`Setting local movie state to: ${foundMovie.title}`); // Debug log
          setMovie(foundMovie);
        }
        
        if (!viewIncremented) {
          // console.log(`View not incremented for ${foundMovie.title}. Incrementing now.`); // Debug log
          incrementMovieViews(foundMovie.id);
          setViewIncremented(true);
        } else {
          // console.log(`View already incremented for ${foundMovie.title}.`); // Debug log
        }
      } else {
        // console.log(`Movie with ID: ${id} not found in context after AppContext loaded. Setting local movie to undefined.`); // Debug log
        setMovie(undefined); // Explicitly set to undefined if not found after context is ready
      }
      setIsLoadingPage(false);
      // console.log(`Finished processing for ID: ${id}. isLoadingPage set to false.`); // Debug log
    } else {
      // console.log(`AppContext is still loading. Waiting...`); // Debug log
      setIsLoadingPage(true); // Ensure loading is true if app context is not ready
    }
  }, [id, contextMovies, incrementMovieViews, navigate, isAppContextLoading, viewIncremented, movie]); // movie added to deps to ensure re-evaluation if it's externally changed


  if (isLoadingPage || (isAppContextLoading && !movie)) { 
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="w-16 h-16" />
        <p className="ml-3 text-xl">Loading Movie Details...</p>
      </div>
    );
  }
  
  if (!movie) { 
     return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h1 className="text-3xl text-red-500 mb-4">Movie Not Found</h1>
        <p className="text-gray-400 mb-6">The movie you are looking for (ID: {id}) does not exist or may have been removed.</p>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 bg-gray-700 px-6 py-3 rounded-lg transition-colors">
            &larr; Go Back to Movies
        </Link>
      </div>
    );
  }


  const handleDownload = async () => {
    if (!movie.videoUrl) {
        alert("No video URL available for download.");
        return;
    }
    
    const link = document.createElement('a');
    link.href = movie.videoUrl;
    link.setAttribute('download', `${movie.title.replace(/\s+/g, '_')}.mp4`); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Attempting to download "${movie.title}".\nYour download should start shortly.`);
    
    try {
      await incrementMovieDownloads(movie.id);
    } catch (error) {
      console.error("Failed to increment download count:", error);
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link to="/" className="text-indigo-400 hover:text-indigo-300 mb-6 inline-block">&larr; Back to Movies</Link>
      
      <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img 
              src={movie.thumbnailUrl} 
              alt={movie.title} 
              className="w-full h-auto md:h-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; 
                target.src = 'https://picsum.photos/400/600?grayscale';
              }}
            />
          </div>
          <div className="md:w-2/3 p-6 md:p-8">
            <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
            <div className="flex items-center space-x-4 mb-4 text-gray-400">
              <span>{movie.releaseDate.substring(0,4)}</span>
              <span>&bull;</span>
              <span>{movie.genre}</span>
              <span>&bull;</span>
              <span>{movie.duration}</span>
            </div>

            <div className="flex items-center mb-6 space-x-4">
              <div className="flex items-center">
                <StarIcon className="w-6 h-6 text-yellow-400 mr-1" />
                <span className="text-xl text-white font-semibold">{(movie.rating || 0).toFixed(1)}</span>
                <span className="text-sm text-gray-400 ml-1">/ 10</span>
              </div>
              <div className="flex items-center text-gray-400">
                <EyeIcon className="w-5 h-5 mr-1" />
                <span>{(movie.views || 0).toLocaleString()} views</span>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6">{movie.description}</p>
            
            <button
              onClick={handleDownload}
              disabled={!movie.videoUrl}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download Movie
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-semibold text-white mb-6">Watch Trailer / Movie</h2>
        {movie.videoUrl ? (
            <VideoPlayer src={movie.videoUrl} title={movie.title} />
        ) : (
            <div className="aspect-video bg-black rounded-lg flex justify-center items-center">
                <p className="text-gray-400 text-xl">No video available for this movie.</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default MovieDetailPage;
