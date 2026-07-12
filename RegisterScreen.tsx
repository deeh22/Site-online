import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, UserPlus, AlertCircle, Sparkles, CheckCircle2, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { authService } from '../lib/authService';

interface RegisterScreenProps {
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
  onNavigateToLogin: () => void;
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
      return 'Erro inesperado no cadastro. Por favor, verifique se seu e-mail já existe ou use o modo Simulação Offline.';
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

export default function RegisterScreen({
  onSignUp,
  onNavigateToLogin,
  onNavigateToIntro,
  loading,
  error,
  successMessage,
  clearMessages
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearMessages();

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setFormError('Por favor, informe o seu nome espiritual.');
      return;
    }
    if (!cleanEmail) {
      setFormError('Por favor, informe o seu e-mail de acesso.');
      return;
    }
    if (password.length < 6) {
      setFormError('Sua senha sagrada precisa de no mínimo 6 caracteres.');
      return;
    }

    await onSignUp(cleanEmail, password, cleanName);
  };

  return (
    <motion.div
      id="register-screen-wrapper"
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

      <div className="p-8 sm:p-10 pt-14" id="register-card-body">
        {/* Header */}
        <div className="text-center mb-8" id="register-header">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-900 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-500" id="register-logo">
            <UserPlus className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide" id="register-title">Criar Conta</h2>
          <p className="text-xs text-zinc-500 mt-2" id="register-subtitle">Inicie sua expansão de consciência no templo.</p>
        </div>

        {/* Alerta de Erro */}
        {(error || formError) && (() => {
          const displayErrorString = formError || formatDisplayError(error);
          return (
            <motion.div
              id="register-error-alert"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-950/10 border border-red-900/30 rounded-2xl flex items-start gap-3 text-xs text-red-200"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1 bg-transparent">
                <span className="font-bold text-red-300">Aviso do Templo</span>
                <p className="text-red-400 leading-relaxed">{displayErrorString}</p>

                {error && (
                  <div className="pt-2.5 border-t border-red-900/15 mt-1.5 space-y-2 bg-transparent">
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Caso seu projeto do Supabase ainda esteja sem as tabelas criadas ou possua erros de conexão/credenciais, você pode alternar para a <strong>Simulação Local Offline</strong> para cadastrar-se e testar as funcionalidades imediatamente!
                    </p>
                    <button
                      id="btn-force-simulation-mode-register"
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
            id="register-success-alert"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
          {/* Nome */}
          <div id="name-field-container">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2" htmlFor="name-input">
              Nome de Aluno / Espiritual
            </label>
            <div className="relative" id="name-input-wrapper">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="name-input"
                type="text"
                required
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Gabriel Silva"
                className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all duration-300 disabled:opacity-50 placeholder-zinc-700"
              />
            </div>
          </div>

          {/* Email */}
          <div id="reg-email-field-container">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2" htmlFor="reg-email-input">
              Seu Melhor E-mail
            </label>
            <div className="relative" id="reg-email-input-wrapper">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reg-email-input"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email@dominio.com"
                className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all duration-300 disabled:opacity-50 placeholder-zinc-700"
              />
            </div>
          </div>

          {/* Senha */}
          <div id="reg-password-field-container">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2" htmlFor="reg-password-input">
              Senha de Acesso (Mín. 6 dígitos)
            </label>
            <div className="relative" id="reg-password-input-wrapper">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reg-password-input"
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all duration-300 disabled:opacity-50 placeholder-zinc-700"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-cadastrar-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-amber-950/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>Cadastrar</span>
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-900/60 text-center" id="register-footer">
          <p className="text-xs text-zinc-500">
            Já possui cadastro?{' '}
            <button
              id="link-login"
              onClick={onNavigateToLogin}
              disabled={loading}
              className="text-amber-500 hover:text-amber-400 font-bold hover:underline transition-colors cursor-pointer"
            >
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
