import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GitBranch, LogOut, Home, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', height: 56, gap: 8,
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', marginRight: 16, flexShrink: 0,
        }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GitBranch size={16} color="white" />
          </div>
          <span style={{
            fontWeight: 700, fontSize: '1.1rem',
            color: 'var(--text-primary)', letterSpacing: '-0.02em',
          }}>
            MyVCS
          </span>
        </Link>

        {/* Nav links */}
        {user && (
          <div style={{ display: 'flex', gap: 4, flex: 1 }}>
            <NavLink to="/dashboard" active={isActive('/dashboard')}>
              <Home size={14} /> Dashboard
            </NavLink>
            <NavLink to="/repos" active={isActive('/repos')}>
              <BookOpen size={14} /> Repositories
            </NavLink>
          </div>
        )}

        <div style={{ flex: user ? 0 : 1 }} />

        {/* Right side */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: '0.8125rem', color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}>
              {user.name || user.username}
            </span>
            <Link to={`/profile/${user._id}`} style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--accent-dim), var(--purple))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: 'white',
              fontSize: '0.875rem', fontWeight: 600, flexShrink: 0,
            }}>
              {(user.name || user.username || 'U')[0].toUpperCase()}
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6, padding: '5px 10px',
                cursor: 'pointer', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.8125rem', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--red)';
                e.currentTarget.style.color = 'var(--red)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" style={{
              padding: '6px 16px', borderRadius: 6, textDecoration: 'none',
              border: '1px solid var(--border)', color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}>
              Sign in
            </Link>
            <Link to="/signup" style={{
              padding: '6px 16px', borderRadius: 6, textDecoration: 'none',
              background: 'var(--accent)', color: 'white',
              fontSize: '0.875rem', fontWeight: 600,
            }}>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
      fontSize: '0.875rem', fontWeight: 500,
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      background: active ? 'var(--bg-elevated)' : 'transparent',
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }
    }}
    >
      {children}
    </Link>
  );
}