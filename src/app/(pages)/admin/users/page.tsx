'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';
import { formatDistanceToNow } from 'date-fns';

type User = {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // Activity metrics
  postCount: number;
  voteCount: number;
  donationCount: number;
};

export default function UserAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [password, setPassword] = useState('');
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  
  // User details modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Only fetch users after authentication
  useEffect(() => {
    if (isAuthenticated && password) {
      fetchUsers();
    }
  }, [isAuthenticated, password]);

  useEffect(() => {
    // Apply filters to the users list
    let results = [...users];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(user => 
        (user.firstName?.toLowerCase().includes(term)) ||
        (user.lastName?.toLowerCase().includes(term)) ||
        user.emailAddress.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (filterType === 'completed') {
      results = results.filter(user => user.postCount > 0);
    } else if (filterType === 'incomplete') {
      results = results.filter(user => user.postCount === 0);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      const aValue = a[sortBy as keyof User];
      const bValue = b[sortBy as keyof User];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue as string) 
          : (bValue as string).localeCompare(aValue as string);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      // Handle date fields
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      return 0;
    });
    
    setFilteredUsers(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, searchTerm, filterType, sortBy, sortOrder]);

  const fetchUsers = async () => {
    // Don't attempt to fetch if not authenticated
    if (!isAuthenticated || !password) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching users with auth:', password);
      
      // Test with mock data first to ensure our UI works
      const mockUsers = [
        {
          id: 'test-user-1',
          firstName: 'Test',
          lastName: 'User',
          emailAddress: 'test@example.com',
          imageUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          postCount: 0,
          voteCount: 0,
          donationCount: 0
        }
      ];
      
      // Use the mock data directly to test UI (bypassing API)
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setError('Using mock data - API still has issues');
      setLoading(false);
      
      // Still attempt the API call in the background for debugging
      console.log('Attempting API call...');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      
      // Log the raw response for debugging
      console.log('API Response status:', response.status);
      const responseText = await response.text();
      console.log('API Response text (first 100 chars):', responseText.substring(0, 100));
      
      try {
        // Try to parse as JSON if possible
        const data = JSON.parse(responseText);
        console.log('Parsed API data:', data);
        // If we got here, API works! Update the UI
        setUsers(data);
        setFilteredUsers(data);
        setError(''); // Clear any previous errors
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        // Keep using the mock data, just update the error message
        setError('API returned invalid JSON - Using mock data instead');
      }
    } catch (err) {
      console.error('API call error:', err);
      setError('Error connecting to server. Using mock data instead.');
    }
  };

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use the exact same pattern as in your churchvideos admin
    if (authPassword === 'Youth100%') {
      // Hardcoded password for simplicity and consistency with churchvideos admin
      console.log('Authentication successful');
      setIsAuthenticated(true);
      setPassword(authPassword);
      setError('');
      fetchUsers(); // Load users immediately after authentication
    } else {
      console.log('Authentication failed - incorrect password');
      setError('Incorrect password');
      setIsAuthenticated(false);
      setPassword('');
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    if (!password) {
      setError('Password is required to perform this action');
      return;
    }
    
    if (action === 'delete' && !confirm('Are you sure you want to delete this user? This will remove all their data including posts, prayers, and other contributions.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ 
          userId, 
          action 
        }),
      });
      
      if (response.ok) {
        setMessage(`User ${action === 'delete' ? 'deleted' : 'updated'} successfully!`);
        fetchUsers();
        
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
          setShowUserModal(false);
        }
      } else {
        const data = await response.json();
        setError(data.error || `Failed to ${action} user`);
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const getPagedUsers = () => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  // Authentication form
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>User Management Admin</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleAuthentication} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="authPassword">Enter Admin Password:</label>
            <input
              type="password"
              id="authPassword"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  // Main admin interface
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Management Admin</h1>
      
      <div className={styles.adminNav}>
        <a href="/admin/churchvideos">Videos Admin</a>
        <a href="/admin/users" className={styles.active}>User Management</a>
        <a href="/admin/verses">Verses Admin</a>
        <a href="/admin/gallery">Gallery Admin</a>
        <a href="/admin/email">Email Admin</a>
      </div>
      
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.adminControls}>
        <div className={styles.searchAndFilter}>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Users</option>
            <option value="completed">Active Users</option>
            <option value="incomplete">Inactive Users</option>
          </select>
          
          <div className={styles.sortControls}>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="createdAt">Join Date</option>
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
              <option value="emailAddress">Email</option>
              <option value="postCount">Activity</option>
            </select>
            
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={styles.sortOrderButton}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        <div className={styles.refreshControls}>
          <button 
            onClick={fetchUsers} 
            disabled={loading}
            className={styles.refreshButton}
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className={styles.usersList}>
        {loading ? (
          <p>Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No users found matching your filters.</p>
        ) : (
          <>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getPagedUsers().map((user) => (
                  <tr key={user.id} className={styles.userRow}>
                    <td className={styles.userName}>
                      {user.imageUrl && (
                        <img 
                          src={user.imageUrl} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className={styles.userAvatar}
                        />
                      )}
                      <span>{`${user.firstName} ${user.lastName}`}</span>
                    </td>
                    <td>{user.emailAddress}</td>
                    <td title={new Date(user.createdAt).toLocaleString()}>
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </td>
                    <td>
                      <span className={styles.activity}>{user.postCount}</span>
                    </td>
                    <td className={styles.userActions}>
                      <button 
                        onClick={() => viewUserDetails(user)}
                        className={styles.viewButton}
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleUserAction('delete', user.id)}
                        className={styles.deleteButton}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
              <div className={styles.pagination}>
                {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={currentPage === i + 1 ? styles.activePage : ''}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.closeModal} onClick={closeUserModal}>&times;</span>
            
            <div className={styles.userProfile}>
              {selectedUser.imageUrl && (
                <img 
                  src={selectedUser.imageUrl} 
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  className={styles.userProfileImage}
                />
              )}
              
              <h2>{`${selectedUser.firstName} ${selectedUser.lastName}`}</h2>
              
              <div className={styles.userDetails}>
                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span className={styles.detailValue}>{selectedUser.emailAddress}</span>
                </div>
                
                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Joined:</span>
                  <span className={styles.detailValue}>
                    {new Date(selectedUser.createdAt).toLocaleDateString()} 
                    ({formatDistanceToNow(new Date(selectedUser.createdAt), { addSuffix: true })})
                  </span>
                </div>
                
                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Updated:</span>
                  <span className={styles.detailValue}>
                    {new Date(selectedUser.updatedAt).toLocaleDateString()} 
                    ({formatDistanceToNow(new Date(selectedUser.updatedAt), { addSuffix: true })})
                  </span>
                </div>
              </div>
              
              <div className={styles.userStats}>
                <h3>Activity Statistics</h3>
                <div className={styles.statGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{selectedUser.postCount}</span>
                    <span className={styles.statLabel}>Forum Posts</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{selectedUser.voteCount}</span>
                    <span className={styles.statLabel}>Votes</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{selectedUser.donationCount}</span>
                    <span className={styles.statLabel}>Donations</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.userActions}>
                <button 
                  onClick={() => handleUserAction('delete', selectedUser.id)}
                  className={styles.deleteButton}
                  disabled={loading}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
