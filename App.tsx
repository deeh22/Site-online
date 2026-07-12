/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { authService } from './lib/authService';
import { User, AuthView } from './types';
import EnvConfigAlert from './components/EnvConfigAlert';
import IntroScreen from './components/IntroScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import WelcomeScreen from './components/WelcomeScreen';
import { Sparkles } from 'lucide-react';

// Função utilitária para formatar mensagens de erro de forma robusta e amigável
function formatError(err: any): string {
  if (!err) return 'Ocorreu um erro inesperado.';
  
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (trimmed === '{}' || trimmed === '[object Object]') {
      return 'Erro inesperado no cadastro. Por favor, verifique se seu e-mail já existe ou se a conexão com o banco está ativa.';
    }
    return err;
  }
  
  // Se for uma instância de Error ou objeto com propriedade message
  if (err.message) {
    if (typeof err.message === 'string') {
      const trimmedMsg = err.message.trim();
      if (trimmedMsg === '{}' || trimmedMsg === '[object Object]') {
        return 'Erro do servidor Supabase (banco ou credenciais). Por favor, verifique a configuração e a conexão de rede.';
      }
      return err.message;
    }
    try {
      const stringified = JSON.stringify(err.message);
      if (stringified === '{}' || stringified === '[object Object]') {
        return 'Erro interno no processamento.';
      }
      return stringified;
    } catch {
      return String(err.message);
    }
  }

  // Se tiver a propriedade error_description (comum em fluxos OAuth/Auth)
  if (err.error_description && typeof err.error_description === 'string') {
    return err.error_description;
  }

  // Se for um objeto e puder ser convertido para string JSON
  try {
    const stringified = JSON.stringify(err);
    if (stringified === '{}') {
      return err.toString && err.toString() !== '[object Object]'
        ? err.toString()
        : 'Erro inesperado do Supabase. Verifique suas tabelas, triggers e RLS políticas.';
    }
    return stringified;
  } catch {
    return String(err);
  }
}

export default function App() {
  const [view, setView] = useState<AuthView>('intro');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setView('authenticated');
        }
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { user: signedInUser, error: signInError } = await authService.signIn(email, password);
      
      if (signInError) {
        setError(formatError(signInError));
      } else if (signedInUser) {
        setUser(signedInUser);
        setView('authenticated');
        setSuccessMessage('Login efetuado com sucesso!');
      }
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { user: registeredUser, error: signUpError } = await authService.signUp(email, password, name);

      if (signUpError) {
        setError(formatError(signUpError));
      } else {
        // Supabase sometimes requires email verification, check if user is returned directly
        if (registeredUser) {
          setUser(registeredUser);
          setView('authenticated');
          setSuccessMessage('Cadastro concluído com sucesso!');
        } else {
          // If no user object is returned directly (e.g. email confirmation required)
          setView('login');
          setSuccessMessage('Cadastro realizado! Por favor, verifique sua caixa de entrada.');
        }
      }
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    setActionLoading(true);
    try {
      const { error: signOutError } = await authService.signOut();
      if (signOutError) {
        setError(formatError(signOutError));
      } else {
        setUser(null);
        setView('login');
        setSuccessMessage('Você saiu da sua conta com sucesso.');
      }
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans text-zinc-300" id="app-root-container">
      {/* Top Section */}
      <div className="w-full flex flex-col items-center" id="app-top-section">
        {/* Header / Brand Title - Only visible on login/register views for cleaner design */}
        {view !== 'authenticated' && view !== 'intro' && (
          <header className="text-center mb-8" id="app-main-header">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-4" id="app-badge">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              Evolução Consciente
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight" id="app-main-title">
              Despertar Espiritualidade
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2.5 max-w-sm mx-auto leading-relaxed" id="app-main-desc">
              Sua jornada de autoconhecimento, frequências sonoras e meditação profunda.
            </p>
          </header>
        )}

        {/* Connection status banner - Only visible on login/register view for clean logged-in dashboard experience */}
        {view !== 'authenticated' && view !== 'intro' && (
          <EnvConfigAlert />
        )}

        {/* Main interactive area */}
        <main className={`w-full transition-all duration-300 ${view === 'authenticated' ? 'max-w-5xl' : view === 'intro' ? 'max-w-2xl' : 'max-w-md'}`} id="app-main-content">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24" id="app-loading-state">
              <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Carregando portal sagrado...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {view === 'intro' && (
                <IntroScreen
                  key="intro"
                  onNavigateToLogin={() => {
                    clearMessages();
                    setView('login');
                  }}
                  onNavigateToRegister={() => {
                    clearMessages();
                    setView('register');
                  }}
                />
              )}

              {view === 'login' && (
                <LoginScreen
                  key="login"
                  onSignIn={handleSignIn}
                  onNavigateToRegister={() => {
                    clearMessages();
                    setView('register');
                  }}
                  onNavigateToIntro={() => {
                    clearMessages();
                    setView('intro');
                  }}
                  loading={actionLoading}
                  error={error}
                  successMessage={successMessage}
                  clearMessages={clearMessages}
                />
              )}

              {view === 'register' && (
                <RegisterScreen
                  key="register"
                  onSignUp={handleSignUp}
                  onNavigateToLogin={() => {
                    clearMessages();
                    setView('login');
                  }}
                  onNavigateToIntro={() => {
                    clearMessages();
                    setView('intro');
                  }}
                  loading={actionLoading}
                  error={error}
                  successMessage={successMessage}
                  clearMessages={clearMessages}
                />
              )}

              {view === 'authenticated' && user && (
                <WelcomeScreen
                  key="welcome"
                  user={user}
                  onSignOut={handleSignOut}
                  loading={actionLoading}
                  onUpdateUserSession={(updatedUser) => setUser(updatedUser)}
                />
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Footer - Hide on authenticated to prevent duplication under bottom navigations */}
      {view !== 'authenticated' && (
        <footer className="text-center text-[11px] text-zinc-600 mt-12 font-medium" id="app-footer">
          <p>&copy; {new Date().getFullYear()} Despertar Espiritualidade. Todos os direitos reservados.</p>
        </footer>
      )}
    </div>
  );
}
