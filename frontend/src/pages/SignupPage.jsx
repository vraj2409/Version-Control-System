import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitBranch, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button, Input, Alert } from '../components/UI';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setApiError('');
    try {
      const res = await authAPI.signup({ name: form.name, email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Signup failed.');
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 20 }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
      <div className="page" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, margin: '0 auto 12px', background: 'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitBranch size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Create account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Start tracking your code with VersaCore</p>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
          {apiError && <div style={{ marginBottom: 20 }}><Alert type="error">{apiError}</Alert></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Name" placeholder="John Doe" icon={<User size={15} />} value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail size={15} />} value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="Password" type="password" placeholder="Min 6 characters" icon={<Lock size={15} />} value={form.password} onChange={set('password')} error={errors.password} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" icon={<Lock size={15} />} value={form.confirm} onChange={set('confirm')} error={errors.confirm} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            <Button onClick={handleSubmit} loading={loading} style={{ width: '100%', justifyContent: 'center' }}>Create account</Button>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}