import type { CSSProperties } from 'react';

export function btn(primary?: boolean): CSSProperties {
  return {
    border: 'none',
    borderRadius: 10,
    padding: '9px 15px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    background: primary ? 'var(--accent)' : 'var(--btn-secondary-bg)',
    color: primary ? '#fff' : 'var(--ink)',
  };
}

export function btnDanger(): CSSProperties {
  return {
    border: 'none',
    borderRadius: 10,
    padding: '9px 15px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    background: 'var(--danger)',
    color: '#fff',
  };
}
