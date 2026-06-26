/**
 * Purpose: Marketing analytics dashboard — traffic, conversions, channel performance.
 * Used by: /admin/marketing/analytics route.
 * Main dependencies: lucide-react.
 * Public functions: AdminAnalytics default export.
 */
import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Eye,
  Globe, MousePointer, ArrowUpRight, RefreshCw, Calendar
} from 'lucide-react';

const PERIODS = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 12 Months'];

const TRAFFIC_DATA = {
  'Last 7 Days': [
    { date: 'Mon', sessions: 142, leads: 4 },
    { date: 'Tue', sessions: 189, leads: 7 },
    { date: 'Wed', sessions: 220, leads: 9 },
    { date: 'Thu', sessions: 175, leads: 5 },
    { date: 'Fri', sessions: 310, leads: 14 },
    { date: 'Sat', sessions: 405, leads: 18 },
    { date: 'Sun', sessions: 380, leads: 16 },
  ],
  'Last 30 Days': [
    { date: 'W1', sessions: 1240, leads: 38 },
    { date: 'W2', sessions: 1580, leads: 52 },
    { date: 'W3', sessions: 1320, leads: 44 },
    { date: 'W4', sessions: 1870, leads: 63 },
  ],
  'Last 3 Months': [
    { date: 'Apr', sessions: 5200, leads: 162 },
    { date: 'May', sessions: 6800, leads: 210 },
    { date: 'Jun', sessions: 7400, leads: 241 },
  ],
  'Last 12 Months': [
    { date: 'Jul', sessions: 3100, leads: 88 },
    { date: 'Aug', sessions: 4200, leads: 126 },
    { date: 'Sep', sessions: 3800, leads: 109 },
    { date: 'Oct', sessions: 3200, leads: 91 },
    { date: 'Nov', sessions: 2900, leads: 74 },
    { date: 'Dec', sessions: 5100, leads: 158 },
    { date: 'Jan', sessions: 4600, leads: 140 },
    { date: 'Feb', sessions: 5300, leads: 161 },
    { date: 'Mar', sessions: 5800, leads: 178 },
    { date: 'Apr', sessions: 5200, leads: 162 },
    { date: 'May', sessions: 6800, leads: 210 },
    { date: 'Jun', sessions: 7400, leads: 241 },
  ],
};

const CHANNELS = [
  { name: 'Organic Search', sessions: 3840, leads: 112, pct: 52 },
  { name: 'Direct', sessions: 1530, leads: 41, pct: 21 },
  { name: 'Social Media', sessions: 980, leads: 27, pct: 13 },
  { name: 'Referral', sessions: 620, leads: 18, pct: 8 },
  { name: 'Email', sessions: 340, leads: 13, pct: 5 },
  { name: 'Paid Ads', sessions: 90, leads: 4, pct: 1 },
];

const TOP_PAGES = [
  { path: '/villas', title: 'Villas Catalog', views: 2840, bounce: 38 },
  { path: '/', title: 'Homepage', views: 1920, bounce: 42 },
  { path: '/villas/villa-karang-seminyak', title: 'Villa Karang Seminyak', views: 1340, bounce: 28 },
  { path: '/villas/villa-tirta-canggu', title: 'Villa Tirta Canggu', views: 1180, bounce: 31 },
  { path: '/contact', title: 'Contact / Inquiry', views: 870, bounce: 22 },
  { path: '/about', title: 'About BALIORA', views: 640, bounce: 55 },
];

const CHANNEL_COLORS = ['bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-cyan-500'];

