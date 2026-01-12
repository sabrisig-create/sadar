'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DictationInput } from '@/components/dictation-input';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Send, Loader2, Eye, Heart, Lightbulb } from 'lucide-react';

type ReflectionData = {
  scene: string;
  therapistAffect: string;
  initialHypothesis: string;
};

type ReflectionWizardProps = {
  onSubmit: (data: ReflectionData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

const STEPS = [
  {
    id: 'scene',
    title: 'Scena Post-Sessione',
    subtitle: 'Cosa e successo?',
    description: 'Descrivi un momento concreto della sessione in 3-6 righe. Concentrati sui fatti osservabili, non sulle interpretazioni.',
    icon: Eye,
    color: 'bg-[#1d1d1f]',
  },
  {
    id: 'affect',
    title: 'Il Tuo Stato Emotivo',
    subtitle: 'Cosa hai provato?',
    description: 'Nomina l\'emozione predominante che hai provato durante o dopo questo momento. Usa 1-2 parole (es. irritazione, preoccupazione, confusione, distanza).',
    icon: Heart,
    color: 'bg-[#34c759]',
  },
  {
    id: 'hypothesis',
    title: 'Ipotesi Iniziale',
    subtitle: 'Cosa potrebbe significare?',
    description: 'Scrivi una frase provvisoria su cosa pensi stia accadendo. Mantienila provvisoria, non definitiva.',
    icon: Lightbulb,
    color: 'bg-[#ff9500]',
  },
];

export function ReflectionWizard({ onSubmit, onCancel, isSubmitting }: ReflectionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ReflectionData>({
    scene: '',
    therapistAffect: '',
    initialHypothesis: '',
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const step = STEPS[currentStep];
  const Icon = step.icon;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.scene.trim().length >= 20;
      case 1:
        return data.therapistAffect.trim().length >= 2;
      case 2:
        return data.initialHypothesis.trim().length >= 10;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const handleSubmit = async () => {
    if (canProceed()) {
      await onSubmit(data);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <div className="sticky top-0 z-10 glass border-b border-[#d2d2d7]/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-[#86868b] uppercase tracking-wider">
              Passaggio {currentStep + 1} di {STEPS.length}
            </span>
            <span className="text-[13px] font-medium text-[#86868b]">
              Metodo SADAR
            </span>
          </div>
          <div className="flex gap-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-[#1d1d1f]' : 'bg-[#d2d2d7]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <Card className="border-0 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden">
          <div className={`${step.color} p-6`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-white">{step.title}</h2>
                <p className="text-white/70 text-[14px]">{step.subtitle}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            <p className="text-[15px] text-[#86868b] leading-relaxed">{step.description}</p>

            {currentStep === 0 && (
              <DictationInput
                value={data.scene}
                onChange={(value) => setData({ ...data, scene: value })}
                placeholder="Descrivi un momento concreto dalla sessione. Cosa e stato detto, fatto o notato?"
                minRows={5}
                required
              />
            )}

            {currentStep === 1 && (
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#1d1d1f]">
                  La tua emozione predominante
                </label>
                <Input
                  value={data.therapistAffect}
                  onChange={(e) => setData({ ...data, therapistAffect: e.target.value })}
                  placeholder="es. preoccupazione, irritazione, confusione, distanza"
                  className="h-12 rounded-xl text-[16px] border-[#d2d2d7] focus:border-[#1d1d1f] focus:ring-[#1d1d1f]"
                  maxLength={50}
                  required
                />
                <p className="text-[13px] text-[#86868b]">Usa 1-2 parole per nominare l'emozione</p>
              </div>
            )}

            {currentStep === 2 && (
              <DictationInput
                value={data.initialHypothesis}
                onChange={(value) => setData({ ...data, initialHypothesis: value })}
                placeholder="Cosa potrebbe stare accadendo? (Una frase provvisoria)"
                minRows={3}
                required
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-0 glass border-t border-[#d2d2d7]/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-[52px] rounded-xl text-[16px] font-medium border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {currentStep === 0 ? 'Annulla' : 'Indietro'}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 h-[52px] rounded-xl text-[16px] font-medium bg-[#1d1d1f] hover:bg-[#424245] disabled:bg-[#d2d2d7] disabled:text-[#86868b]"
            >
              Continua
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 h-[52px] rounded-xl text-[16px] font-medium bg-[#34c759] hover:bg-[#30b350] disabled:bg-[#d2d2d7] disabled:text-[#86868b]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Elaborazione...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Genera Riflessione
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
