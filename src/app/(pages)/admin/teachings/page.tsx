'use client';

import { useState, useEffect } from 'react';
import TranslatableText from '@/app/_components/TranslatableText';
import Link from 'next/link';

const CATEGORIES = [
  'Sermon',
  'Bible Study',
  'Spiritual Message',
  'Special Service',
  'Youth Message',
  'Q&A',
  'Other'
];

const MEDIA_TYPES = [
  'video',
  'audio'
];

type Teaching = {
  id: string;
  title: string;
  description: string;
  priestName: string;
  mediaType: string;
  mediaUrl: string;
  vimeoId: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  category: string;
  createdAt: string;
};

export default function AdminTeachingsPage() {
  const [password, setPassword] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priestName, setPriestName] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('video');
  const [category, setCategory] = useState('Sermon');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loadingTeachings, setLoadingTeachings] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [useFileUpload, setUseFileUpload] = useState(false);

  // Fetch existing teachings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTeachings();
    }
  }, [isAuthenticated]);

  const fetchTeachings = async () => {
    try {
      setLoadingTeachings(true);
      const response = await fetch('/api/teachings');
      if (response.ok) {
        const data = await response.json();
        setTeachings(data);
      } else {
        console.error('Failed to fetch teachings');
      }
    } catch (error) {
      console.error('Error fetching teachings:', error);
    } finally {
      setLoadingTeachings(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError('Please select a file to upload');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('password', password);
      
      const response = await fetch('/api/teachings/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUploadProgress(100);
        setMessage('File uploaded successfully!');
        return data;
      } else {
        setError(data.error || 'Failed to upload file');
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('An error occurred during file upload');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setSuccess(false);

    let fileUploadResult = null;
    let finalMediaUrl = mediaUrl;
    let finalMediaType = mediaType;

    // Handle file upload if that option is selected
    if (useFileUpload && uploadFile) {
      fileUploadResult = await handleFileUpload();
      if (!fileUploadResult) {
        setLoading(false);
        return;
      }
      finalMediaUrl = fileUploadResult.fileUrl;
      finalMediaType = fileUploadResult.mediaType;
    } else if (!useFileUpload && !mediaUrl) {
      setError('Please provide a media URL.');
      setLoading(false);
      return;
    }

    if (!title || !priestName) {
      setError('Please provide all required fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/teachings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          priestName,
          mediaType: finalMediaType,
          mediaUrl: finalMediaUrl,
          category,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage('Teaching added successfully!');
        // Reset form
        setTitle('');
        setDescription('');
        setPriestName('');
        setMediaUrl('');
        setCategory('Sermon');
        // Refresh teachings list
        fetchTeachings();
      } else {
        setError(data.error || 'Failed to add teaching. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/teachings/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: authPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Authentication successful');
        setIsAuthenticated(true);
        setPassword(authPassword); // Set the main password field to reuse for other operations
        setError(''); // Clear any errors
      } else {
        console.error('Authentication failed:', response.status, data);
        setError(data.error || `Authentication failed (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Error connecting to server. Please check your network connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!password) {
      setError('Password is required to delete teachings.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this teaching?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/teachings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          password,
        }),
      });

      if (response.ok) {
        setMessage('Teaching deleted successfully.');
        // Refresh teachings
        fetchTeachings();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete teaching.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // No Clerk sign-in requirement, only password authentication
  
  // If signed in but not authenticated with password, show authentication screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              <TranslatableText>Manage Church Teachings</TranslatableText>
            </h1>
          </div>

          {/* Admin Navigation */}
          <div className="mb-8 bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <div className="flex space-x-4">
              <a href="/admin/churchvideos/" className="text-blue-500 hover:text-blue-700">Manage Videos</a>
              <a href="/admin/users/" className="text-blue-500 hover:text-blue-700">Manage Users</a>
              <a href="/admin/verses/" className="text-blue-500 hover:text-blue-700">Manage Verses</a>
              <a href="/admin/gallery/" className="text-blue-500 hover:text-blue-700">Manage Gallery</a>
              <a href="/admin/email/" className="text-blue-500 hover:text-blue-700">Send Emails</a>
              <a href="/admin/teachings/" className="text-blue-500 hover:text-blue-700 font-bold">Manage Teachings</a>
            </div>
          </div>
          
          {error && (
            <div className="p-4 mb-4 rounded-md bg-red-100 text-red-800">
              {error}
            </div>
          )}
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              <TranslatableText>Authentication Required</TranslatableText>
            </h2>
            
            <form onSubmit={handleAuthentication}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="authPassword">
                  <TranslatableText>Admin Password</TranslatableText>
                </label>
                <input
                  id="authPassword"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                {loading ? 'Verifying...' : 'Authenticate'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <TranslatableText>Manage Church Teachings</TranslatableText>
          </h1>
        </div>

        {/* Admin Navigation */}
        <div className="mb-8 bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <div className="flex space-x-4">
            <a href="/admin/churchvideos/" className="text-blue-500 hover:text-blue-700">Manage Videos</a>
            <a href="/admin/users/" className="text-blue-500 hover:text-blue-700">Manage Users</a>
            <a href="/admin/verses/" className="text-blue-500 hover:text-blue-700">Manage Verses</a>
            <a href="/admin/gallery/" className="text-blue-500 hover:text-blue-700">Manage Gallery</a>
            <a href="/admin/email/" className="text-blue-500 hover:text-blue-700">Send Emails</a>
            <a href="/admin/teachings/" className="text-blue-500 hover:text-blue-700 font-bold">Manage Teachings</a>
          </div>
        </div>

        {message && (
          <div className={`p-4 mb-4 rounded-md ${success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            <TranslatableText>Add New Teaching</TranslatableText>
          </h2>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              <TranslatableText>Admin Password</TranslatableText> <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter admin password"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                <TranslatableText>Title</TranslatableText> <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter teaching title"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priestName">
                <TranslatableText>Priest Name</TranslatableText> <span className="text-red-500">*</span>
              </label>
              <input
                id="priestName"
                type="text"
                value={priestName}
                onChange={(e) => setPriestName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter priest's name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mediaType">
                <TranslatableText>Media Type</TranslatableText> <span className="text-red-500">*</span>
              </label>
              <select
                id="mediaType"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                {MEDIA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                <TranslatableText>Category</TranslatableText> <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-4">
              <input
                id="useUrl"
                type="radio"
                checked={!useFileUpload}
                onChange={() => setUseFileUpload(false)}
                className="mr-2"
              />
              <label htmlFor="useUrl" className="text-gray-700">
                <TranslatableText>Provide Media URL</TranslatableText>
              </label>
              
              <input
                id="useFile"
                type="radio"
                checked={useFileUpload}
                onChange={() => setUseFileUpload(true)}
                className="ml-8 mr-2"
              />
              <label htmlFor="useFile" className="text-gray-700">
                <TranslatableText>Upload Media File</TranslatableText>
              </label>
            </div>
            
            {!useFileUpload ? (
              <>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mediaUrl">
                  <TranslatableText>Media URL</TranslatableText> <span className="text-red-500">*</span>
                </label>
                <input
                  id="mediaUrl"
                  type="text"
                  value={mediaUrl || ""}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={mediaType === 'video' ? "Enter Vimeo URL (e.g., https://vimeo.com/123456789)" : "Enter audio file URL"}
                  required={!useFileUpload}
                />
                {mediaType === 'video' && (
                  <p className="text-sm text-gray-600 mt-1">
                    <TranslatableText>For videos, please use Vimeo URLs in the format: https://vimeo.com/123456789</TranslatableText>
                  </p>
                )}
              </>
            ) : (
              <>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fileUpload">
                  <TranslatableText>Upload File</TranslatableText> <span className="text-red-500">*</span>
                </label>
                <input
                  id="fileUpload"
                  type="file"
                  accept={mediaType === 'audio' ? ".mp3,.wav,.ogg,.m4a" : ".mp4,.webm,.mov"}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required={useFileUpload}
                />
                <p className="text-sm text-gray-600 mt-1">
                  {mediaType === 'audio' ? (
                    <TranslatableText>Allowed audio formats: MP3, WAV, OGG, M4A</TranslatableText>
                  ) : (
                    <TranslatableText>Allowed video formats: MP4, WebM, MOV</TranslatableText>
                  )}
                </p>
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                {uploadFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    <TranslatableText>Selected file:</TranslatableText> {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)
                  </p>
                )}
              </>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              <TranslatableText>Description</TranslatableText>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={4}
              placeholder="Enter teaching description (optional)"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : 'Add Teaching'}
            </button>
          </div>
        </form>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            <TranslatableText>Existing Teachings</TranslatableText>
          </h2>

          {loadingTeachings ? (
            <p>Loading teachings...</p>
          ) : teachings.length === 0 ? (
            <p>No teachings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <TranslatableText>Title</TranslatableText>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <TranslatableText>Priest</TranslatableText>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <TranslatableText>Type</TranslatableText>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <TranslatableText>Category</TranslatableText>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <TranslatableText>Date</TranslatableText>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <TranslatableText>Actions</TranslatableText>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachings.map((teaching) => (
                    <tr key={teaching.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{teaching.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{teaching.priestName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          teaching.mediaType === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {teaching.mediaType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teaching.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(teaching.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(teaching.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TranslatableText>Delete</TranslatableText>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
