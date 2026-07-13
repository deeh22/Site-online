import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, RefreshCw, KeyRound, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from '../lib/authService';
import GoogleGuideModal from './GoogleGuideModal';

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onNavigateToRegister: () => void;
  onNavigateToIntro?: () => void;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

const formatDisplayError = (err: any): string => {
  if (!err) return '';
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (trimmed === '{}' || trimmed === '[object Object]') {
      return 'Erro inesperado. Por favor, verifique seus dados ou use o modo Simulação Offline.';
    }
    return err;
  }
  if (err.message && typeof err.message === 'string') {
    const trimmedMsg = err.message.trim();
    if (trimmedMsg === '{}' || trimmedMsg === '[object Object]') {
      return 'Erro do servidor Supabase (banco ou credenciais). Se persistir, use o modo Simulação Offline.';
    }
    return err.message;
  }
  try {
    const str = JSON.stringify(err);
    if (str === '{}' || str === '[object Object]') {
      return 'Erro inesperado do servidor. Por favor, use o modo Simulação Offline.';
    }
    return str;
  } catch {
    return String(err);
  }
};

export default function LoginScreen({
  onSignIn,
  onNavigateToRegister,
  onNavigateToIntro,
  loading,
  error,
  successMessage,
  clearMessages
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Recovery Password Sub-State
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  // Google Login State
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleGuideOpen, setIsGoogleGuideOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearMessages();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFormError('Por favor, insira o seu e-mail.');
      return;
    }
    if (!password) {
      setFormError('Por favor, insira a sua senha.');
      return;
    }

    await onSignIn(cleanEmail, password);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setFormError(null);
    clearMessages();
    try {
      const { user, error: oauthError } = await authService.signInWithGoogle();
      if (oauthError) {
        let msg = oauthError.message || 'Erro ao realizar login com o Google.';
        if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider')) {
          msg = 'O login com o Google não está ativo em seu projeto do Supabase. Gostaria de ver o guia de configuração ou utilizar a Simulação Offline?';
          setIsGoogleGuideOpen(true);
        }
        setFormError(msg);
      } else if (user) {
        // Redirecionamento é feito pelo pai (App.tsx)
        window.location.reload();
      }
    } catch (err: any) {
      let msg = err.message || 'Erro inesperado.';
      if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider')) {
        msg = 'O login com o Google não está ativo em seu projeto do Supabase. Gostaria de ver o guia de configuração ou utilizar a Simulação Offline?';
        setIsGoogleGuideOpen(true);
      }
      setFormError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRecoverPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);
    
    const cleanEmail = recoveryEmail.trim();
    if (!cleanEmail) {
      setRecoveryError('Por favor, digite seu e-mail cadastrado.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const { error: recError, successMessage: recSuccess } = await authService.recoverPassword(cleanEmail);
      if (recError) {
        setRecoveryError(recError.message || 'Erro ao processar recuperação de senha.');
      } else {
        setRecoverySuccess(recSuccess || 'E-mail de recuperação enviado com sucesso!');
        setRecoveryEmail('');
      }
    } catch (err: any) {
      setRecoveryError(err.message || 'Erro inesperado ao recuperar a senha.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <motion.div
      id="login-screen-wrapper"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto bg-zinc-950 border border-amber-500/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative backdrop-blur-md"
    >
      {/* Botão sutil de voltar para a intro */}
      {onNavigateToIntro && (
        <button
          id="btn-back-to-intro"
          onClick={onNavigateToIntro}
          className="absolute top-6 left-6 text-zinc-500 hover:text-amber-500 transition-colors p-1.5 rounded-xl hover:bg-zinc-900/30 flex items-center justify-center cursor-pointer group"
          title="Voltar ao início"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      <div className="p-8 sm:p-10 pt-14" id="login-card-body">
        
        <AnimatePresence mode="wait">
          {!isRecovering ? (
            <motion.div
              key="login-form-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="text-center mb-8" id="login-header">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-900 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-500" id="login-logo">
                  <LogIn className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide" id="login-title">Conectar-se</h2>
                <p className="text-xs text-zinc-500 mt-2" id="login-subtitle">Retome sua jornada de evolução consciente.</p>
              </div>

              {/* Alertas de Erro */}
              {(error || formError) && (() => {
                const displayErrorString = formError || formatDisplayError(error);
                const lowerError = displayErrorString.toLowerCase();
                const isProviderError = lowerError.includes('não está ativo') || lowerError.includes('provider is not enabled') || lowerError.includes('unsupported provider');

                return (
                  <motion.div
                    id="login-error-alert"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-950/10 border border-red-900/30 rounded-2xl flex items-start gap-3 text-xs text-red-200"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1 bg-transparent">
                      <span className="font-bold text-red-300">Aviso do Templo</span>
                      <p className="text-red-400 leading-relaxed">{displayErrorString}</p>
                      
                      {isProviderError && (
                        <div className="pt-2 border-t border-red-900/10 mt-1 space-y-2 bg-transparent">
                          <p className="text-[10px] text-zinc-400 leading-relaxed">
                            Siga o nosso guia passo a passo para habilitar o login social com Google em seu projeto Supabase.
                          </p>
                          <button
                            id="btn-open-google-guide-err"
                            type="button"
                            onClick={() => setIsGoogleGuideOpen(true)}
                            className="px-2.5 py-1 bg-amber-500 text-black rounded-lg font-bold text-[9px] uppercase tracking-wider hover:bg-amber-400 transition-colors cursor-pointer"
                          >
                            Configurar Google no Supabase 🔑
                          </button>
                        </div>
                      )}

                      {error && !isProviderError && (
                        <div className="pt-2.5 border-t border-red-900/15 mt-1.5 space-y-2 bg-transparent">
                          <p className="text-[10px] text-zinc-400 leading-relaxed">
                            Caso seu projeto do Supabase ainda esteja sem as tabelas criadas ou possua erros de conexão/credenciais, você pode alternar para a <strong>Simulação Local Offline</strong> para testar todas as funcionalidades instantaneamente!
                          </p>
                          <button
                            id="btn-force-simulation-mode-login"
                            type="button"
                            onClick={() => {
                              authService.isMock = true;
                              window.location.reload();
                            }}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Ativar Simulação Local ⚡
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Alerta de Sucesso */}
              {successMessage && (
                <motion.div
                  id="login-success-alert"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
                {/* Email Field */}
                <div id="email-field-container">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2" htmlFor="email-input">
                    E-mail de Acesso
                  </label>
                  <div className="relative" id="email-input-wrapper">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600 focus-within:text-amber-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email-input"
                      type="email"
                      required
                      disabled={loading || googleLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu-email@dominio.com"
                      className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all duration-300 disabled:opacity-50 placeholder-zinc-700"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div id="password-field-container">
                  <div className="flex justify-between items-center mb-2" id="password-header-row">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest" htmlFor="password-input">
                      Senha Sagrada
                    </label>
                    <button
                      type="button"
                      id="btn-forgot-pwd"
                      onClick={() => {
                        clearMessages();
                        setIsRecovering(true);
                      }}
                      className="text-[10px] text-zinc-500 hover:text-amber-500 transition-colors font-medium cursor-pointer"
                    >
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative" id="password-input-wrapper">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={loading || googleLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all duration-300 disabled:opacity-50 placeholder-zinc-700"
                    />
                    <button
                      id="toggle-password-visibility"
                      type="button"
                      tabIndex={-1}
                      disabled={loading || googleLoading}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-600 hover:text-amber-500 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button - Ouro de Destaque */}
                <button
                  id="btn-entrar"
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-amber-950/20 focus:outline-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" id="login-spinner" />
                  ) : (
                    <>
                      <span>Entrar</span>
                      <LogIn className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6" id="login-divider">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-900"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-zinc-950 px-3.5 text-zinc-600 font-bold tracking-widest">ou</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                id="btn-google-login"
                type="button"
                disabled={loading || googleLoading}
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 bg-black hover:bg-zinc-900 text-zinc-300 border border-zinc-900 hover:border-amber-500/20 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                ) : (
                  <>
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" className="opacity-80"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="currentColor" className="opacity-70"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="currentColor" className="opacity-95"/>
                    </svg>
                    <span>Entrar com o Google</span>
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="recovery-form-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Recovery Header */}
              <div className="text-center mb-8" id="recovery-header">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-900 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-500" id="recovery-logo">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide" id="recovery-title">Recuperar Senha</h2>
                <p className="text-xs text-zinc-500 mt-2" id="recovery-subtitle">Instruções para redefinir sua credencial serão enviadas.</p>
              </div>

              {/* Recovery Alerts */}
              {recoveryError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-red-950/10 border border-red-900/30 rounded-2xl flex items-start gap-3 text-xs text-red-200"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">{recoveryError}</div>
                </motion.div>
              )}

              {recoverySuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200"
                >
                  <span>{recoverySuccess}</span>
                </motion.div>
              )}

              {/* Recovery Form */}
              <form onSubmit={handleRecoverPasswordSubmit} className="space-y-5" id="recovery-form">
                <div id="rec-email-field-container">
                  <label className="block text-[10px] font-bo
