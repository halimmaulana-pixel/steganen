'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HeroStats from '@/components/dashboard/HeroStats';
import QualityTrendChart from '@/components/dashboard/QualityTrendChart';
import ThresholdQualityScatter from '@/components/dashboard/ThresholdQualityScatter';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import CapacityGauge from '@/components/dashboard/CapacityGauge';
import OperationDistribution from '@/components/dashboard/OperationDistribution';
import EnhancedHistoryTable from '@/components/dashboard/EnhancedHistoryTable';
import HistoryDetailModal from '@/components/dashboard/HistoryDetailModal';
import type { HistoryEntry } from '@/lib/api';
import { api } from '@/lib/api';

function formatBytes(bits: number): string {
  const bytes = bits / 8;
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [totalProcesses, setTotalProcesses] = useState(0);
  const [avgPsnr, setAvgPsnr] = useState(0);
  const [avgSsim, setAvgSsim] = useState(0);
  const [totalPayload, setTotalPayload] = useState('0 B');
  const [embedRatio, setEmbedRatio] = useState(0);
  const [avgUsagePercent, setAvgUsagePercent] = useState(0);
  const [totalCapacityBits, setTotalCapacityBits] = useState(0);
  const [totalUsedBits, setTotalUsedBits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.getStats(),
          api.getHistory({ limit: 100 }),
        ]);

        if (statsRes.success) {
          const s = statsRes.data;
          setTotalProcesses(s.total_processes);
          setAvgPsnr(s.avg_psnr);
          setAvgSsim(s.avg_ssim);
          setTotalPayload(formatBytes(s.total_payload_bits));
          setEmbedRatio(s.embed_ratio);
          setAvgUsagePercent(s.avg_usage_percent);
        }

        const hist = historyRes.data;
        setHistory(hist);

        // Compute capacity totals from history
        const caps = hist.reduce((acc, e) => {
          acc.totalCapacity += e.capacity_bits || 0;
          acc.totalUsed += Math.round((e.usage_percent / 100) * (e.capacity_bits || 0));
          return acc;
        }, { totalCapacity: 0, totalUsed: 0 });
        setTotalCapacityBits(caps.totalCapacity);
        setTotalUsedBits(caps.totalUsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const handleRowClick = useCallback((entry: HistoryEntry) => {
    setSelectedEntry(entry);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-dark-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-dark-400">
          Ringkasan operasi steganografi dan kualitas citra
        </p>
      </motion.div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-accent-pink/30 bg-accent-pink/5 p-4 text-sm text-accent-pink">
          <p className="font-medium">Error memuat data</p>
          <p className="mt-1 text-accent-pink/70">{error}</p>
        </div>
      )}

      {/* Section 1: Hero Stats */}
      <HeroStats
        totalProcesses={totalProcesses}
        avgPsnr={avgPsnr}
        avgSsim={avgSsim}
        totalPayload={totalPayload}
        embedRatio={embedRatio}
        avgUsagePercent={avgUsagePercent}
      />

      {/* Section 2: Quality Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QualityTrendChart data={history} />
        <ThresholdQualityScatter data={history} />
      </div>

      {/* Section 3: Operations Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed data={history} />
        </div>
        <div className="space-y-6">
          <CapacityGauge
            avgUsagePercent={avgUsagePercent}
            totalCapacityBits={totalCapacityBits}
            totalUsedBits={totalUsedBits}
          />
          <OperationDistribution data={history} />
        </div>
      </div>

      {/* Section 4: History Table */}
      <EnhancedHistoryTable data={history} onRowClick={handleRowClick} />

      {/* Section 5: Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h3 className="text-sm font-medium text-dark-400 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/embed" className="group">
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-dark-800 bg-dark-900 hover:border-accent-cyan/40 hover:bg-dark-800 transition-all">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20">
                <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-accent-cyan transition-colors">
                  Embed Baru
                </p>
                <p className="text-xs text-dark-400">Sembunyikan pesan dalam citra</p>
              </div>
            </div>
          </Link>

          <Link href="/extract" className="group">
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-dark-800 bg-dark-900 hover:border-accent-purple/40 hover:bg-dark-800 transition-all">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20">
                <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-accent-purple transition-colors">
                  Extract Pesan
                </p>
                <p className="text-xs text-dark-400">Ekstrak pesan tersembunyi</p>
              </div>
            </div>
          </Link>

          <Link href="/embed#evaluate" className="group">
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-dark-800 bg-dark-900 hover:border-accent-blue/40 hover:bg-dark-800 transition-all">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20">
                <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-accent-blue transition-colors">
                  Evaluasi
                </p>
                <p className="text-xs text-dark-400">Bandingkan LSB vs LSB+CNN</p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <HistoryDetailModal entry={selectedEntry} onClose={handleCloseModal} />
    </div>
  );
}
