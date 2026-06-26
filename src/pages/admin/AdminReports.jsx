/**
 * Purpose: Owner performance reporting — per-villa summary, occupancy trends, and payout history.
 * Used by: /admin/owners/reports route.
 * Main dependencies: localClient, React Query, lucide-react.
 * Public functions: AdminReports default export.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import {
  BarChart3, TrendingUp, TrendingDown, Home, Users,
  DollarSign, CalendarDays, Download, AlertCircle
} from 'lucide-react';

const fmt = (n) => `$${Number(n || 0).toLocaleString()}`;
const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

const MONTHS_ORDER = ['2026-04', '2026-05', '2026-06', '2026-07'];

export default function AdminReports() {
  const [selectedVilla, setSelectedVilla] = useState('all');

  const { data: revenues = [], isLoading: loadingRev } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => localClient.entities.OwnerRevenueEntry.list('-period_month', 200),
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: () => localClient.entities.Reservation.list('-created_date', 200),
  });

  const { data: villas = [] } = useQuery({
    queryKey: ['admin-villas-report'],
    queryFn: () => localClient.entities.VillaListing.list('-created_date', 50),
  });

  const { data: owners = [] } = useQuery({
    queryKey: ['admin-owners'],
    queryFn: () => localClient.entities.VillaOwner.list('-created_date', 100),
  });

  const villaNames = [...new Set(revenues.map(r => r.villa_name))];

  const filteredRevenues = selectedVilla === 'all'
    ? revenues
    : revenues.filter(r => r.villa_name === selectedVilla);

  // Total across filtered
  const totalGross = filteredRevenues.reduce((s, r) => s + Number(r.gross_revenue || 0), 0);
  const totalNet = filteredRevenues.reduce((s, r) => s + Number(r.net_payout || 0), 0);
  const totalFees = filteredRevenues.reduce((s, r) => s + Number(r.management_fee || 0), 0);
  const avgOccupancy = filteredRevenues.length
    ? filteredRevenues.reduce((s, r) => s + Number(r.occupancy_rate || 0), 0) / filteredRevenues.length
    : 0;

  // Month-by-month series
  const monthlyData = MONTHS_ORDER.map(month => {
    const entries = filteredRevenues.filter(r => r.period_month === month);
    return {
      month,
      gross: entries.reduce((s, r) => s + Number(r.gross_revenue || 0), 0),
      net: entries.reduce((s, r) => s + Number(r.net_payout || 0), 0),
      occupancy: entries.length ? entries.reduce((s, r) => s + Number(r.occupancy_rate || 0), 0) / entries.length : 0,
    };
  }).filter(d => d.gross > 0);

  const maxGross = Math.max(...monthlyData.map(d => d.gross), 1);

  // Per-villa summary for "all" view
  const villaBreakdown = villaNames.map(name => {
    const rev = revenues.filter(r => r.villa_name === name);
    const villa = villas.find(v => v.name === name);
    return {
      name,
      base_rate: villa?.price_per_night || 0,
      total_gross: rev.reduce((s, r) => s + Number(r.gross_revenue || 0), 0),
      total_net: rev.reduce((s, r) => s + Number(r.net_payout || 0), 0),
      avg_occupancy: rev.length ? rev.reduce((s, r) => s + Number(r.occupancy_rate || 0), 0) / rev.length : 0,
      months: rev.length,
      pending_count: rev.filter(r => r.payment_status === 'pending').length,
    };
  });

  // Reservation stats
  const confirmedRes = reservations.filter(r => r.status === 'confirmed' || r.status === 'checked_in').length;

  const handleExport = () => {
    const rows = [
      ['Month', 'Villa', 'Owner', 'Gross', 'Management Fee', 'Net Payout', 'Occupancy %', 'Payment Status'],
      ...filteredRevenues.map(r => [
        r.period_month, r.villa_name, r.owner_name,
        r.gross_revenue, r.management_fee, r.net_payout,
        r.occupancy_rate, r.payment_status,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baliora_revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-amber-500" size={24} /> Owner Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">Performance summary, occupancy trends, and revenue breakdown</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-700 transition-colors">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Villa Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSelectedVilla('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedVilla === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
          All Villas
        </button>
        {villaNames.map(v => (
          <button key={v} onClick={() => setSelectedVilla(selectedVilla === v ? 'all' : v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedVilla === v ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {v}
          </button>
        ))}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Gross Revenue', value: fmt(totalGross), icon: DollarSign, color: 'text-blue-400', sub: 'selected period' },
          { label: 'Total Net Payout', value: fmt(totalNet), icon: TrendingUp, color: 'text-green-400', sub: 'to owners' },
          { label: 'Mgmt Fees Collected', value: fmt(totalFees), icon: BarChart3, color: 'text-amber-400', sub: 'baliora share' },
          { label: 'Avg Occupancy', value: pct(avgOccupancy), icon: Home, color: 'text-purple-400', sub: 'across months' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className={color} />
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-600 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-amber-500" /> Monthly Revenue Trend
          </h2>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500">
              <AlertCircle size={16} className="mr-2" /> No data for selected filter
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyData.map((d, i) => {
                const prevGross = i > 0 ? monthlyData[i - 1].gross : d.gross;
                const isUp = d.gross >= prevGross;
                return (
                  <div key={d.month} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs tabular-nums w-14">{d.month}</span>
                        {i > 0 && (
                          isUp
                            ? <TrendingUp size={11} className="text-green-400" />
                            : <TrendingDown size={11} className="text-red-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs">{pct(d.occupancy)} occ.</span>
                        <span className="text-green-400 text-xs">{fmt(d.net)} net</span>
                        <span className="text-white text-xs font-medium">{fmt(d.gross)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                        style={{ width: `${(d.gross / maxGross) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Operational Stats */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users size={16} className="text-amber-500" /> Portfolio Overview
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Total Villas', value: villas.length },
                { label: 'Active Owners', value: owners.filter(o => o.status === 'active').length },
                { label: 'Active Reservations', value: confirmedRes },
                { label: 'Revenue Records', value: revenues.length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Per-Villa Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Home size={16} className="text-amber-500" /> Villa Breakdown
            </h2>
            <div className="space-y-3">
              {villaBreakdown.map(v => (
                <div key={v.name}
                  onClick={() => setSelectedVilla(selectedVilla === v.name ? 'all' : v.name)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedVilla === v.name ? 'border-amber-500/50 bg-amber-600/5' : 'border-slate-800 hover:border-slate-700'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium truncate">{v.name}</p>
                    {v.pending_count > 0 && (
                      <span className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                        {v.pending_count} pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 text-xs">{fmt(v.total_gross)} gross</span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-green-400 text-xs">{fmt(v.total_net)} net</span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-slate-400 text-xs">{pct(v.avg_occupancy)} occ.</span>
                  </div>
                </div>
              ))}
              {villaBreakdown.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No revenue data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <CalendarDays size={15} className="text-amber-500" /> Detailed Records
          </h2>
          <span className="text-slate-500 text-xs">{filteredRevenues.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Month', 'Owner', 'Villa', 'Gross', 'Net Payout', 'Occupancy', 'Nights', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-slate-500 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRevenues.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-500">No records</td></tr>
              ) : filteredRevenues.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-slate-300 text-sm tabular-nums">{r.period_month}</td>
                  <td className="px-4 py-3 text-white text-sm">{r.owner_name}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{r.villa_name}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm tabular-nums">{fmt(r.gross_revenue)}</td>
                  <td className="px-4 py-3 text-green-400 font-semibold text-sm tabular-nums">{fmt(r.net_payout)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${r.occupancy_rate || 0}%` }} />
                      </div>
                      <span className="text-slate-400 text-xs">{r.occupancy_rate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{r.nights_booked}n</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 border rounded-full ${r.payment_status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {r.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
