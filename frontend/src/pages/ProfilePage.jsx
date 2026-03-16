import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Save, Trash2, BookOpen, GitBranch } from 'lucide-react';
import { authAPI, repoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card, Badge, EmptyState, LoadingPage, Alert } from '../components/UI';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, logout, login, token } = useAuth();
  const isOwnProfile = currentUser?._id === id;

  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.allSettled([
      authAPI.getUserProfile(id),
      repoAPI.getByUser(id),
    ]).then(([profileRes, reposRes]) => {
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
      if (reposRes.status === 'fulfilled') setRepos(reposRes.value.data?.repositories || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    const payload = {};
    if (editForm.email) payload.email = editForm.email;
    if (editForm.password) payload.password = editForm.password;
    try {
      const res = await authAPI.updateProfile(id, payload);
      setProfile(res.data);
      if (isOwnProfile) login({ ...currentUser, ...res.data }, token);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete your account? This cannot be undone.')) return;
    try {
      await authAPI.deleteProfile(id);
      logout();
      navigate('/signup');
    } catch {}
  };

  if (loading) return <LoadingPage />;

  if (!profile) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>User not found.</p>
    </div>
  );

  const initials = (profile.name || profile.username || 'U')
    .split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page" style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 24, fontSize: '0.875rem', padding: 0,
      }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Profile card */}
        <Card style={{ padding: 28 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
              background: 'linear-gradient(135deg, var(--accent-dim), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 700, color: 'white',
            }}>
              {initials}
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 4 }}>
              {profile.name || profile.username}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
              {profile.email}
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { label: 'Repositories', value: repos.length },
              { label: 'Following', value: profile.followedUsers?.length || 0 },
            ].map(stat => (
              <div key={stat.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0', borderTop: '1px solid var(--border)',
              }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {stat.label}
                </span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {isOwnProfile && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button size="sm" variant="secondary"
                onClick={() => setEditing(!editing)}
                style={{ width: '100%', justifyContent: 'center' }}>
                {editing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
              <Button size="sm" variant="danger"
                onClick={handleDelete}
                style={{ width: '100%', justifyContent: 'center' }}>
                <Trash2 size={12} /> Delete Account
              </Button>
            </div>
          )}
        </Card>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {editing && (
            <Card style={{ padding: 24, border: '1px solid var(--border-bright)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Edit Profile</h3>
              {error && <div style={{ marginBottom: 14 }}><Alert type="error">{error}</Alert></div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Input label="New Email" type="email" placeholder={profile.email}
                  icon={<Mail size={14} />}
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                <Input label="New Password" type="password"
                  placeholder="Leave blank to keep current"
                  value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })} />
                <Button onClick={handleSave} loading={saving} style={{ width: 'fit-content' }}>
                  <Save size={13} /> Save Changes
                </Button>
              </div>
            </Card>
          )}

          {success && !editing && <Alert type="success">{success}</Alert>}

          {/* Repositories */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem' }}>Repositories</h3>
            {repos.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<BookOpen size={20} />}
                  title="No repositories"
                  description="This user hasn't created any repositories yet."
                />
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {repos.map((repo, i) => (
                  <Card key={repo._id} hover
                    onClick={() => navigate(`/repos/${repo._id}`)}
                    style={{ padding: '14px 18px', animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <GitBranch size={15} color="var(--accent)" />
                        <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                          {repo.name}
                        </span>
                        <Badge color={repo.visibility ? 'green' : 'default'}>
                          {repo.visibility ? 'public' : 'private'}
                        </Badge>
                      </div>
                    </div>
                    {repo.description && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 4, marginLeft: 25 }}>
                        {repo.description}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}