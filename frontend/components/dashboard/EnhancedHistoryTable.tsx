'use client';

import { useState, useMemo } from 'react';
import type { HistoryEntry } from '@/lib/api';

interface EnhancedHistoryTableProps {
  data: HistoryEntry[];
  onRowClick: (entry: HistoryEntry) => void;
}

type SortKey = 'created_at' | 'psnr_db' | 'ssim' | 'threshold_percent' | 'message_length_chars' | 'usage_percent';

const TYPE_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  embed: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', label: 'Embed' },
  extract: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', label: 'Extract' },
  evaluate: { bg: 'bg-accent-blue/10', text: 'text-accent-blue', label: 'Evaluate' },
  analyze: { bg: 'bg-accent-orange/10', text: 'text-accent-orange', label: 'Analyze' },
};

function psnrColor(v: number | null) {
  if (v == null) return 'text-dark-500';
  if (v >= 40) return 'text-accent-cyan';
  if (v >= 30) return 'text-accent-orange';
  return 'text-accent-pink';
}

function ssimColor(v: number | null) {
  if (v == null) return 'text-dark-500';
  if (v >= 0.95) return 'text-accent-cyan';
  if (v >= 0.90) return 'text-accent-blue';
  return 'text-accent-pink';
}

const PAGE_SIZE = 10;

export default function EnhancedHistoryTable({ data, onRowClick }: EnhancedHistoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = data;
    if (filterType !== 'all') items = items.filter(e => e.process_type === filterType);
    return items;
  }, [data, filterType]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? (sortKey === 'created_at' ? '' : -Infinity);
      const bv = b[sortKey] ?? (sortKey === 'created_at' ? '' : -Infinity);
      if (sortKey === 'created_at') {
        const cmp = new Date(av as string).getTime() - new Date(bv as string).getTime();
        return sortAsc ? cmp : -cmp;
      }
      const cmp = (av as number) - (bv as number);
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'created_at'); }
  };

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => (
    <span className={`ml-1 inline-block ${active ? 'text-accent-cyan' : 'text-dark-600'}`}>
      {active ? (asc ? '↑' : '↓') : '↕'}
    </span>
  );

  const th = (key: SortKey, label: string, align: string = 'left') => (
    <th
      className={`px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider cursor-pointer hover:text-dark-200 transition-colors text-${align}`}
      onClick={() => toggleSort(key)}
    >
      {label}
      <SortIcon active={sortKey === key} asc={sortAsc} />
    </th>
  );

  return (
    <div className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden">
      <div className="px-6 py-3 border-b border-dark-800 flex flex-wrap gap-2">
        {['all', 'embed', 'extract', 'evaluate', 'analyze'].map(type => (
          <button
            key={type}
            onClick={() => { setFilterType(type); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filterType === type
                ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan'
                : 'border-dark-700 text-dark-400 hover:text-dark-200 hover:border-dark-600'
            }`}
          >
            {type === 'all' ? 'Semua' : TYPE_BADGES[type]?.label || type}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-800">
              {th('created_at', 'Waktu')}
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider text-left">Citra</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase tracking-wider text-center">Tipe</th>
              {th('threshold_percent', 'Threshold', 'right')}
              {th('psnr_db', 'PSNR', 'right')}
              {th('ssim', 'SSIM', 'right')}
              {th('message_length_chars', 'Payload', 'right')}
              {th('usage_percent', 'Kapasitas', 'right')}
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-sm text-dark-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              paged.map(entry => {
                const badge = TYPE_BADGES[entry.process_type] || TYPE_BADGES.embed;
                return (
                  <tr
                    key={entry.id}
                    onClick={() => onRowClick(entry)}
                    className="border-b border-dark-800/50 hover:bg-dark-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-dark-300 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' '}
                      {new Date(entry.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium truncate max-w-[200px]">{entry.image_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-300 text-right tabular-nums">{entry.threshold_percent}%</td>
                    <td className={`px-4 py-3 text-sm text-right tabular-nums font-medium ${psnrColor(entry.psnr_db)}`}>
                      {entry.psnr_db != null ? `${entry.psnr_db.toFixed(1)} dB` : '—'}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right tabular-nums font-medium ${ssimColor(entry.ssim)}`}>
                      {entry.ssim != null ? entry.ssim.toFixed(4) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-300 text-right tabular-nums">{entry.message_length_chars}</td>
                    <td className="px-4 py-3 text-sm text-dark-300 text-right tabular-nums">{entry.usage_percent?.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-dark-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-dark-800">
          <p className="text-xs text-dark-400">
            Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} dari {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg text-dark-400 hover:bg-dark-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? 'bg-accent-cyan/10 text-accent-cyan'
                    : 'text-dark-400 hover:bg-dark-800'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg text-dark-400 hover:bg-dark-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
