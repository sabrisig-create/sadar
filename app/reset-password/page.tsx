'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { updatePassword, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken) {
        console.log('Recovery token detected, waiting for session...');
        const timer = setTimeout(() => {
          if (session) {
            console.log('Recovery session established');
            setIsValidSession(true);
          } else {
            console.error('No session after recovery token');
            setError('Sessione non valida. Richiedi un nuovo link.');
          }
          setCheckingSession(false);
        }, 2000);

        return () => clearTimeout(timer);
      } else {
        if (session) {
          setIsValidSession(true);
        }
        setCheckingSession(false);
      }
    };

    checkRecoverySession();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-5">
              <Image
                src="/image.png"
                alt="Il Metodo SADAR"
                width={200}
                height={200}
                className="w-48 h-auto"
                priority
              />
            </div>
            <p className="text-[#86868b] mt-1.5 text-[15px]">Verifica in corso...</p>
            <div className="mt-6 flex justify-center">
              <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-5">
              <Image
                src="/image.png"
                alt="Il Metodo SADAR"
                width={200}
                height={200}
                className="w-48 h-auto"
                priority
              />
            </div>
          </div>

          <Card className="border-0 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden">
            <CardContent className="px-7 py-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">Link non valido o scaduto</h3>
                <p className="text-[14px] text-[#86868b] leading-relaxed mb-6">
                  Il link per reimpostare la password non e valido o e scaduto. Richiedi un nuovo link dalla pagina di login.
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  className="h-12 px-8 rounded-xl bg-[#1d1d1f] hover:bg-[#424245] text-white text-[16px] font-medium"
                >
                  Torna al login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-5">
            <Image
              src="/image.png"
              alt="Il Metodo SADAR"
              width={200}
              height={200}
              className="w-48 h-auto"
              priority
            />
          </div>
        </div>

        <Card className="border-0 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1.5 pb-2 pt-7 px-7">
            <CardTitle className="text-[22px] font-semibold text-[#1d1d1f]">
              {success ? 'Password aggiornata' : 'Nuova password'}
            </CardTitle>
            <CardDescription className="text-[15px] text-[#86868b]">
              {success ? 'Ora puoi accedere con la nuova password' : 'Inserisci la tua nuova password'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            {success ? (
              <div className="py-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-[14px] text-[#86868b] leading-relaxed mb-6">
                    La tua password e stata aggiornata con successo.
                  </p>
                  <Button
                    onClick={() => router.push('/login')}
                    className="h-12 px-8 rounded-xl bg-[#1d1d1f] hover:bg-[#424245] text-white text-[16px] font-medium"
                  >
                    Vai al login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[14px] text-red-600 leading-snug">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[14px] font-medium text-[#1d1d1f]">Nuova password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Inserisci la nuova password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 rounded-xl border-[#d2d2d7] bg-white text-[16px] placeholder:text-[#86868b] pr-12 focus:border-[#0071e3] focus:ring-[#0071e3]"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[14px] font-medium text-[#1d1d1f]">Conferma password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Ripeti la nuova password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 rounded-xl border-[#d2d2d7] bg-white text-[16px] placeholder:text-[#86868b] pr-12 focus:border-[#0071e3] focus:ring-[#0071e3]"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#424245] text-white text-[16px] font-medium shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5" />
                      Aggiorna password
                    </span>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-7 pt-6 border-t border-[#d2d2d7]">
              <p className="text-[13px] text-[#86868b] text-center leading-relaxed">
                Le tue riflessioni sono private e protette.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
