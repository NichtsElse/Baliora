import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Activity, Clock, Loader2, Building2, CalendarDays, FileText, Settings, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ENTITY_ICONS = {
  VillaListing: Building2,
  BookingInquiry: CalendarDays,
  BlogPost: FileText,
  Inquiry: FileText,
  WebsiteSetting: Settings,
  VillaOwner: User,
};

export default function AdminActivity() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-activity'],
     queryFn: () => localClient.entities.ActivityLog.list('-created_date', 100),
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        <p className="text-slate-500 text-sm mt-1">Recent system activity and changes</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-amber-500" /></div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl text-center py-16">
          <Activity size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No activity logged yet</p>
          <p className="text-slate-600 text-xs mt-1">Activity will appear here as your team performs actions</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-800">
            {logs.map(log => {
              const Icon = ENTITY_ICONS[log.entity_type] || Activity;
              return (
                <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{log.action}</p>
                    {log.details && <p className="text-slate-500 text-xs mt-0.5">{log.details}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {log.user_name && <span className="text-slate-600 text-xs">{log.user_name}</span>}
                      {log.entity_type && <span className="text-slate-700 text-xs">· {log.entity_type}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 text-xs flex-shrink-0">
                    <Clock size={11} />
                    {log.created_date ? formatDistanceToNow(new Date(log.created_date), { addSuffix: true }) : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
