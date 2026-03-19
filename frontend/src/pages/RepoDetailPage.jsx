import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitBranch, ArrowLeft, Eye, EyeOff, Pencil, Plus,
  AlertCircle, CheckCircle, Trash2, Save, X, Clock,
  Upload, File, GitCommit, Copy, Check, Lock,
} from 'lucide-react';
import { repoAPI, issueAPI, commitAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Button, Badge, Card, EmptyState, LoadingPage,
  Modal, Input, Textarea, Alert,
} from '../components/UI';

export default function RepoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [repo, setRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [commits, setCommits] = useState([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [commitsError, setCommitsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  // Issue states
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({ title: '', description: '' });
  const [issueError, setIssueError] = useState('');
  const [creatingIssue, setCreatingIssue] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Repo states
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');

  // Upload states
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Copy state
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { fetchAll(); }, [id]);

  // Fetch commits when tab switches to commits
  useEffect(() => {
    if (tab === 'commits' && repo) {
      fetchCommits();
    }
  }, [tab, repo]);

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

  const fetchCommits = async () => {
    setCommitsLoading(true);
    setCommitsError('');
    try {
      const res = await commitAPI.getAll(id);
      setCommits(res.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setCommitsError('access_denied');
      } else {
        setCommitsError('failed');
      }
    } finally {
      setCommitsLoading(false);
    }
  };

  const isOwner = (() => {
    if (!repo || !user) return false;
    const ownerId = repo.owner?.toString() || '';
    const userId = user._id?.toString() || '';
    return ownerId === userId;
  })();

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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setUploadFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setUploadFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const closeUploadModal = () => {
    setShowUpload(false);
    setUploadFiles([]);
    setUploadMessage('');
    setUploadError('');
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) { setUploadError('Please select at least one file.'); return; }
    if (!uploadMessage.trim()) { setUploadError('Please enter a commit message.'); return; }
    setUploading(true); setUploadError('');
    try {
      const formData = new FormData();
      uploadFiles.forEach(file => formData.append('files', file));
      formData.append('message', uploadMessage);
      formData.append('repoId', id);

      const res = await commitAPI.upload(formData);
      await fetchAll();

      // Refresh commits if on commits tab
      if (tab === 'commits') await fetchCommits();

      closeUploadModal();
      const fileCount = res.data.files.length;
      const s3Pushed = res.data.s3?.pushed || 0;
      setUploadSuccess(
        `${fileCount} file${fileCount !== 1 ? 's' : ''} committed and ${s3Pushed} pushed to S3!`
      );
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  const handleCopyId = (commitId) => {
    navigator.clipboard.writeText(commitId);
    setCopiedId(commitId);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

      {/* Back */}
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
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)' }}>
                {repo.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Badge color={repo.visibility ? 'green' : 'default'}>
                  {repo.visibility ? 'public' : 'private'}
                </Badge>
                {repo.updatedAt && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> Updated {new Date(repo.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buttons — only owner */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" size="sm" onClick={() => setShowUpload(true)}>
              <Upload size={13} /> Upload Files
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToggleVisibility}>
              {repo.visibility
                ? <><EyeOff size={13} /> Make private</>
                : <><Eye size={13} /> Make public</>
              }
            </Button>
          </div>
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
              <button onClick={() => setEditingDesc(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 2,
              }}>
                <Pencil size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload success */}
      {uploadSuccess && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="success">{uploadSuccess}</Alert>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'commits', label: 'Commits' },
          { key: 'issues', label: `Issues (${issues.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600,
            color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1, fontFamily: 'var(--font-sans)',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────── */}
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

      {/* ── Commits Tab ──────────────────────────────── */}
      {tab === 'commits' && (
        <div>
          {/* Access denied */}
          {commitsError === 'access_denied' && (
            <Card style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, margin: '0 auto 16px',
                background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Lock size={24} color="var(--red)" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
                Access Denied
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Commit history is private and only visible to the repository owner.
              </p>
            </Card>
          )}

          {/* Loading */}
          {commitsLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" style={{ width: 28, height: 28 }} />
            </div>
          )}

          {/* Error */}
          {commitsError === 'failed' && (
            <Alert type="error">Failed to load commits. Please try again.</Alert>
          )}

          {/* Commits list */}
          {!commitsLoading && !commitsError && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
                  {commits.length} commit{commits.length !== 1 ? 's' : ''} total
                </span>
                <Button size="sm" onClick={() => setShowUpload(true)}>
                  <Upload size={13} /> Upload Files
                </Button>
              </div>

              {commits.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={<GitCommit size={24} />}
                    title="No commits yet"
                    description="Upload files to create your first commit."
                    action={
                      <Button size="sm" onClick={() => setShowUpload(true)}>
                        <Upload size={13} /> Upload Files
                      </Button>
                    }
                  />
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {commits.map((commit, i) => (
                    <div key={commit.id} style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderBottom: i === commits.length - 1 ? '1px solid var(--border)' : 'none',
                      borderRadius: i === 0 && commits.length === 1
                        ? 12
                        : i === 0
                          ? '12px 12px 0 0'
                          : i === commits.length - 1
                            ? '0 0 12px 12px'
                            : '0',
                      padding: '16px 20px',
                      animation: `fadeIn 0.3s ease ${Math.min(i, 9) * 0.04}s both`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
                          {/* Commit icon */}
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: 'var(--bg-elevated)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <GitCommit size={15} color="var(--accent)" />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            {/* Commit message */}
                            <p style={{ fontWeight: 600, marginBottom: 6, fontSize: '0.9375rem' }}>
                              {commit.message}
                            </p>

                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                              {/* Commit ID — click to copy */}
                              <button
                                onClick={() => handleCopyId(commit.id)}
                                style={{
                                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                  borderRadius: 6, padding: '2px 8px', cursor: 'pointer',
                                  color: 'var(--text-muted)', fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                  transition: 'all 0.15s',
                                }}
                              >
                                {copiedId === commit.id
                                  ? <><Check size={10} color="var(--green)" /> Copied!</>
                                  : <><Copy size={10} /> {commit.id.slice(0, 8)}...</>
                                }
                              </button>

                              {/* Date */}
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Clock size={11} />
                                {new Date(commit.date).toLocaleString()}
                              </span>

                              {/* Files count */}
                              {commit.files?.length > 0 && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <File size={11} />
                                  {commit.files.length} file{commit.files.length !== 1 ? 's' : ''}
                                </span>
                              )}

                              {/* Source badge */}
                              <Badge color={commit.source === 's3' ? 'blue' : 'default'}>
                                {commit.source === 's3' ? '☁ S3' : '💻 local'}
                              </Badge>
                            </div>

                            {/* Files list */}
                            {commit.files?.length > 0 && (
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                                {commit.files.map(f => (
                                  <span key={f} style={{
                                    background: 'var(--accent-glow)', color: 'var(--accent)',
                                    border: '1px solid rgba(59,130,246,0.2)',
                                    borderRadius: 4, padding: '1px 7px',
                                    fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                                  }}>
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Issues Tab ───────────────────────────────── */}
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
                        <button
                          onClick={() => { setEditingIssue(issue); setEditForm({ title: issue.title, description: issue.description, status: issue.status }); }}
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

      {/* Upload Files Modal */}
      <Modal open={showUpload} onClose={closeUploadModal} title="Upload Files">
        {uploadError && <div style={{ marginBottom: 14 }}><Alert type="error">{uploadError}</Alert></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', padding: '36px 20px',
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'var(--accent-glow)' : 'var(--bg-base)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 48, height: 48, margin: '0 auto 12px',
              background: dragOver ? 'var(--accent-glow)' : 'var(--bg-elevated)',
              border: `1px solid ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Upload size={22} color={dragOver ? 'var(--accent)' : 'var(--text-muted)'} />
            </div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>
              {dragOver ? 'Drop your files here' : 'Drag & drop files here'}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              or <span style={{ color: 'var(--accent)', fontWeight: 600 }}>click to browse</span>
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 6 }}>
              Max 10MB per file — up to 20 files
            </p>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
          </div>

          {uploadFiles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''} selected
                </p>
                <button onClick={() => setUploadFiles([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Clear all
                </button>
              </div>
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {uploadFiles.map((file, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <File size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', flexShrink: 0 }}>
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Commit Message"
            placeholder="Describe what you changed or added..."
            value={uploadMessage}
            onChange={e => setUploadMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUpload()}
          />

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={closeUploadModal}>Cancel</Button>
            <Button onClick={handleUpload} loading={uploading} disabled={uploadFiles.length === 0 || !uploadMessage.trim()}>
              <Upload size={13} />
              {uploading ? 'Committing...' : `Commit ${uploadFiles.length > 0 ? uploadFiles.length + ' ' : ''}File${uploadFiles.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}