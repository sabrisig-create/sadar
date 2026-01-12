'use client';

import { Card } from '@/components/ui/card';
import { Clock, ChevronRight, FileText } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Reflection } from '@/lib/supabase';

type ReflectionHistoryProps = {
  reflections: Reflection[];
  onSelect: (reflection: Reflection) => void;
  loading: boolean;
};

export function ReflectionHistory({ reflections, onSelect, loading }: ReflectionHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 border-0 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.1)] rounded-2xl animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#e5e5ea]" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 bg-[#e5e5ea] rounded-lg w-3/4" />
                <div className="h-3 bg-[#f5f5f7] rounded-lg w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <Card className="p-10 border-0 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] rounded-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] mx-auto mb-5 flex items-center justify-center">
          <FileText className="w-8 h-8 text-[#86868b]" />
        </div>
        <h3 className="text-[18px] font-semibold text-[#1d1d1f] mb-2">Nessuna riflessione ancora</h3>
        <p className="text-[15px] text-[#86868b] max-w-[280px] mx-auto leading-relaxed">
          Inizia la tua prima riflessione 3-2-1 per costruire il tuo archivio di intuizioni cliniche.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reflections.map((reflection) => {
        const createdAt = new Date(reflection.created_at);
        const relativeTime = formatDistanceToNow(createdAt, { addSuffix: true, locale: it });
        const fullDate = format(createdAt, 'd MMM yyyy', { locale: it });

        return (
          <Card
            key={reflection.id}
            className="p-4 border-0 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.1)] rounded-2xl hover:shadow-[0_4px_30px_-8px_rgba(0,0,0,0.15)] transition-all duration-200 cursor-pointer group active:scale-[0.98]"
            onClick={() => onSelect(reflection)}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] flex items-center justify-center flex-shrink-0 group-hover:bg-[#e5e5ea] transition-colors">
                <FileText className="w-5 h-5 text-[#86868b]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] text-[#1d1d1f] font-medium line-clamp-2 leading-snug">
                  {(reflection.scene || 'Nessuna scena registrata').slice(0, 120)}
                  {(reflection.scene?.length || 0) > 120 ? '...' : ''}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3.5 h-3.5 text-[#aeaeb2]" />
                  <span className="text-[13px] text-[#86868b]">{relativeTime}</span>
                  <span className="text-[13px] text-[#d2d2d7]">|</span>
                  <span className="text-[13px] text-[#aeaeb2]">{fullDate}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#d2d2d7] flex-shrink-0 group-hover:text-[#86868b] transition-colors mt-0.5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
