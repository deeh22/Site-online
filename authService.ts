import { supabase, supabaseAnonKey } from '../supabaseClient';
import { User } from '../types';

// O serviço entra em modo de simulação se a chave do Supabase não for um JWT válido (deve começar com 'eyJ')
const IS_MOCK_ACTIVE = !supabaseAnonKey || !supabaseAnonKey.trim().startsWith('eyJ');

const LOCAL_STORAGE_SESSION_KEY = 'supabase_simulated_session';
const LOCAL_STORAGE_USERS_KEY = 'supabase_simulated_users';

// Obtém a lista de usuários simulados do LocalStorage ou inicia com uma lista padrão
function getSimulatedUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  // Usuários padrão da simulação
  const defaults: User[] = [
    {
      id: 'simulated-admin-id',
      email: 'davidsilvacope11@gmail.com',
      name: 'David Silva (Admin)',
      role: 'ADMIN',
      accessLevel: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'simulated-user-id-1',
      email: 'aluno@templo.com',
      name: 'Aluno do Templo',
      role: 'USER',
      accessLevel: 1,
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

// Salva a lista de usuários simulados no LocalStorage
function saveSimulatedUsers(users: User[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  }
}

// Busca o perfil completo do usuário do Supabase
async function fetchProfile(userId: string, email: string): Promise<{ role: 'ADMIN' | 'USER'; name: string; accessLevel: 1 | 2 | 3 }> {
  const cleanEmail = email.toLowerCase().trim();
  const fallbackName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
  const defaultRole = cleanEmail.includes('admin') || cleanEmail === 'davidsilvacope11@gmail.com' ? 'ADMIN' : 'USER';
  const defaultAccessLevel = defaultRole === 'ADMIN' ? 3 : 1;

  console.log('[AuthService] Buscando perfil do Supabase para o ID:', userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      console.log('[AuthService] Perfil encontrado com sucesso:', data);
      const isTargetAdmin = cleanEmail === 'davidsilvacope11@gmail.com';
      return {
        role: isTargetAdmin ? 'ADMIN' : ((data.role === 'ADMIN' || data.role === 'USER') ? data.role : defaultRole),
        name: data.name || data.display_name || fallbackName,
        accessLevel: isTargetAdmin ? 3 : ((data.access_level === 1 || data.access_level === 2 || data.access_level === 3) ? data.access_level : defaultAccessLevel)
      };
    } else {
      const isTargetAdmin = cleanEmail === 'davidsilvacope11@gmail.com';
      const finalRole = isTargetAdmin ? 'ADMIN' : defaultRole;
      const finalLevel = isTargetAdmin ? 3 : defaultAccessLevel;

      console.warn(`[AuthService] Perfil ausente no Supabase para ID: ${userId}, E-mail: ${cleanEmail}. Criando perfil...`);
      
      try {
        await supabase.from('profiles').insert({
          id: userId,
          email: cleanEmail,
          name: fallbackName,
          role: finalRole,
          access_level: finalLevel,
          created_at: new Date().toISOString()
        });
      } catch (insertErr) {
        console.error('[AuthService] Exceção ao auto-criar perfil no Supabase:', insertErr);
      }

      return {
        role: finalRole,
        name: fallbackName,
        accessLevel: finalLevel as any
      };
    }
  } catch (e) {
    console.warn('[AuthService] Erro crítico ao obter o perfil do Supabase. Usando defaults:', e);
    const isTargetAdmin = cleanEmail === 'davidsilvacope11@gmail.com';
    return {
      role: isTargetAdmin ? 'ADMIN' : defaultRole,
      name: fallbackName,
      accessLevel: isTargetAdmin ? 3 : (defaultAccessLevel as any)
    };
  }
}

export const authService = {
  get isMock(): boolean {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('supabase_force_mock');
      if (stored === 'true') return true;
      if (stored === 'false') return false;
    }
    return IS_MOCK_ACTIVE;
  },

  set isMock(val: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabase_force_mock', val ? 'true' : 'false');
    }
  },

  toggleForceMock(enable: boolean) {
    this.isMock = enable;
    console.log('[AuthService] Modo offline ajustado para:', enable);
  },

  // Cadastro de usuário
  async signUp(email: string, password: string, name: string): Promise<{ user: User | null; error: Error | null }> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim() || email.split('@')[0];
    const initialRole = cleanEmail.includes('admin') || cleanEmail === 'davidsilvacope11@gmail.com' ? 'ADMIN' : 'USER';
    const initialLevel = initialRole === 'ADMIN' ? 3 : 1;

    // --- MODO SIMULAÇÃO LOCAL ---
    if (this.isMock) {
      console.log('[AuthService] [Simulado] Cadastrando novo usuário:', cleanEmail);
      const users = getSimulatedUsers();
      
      if (users.some(u => u.email === cleanEmail)) {
        return { user: null, error: new Error('Este e-mail já está cadastrado no sistema (Simulado).') };
      }

      const newUser: User = {
        id: 'simulated-' + Math.random().toString(36).substr(2, 9),
        email: cleanEmail,
        name: cleanName,
        role: initialRole,
        accessLevel: initialLevel,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveSimulatedUsers(users);

      // Efetua login automático na simulação
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newUser));
      }

      return { user: newUser, error: null };
    }

    // --- MODO REAL SUPABASE ---
    console.log('[AuthService] Iniciando cadastro no Supabase:', { email: cleanEmail, name: cleanName, role: initialRole, accessLevel: initialLevel });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            name: cleanName,
            display_name: cleanName,
            role: initialRole,
            access_level: initialLevel
          }
        }
      });
      
      if (error) {
        console.error('[AuthService] Erro retornado no signUp do Supabase:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as any).code || (error as any).status_code,
          originalError: String(error)
        });
        let signUpMsg = error.message || '';
        const lowerMsg = signUpMsg.toLowerCase();
        
        if (lowerMsg.includes('already registered') || lowerMsg.includes('already exists')) {
          signUpMsg = 'Este e-mail já está cadastrado no sistema.';
        } else if (lowerMsg.includes('weak') || lowerMsg.includes('password should be')) {
          signUpMsg = 'Senha muito fraca. A senha deve ter pelo menos 6 caracteres.';
        } else if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('network') || lowerMsg.includes('connection')) {
          signUpMsg = 'Erro de conexão: Não foi possível contatar o servidor Supabase.';
        } else if (!signUpMsg || lowerMsg === '{}' || lowerMsg === '[object object]') {
          signUpMsg = 'Erro do servidor Supabase (banco ou credenciais). Por favor, verifique a conexão ou use outra conta.';
        }
        return { user: null, error: new Error(signUpMsg) };
      }
      
      if (data.user) {
        console.log('[AuthService] Usuário criado com sucesso no Auth do Supabase. ID:', data.user.id);
        
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: cleanName,
            role: initialRole,
            access_level: initialLevel,
            created_at: data.user.created_at || new Date().toISOString()
          }, { onConflict: 'id' });
        } catch (e) {
          console.error('[AuthService] Falha no bloco do upsert do perfil:', e);
        }

        const profile = await fetchProfile(data.user.id, cleanEmail);
        return {
          user: {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: profile.name,
            createdAt: data.user.created_at,
            role: profile.role,
            accessLevel: profile.accessLevel,
          },
          error: null
        };
      }
      return { user: null, error: new Error('Ocorreu um erro inesperado ao cadastrar.') };
    } catch (err: any) {
      console.error('[AuthService] Exceção crítica em signUp:', err);
      let errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg === '{}' || errMsg === '[object Object]') {
        errMsg = 'Erro de comunicação com o Supabase. Por favor, verifique a conexão com o banco.';
      }
      return { user: null, error: new Error(errMsg) };
    }
  },

  // Login de usuário
  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    const cleanEmail = email.toLowerCase().trim();

    // --- MODO SIMULAÇÃO LOCAL ---
    if (this.isMock) {
      console.log('[AuthService] [Simulado] Tentando login:', cleanEmail);
      const users = getSimulatedUsers();
      const user = users.find(u => u.email === cleanEmail);

      if (!user) {
        return { user: null, error: new Error('Usuário inexistente (Este e-mail não foi cadastrado no sistema).') };
      }

      // Simulação simples de senha (qualquer senha de 6+ caracteres funciona)
      if (password.length < 6) {
        return { user: null, error: new Error('Senha incorreta. Por favor, tente novamente.') };
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(user));
      }

      return { user, error: null };
    }

    // --- MODO REAL SUPABASE ---
    console.log('[AuthService] Tentando fazer login para o e-mail:', cleanEmail);

    try {
      let profileExists = false;
      try {
        const { data: profileCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (profileCheck) {
          profileExists = true;
        }
      } catch (checkEx) {
        console.error('[AuthService] Erro na pré-verificação de e-mail:', checkEx);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        console.error('[AuthService] Erro retornado no signInWithPassword:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as any).code || (error as any).status_code,
          originalError: String(error)
        });
        let customErrMessage = error.message || '';
        const lowerMsg = customErrMessage.toLowerCase();

        if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('credentials') || error.status === 400) {
          if (!profileExists) {
            customErrMessage = 'Usuário inexistente (Este e-mail não foi cadastrado no sistema).';
          } else {
            customErrMessage = 'Senha incorreta. Por favor, tente novamente.';
          }
        } else if (lowerMsg.includes('email not confirmed') || lowerMsg.includes('confirm')) {
          customErrMessage = 'E-mail não confirmado. Por favor, verifique sua caixa de entrada para confirmar seu cadastro.';
        } else if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('network') || lowerMsg.includes('connection')) {
          customErrMessage = 'Erro de conexão: Não foi possível contatar o servidor Supabase.';
        } else if (!customErrMessage || lowerMsg === '{}' || lowerMsg === '[object object]') {
          customErrMessage = 'Erro do servidor Supabase (banco ou credenciais). Verifique se suas credenciais estão corretas.';
        }
        
        return { user: null, error: new Error(customErrMessage) };
      }

      if (data.user) {
        console.log('[AuthService] Login efetuado com sucesso no Supabase. ID:', data.user.id);
        const profile = await fetchProfile(data.user.id, cleanEmail);
        return {
          user: {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: profile.name,
            createdAt: data.user.created_at,
            role: profile.role,
            accessLevel: profile.accessLevel,
          },
          error: null
        };
      }
      return { user: null, error: new Error('Credenciais inválidas. E-mail ou senha incorretos.') };
    } catch (err: any) {
      console.error('[AuthService] Exceção crítica em signIn:', err);
      let errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg === '{}' || errMsg === '[object Object]') {
        errMsg = 'Erro de conexão com o Supabase. Por favor, tente novamente.';
      }
      return { user: null, error: new Error(errMsg) };
    }
  },

  // Login com Google
  async signInWithGoogle(): Promise<{ user: User | null; error: Error | null }> {
    if (this.isMock) {
      console.log('[AuthService] [Simulado] Iniciando login com Google...');
      const adminUser = getSimulatedUsers().find(u => u.email === 'davidsilvacope11@gmail.com') || {
        id: 'simulated-admin-id',
        email: 'davidsilvacope11@gmail.com',
        name: 'David Silva (Admin)',
        role: 'ADMIN',
        accessLevel: 3,
        createdAt: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(adminUser));
        window.location.reload();
      }
      return { user: adminUser, error: null };
    }

    console.log('[AuthService] Iniciando Login com Google...');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        console.error('[AuthService] Erro no login com Google:', error);
        return { user: null, error };
      }
      return { user: null, error: null };
    } catch (err: any) {
      console.error('[AuthService] Exceção no login com Google:', err);
      return { user: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  // Recuperar senha (Envio de email)
  async recoverPassword(email: string): Promise<{ error: Error | null; successMessage: string | null }> {
    const cleanEmail = email.toLowerCase().trim();

    if (this.isMock) {
      console.log('[AuthService] [Simulado] Enviando recuperação de senha para:', cleanEmail);
      return { error: null, successMessage: 'Instruções de recuperação enviadas para o seu e-mail (Simulação)!' };
    }

    console.log('[AuthService] Iniciando recuperação de senha para:', cleanEmail);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });
      if (error) {
        console.error('[AuthService] Erro no resetPasswordForEmail:', error);
        return { error, successMessage: null };
      }
      return { error: null, successMessage: 'Instruções de recuperação enviadas para o seu e-mail!' };
    } catch (err: any) {
      console.error('[AuthService] Exceção em recoverPassword:', err);
      return { error: err instanceof Error ? err : new Error(String(err)), successMessage: null };
    }
  },

  // Sign Out
  async signOut(): Promise<{ error: Error | null }> {
    console.log('[AuthService] Realizando logout...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    }

    if (this.isMock) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err: any) {
      console.error('[AuthService] Exceção em signOut:', err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  // Retorna usuário logado na sessão atual
  async getCurrentUser(): Promise<User | null> {
    if (this.isMock) {
      if (typeof window === 'undefined') return null;
      const session = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (session) {
        try {
          return JSON.parse(session);
        } catch {
          return null;
        }
      }
      return null;
    }

    console.log('[AuthService] Obtendo usuário da sessão activa...');
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const profile = await fetchProfile(data.user.id, data.user.email || '');
        
        // Auto-promoção silenciosa no Supabase real para davidsilvacope11@gmail.com
        if (data.user.email?.toLowerCase().trim() === 'davidsilvacope11@gmail.com' && (profile.role !== 'ADMIN' || profile.accessLevel !== 3)) {
          try {
            console.log('[AuthService] Auto-promovendo davidsilvacope11@gmail.com para administrador...');
            await supabase
              .from('profiles')
              .update({ role: 'ADMIN', access_level: 3 })
              .eq('id', data.user.id);
            profile.role = 'ADMIN';
            profile.accessLevel = 3;
          } catch (e) {
            console.warn('[AuthService] Falha ao auto-promover no Supabase:', e);
          }
        }

        return {
          id: data.user.id,
          email: data.user.email || '',
          name: profile.name,
          createdAt: data.user.created_at,
          role: profile.role,
          accessLevel: profile.accessLevel
        };
      }
      return null;
    } catch (err) {
      console.error('[AuthService] Erro ao buscar getCurrentUser:', err);
      return null;
    }
  },

  // Busca TODOS os perfis (para a Tela de Administração de Usuários)
  async getAllProfiles(): Promise<{ profiles: User[]; error: Error | null }> {
    if (this.isMock) {
      console.log('[AuthService] [Simulado] Buscando todos os perfis...');
      return { profiles: getSimulatedUsers(), error: null };
    }

    console.log('[AuthService] Buscando todos os perfis do banco...');
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error && error.code === '42703') {
        const fallbackQuery = await supabase
          .from('profiles')
          .select('*');
        if (!fallbackQuery.error) {
          data = fallbackQuery.data;
          error = null;
        }
      }
      
      if (error) {
        console.error("[AuthService] Erro do Supabase ao buscar perfis:", error);
        let customErrorMessage = 'Erro ao recuperar perfis de usuários do banco de dados.';
        
        if (error.code === '42P01') {
          customErrorMessage = "A tabela 'profiles' não existe no banco de dados. Por favor, acesse o painel do Supabase, clique no Editor SQL e execute o script de configuração.";
        } else if (error.code === '42703') {
          customErrorMessage = "Uma coluna esperada não foi encontrada na tabela 'profiles'. Execute o script SQL de migração.";
        } else {
          customErrorMessage = `Erro na consulta: ${error.message}`;
        }
        return { profiles: [], error: new Error(customErrorMessage) };
      }
      
      const list: User[] = (data || []).map((p: any) => {
        const fallbackName = p.email ? p.email.split('@')[0] : 'Usuário';
        return {
          id: p.id,
          email: p.email || '',
          name: p.name || p.display_name || fallbackName,
          createdAt: p.created_at || new Date().toISOString(),
          role: p.role || 'USER',
          accessLevel: p.access_level || 1,
        };
      });

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { profiles: list, error: null };
    } catch (err: any) {
      console.error("[AuthService] Erro inesperado em getAllProfiles:", err);
      return { profiles: [], error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  // Altera a role e o nível de acesso de um perfil
  async updateProfileRoleAndLevel(userId: string, role: 'ADMIN' | 'USER', accessLevel: 1 | 2 | 3): Promise<{ error: Error | null }> {
    if (this.isMock) {
      console.log('[AuthService] [Simulado] Atualizando perfil:', { userId, role, accessLevel });
      const users = getSimulatedUsers();
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx !== -1) {
        users[userIdx].role = role;
        users[userIdx].accessLevel = accessLevel;
        saveSimulatedUsers(users);
        
        // Se for o próprio usuário logado, atualiza a sessão
        const currentSession = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_SESSION_KEY) : null;
        if (currentSession) {
          try {
            const sessUser = JSON.parse(currentSession);
            if (sessUser.id === userId) {
              sessUser.role = role;
              sessUser.accessLevel = accessLevel;
              localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(sessUser));
            }
          } catch {}
        }
      }
      return { error: null };
    }

    console.log('[AuthService] Atualizando perfil no Supabase:', { userId, role, accessLevel });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role, access_level: accessLevel })
        .eq('id', userId);
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  // Deleta um perfil
  async deleteProfile(userId: string): Promise<{ error: Error | null }> {
    if (this.isMock) {
      console.log('[AuthService] [Simulado] Deletando perfil:', userId);
      const users = getSimulatedUsers();
      const filtered = users.filter(u => u.id !== userId);
      saveSimulatedUsers(filtered);
      return { error: null };
    }

    console.log('[AuthService] Deletando perfil do Supabase:', userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  // Atualiza o nome espiritual do usuário
  async updateProfileName(userId: string, name: string): Promise<{ error: Error | null }> {
    if (this.isMock) {
      console.log('[AuthService] [Simulado] Atualizando nome espiritual:', userId, name);
      const users = getSimulatedUsers();
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx !== -1) {
        users[userIdx].name = name;
        saveSimulatedUsers(users);
        
        const currentSession = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_SESSION_KEY) : null;
        if (currentSession) {
          try {
            const sessUser = JSON.parse(currentSession);
            if (sessUser.id === userId) {
              sessUser.name = name;
              localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(sessUser));
            }
          } catch {}
        }
      }
      return { error: null };
    }

    console.log('[AuthService] Atualizando nome espiritual no Supabase:', userId, name);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', userId);
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  // Altera a senha do usuário logado
  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<{ error: Error | null }> {
    if (this.isMock) {
      console.log('[AuthService] [Simulado] Alterando senha de:', email);
      return { error: null };
    }

    console.log('[AuthService] Alterando senha no Supabase de:', email);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  async addSimulatedUser(email: string, password: string, role: 'ADMIN' | 'USER', accessLevel: 1 | 2 | 3 = 1, name?: string): Promise<{ user: User | null; error: Error | null }> {
    if (this.isMock) {
      const cleanEmail = email.toLowerCase().trim();
      const users = getSimulatedUsers();
      if (users.some(u => u.email === cleanEmail)) {
        return { user: null, error: new Error('Usuário já existe.') };
      }
      const newUser: User = {
        id: 'simulated-' + Math.random().toString(36).substr(2, 9),
        email: cleanEmail,
        name: name || email.split('@')[0],
        role,
        accessLevel,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      saveSimulatedUsers(users);
      return { user: newUser, error: null };
    }
    return { 
      user: null, 
      error: new Error('Criação rápida não suportada no Supabase oficial devido às restrições do client SDK. Registre novos usuários pela tela de cadastro.') 
    };
  }
};
