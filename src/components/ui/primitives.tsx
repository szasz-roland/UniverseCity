import type { ReactNode } from 'react';

export function Pill({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5px 16px',
        borderRadius: 12,
        background: accent ? 'var(--lav)' : '#F3F1EB',
        minWidth: 74,
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 600,
          fontFamily: "'Fraunces',serif",
          color: accent ? 'var(--lav-ink)' : 'var(--ink)',
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{label}</span>
    </div>
  );
}

export function Overlay({
  children,
  onClose,
  right,
}: {
  children: ReactNode;
  onClose: () => void;
  right?: boolean;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(40,38,50,.28)',
        display: 'flex',
        alignItems: right ? 'stretch' : 'center',
        justifyContent: right ? 'flex-end' : 'center',
        zIndex: 50,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--panel)',
          borderRadius: right ? '18px 0 0 18px' : 18,
          padding: '22px 22px 20px',
          boxShadow: '0 12px 40px rgba(0,0,0,.16)',
          ...(right ? { height: '100%', overflowY: 'auto' } : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}
