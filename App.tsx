
import React, { useState, useEffect, useCallback, createContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Movie, Database } from './types'; // Added Database for MovieInsertType
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import AdminPage from './pages/AdminPage';
import { supabase } from './supabaseClient'; // Import Supabase client
import type { User, Session } from '@supabase/supabase-js'; 
import LoadingSpinner from './components/common/LoadingSpinner';

// Define the type for movie data used in addMovie, matching the DB insert type
type MovieInsertType = Database['public']['Tables']['movies']['Insert'];

export interface AppContextType {
  movies: Movie[];
  isAdmin: boolean;
  user: User | null;
  session: Session | null;
  loginAdmin: (password: string, email?: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  addMovie: (movieData: MovieInsertType) => Promise<Movie | null>; // Using MovieInsertType here for consistency
  updateMovie: (movieId: string, updatedData: Partial<Omit<Movie, 'id' | 'created_at'>>) => Promise<Movie | null>;
  deleteMovie: (movieId: string) => Promise<boolean>;
  incrementMovieViews: (movieId: string) => Promise<void>;
  incrementMovieDownloads: (movieId: string) => Promise<void>;
  isLoading: boolean; // Represents initial app load (auth + first movie fetch)
}

export const AppContext = createContext<AppContextType>({
  movies: [],
  isAdmin: false,
  user: null,
  session: null,
  loginAdmin: async () => false,
  logoutAdmin: async () => {},
  addMovie: async () => null,
  updateMovie: async () => null,
  deleteMovie: async () => false,
  incrementMovieViews: async () => {},
  incrementMovieDownloads: async () => {},
  isLoading: true,
});

export const App: React.FC = () => { // Changed to named export
  const [movies, setMovies] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For initial auth and initial movie load

  const navigate = useNavigate();
  const location = useLocation();

  const refreshMovies = useCallback(async () => {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error refreshing movies:', error.message || error);
      alert(`Error refreshing movies: ${error.message || 'Unknown error'}. The movie list might be out of date.`);
    } else {
      setMovies(data || []);
    }
  }, []);

  // Effect for handling authentication state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        const adminStatus = !!newSession?.user;
        setIsAdmin(adminStatus);

        if (_event === 'SIGNED_IN') {
          navigate(location.pathname.startsWith('/admin') ? location.pathname : '/admin/dashboard', { replace: true });
        }
        if (_event === 'SIGNED_OUT') {
          navigate('/admin', { replace: true });
        }
      }
    );
    return () => authListener.subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Effect for fetching initial session and movie data, runs only once
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error fetching session:", sessionError.message || sessionError);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAdmin(!!currentSession?.user);

      await refreshMovies();
      setIsLoading(false); 
    };

    fetchInitialData();
  }, [refreshMovies]);


  const loginAdmin = useCallback(async (password: string, email: string = 'admin@moviezone.com'): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email, 
      password: password,
    });
    if (error) {
      console.error('Error logging in:', error.message || error);
      alert(`Login failed: ${error.message}`);
      return false;
    }
    // No alert on success, navigation handles feedback
    return true; 
  }, []);

  const logoutAdmin = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message || error);
      alert(`Logout failed: ${error.message}`);
    }
    // No alert on success, navigation handles feedback
  }, []);

  const addMovie = useCallback(async (movieData: MovieInsertType): Promise<Movie | null> => {
    const moviePayload = {
        ...movieData, 
        views: movieData.views || 0,
        downloads: movieData.downloads || 0, 
    };
    const { data, error } = await supabase
      .from('movies')
      .insert([moviePayload])
      .select()
      .single();
    if (error) {
      console.error('Error adding movie:', error.message || error);
      alert(`Failed to add movie: ${error.message}`);
      return null;
    }
    if (data) {
      await refreshMovies(); 
      alert('Movie added successfully!');
    }
    return data as Movie | null;
  }, [refreshMovies]);

  const updateMovie = useCallback(async (movieId: string, updatedData: Partial<Omit<Movie, 'id' | 'created_at'>>): Promise<Movie | null> => {
    const { data, error } = await supabase
      .from('movies')
      .update(updatedData)
      .eq('id', movieId)
      .select()
      .single();
    if (error) {
      console.error('Error updating movie:', error.message || error);
      alert(`Failed to update movie: ${error.message}`);
      return null;
    }
    if (data) {
      await refreshMovies(); 
      alert('Movie updated successfully!');
    }
    return data as Movie | null;
  }, [refreshMovies]);
  
  const deleteMovie = useCallback(async (movieId: string): Promise<boolean> => {
    console.log(`Attempting to delete movie with ID: ${movieId}`);
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', movieId);
    if (error) {
      console.error('Error deleting movie:', error.message || error);
      alert(`Failed to delete movie: ${error.message}. This could be due to Row Level Security policies or network issues.`);
      return false;
    }
    await refreshMovies(); 
    alert('Movie deleted successfully.');
    return true;
  }, [refreshMovies]);

  const incrementMovieViews = useCallback(async (movieId: string) => {
    const { error } = await supabase.rpc('increment_views', { movie_id_param: movieId });
    if (error) {
        console.error("Error incrementing views via RPC:", error.message || error);
        // Not alerting user for this, as it's a background action
    } else {
        await refreshMovies();
    }
  }, [refreshMovies]);

  const incrementMovieDownloads = useCallback(async (movieId: string) => {
    const { error } = await supabase.rpc('increment_downloads', { movie_id_param: movieId });
    if (error) {
        console.error("Error incrementing downloads via RPC:", error.message || error);
        // Not alerting user for this
    } else {
        await refreshMovies(); 
    }
  }, [refreshMovies]);


  const contextValue: AppContextType = {
    movies,
    isAdmin,
    user,
    session,
    loginAdmin,
    logoutAdmin,
    addMovie,
    updateMovie,
    deleteMovie,
    incrementMovieViews,
    incrementMovieDownloads,
    isLoading,
  };

  const showNavbarAndFooter = !location.pathname.startsWith('/admin') || (location.pathname.startsWith('/admin') && isAdmin);
  
  if (isLoading && location.pathname.startsWith('/admin') && !session) { 
      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-gray-100">
            <LoadingSpinner size="w-12 h-12" />
            <p className="mt-4">Loading Admin Area...</p>
        </div>
      )
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        {showNavbarAndFooter && <Navbar />}
        <main className="flex-grow container mx-auto px-4 py-8">
          {isLoading && !location.pathname.startsWith('/admin') ? ( 
             <div className="flex justify-center items-center h-64"> <LoadingSpinner size="w-12 h-12" /><p className="ml-3 text-xl">Loading Movies...</p></div>
          ) : (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
            </Routes>
          )}
        </main>
        {showNavbarAndFooter && <Footer />}
      </div>
    </AppContext.Provider>
  );
};