function StatCard({ label, value, sub, trend, icon: Icon, color = 'text-amber-400' }) {
  const isUp = trend > 0;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className={color} />
        <p className="text-slate-500 text-xs">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}% vs prior period
        </div>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('Last 30 Days');
  const [refreshKey, setRefreshKey] = useState(0);

  const data = TRAFFIC_DATA[period] || [];
  const totalSessions = data.reduce((s, d) => s + d.sessions, 0);
  const totalLeads = data.reduce((s, d) => s + d.leads, 0);
  const convRate = totalSessions ? ((totalLeads / totalSessions) * 100).toFixed(2) : '0.00';
  const maxSessions = Math.max(...data.map(d => d.sessions), 1);
  const maxLeads = Math.max(...data.map(d => d.leads), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-amber-500" size={24} /> Marketing Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">Traffic, leads, and channel performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setRefreshKey(k => k + 1)}
            className="p-2 text-slate-500 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition-colors">
            <RefreshCw size={15} />
          </button>
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${period === p ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {p.replace('Last ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={totalSessions.toLocaleString()} sub={period} trend={12} icon={Users} color="text-blue-400" />
        <StatCard label="Page Views" value={(totalSessions * 2.4).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} sub="avg 2.4 pages/session" trend={8} icon={Eye} color="text-purple-400" />
        <StatCard label="Total Leads" value={totalLeads} sub="form submissions" trend={18} icon={MousePointer} color="text-green-400" />
        <StatCard label="Conversion Rate" value={`${convRate}%`} sub="sessions → leads" trend={5} icon={TrendingUp} color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-500" /> Sessions & Leads — {period}
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-blue-500 inline-block" /> Sessions</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-green-500 inline-block" /> Leads</span>
            </div>
          </div>
          <div className="space-y-2">
            {data.map(d => (
              <div key={d.date} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs w-8 text-right">{d.date}</span>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 rounded-sm bg-blue-500/70 transition-all" style={{ width: `${(d.sessions / maxSessions) * 100}%` }} />
                      <span className="text-slate-400 text-xs">{d.sessions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-sm bg-green-500/70 transition-all" style={{ width: `${(d.leads / maxLeads) * 100}%` }} />
                      <span className="text-slate-500 text-xs">{d.leads} leads</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Channels */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Globe size={16} className="text-amber-500" /> Traffic Channels
          </h2>
          {/* Stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-4">
            {CHANNELS.map((ch, i) => (
              <div key={ch.name} className={`${CHANNEL_COLORS[i]} h-full`} style={{ width: `${ch.pct}%` }} title={`${ch.name}: ${ch.pct}%`} />
            ))}
          </div>
          <div className="space-y-3">
            {CHANNELS.map((ch, i) => (
              <div key={ch.name} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${CHANNEL_COLORS[i]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-xs">{ch.name}</span>
                    <span className="text-slate-400 text-xs font-medium">{ch.pct}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span>{ch.sessions.toLocaleString()} sessions</span>
                    <span>·</span>
                    <span className="text-green-500">{ch.leads} leads</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <Eye size={15} className="text-amber-500" /> Top Pages by Views
          </h2>
          <span className="text-slate-500 text-xs">{period}</span>
        </div>
        <div className="divide-y divide-slate-800">
          {TOP_PAGES.map((page, i) => (
            <div key={page.path} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-800/40 transition-colors">
              <span className="text-slate-600 text-sm font-bold w-5 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{page.title}</p>
                <p className="text-slate-600 text-xs">{page.path}</p>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-white text-sm font-semibold">{page.views.toLocaleString()}</p>
                  <p className="text-slate-600 text-xs">views</p>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${page.bounce < 35 ? 'text-green-400' : page.bounce < 50 ? 'text-amber-400' : 'text-red-400'}`}>{page.bounce}%</p>
                  <p className="text-slate-600 text-xs">bounce</p>
                </div>
                <a href={page.path} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-blue-400 transition-colors">
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-3">
        <Calendar size={15} className="text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-slate-500 text-xs">Analytics data is simulated for demonstration. Connect Google Analytics 4 via the <span className="text-amber-400">Settings → Integrations</span> panel to view real traffic data.</p>
      </div>
    </div>
  );
}
