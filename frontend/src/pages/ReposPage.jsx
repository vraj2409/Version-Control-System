import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, GitBranch, Clock, ChevronDown } from 'lucide-react';
import { repoAPI } from '../services/api';
import { Card, Badge, EmptyState, LoadingPage, Input, Button } from '../components/UI';

const PAGE_SIZE = 10;

export default function ReposPage() {
  const [repos, setRepos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const navigate = useNavigate();

  useEffect(() => {
    repoAPI.getAll()
      .then(res => {
        setRepos(res.data);
        setFiltered(res.data);
        setDisplayed(res.data.slice(0, PAGE_SIZE));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(repos);
      setDisplayed(repos.slice(0, PAGE_SIZE));
      setShowCount(PAGE_SIZE);
    } else {
      const q = search.toLowerCase();
      const results = repos.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
      setFiltered(results);
      setDisplayed(results.slice(0, PAGE_SIZE));
      setShowCount(PAGE_SIZE);
    }
  }, [search, repos]);

  const handleLoadMore = () => {
    const newCount = showCount + PAGE_SIZE;
    setShowCount(newCount);
    setDisplayed(filtered.slice(0, newCount));
  };

  const hasMore = displayed.length < filtered.length;

  if (loading) return <LoadingPage />;

  return (
    <div className="page" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
          All Repositories
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse all public repositories
        </p>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 20 }}>
        <Input
          placeholder="Search repositories by name or description..."
          icon={<Search size={15} />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
          {search
            ? `${filtered.length} results for "${search}"`
            : `Showing ${displayed.length} of ${repos.length} repositories`
          }
        </span>
        {search && filtered.length > 0 && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontSize: '0.8125rem',
            }}
          >
            Clear search
          </button>
        )}
      </div>

      {/* Repos list */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen size={24} />}
            title={search ? 'No repositories match your search' : 'No repositories found'}
            description={search ? 'Try a different search term.' : 'Be the first to create a repository.'}
            action={search ? (
              <Button variant="ghost" onClick={() => setSearch('')}>Clear search</Button>
            ) : null}
          />
        </Card>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayed.map((repo, i) => (
              <Card
                key={repo._id}
                hover
                onClick={() => navigate(`/repos/${repo._id}`)}
                style={{
                  padding: '18px 20px',
                  animation: `fadeIn 0.3s ease ${Math.min(i, 9) * 0.04}s both`,
                }}
              >
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
                        <h3 style={{
                          fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.9375rem',
                        }}>
                          {/* Highlight search match */}
                          {search ? highlightMatch(repo.name, search) : repo.name}
                        </h3>
                        <Badge color={repo.visibility ? 'green' : 'default'}>
                          {repo.visibility ? 'public' : 'private'}
                        </Badge>
                      </div>
                      {repo.description && (
                        <p style={{
                          color: 'var(--text-secondary)', fontSize: '0.8125rem',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {search ? highlightMatch(repo.description, search) : repo.description}
                        </p>
                      )}
                      {repo.owner?.name && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                          by {repo.owner.name}
                        </p>
                      )}
                    </div>
                  </div>
                  {repo.updatedAt && (
                    <span style={{
                      color: 'var(--text-muted)', fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Clock size={11} /> {new Date(repo.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Button
                variant="ghost"
                onClick={handleLoadMore}
                style={{ gap: 6 }}
              >
                <ChevronDown size={15} />
                Load more ({filtered.length - displayed.length} remaining)
              </Button>
            </div>
          )}

          {/* End message */}
          {!hasMore && repos.length > PAGE_SIZE && !search && (
            <p style={{
              textAlign: 'center', marginTop: 20,
              color: 'var(--text-muted)', fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
            }}>
              All {repos.length} repositories loaded
            </p>
          )}
        </>
      )}
    </div>
  );
}

// Helper — highlight matching text in search
function highlightMatch(text, query) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} style={{
        background: 'rgba(59,130,246,0.25)',
        color: 'var(--accent)',
        borderRadius: 3,
        padding: '0 2px',
      }}>
        {part}
      </mark>
    ) : part
  );
}