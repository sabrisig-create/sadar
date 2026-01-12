'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

type DeIdGateProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeIdGate({ onConfirm, onCancel }: DeIdGateProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-[420px] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-up">
        <div className="bg-[#1d1d1f] p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-white">Protezione dei Dati</h2>
              <p className="text-[#86868b] text-[14px]">Richiesto prima di procedere</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-[14px] text-amber-900 font-semibold">
                Promemoria Privacy
              </p>
              <p className="text-[14px] text-amber-700 leading-relaxed">
                SADAR e progettato solo per l'auto-riflessione del terapeuta.
                I dati dei pazienti non devono mai essere inseriti in questo sistema.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[14px] text-[#86868b] leading-relaxed">
              Prima di iniziare la riflessione, devi confermare che il tuo inserimento non conterra:
            </p>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-3 text-[15px] text-[#1d1d1f]">
                <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#86868b]" />
                </div>
                Nomi o iniziali dei pazienti
              </li>
              <li className="flex items-center gap-3 text-[15px] text-[#1d1d1f]">
                <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#86868b]" />
                </div>
                Date di nascita o date delle sessioni
              </li>
              <li className="flex items-center gap-3 text-[15px] text-[#1d1d1f]">
                <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#86868b]" />
                </div>
                Informazioni di contatto o indirizzi
              </li>
              <li className="flex items-center gap-3 text-[15px] text-[#1d1d1f]">
                <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#86868b]" />
                </div>
                Qualsiasi altra informazione identificabile
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#f5f5f7] rounded-2xl">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="mt-0.5 h-5 w-5 rounded-md"
            />
            <label
              htmlFor="confirm"
              className="text-[14px] text-[#1d1d1f] leading-relaxed cursor-pointer select-none"
            >
              Certifico che nessun nome, data o dato identificabile del paziente sara inserito in questa riflessione.
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-[52px] rounded-xl text-[16px] font-medium border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              Annulla
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!confirmed}
              className="flex-1 h-[52px] rounded-xl text-[16px] font-medium bg-[#1d1d1f] hover:bg-[#424245] disabled:bg-[#d2d2d7] disabled:text-[#86868b]"
            >
              Inizia Riflessione
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
