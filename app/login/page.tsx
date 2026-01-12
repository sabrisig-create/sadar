'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'forgot') {
      console.log('Requesting password reset for:', email);
      const result = await resetPassword(email);
      if (result.error) {
        console.error('Reset password failed:', result.error);
        setError(result.error);
      } else {
        console.log('Reset email sent successfully');
        setResetEmailSent(true);
      }
      setLoading(false);
      return;
    }

    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      if (mode === 'signup') {
        setError(null);
        setMode('signin');
        setLoading(false);
        alert('Account creato. Ora puoi accedere.');
      } else {
        router.push('/');
      }
    }
  };

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
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setResetEmailSent(false);
                }}
                className="flex items-center gap-1.5 text-[14px] text-[#0071e3] hover:text-[#0077ed] transition-colors mb-2 -ml-0.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Torna al login
              </button>
            )}
            <CardTitle className="text-[22px] font-semibold text-[#1d1d1f]">
              {mode === 'signin' ? 'Bentornato' : mode === 'signup' ? 'Crea account' : 'Recupera password'}
            </CardTitle>
            <CardDescription className="text-[15px] text-[#86868b]">
              {mode === 'signin'
                ? 'Accedi per visualizzare le tue riflessioni'
                : mode === 'signup'
                ? 'Crea il tuo account per iniziare'
                : 'Inserisci la tua email per ricevere il link di reset'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            {mode === 'forgot' && resetEmailSent ? (
              <div className="py-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">Email inviata</h3>
                  <p className="text-[14px] text-[#86868b] leading-relaxed mb-6">
                    Abbiamo inviato un link per reimpostare la password a <span className="font-medium text-[#1d1d1f]">{email}</span>. Controlla la tua casella di posta.
                  </p>
                  <Button
                    onClick={() => {
                      setMode('signin');
                      setResetEmailSent(false);
                      setEmail('');
                    }}
                    className="h-12 px-8 rounded-xl bg-[#1d1d1f] hover:bg-[#424245] text-white text-[16px] font-medium"
                  >
                    Torna al login
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[14px] text-red-600 leading-snug">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[14px] font-medium text-[#1d1d1f]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nome@esempio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border-[#d2d2d7] bg-white text-[16px] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-[#0071e3]"
                      autoComplete="email"
                    />
                  </div>

                  {mode !== 'forgot' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-[14px] font-medium text-[#1d1d1f]">Password</Label>
                        {mode === 'signin' && (
                          <button
                            type="button"
                            onClick={() => {
                              setMode('forgot');
                              setError(null);
                            }}
                            className="text-[13px] text-[#0071e3] hover:text-[#0077ed] transition-colors"
                          >
                            Password dimenticata?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Inserisci la password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="h-12 rounded-xl border-[#d2d2d7] bg-white text-[16px] placeholder:text-[#86868b] pr-12 focus:border-[#0071e3] focus:ring-[#0071e3]"
                          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
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
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#424245] text-white text-[16px] font-medium shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : mode === 'forgot' ? (
                      <span className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Invia link di reset
                      </span>
                    ) : (
                      mode === 'signin' ? 'Accedi' : 'Crea Account'
                    )}
                  </Button>
                </form>

                {mode !== 'forgot' && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signin' ? 'signup' : 'signin');
                        setError(null);
                      }}
                      className="text-[15px] text-[#0071e3] hover:text-[#0077ed] transition-colors"
                    >
                      {mode === 'signin'
                        ? 'Non hai un account? Registrati'
                        : 'Hai gia un account? Accedi'}
                    </button>
                  </div>
                )}

                <div className="mt-7 pt-6 border-t border-[#d2d2d7]">
                  <p className="text-[13px] text-[#86868b] text-center leading-relaxed">
                    Le tue riflessioni sono private e protette.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
