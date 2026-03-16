import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GitBranch, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button, Input, Alert } from '../components/UI';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-base)', padding: 20,
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: 0.3,
      }} />
      <div className="page" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GitBranch size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to your MyVCS account</p>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 28,
        }}>
          {error && <div style={{ marginBottom: 20 }}><Alert type="error">{error}</Alert></div>}
          {location.state?.from && (
            <div style={{ marginBottom: 20 }}>
              <Alert type="info">Please login to continue.</Alert>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input
              label="Email" type="email" placeholder="you@example.com"
              icon={<Mail size={15} />}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <Input
              label="Password" type="password" placeholder="••••••••"
              icon={<Lock size={15} />}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <Button
              onClick={handleSubmit} loading={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              Sign in
            </Button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}