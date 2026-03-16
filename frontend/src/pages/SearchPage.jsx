import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Users, GitBranch, UserPlus, UserMinus } from 'lucide-react';
import { authAPI, repoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, EmptyState, LoadingPage, Input, Button } from '../components/UI';

export default function SearchPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [followingMap, setFollowingMap] = useState({});

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await authAPI.searchUsers(query);
      const results = res.data.filter(u => u._id.toString() !== currentUser._id);
      setUsers(results);

      // Build following map
      const map = {};
      results.forEach(u => {
        map[u._id] = currentUser.followedUsers?.some(
          fid => fid.toString() === u._id.toString()
        ) || false;
      });
      setFollowingMap(map);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const res = await authAPI.followUser(userId, currentUser._id);
      const isNowFollowing = res.data.following;

      // Update following map
      setFollowingMap(prev => ({ ...prev, [userId]: isNowFollowing }));

      // Update followers count in users list instantly
      setUsers(prev => prev.map(u => {
        if (u._id === userId) {
          const currentFollowers = u.followers || [];
          return {
            ...u,
            followers: isNowFollowing
              ? [...currentFollowers, currentUser._id]
              : currentFollowers.filter(fid => fid.toString() !== currentUser._id.toString()),
          };
        }
        return u;
      }));

      // Update localStorage
      const savedUser = JSON.parse(localStorage.getItem('vcs_user') || '{}');
      if (isNowFollowing) {
        savedUser.followedUsers = [...(savedUser.followedUsers || []), userId];
      } else {
        savedUser.followedUsers = (savedUser.followedUsers || []).filter(
          fid => fid.toString() !== userId.toString()
        );
      }
      localStorage.setItem('vcs_user', JSON.stringify(savedUser));

    } catch (err) {
      console.error('Follow error:', err.response?.data || err.message);
    }
  };


  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
          Search Users
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Find users and explore their public repositories
        </p>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Search by name, username or email..."
            icon={<Search size={15} />}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} loading={loading}>
          <Search size={14} /> Search
        </Button>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingPage />
      ) : searched && users.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={24} />}
            title="No users found"
            description={`No users match "${query}". Try a different search term.`}
          />
        </Card>
      ) : users.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
            {users.length} user{users.length !== 1 ? 's' : ''} found
          </p>
          {users.map((u, i) => (
            <UserCard
              key={u._id}
              user={u}
              isFollowing={followingMap[u._id]}
              onFollow={() => handleFollow(u._id)}
              onViewProfile={() => navigate(`/profile/${u._id}`)}
              index={i}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Search size={24} />}
            title="Search for users"
            description="Type a name or email above to find users."
          />
        </Card>
      )}
    </div>
  );
}

function UserCard({ user, isFollowing, onFollow, onViewProfile, index }) {
  const initials = (user.name || user.username || 'U')
    .split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card style={{ padding: '18px 20px', animation: `fadeIn 0.3s ease ${index * 0.05}s both` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent-dim), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, color: 'white',
          }}>
            {initials}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 2 }}>
              {user.name || user.username}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
              {user.email}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                <GitBranch size={11} /> {user.repositories?.length || 0} repos
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Users size={11} /> {user.followedUsers?.length || 0} following
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <span style={{
            color: 'var(--text-muted)', fontSize: '0.75rem',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <GitBranch size={11} /> {user.repositories?.length || 0} repos
          </span>
          <span style={{
            color: 'var(--text-muted)', fontSize: '0.75rem',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Users size={11} /> {user.followers?.length || 0} followers
          </span>
          <span style={{
            color: 'var(--text-muted)', fontSize: '0.75rem',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <UserPlus size={11} /> {user.followedUsers?.length || 0} following
          </span>
        </div>
      </div>
    </Card>
  );
}