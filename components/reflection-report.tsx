'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Clock, Eye, Heart, Lightbulb, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Reflection } from '@/lib/supabase';

type ReflectionReportProps = {
  reflection: Reflection;
  onBack: () => void;
  onExport: () => void;
};

export function ReflectionReport({ reflection, onBack, onExport }: ReflectionReportProps) {
  const formattedDate = format(new Date(reflection.created_at), 'd MMMM yyyy', { locale: it });
  const formattedTime = format(new Date(reflection.created_at), 'HH:mm', { locale: it });

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="sticky top-0 z-10 glass border-b border-[#d2d2d7]/50">
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#0071e3] hover:text-[#0077ed] transition-colors px-2 py-1 -ml-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-[15px] font-medium">Indietro</span>
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2 rounded-lg border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              <Download className="w-4 h-4" />
              Esporta PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-2 text-[14px] text-[#86868b] px-1">
          <Clock className="w-4 h-4" />
          <span>{formattedDate} alle {formattedTime}</span>
        </div>

        <Card className="border-0 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden">
          <div className="bg-[#1d1d1f] p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-white">Scena Post-Sessione</h3>
                <p className="text-[#86868b] text-[14px]">Momento concreto dalla sessione</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <p className="text-[15px] text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {reflection.scene || 'Nessuna scena registrata'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden">
          <div className="bg-[#34c759] p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-white">Stato Emotivo del Terapeuta</h3>
                <p className="text-white/70 text-[14px]">La tua emozione predominante</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <p className="text-[#1d1d1f] leading-relaxed font-semibold text-[18px]">
              {reflection.therapist_affect || 'Non registrato'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden">
          <div className="bg-[#ff9500] p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-white">Ipotesi Iniziale</h3>
                <p className="text-white/70 text-[14px]">La tua lettura provvisoria</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <p className="text-[15px] text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {reflection.initial_hypothesis || 'Nessuna ipotesi registrata'}
            </p>
          </CardContent>
        </Card>

        {reflection.ai_response && (
          <>
            <div className="py-2">
              <Separator className="bg-[#d2d2d7]" />
            </div>

            <Card className="border-0 shadow-[0_4px_60px_-12px_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#1d1d1f] to-[#3a3a3c] p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-white">Riflessione SADAR</h3>
                    <p className="text-[#a1a1a6] text-[14px]">Contro-ipotesi e Considerazioni Cliniche</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-5 bg-[#fafafa]">
                <div className="prose prose-slate prose-sm max-w-none">
                  <div className="text-[15px] text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                    {reflection.ai_response}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="pt-6 pb-10">
          <p className="text-[13px] text-[#86868b] text-center leading-relaxed">
            Questa riflessione e solo per il tuo sviluppo professionale.
            <br />
            Non devono essere inclusi dati dei pazienti.
          </p>
        </div>
      </div>
    </div>
  );
}
