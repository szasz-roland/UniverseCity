import { useRef, useState } from 'react';
import { Pill } from '@/components/ui/primitives';
import { btn, btnDanger } from '@/components/ui/buttonStyles';

interface TopBarProps {
  placedCredits: number;
  placedCount: number;
  hasPlaced: boolean;
  selectMode: boolean;
  onSelectMode: () => void;
  onDeleteAll: () => void;
  onExportPdf: () => Promise<void>;
  onImportFile: (file: File) => Promise<void>;
  catalogOpen: boolean;
  onToggleCatalog: () => void;
  onLogout: () => void;
}

export function TopBar({
  placedCredits,
  placedCount,
  hasPlaced,
  selectMode,
  onSelectMode,
  onDeleteAll,
  onExportPdf,
  onImportFile,
  catalogOpen,
  onToggleCatalog,
  onLogout,
}: TopBarProps) {
  const [confirmAll, setConfirmAll] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: 10,
        padding: '14px 22px',
        background: 'var(--panel)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggleCatalog}
          title={catalogOpen ? 'Tárgylista elrejtése' : 'Tárgylista megjelenítése'}
          aria-label={catalogOpen ? 'Tárgylista elrejtése' : 'Tárgylista megjelenítése'}
          style={{
            ...btn(),
            width: 34,
            height: 34,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4.5H14M2 8H14M2 11.5H14"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className="disp" style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-.01em' }}>
          Tanrend
        </span>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>
          Üzemmérnök informatikus · 2026/2027
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setImporting(true);
            try {
              await onImportFile(file);
            } finally {
              setImporting(false);
            }
          }}
        />
        <button
          style={btn(true)}
          disabled={importing}
          onClick={() => fileInputRef.current?.click()}
          title="Neptun felvett kurzusok exportjának (.xlsx) importálása"
        >
          {importing ? 'Importálás…' : 'Importálás'}
        </button>
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
        {hasPlaced && (
          <button
            style={btn()}
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              try {
                await onExportPdf();
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? 'Exportálás…' : 'PDF export'}
          </button>
        )}
        <button style={btn()} onClick={onLogout} title="Kijelentkezés">
          Kijelentkezés
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
