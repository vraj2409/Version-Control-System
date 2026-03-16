import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Eye, EyeOff, Trash2, GitBranch, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { repoAPI } from '../services/api';
import { Button, Card, Badge, EmptyState, LoadingPage, Modal, Input, Textarea, Alert } from '../components/UI';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', visibility: true });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => { fetchRepos(); }, []);

  const fetchRepos = async () => {
    try {
      const res = await repoAPI.getByUser(user._id);
      setRepos(res.data.repositories || []);
    } catch {
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) { setCreateError('Repository name is required.'); return; }
    setCreating(true); setCreateError('');
    try {
      await repoAPI.create({ ...createForm, owner: user._id });
      setShowCreate(false);
      setCreateForm({ name: '', description: '', visibility: true });
      fetchRepos();
    } catch (err) {
      setCreateError(err.response?.data || 'Failed to create repository.');
    } finally { setCreating(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this repository?')) return;
    try {
      await repoAPI.delete(id);
      setRepos(repos.filter(r => r._id !== id));
    } catch {}
  };

  const handleToggle = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await repoAPI.toggleVisibility(id);
      setRepos(repos.map(r => r._id === id ? res.data.repository : r));
    } catch {}
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="page" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome back,{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.name}</span>
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Repository
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Repositories', value: repos.length, color: 'var(--accent)' },
          { label: 'Public', value: repos.filter(r => r.visibility).length, color: 'var(--green)' },
          { label: 'Private', value: repos.filter(r => !r.visibility).length, color: 'var(--purple)' },
        ].map(stat => (
          <Card key={stat.label} style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
              {stat.value}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Repos list */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Your Repositories</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
          {repos.length} total
        </span>
      </div>

      {repos.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen size={24} />}
            title="No repositories yet"
            description="Create your first repository to start tracking your code."
            action={<Button onClick={() => setShowCreate(true)}><Plus size={14} /> Create Repository</Button>}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {repos.map((repo, i) => (
            <Card key={repo._id} hover onClick={() => navigate(`/repos/${repo._id}`)}
              style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s both`, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <GitBranch size={16} color="var(--accent)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'var(--font-mono)' }}>
                        {repo.name}
                      </h3>
                      <Badge color={repo.visibility ? 'green' : 'default'}>
                        {repo.visibility ? 'public' : 'private'}
                      </Badge>
                    </div>
                    {repo.description && (
                      <p style={{
                        color: 'var(--text-secondary)', fontSize: '0.8125rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{repo.description}</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {repo.updatedAt && (
                    <span style={{
                      color: 'var(--text-muted)', fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)', marginRight: 8,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Clock size={11} />
                      {new Date(repo.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                  <button onClick={(e) => handleToggle(e, repo._id)}
                    style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
                      color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
                    }}>
                    {repo.visibility ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button onClick={(e) => handleDelete(e, repo._id)}
                    style={{
                      background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
                      color: 'var(--red)', display: 'flex', alignItems: 'center',
                    }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Repository">
        {createError && <div style={{ marginBottom: 16 }}><Alert type="error">{createError}</Alert></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Repository Name" placeholder="my-awesome-project"
            value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
          <Textarea label="Description (optional)" placeholder="What is this repository for?"
            value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={createForm.visibility}
              onChange={e => setCreateForm({ ...createForm, visibility: e.target.checked })}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Make this repository <strong style={{ color: 'var(--text-primary)' }}>public</strong>
            </span>
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Create Repository</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}