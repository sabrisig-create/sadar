'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Search, LogOut, Database, Users } from 'lucide-react';
import { format } from 'date-fns';

type Reflection = {
  id: string;
  user_id: string;
  scene: string | null;
  therapist_affect: string | null;
  initial_hypothesis: string | null;
  ai_response: string | null;
  de_id_confirmed: boolean;
  created_at: string;
  user_email?: string;
};

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  reflection_count: number;
};

type SystemPrompt = {
  id: string;
  name: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    loadAllData();
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadReflections(), loadUsers(), loadSystemPrompts()]);
    setLoading(false);
  };

  const loadReflections = async () => {
    try {
      const response = await fetch('/api/admin/reflections');
      if (response.ok) {
        const data = await response.json();
        setReflections(data || []);
      } else {
        const errorData = await response.json();
        console.error('Error loading reflections:', errorData.error);
        if (errorData.error === 'Service role key not configured') {
          alert('Admin dashboard requires SUPABASE_SERVICE_ROLE_KEY to be configured in .env file');
        }
      }
    } catch (error) {
      console.error('Error loading reflections:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      } else {
        console.error('Error loading users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadSystemPrompts = async () => {
    try {
      const response = await fetch('/api/admin/prompts');
      if (response.ok) {
        const data = await response.json();
        setSystemPrompts(data || []);
      } else {
        console.error('Error loading system prompts');
      }
    } catch (error) {
      console.error('Error loading system prompts:', error);
    }
  };

  const handleSignOut = () => {
    document.cookie = 'admin_auth=; path=/; max-age=0';
    sessionStorage.removeItem('admin_authenticated');
    router.push('/admin/login');
  };

  const filteredReflections = reflections.filter(r =>
    r.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.scene?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.therapist_affect?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#1d1d1f]" />
            <div>
              <h1 className="text-[28px] font-semibold text-[#1d1d1f]">Admin Dashboard</h1>
              <p className="text-[15px] text-[#86868b]">Gestione completa del sistema SADAR</p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[13px] text-[#86868b]">Riflessioni Totali</p>
                  <p className="text-[24px] font-semibold text-[#1d1d1f]">{reflections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[13px] text-[#86868b]">Utenti Registrati</p>
                  <p className="text-[24px] font-semibold text-[#1d1d1f]">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Database className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-[13px] text-[#86868b]">System Prompts</p>
                  <p className="text-[24px] font-semibold text-[#1d1d1f]">{systemPrompts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reflections" className="space-y-6">
          <TabsList className="bg-white border-0 shadow-sm p-1">
            <TabsTrigger value="reflections">Riflessioni</TabsTrigger>
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="prompts">System Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value="reflections" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tutte le Riflessioni</CardTitle>
                    <CardDescription>Visualizza tutte le riflessioni degli utenti</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                    <Input
                      placeholder="Cerca per ID o contenuto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredReflections.length === 0 ? (
                    <div className="text-center py-8 text-[#86868b]">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nessuna riflessione trovata</p>
                    </div>
                  ) : (
                    filteredReflections.map((reflection) => (
                      <div
                        key={reflection.id}
                        className="p-4 bg-white rounded-xl border border-[#d2d2d7] hover:border-[#86868b] transition-colors cursor-pointer"
                        onClick={() => setSelectedReflection(reflection)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[11px]">
                                ID: {reflection.user_id.substring(0, 8)}...
                              </Badge>
                              <span className="text-[12px] text-[#86868b]">
                                {format(new Date(reflection.created_at), 'dd/MM/yyyy HH:mm')}
                              </span>
                            </div>
                            {reflection.therapist_affect && (
                              <p className="text-[14px] text-[#1d1d1f] font-medium mb-1">
                                Affect: {reflection.therapist_affect}
                              </p>
                            )}
                            {reflection.scene && (
                              <p className="text-[13px] text-[#86868b] line-clamp-2">
                                {reflection.scene}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedReflection && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Dettaglio Riflessione</CardTitle>
                      <CardDescription>ID: {selectedReflection.user_id}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReflection(null)}
                    >
                      Chiudi
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-[13px] font-medium text-[#86868b] mb-1">Data</p>
                    <p className="text-[15px] text-[#1d1d1f]">
                      {format(new Date(selectedReflection.created_at), 'dd MMMM yyyy, HH:mm')}
                    </p>
                  </div>
                  {selectedReflection.scene && (
                    <div>
                      <p className="text-[13px] font-medium text-[#86868b] mb-1">Scena</p>
                      <p className="text-[15px] text-[#1d1d1f] whitespace-pre-wrap">
                        {selectedReflection.scene}
                      </p>
                    </div>
                  )}
                  {selectedReflection.therapist_affect && (
                    <div>
                      <p className="text-[13px] font-medium text-[#86868b] mb-1">Affect del Terapeuta</p>
                      <p className="text-[15px] text-[#1d1d1f]">{selectedReflection.therapist_affect}</p>
                    </div>
                  )}
                  {selectedReflection.initial_hypothesis && (
                    <div>
                      <p className="text-[13px] font-medium text-[#86868b] mb-1">Ipotesi Iniziale</p>
                      <p className="text-[15px] text-[#1d1d1f]">{selectedReflection.initial_hypothesis}</p>
                    </div>
                  )}
                  {selectedReflection.ai_response && (
                    <div>
                      <p className="text-[13px] font-medium text-[#86868b] mb-1">Risposta SADAR</p>
                      <div className="p-4 bg-[#f5f5f7] rounded-xl">
                        <p className="text-[14px] text-[#1d1d1f] whitespace-pre-wrap leading-relaxed">
                          {selectedReflection.ai_response}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Utenti Registrati</CardTitle>
                <CardDescription>Elenco di tutti gli utenti del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-[#86868b]">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nessun utente registrato</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#d2d2d7]">
                            <th className="text-left py-3 px-4 text-[13px] font-medium text-[#86868b]">Email</th>
                            <th className="text-left py-3 px-4 text-[13px] font-medium text-[#86868b]">Data Registrazione</th>
                            <th className="text-left py-3 px-4 text-[13px] font-medium text-[#86868b]">Ultimo Accesso</th>
                            <th className="text-left py-3 px-4 text-[13px] font-medium text-[#86868b]">Riflessioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors">
                              <td className="py-3 px-4 text-[15px] text-[#1d1d1f]">{user.email}</td>
                              <td className="py-3 px-4 text-[14px] text-[#86868b]">
                                {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm')}
                              </td>
                              <td className="py-3 px-4 text-[14px] text-[#86868b]">
                                {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm') : 'Mai'}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className="text-[12px]">{user.reflection_count}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>System Prompts</CardTitle>
                <CardDescription>Prompt AI utilizzati per generare le riflessioni</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemPrompts.length === 0 ? (
                    <div className="text-center py-8 text-[#86868b]">
                      <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nessun prompt configurato</p>
                    </div>
                  ) : (
                    systemPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="p-4 bg-white rounded-xl border border-[#d2d2d7]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[15px] font-medium text-[#1d1d1f]">{prompt.name}</p>
                              {prompt.is_active && (
                                <Badge className="bg-green-500 text-white">Attivo</Badge>
                              )}
                            </div>
                            <p className="text-[13px] text-[#86868b]">
                              Creato il {format(new Date(prompt.created_at), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-[#f5f5f7] rounded-lg">
                          <p className="text-[13px] text-[#1d1d1f] whitespace-pre-wrap font-mono">
                            {prompt.prompt_text.substring(0, 200)}
                            {prompt.prompt_text.length > 200 && '...'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
