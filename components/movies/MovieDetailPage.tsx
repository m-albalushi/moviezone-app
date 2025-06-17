
import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../../App';
import { Movie } from '../../types';
import VideoPlayer from '../movies/VideoPlayer';
import DownloadIcon from '../icons/DownloadIcon';
import EyeIcon from '../icons/EyeIcon';
import StarIcon from '../icons/StarIcon';
import LoadingSpinner from '../common/LoadingSpinner';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    movies: contextMovies, 
    incrementMovieViews, 
    incrementMovieDownloads, 
    isLoading: isAppContextLoading 
  } = useContext<AppContextType>(AppContext);
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [viewIncremented, setViewIncremented] = useState<boolean>(false);


  useEffect(() => {
    setMovie(undefined); 
    setViewIncremented(false);
    setIsLoadingPage(true); 
  }, [id]);

  useEffect(() => {
    if (!id) {
      navigate('/'); 
      setIsLoadingPage(false); 
      return;
    }

    if (!isAppContextLoading) { 
      const foundMovie = contextMovies.find(m => m.id === id);
      
      if (foundMovie) {
        if (movie?.id !== foundMovie.id) {
          setMovie(foundMovie);
        }
        
        if (!viewIncremented) {
          incrementMovieViews(foundMovie.id);
          setViewIncremented(true);
        }
      } else {
        setMovie(undefined); 
      }
      setIsLoadingPage(false);
    } else {
      setIsLoadingPage(true); 
    }
  }, [id, contextMovies, incrementMovieViews, navigate, isAppContextLoading, viewIncremented, movie]);


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
    
    // Supabase Storage serves the exact file that was uploaded,
    // so the downloaded quality will be identical to the uploaded quality.
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