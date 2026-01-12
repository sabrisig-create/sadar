'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, supabaseUrl, Reflection } from '@/lib/supabase';
import { generateReflectionPDF } from '@/lib/pdf-export';
import { ProtectedRoute } from '@/components/protected-route';
import { DeIdGate } from '@/components/de-id-gate';
import { ReflectionWizard } from '@/components/reflection-wizard';
import { ReflectionReport } from '@/components/reflection-report';
import { ReflectionHistory } from '@/components/reflection-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, LogOut, Shield, Clock, History } from 'lucide-react';

type ViewState = 'dashboard' | 'gate' | 'wizard' | 'report';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<ViewState>('dashboard');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchReflections = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reflections:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le riflessioni',
        variant: 'destructive',
      });
    } else {
      setReflections(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

  const handleStartReflection = () => {
    setView('gate');
  };

  const handleGateConfirm = () => {
    setView('wizard');
  };

  const handleGateCancel = () => {
    setView('dashboard');
  };

  const handleWizardCancel = () => {
    setView('dashboard');
  };

  const handleWizardSubmit = async (data: {
    scene: string;
    therapistAffect: string;
    initialHypothesis: string;
  }) => {
    setSubmitting(true);

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-reflection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate reflection');
      }

      setSelectedReflection(result.reflection);
      setView('report');
      await fetchReflections();

      toast({
        title: 'Riflessione salvata',
        description: 'La tua riflessione e stata elaborata e salvata.',
      });
    } catch (error) {
      console.error('Error submitting reflection:', error);

      const savedData = {
        scene: data.scene,
        therapistAffect: data.therapistAffect,
        initialHypothesis: data.initialHypothesis,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('sadar_draft_reflection', JSON.stringify(savedData));

      toast({
        title: 'Errore nel salvataggio',
        description: 'Le tue note sono state salvate localmente. Riprova piu tardi.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewReflection = (reflection: Reflection) => {
    setSelectedReflection(reflection);
    setView('report');
  };

  const handleBackToDashboard = () => {
    setSelectedReflection(null);
    setView('dashboard');
  };

  const handleExportPDF = () => {
    if (selectedReflection) {
      generateReflectionPDF(selectedReflection);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (view === 'gate') {
    return <DeIdGate onConfirm={handleGateConfirm} onCancel={handleGateCancel} />;
  }

  if (view === 'wizard') {
    return (
      <ReflectionWizard
        onSubmit={handleWizardSubmit}
        onCancel={handleWizardCancel}
        isSubmitting={submitting}
      />
    );
  }

  if (view === 'report' && selectedReflection) {
    return (
      <ReflectionReport
        reflection={selectedReflection}
        onBack={handleBackToDashboard}
        onExport={handleExportPDF}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="sticky top-0 z-10 glass border-b border-[#d2d2d7]/50">
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1d1d1f] flex items-center justify-center shadow-sm">
              <Shield className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-semibold text-[17px] text-[#1d1d1f]">SADAR</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[15px] text-[#86868b] hover:text-[#1d1d1f] transition-colors px-3 py-2 rounded-lg hover:bg-black/5"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">Esci</span>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Card className="border-0 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.15)] rounded-2xl bg-[#1d1d1f] text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[#86868b] text-[13px] font-medium uppercase tracking-wider">Pronto per la riflessione</p>
                <h2 className="text-[22px] font-semibold tracking-tight">Rituale 3-2-1</h2>
                <p className="text-[#a1a1a6] text-[15px] leading-relaxed mt-2 max-w-[240px]">
                  Un rituale cognitivo strutturato di 7 minuti per elaborare il tuo stato post-sessione.
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Clock className="w-7 h-7 text-white/70" />
              </div>
            </div>
            <Button
              onClick={handleStartReflection}
              className="w-full mt-6 h-[52px] rounded-xl bg-white text-[#1d1d1f] hover:bg-[#f5f5f7] text-[16px] font-semibold shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuova Riflessione
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1">
            <History className="w-5 h-5 text-[#86868b]" />
            <h3 className="font-semibold text-[17px] text-[#1d1d1f]">Riflessioni Recenti</h3>
          </div>

          <ReflectionHistory
            reflections={reflections}
            onSelect={handleViewReflection}
            loading={loading}
          />
        </div>

        <div className="pt-6 pb-10">
          <p className="text-[13px] text-[#86868b] text-center leading-relaxed">
            Connesso come {user?.email}
            <br />
            Le tue riflessioni sono private e crittografate.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
