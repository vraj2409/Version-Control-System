import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Upload, GitCommit, RotateCcw, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '50px 50px', opacity: 0.25,
      }} />

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--accent-glow)', border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: 20, padding: '5px 14px', marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            Version Control System
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
          Track, commit, and<br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            collaborate on code
          </span>
        </h1>

        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          VersaCore is a lightweight version control platform. Initialize repos, stage files, commit changes, and manage issues — all in one place.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/dashboard" style={{
              padding: '12px 28px', background: 'var(--accent)', color: 'white',
              borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <GitBranch size={16} /> Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/signup" style={{ padding: '12px 28px', background: 'var(--accent)', color: 'white', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>
                Get started free
              </Link>
              <Link to="/login" style={{ padding: '12px 28px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { icon: <GitBranch size={20} />, title: 'Initialize Repos', desc: 'Create and manage repositories for your projects with a clean, simple interface.', color: 'var(--accent)' },
            { icon: <Upload size={20} />, title: 'Stage & Push', desc: 'Add files to staging, commit changes with messages, and push to S3 storage.', color: 'var(--green)' },
            { icon: <GitCommit size={20} />, title: 'Commit History', desc: 'Every commit is tracked with a UUID, timestamp, and your custom message.', color: 'var(--purple)' },
            { icon: <RotateCcw size={20} />, title: 'Revert Changes', desc: 'Roll back to any previous commit instantly with the revert command.', color: 'var(--yellow)' },
            { icon: <Shield size={20} />, title: 'Issue Tracking', desc: 'Create, update, and close issues directly linked to your repositories.', color: 'var(--red)' },
            { icon: <Zap size={20} />, title: 'JWT Auth', desc: 'Secure authentication with bcrypt-hashed passwords and JSON Web Tokens.', color: 'var(--accent)' },
          ].map((f, i) => (
            <div key={f.title} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 24,
              animation: `fadeIn 0.4s ease ${i * 0.07}s both`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 14,
                background: `${f.color}15`, border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color,
              }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}