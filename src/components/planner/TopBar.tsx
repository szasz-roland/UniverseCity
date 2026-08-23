import { useState } from 'react';
import { Pill, btn, btnDanger } from '@/components/ui/primitives';

interface TopBarProps {
  placedCredits: number;
  placedCount: number;
  hasPlaced: boolean;
  selectMode: boolean;
  onSelectMode: () => void;
  onDeleteAll: () => void;
}

export function TopBar({
  placedCredits,
  placedCount,
  hasPlaced,
  selectMode,
  onSelectMode,
  onDeleteAll,
}: TopBarProps) {
  const [confirmAll, setConfirmAll] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 22px',
        background: 'var(--panel)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span className="disp" style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-.01em' }}>
          Tanrend
        </span>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>
          Üzemmérnök informatikus · 2026/2027
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Pill label="Tárgy a tanrendben" value={placedCount} />
        <Pill label="Kredit" value={placedCredits} accent />
        {hasPlaced && !selectMode && (
          <button style={btn()} onClick={onSelectMode} title="Több tárgy kijelölése és törlése">
            Kijelölés
          </button>
        )}
        {hasPlaced &&
          !selectMode &&
          (confirmAll ? (
            <button
              style={btnDanger()}
              onClick={() => {
                onDeleteAll();
                setConfirmAll(false);
              }}
              onMouseLeave={() => setConfirmAll(false)}
            >
              Biztosan? Összes törlése
            </button>
          ) : (
            <button style={btn()} onClick={() => setConfirmAll(true)}>
              Összes törlése
            </button>
          ))}
        <button style={btn()} title="Hamarosan">
          PDF export
        </button>
      </div>
    </div>
  );
}

export function SelectBar({
  count,
  onCancel,
  onDelete,
}: {
  count: number;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 22px',
        background: 'var(--lav)',
        borderBottom: '1px solid var(--line2)',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--lav-ink)', fontWeight: 500 }}>
        Kijelölés mód — kattints a tanrendben lévő tárgyakra. {count} kijelölve.
      </span>
      <div style={{ display: 'flex', gap: 9 }}>
        <button style={btn()} onClick={onCancel}>
          Mégse
        </button>
        <button
          style={count ? btnDanger() : { ...btnDanger(), opacity: 0.5, cursor: 'default' }}
          onClick={count ? onDelete : undefined}
        >
          Kijelöltek törlése ({count})
        </button>
      </div>
    </div>
  );
}
