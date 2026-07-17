'use client';

import type { HistoryEntry } from '@/lib/api';

interface ActivityFeedProps {
  data: HistoryEntry[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  const days = Math.floor(hrs / 24);
  return `${days}h lalu`;
}

const TYPE_CONFIG: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  embed: {
    bg: 'bg-accent-cyan/10',
    text: 'text-accent-cyan',
    label: 'Embed',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  extract: {
    bg: 'bg-accent-purple/10',
    text: 'text-accent-purple',
    label: 'Extract',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  evaluate: {
    bg: 'bg-accent-blue/10',
    text: 'text-accent-blue',
    label: 'Evaluate',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  analyze: {
    bg: 'bg-accent-orange/10',
    text: 'text-accent-orange',
    label: 'Analyze',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
};

export default function ActivityFeed({ data }: ActivityFeedProps) {
  const recent = data.slice(0, 8);

  if (recent.length === 0) {
    return (
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
        <h3 className="text-sm font-medium text-dark-400 mb-4">Aktivitas Terakhir</h3>
        <div className="text-center py-8">
          <svg className="w-8 h-8 text-dark-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-dark-400">Belum ada aktivitas</p>
          <p className="text-xs text-dark-500">Mulai dengan embed pesan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
      <h3 className="text-sm font-medium text-dark-400 mb-4">Aktivitas Terakhir</h3>
      <div className="space-y-0">
        {recent.map((entry) => {
          const config = TYPE_CONFIG[entry.process_type] || TYPE_CONFIG.embed;
          return (
            <div key={entry.id} className="flex items-start gap-3 py-3 border-b border-dark-800 last:border-0">
              <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
                <span className={config.text}>{config.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {config.label} pesan ke {entry.image_name}
                </p>
                <p className="text-xs text-dark-400">
                  {timeAgo(entry.created_at)}
                  {entry.psnr_db != null && ` · PSNR ${entry.psnr_db.toFixed(1)} dB`}
                  {!entry.psnr_db && entry.message_length_chars > 0 && ` · ${entry.message_length_chars} char`}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-accent-cyan mt-2 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
