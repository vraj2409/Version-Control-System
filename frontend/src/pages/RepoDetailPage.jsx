import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitBranch, ArrowLeft, Eye, EyeOff, Pencil, Plus,
  AlertCircle, CheckCircle, Trash2, Save, X, Clock
} from 'lucide-react';
import { repoAPI, issueAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Badge, Card, EmptyState, LoadingPage, Modal, Input, Textarea, Alert } from '../components/UI';

export default function RepoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [repo, setRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({ title: '', description: '' });
  const [issueError, setIssueError] = useState('');
  const [creatingIssue, setCreatingIssue] = useState(false);

  const [editingIssue, setEditingIssue] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [repoRes, issuesRes] = await Promise.allSettled([
        repoAPI.getById(id),
        issueAPI.getAll(id),
      ]);
      if (repoRes.status === 'fulfilled') {
        const r = Array.isArray(repoRes.value.data)
          ? repoRes.value.data[0]
          : repoRes.value.data;
        setRepo(r);
        setDescValue(r?.description || '');
      }
      if (issuesRes.status === 'fulfilled') {
        setIssues(issuesRes.value.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const res = await repoAPI.toggleVisibility(id);
      setRepo(res.data.repository);
    } catch {}
  };

  const handleSaveDesc = async () => {
    try {
      await repoAPI.update(id, { description: descValue, content: '' });
      setRepo({ ...repo, description: descValue });
      setEditingDesc(false);
    } catch {}
  };

  const handleCreateIssue = async () => {
    if (!issueForm.title.trim()) { setIssueError('Title is required.'); return; }
    setCreatingIssue(true); setIssueError('');
    try {
      const res = await issueAPI.create(id, issueForm);
      setIssues([res.data, ...issues]);
      setShowCreateIssue(false);
      setIssueForm({ title: '', description: '' });
    } catch (err) {
      setIssueError(err.response?.data || 'Failed to create issue.');
    } finally { setCreatingIssue(false); }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!confirm('Delete this issue?')) return;
    try {
      await issueAPI.delete(issueId);
      setIssues(issues.filter(i => i._id !== issueId));
    } catch {}
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await issueAPI.update(editingIssue._id, editForm);
      setIssues(issues.map(i => i._id === editingIssue._id ? res.data : i));
      setEditingIssue(null);
    } catch {} finally { setSavingEdit(false); }
  };

  const isOwner =
    repo?.owner?._id?.toString() === user?._id ||
    repo?.owner?.toString() === user?._id;

  if (loading) return <LoadingPage />;

  if (!repo) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Repository not found.</p>
      <Button variant="ghost" onClick={() => navigate('/dashboard')} style={{ marginTop: 16 }}>
        <ArrowLeft size={14} /> Back
      </Button>
    </div>
  );

  const openIssues = issues.filter(i => i.status === 'open');
  const closedIssues = issues.filter(i => i.status === 'closed');

  return (
    <div className="page" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate('/dashboard')} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 20, fontSize: '0.875rem', padding: 0,
      }}>
        <ArrowLeft size={14} /> Dashboard
      </button>

      {/* Repo Header */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent-dim), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <GitBranch size={20} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.375rem', fontWeight: 800,
                letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)',
              }}>
                {repo.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Badge color={repo.visibility ? 'green' : 'default'}>
                  {repo.visibility ? 'public' : 'private'}
                </Badge>
                {repo.updatedAt && (
                  <span style={{
                    color: 'var(--text-muted)', fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Clock size={11} /> Updated {new Date(repo.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={handleToggleVisibility}>
              {repo.visibility
                ? <><EyeOff size={13} /> Make private</>
                : <><Eye size={13} /> Make public</>
              }
            </Button>
          )}
        </div>

        {/* Description */}
        <div style={{ marginTop: 16 }}>
          {editingDesc ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <Textarea value={descValue} onChange={e => setDescValue(e.target.value)} style={{ minHeight: 60 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Button size="sm" onClick={handleSaveDesc}><Save size={13} /></Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingDesc(false)}><X size={13} /></Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{
                color: repo.description ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontSize: '0.9375rem', fontStyle: repo.description ? 'normal' : 'italic',
              }}>
                {repo.description || 'No description provided.'}
              </p>
              {isOwner && (
                <button onClick={() => setEditingDesc(true)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 2,
                }}>
                  <Pencil size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {['overview', 'issues'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600,
            color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1, fontFamily: 'var(--font-sans)',
          }}>
            {t === 'overview' ? 'Overview' : `Issues (${issues.length})`}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Issues', value: issues.length, color: 'var(--accent)' },
            { label: 'Open Issues', value: openIssues.length, color: 'var(--green)' },
            { label: 'Closed Issues', value: closedIssues.length, color: 'var(--text-muted)' },
            { label: 'Files Tracked', value: repo.content?.length || 0, color: 'var(--purple)' },
          ].map(s => (
            <Card key={s.label} style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Issues Tab */}
      {tab === 'issues' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={14} /> {openIssues.length} open
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={14} /> {closedIssues.length} closed
              </span>
            </div>
            <Button size="sm" onClick={() => setShowCreateIssue(true)}>
              <Plus size={13} /> New Issue
            </Button>
          </div>

          {issues.length === 0 ? (
            <Card>
              <EmptyState
                icon={<AlertCircle size={24} />}
                title="No issues yet"
                description="Create an issue to track bugs or feature requests."
                action={<Button size="sm" onClick={() => setShowCreateIssue(true)}><Plus size={13} /> New Issue</Button>}
              />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {issues.map((issue, i) => (
                <Card key={issue._id} style={{ animation: `fadeIn 0.3s ease ${i * 0.04}s both`, padding: '14px 18px' }}>
                  {editingIssue?._id === issue._id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                      <Textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ minHeight: 70 }} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                          style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', padding: '5px 10px', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
                          <option value="open">open</option>
                          <option value="closed">closed</option>
                        </select>
                        <Button size="sm" onClick={handleSaveEdit} loading={savingEdit}><Save size={12} /> Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingIssue(null)}><X size={12} /></Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ marginTop: 2 }}>
                          {issue.status === 'open'
                            ? <AlertCircle size={16} color="var(--green)" />
                            : <CheckCircle size={16} color="var(--text-muted)" />}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 2 }}>{issue.title}</p>
                          {issue.description && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{issue.description}</p>
                          )}
                          <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Badge color={issue.status === 'open' ? 'green' : 'default'}>{issue.status}</Badge>
                            {issue.createdAt && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => { setEditingIssue(issue); setEditForm({ title: issue.title, description: issue.description, status: issue.status }); }}
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleDeleteIssue(issue._id)}
                          style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--red)' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Issue Modal */}
      <Modal open={showCreateIssue} onClose={() => setShowCreateIssue(false)} title="Create New Issue">
        {issueError && <div style={{ marginBottom: 14 }}><Alert type="error">{issueError}</Alert></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Title" placeholder="Short, descriptive title"
            value={issueForm.title} onChange={e => setIssueForm({ ...issueForm, title: e.target.value })} />
          <Textarea label="Description" placeholder="What is this issue about?"
            value={issueForm.description} onChange={e => setIssueForm({ ...issueForm, description: e.target.value })} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowCreateIssue(false)}>Cancel</Button>
            <Button onClick={handleCreateIssue} loading={creatingIssue}>Create Issue</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}