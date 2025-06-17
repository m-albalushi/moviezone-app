
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext, AppContextType } from '../../App';
import { Movie, Genre } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { supabase } from '../../supabaseClient'; // Import Supabase client

// Name of your public Supabase Storage bucket for videos
const VIDEO_BUCKET_NAME = 'movie-videos'; 

const MovieForm: React.FC = () => {
  const { id: movieIdToEdit } = useParams<{ id: string }>();
  const { movies: contextMovies, addMovie, updateMovie, isLoading: isAppContextLoading } = useContext<AppContextType>(AppContext);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Movie, 'id' | 'created_at' | 'views' | 'downloads'>>({
    title: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '', 
    genre: Genre.ACTION,
    releaseDate: '',
    rating: 7.0,
    duration: '1h 30m',
  });
  const [currentMovieId, setCurrentMovieId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formLoading, setFormLoading] = useState(false);


  useEffect(() => {
    setFormLoading(true);
    if (movieIdToEdit) {
      const movieToEdit = contextMovies.find(m => m.id === movieIdToEdit);
      if (movieToEdit) {
        setIsEditing(true);
        setCurrentMovieId(movieToEdit.id);
        const { id, created_at, views, downloads, ...editableData } = movieToEdit;
        setFormData(editableData);
      } else if (!isAppContextLoading) { 
        console.warn("Movie to edit not found, navigating to dashboard.");
        navigate('/admin/dashboard'); 
      }
    } else {
      setIsEditing(false);
      setCurrentMovieId(null);
      setFormData({
        title: '', description: '', thumbnailUrl: '', videoUrl: '',
        genre: Genre.ACTION, releaseDate: '', rating: 7.0, duration: '1h 30m',
      });
    }
    setFormLoading(false);
  }, [movieIdToEdit, contextMovies, navigate, isAppContextLoading]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rating' ? parseFloat(value) : value }));
    
    if (name === 'title' && (formData.thumbnailUrl === '' || formData.thumbnailUrl.includes('picsum.photos/seed/'))) { 
        setFormData(prev => ({ ...prev, thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(value) || 'movie'}/400/600` }));
    }
     if (name === 'videoUrl') { 
        setVideoFile(null);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setFormData(prev => ({ ...prev, videoUrl: '' })); 
    } else {
      setVideoFile(null);
    }
  };

  const sanitizeFilename = (filename: string): string => {
    const extensionMatch = filename.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
    const extension = extensionMatch ? `.${extensionMatch[1]}` : '.mp4'; 
  
    let baseName = filename.substring(0, filename.length - extension.length);
  
    baseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    baseName = baseName.replace(/[_]{2,}/g, '_').replace(/[-]{2,}/g, '-');
    baseName = baseName.replace(/^[_/-]+|[_/-]+$/g, '');
    baseName = baseName.substring(0, 50); 
  
    return `${Date.now()}_${baseName || 'video'}${extension}`;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    let finalVideoUrl = formData.videoUrl;

    if (videoFile) {
      setIsUploadingVideo(true);
      setUploadProgress(0);
      const sanitizedFileName = sanitizeFilename(videoFile.name);
      
      // Supabase Storage stores the file as-is, preserving its original quality.
      console.log(`[MovieForm] Attempting to upload video. Original name: "${videoFile.name}", Sanitized name: "${sanitizedFileName}" to bucket: "${VIDEO_BUCKET_NAME}"`);

      try {
        setUploadProgress(10); 
        const { data: uploadData, error: uploadError } = await supabase.storage
        .from(VIDEO_BUCKET_NAME)
        .upload(sanitizedFileName, videoFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: videoFile.type || 'video/mp4',
        });
        
        console.log("[MovieForm] Supabase storage upload call completed."); 

        if (uploadError) {
          console.error('[MovieForm] Supabase storage upload returned an error:', uploadError);
          throw uploadError; 
        }
        
        if (!uploadData || !uploadData.path) {
            console.error('[MovieForm] Supabase storage upload succeeded but returned no path in data:', uploadData);
            throw new Error("Video upload succeeded but path was not returned.");
        }
        
        setUploadProgress(100); 
        console.log("[MovieForm] Video upload successful. Upload data:", uploadData);
        
        const { data: publicUrlData } = supabase.storage
          .from(VIDEO_BUCKET_NAME)
          .getPublicUrl(uploadData.path);
        
        if (!publicUrlData || !publicUrlData.publicUrl) {
            console.error('[MovieForm] Failed to get public URL for uploaded video. Path:', uploadData.path, 'Public URL Data:', publicUrlData);
            throw new Error("Failed to get public URL for uploaded video.");
        }
        finalVideoUrl = publicUrlData.publicUrl;
        console.log("[MovieForm] Successfully obtained public URL:", finalVideoUrl);

      } catch (uploadError: any) {
        console.error('[MovieForm] Detailed error object during video upload to Supabase Storage (inside catch):', uploadError);
        console.error('[MovieForm] Message from video upload error (inside catch):', uploadError.message || "No specific message found in error object.");
        alert(`Video upload failed: ${uploadError.message || 'An unknown error occurred during upload. Check console for details.'}`);
        setIsUploadingVideo(false);
        setFormLoading(false);
        setUploadProgress(0); 
        return;
      } finally {
        setIsUploadingVideo(false); 
      }

    } else if (!finalVideoUrl && !isEditing) { 
      alert("Please provide a video URL or upload a video file for new movies.");
      setFormLoading(false);
      return;
    }
    
    const movieDataToSave = { 
        ...formData, 
        videoUrl: finalVideoUrl,
        rating: Number(formData.rating) || 0,
    };
    
    let success = false;
    let resultMovie = null;

    console.log("[MovieForm] Attempting to save movie metadata to database table 'movies'. Editing:", isEditing, "ID:", currentMovieId);
    if (isEditing && currentMovieId) {
      resultMovie = await updateMovie(currentMovieId, movieDataToSave);
    } else {
      resultMovie = await addMovie(movieDataToSave);
    }
    
    if (resultMovie) {
        success = true;
        console.log("[MovieForm] Successfully saved/updated movie metadata to database. Movie ID:", resultMovie.id);
    } else {
        console.error("[MovieForm] Failed to save/update movie metadata to database.");
    }
    
    setFormLoading(false);
    if (success) {
      setVideoFile(null); 
      setUploadProgress(0); 
      navigate('/admin/dashboard');
    } else {
      // Alerts are now handled in App.tsx's addMovie/updateMovie for consistency
      // If still no alert and fails, check console in App.tsx
    }
  };

  if (formLoading && isAppContextLoading) {
      return <div className="flex justify-center items-center p-10"><LoadingSpinner size="w-10 h-10" /> <p className="ml-3">Loading form...</p></div>;
  }

  const inputClass = "w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">{isEditing ? 'Edit Movie' : 'Add New Movie'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className={labelClass}>Title</label>
          <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={inputClass} required disabled={formLoading || isUploadingVideo}/>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} required disabled={formLoading || isUploadingVideo}/>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="thumbnailUrl" className={labelClass}>Thumbnail URL</label>
              <input type="url" name="thumbnailUrl" id="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} className={inputClass} placeholder="https://example.com/image.jpg" disabled={formLoading || isUploadingVideo}/>
              {formData.thumbnailUrl && <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="mt-2 rounded-md max-h-32 object-contain" onError={(e) => { const t = e.target as HTMLImageElement; t.style.display='none';}}/>}
            </div>
            <div>
              <label htmlFor="videoUrl" className={labelClass}>Video URL (Publicly Accessible)</label>
              <input 
                type="url" 
                name="videoUrl" 
                id="videoUrl" 
                value={formData.videoUrl}
                onChange={handleChange} 
                className={inputClass} 
                placeholder="https://example.com/movie.mp4" 
                disabled={formLoading || !!videoFile || isUploadingVideo}
              />
               <p className="text-xs text-gray-400 mt-1">If not uploading, provide a direct, public URL.</p>

              <label htmlFor="videoFile" className={`${labelClass} mt-3`}>Or Upload Video File (to Supabase Storage):</label>
              <input 
                type="file" 
                name="videoFile" 
                id="videoFile" 
                accept="video/*" 
                onChange={handleVideoFileChange} 
                className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`} 
                disabled={formLoading || isUploadingVideo}
              />
               {videoFile && (
                <p className="text-xs text-blue-400 mt-1">Selected file: {videoFile.name} ({ (videoFile.size / (1024*1024)).toFixed(2) } MB)</p>
               )}
               {isUploadingVideo && (
                 <div className="mt-2">
                    <p className="text-xs text-yellow-400">Uploading video... This may take a while.</p>
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-yellow-400">{uploadProgress}%</p>
                 </div>
               )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="genre" className={labelClass}>Genre</label>
            <select name="genre" id="genre" value={formData.genre} onChange={handleChange} className={inputClass} disabled={formLoading || isUploadingVideo}>
              {Object.values(Genre).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="releaseDate" className={labelClass}>Release Date</label>
            <input type="date" name="releaseDate" id="releaseDate" value={formData.releaseDate} onChange={handleChange} className={inputClass} required disabled={formLoading || isUploadingVideo}/>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="rating" className={labelClass}>Rating (0.0 - 10.0)</label>
            <input type="number" name="rating" id="rating" value={formData.rating} onChange={handleChange} step="0.1" min="0" max="10" className={inputClass} required disabled={formLoading || isUploadingVideo}/>
          </div>
          <div>
            <label htmlFor="duration" className={labelClass}>Duration (e.g., 2h 15m)</label>
            <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} className={inputClass} placeholder="2h 15m" required disabled={formLoading || isUploadingVideo}/>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            disabled={formLoading || isUploadingVideo}
            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formLoading || isUploadingVideo}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            { (formLoading || isUploadingVideo) && <LoadingSpinner size="w-5 h-5 mr-2"/> }
            {isUploadingVideo ? 'Uploading...' : (formLoading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Movie'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;