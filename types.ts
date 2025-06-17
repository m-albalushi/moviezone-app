export enum Genre {
  ACTION = "Action",
  COMEDY = "Comedy",
  DRAMA = "Drama",
  HORROR = "Horror",
  SCIFI = "Sci-Fi",
  ROMANCE = "Romance",
  THRILLER = "Thriller",
  FANTASY = "Fantasy",
  ANIMATION = "Animation",
  DOCUMENTARY = "Documentary",
  ADVENTURE = "Adventure",
  MYSTERY = "Mystery",
}

export interface Movie {
  id: string; // UUID from Supabase
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string; // Public URL from Supabase Storage
  genre: Genre;
  releaseDate: string; // YYYY-MM-DD
  rating: number; // e.g., 8.5
  duration: string; // e.g., "2h 15m"
  views: number;
  downloads: number; 
  created_at?: string; // Supabase auto-generated timestamp
}

// Basic Supabase Database definition for typing with createClient
export interface Database {
  public: {
    Tables: {
      movies: {
        Row: Movie; // The type of data you get from .select()
        Insert: Omit<Movie, 'id' | 'created_at' | 'views' | 'downloads'> & { views?: number, downloads?: number }; // The type of data you send to .insert()
        Update: Partial<Omit<Movie, 'id' | 'created_at'>>; // The type of data you send to .update()
      };
    };
    Views: {
      // Add views here if you have them
    };
    Functions: {
      "increment_views": { // Made non-optional
        Args: { movie_id_param: string }; 
        Returns: void;
      };
      "increment_downloads": { // Made non-optional
        Args: { movie_id_param: string };
        Returns: void;
      };
    };
  };
}