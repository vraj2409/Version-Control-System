import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', loading, disabled, style, ...props }) {
  const sizes = {
    sm: { padding: '5px 12px', fontSize: '0.8125rem' },
    md: { padding: '8px 18px', fontSize: '0.875rem' },
    lg: { padding: '11px 24px', fontSize: '1rem' },
  };
  const variants = {
    primary: { background: 'var(--accent)', color: 'white', border: '1px solid transparent' },
    secondary: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
    danger: { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)' },
    success: { background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green)' },
  };
  return (
    <button disabled={disabled || loading} style={{
      ...sizes[size], ...variants[variant],
      borderRadius: 'var(--radius)', cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, fontFamily: 'var(--font-sans)', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.15s', ...style,
    }} {...props}>
      {loading && <span className="spinner" style={{ width: 14, height: 14 }} />}
      {children}
    </button>
  );
}

export function Input({ label, error, icon, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)',
          letterSpacing: '0.02em', textTransform: 'uppercase',
        }}>{label}</label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
        <input style={{
          width: '100%', padding: icon ? '10px 12px 10px 38px' : '10px 14px',
          background: 'var(--bg-base)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)', color: 'var(--text-primary)',
          fontSize: '0.9375rem', fontFamily: 'var(--font-mono)', outline: 'none', ...style,
        }}
        onFocus={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
        {...props} />
      </div>
      {error && <span style={{ fontSize: '0.8125rem', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)',
          letterSpacing: '0.02em', textTransform: 'uppercase',
        }}>{label}</label>
      )}
      <textarea style={{
        width: '100%', minHeight: 90, padding: '10px 14px',
        background: 'var(--bg-base)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', color: 'var(--text-primary)',
        fontSize: '0.9375rem', fontFamily: 'var(--font-mono)', outline: 'none', resize: 'vertical', ...style,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
      {...props} />
      {error && <span style={{ fontSize: '0.8125rem', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

export function Card({ children, style, hover, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 20,
      cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', ...style,
    }}
    onMouseEnter={e => { if (hover || onClick) { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
    onMouseLeave={e => { if (hover || onClick) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}}
    >
      {children}
    </div>
  );
}

export function Badge({ children, color = 'default' }) {
  const colors = {
    default: { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: 'var(--border)' },
    green: { bg: 'var(--green-dim)', color: 'var(--green)', border: 'rgba(34,197,94,0.3)' },
    red: { bg: 'var(--red-dim)', color: 'var(--red)', border: 'rgba(239,68,68,0.3)' },
    blue: { bg: 'var(--accent-glow)', color: 'var(--accent)', border: 'rgba(59,130,246,0.3)' },
    yellow: { bg: 'var(--yellow-dim)', color: 'var(--yellow)', border: 'rgba(245,158,11,0.3)' },
  };
  const c = colors[color];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
    }}>{children}</span>
  );
}

export function Alert({ type = 'error', children }) {
  const styles = {
    error: { bg: 'var(--red-dim)', color: 'var(--red)', border: 'rgba(239,68,68,0.3)' },
    success: { bg: 'var(--green-dim)', color: 'var(--green)', border: 'rgba(34,197,94,0.3)' },
    info: { bg: 'var(--accent-glow)', color: 'var(--accent)', border: 'rgba(59,130,246,0.3)' },
  };
  const s = styles[type];
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--radius)',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '0.875rem',
    }}>{children}</div>
  );
}

export function LoadingPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>Loading...</span>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 56, height: 56, background: 'var(--bg-elevated)', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
      }}>{icon}</div>
      <div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{title}</p>
        {description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius-lg)', padding: 28,
        width: '100%', maxWidth: 520, animation: 'fadeIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        {title && (
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{title}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}