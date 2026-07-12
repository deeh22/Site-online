import React, { useState } from 'react';
import { User, LogOut, KeyRound, UserPen, Award, Mail, Sparkles, X, Shield, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { authService } from '../lib/authService';

interface UserProfileProps {
  user: UserType;
  onSignOut: () => Promise<void>;
  onUpdateUserSession: (updatedUser: UserType) => void;
}

export default function UserProfile({ user, onSignOut, onUpdateUserSession }: UserProfileProps) {
  // Modais State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Edit Name State
  const [editName, setEditName] = useState(user.name);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getPlanName = (level: number) => {
    if (level === 3) return 'Plano Supremo (Nível 3)';
    if (level === 2) return 'Senda Interior (Nível 2)';
    return 'Despertar Inicial (Nível 1)';
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    const cleanName = editName.trim();
    if (!cleanName) {
      setEditError('Por favor, informe seu nome espiritual.');
      return;
    }

    setEditLoading(true);
    try {
      // Atualiza no backend (Supabase / Mock)
      const { error } = await authService.updateProfileName(user.id, cleanName);
      if (error) {
        setEditError(error.message || 'Erro ao salvar alteração.');
      } else {
        setEditSuccess('Perfil atualizado com sucesso!');
        // Atualiza a sessão no App.tsx
        onUpdateUserSession({
          ...user,
          name: cleanName
        });
        setTimeout(() => setIsEditingProfile(false), 1500);
      }
    } catch (err: any) {
      setEditError(err.message || 'Erro inesperado.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword) {
      setPassError('Por favor, insira a senha atual.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('A nova senha sagrada precisa de no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('A confirmação não confere com a nova senha.');
      return;
    }

    setPassLoading(true);
    try {
      const { error } = await authService.changePassword(user.email, currentPassword, newPassword);
      if (error) {
        setPassError(error.message || 'Senha atual inválida ou erro no processamento.');
      } else {
        setPassSuccess('Sua senha sagrada foi redefinida com êxito!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setIsChangingPassword(false), 2000);
      }
    } catch (err: any) {
      setPassError(err.message || 'Erro inesperado.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 pb-12"
      id="user-profile-wrapper"
    >
      {/* Modais de Edição e Senha */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            id="edit-profile-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              id="edit-profile-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center mb-6" id="edit-modal-header">
                <h4 className="text-lg font-serif font-bold text-white tracking-wide">Editar Identidade</h4>
                <button
                  id="close-edit-modal"
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-red-950/10 border border-red-900/30 text-xs text-red-400 rounded-xl mb-4 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 rounded-xl mb-4 flex gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>{editSuccess}</span>
                </div>
              )}

              <form onSubmit={handleEditProfileSubmit} className="space-y-4" id="edit-profile-form">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Nome Espiritual</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-2xl hover:from-amber-500 hover:to-amber-400 active:scale-98 transition-all cursor-pointer"
                >
                  {editLoading ? 'Salvando...' : 'Atualizar Dados'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isChangingPassword && (
          <motion.div
            id="change-password-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              id="change-password-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center mb-6" id="password-modal-header">
                <h4 className="text-lg font-serif font-bold text-white tracking-wide">Mudar Senha Sagrada</h4>
                <button
                  id="close-password-modal"
                  onClick={() => setIsChangingPassword(false)}
                  className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {passError && (
                <div className="p-3 bg-red-950/10 border border-red-900/30 text-xs text-red-400 rounded-xl mb-4 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 rounded-xl mb-4 flex gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4" id="change-password-form">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Senha Atual</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Nova Senha</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      required
                      placeholder="Mín. 6 dígitos"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Confirmar Nova Senha</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-2xl hover:from-amber-500 hover:to-amber-400 active:scale-98 transition-all cursor-pointer"
                >
                  {passLoading ? 'Redefinindo...' : 'Alterar Senha'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1 text-left">
        <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Meu Altar</h2>
        <p className="text-xs text-zinc-500">Gerencie sua identidade iniciática e níveis de sintonia no portal.</p>
      </div>

      {/* Cartão de Identidade Principal */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 flex flex-col items-center sm:flex-row gap-6 sm:gap-8 relative overflow-hidden" id="profile-identity-card">
        {/* Luz de fundo */}
        <div className="absolute top-0 left-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Avatar místico elegante */}
        <div className="relative shrink-0" id="profile-avatar-container">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 to-amber-300 rounded-full blur-[2px] opacity-40 animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-zinc-950 border border-amber-500/30 flex items-center justify-center relative z-10 font-serif font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            {getInitials(user.name)}
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-black rounded-full border border-zinc-950 z-20">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
          </div>
        </div>

        {/* Informações de Perfil */}
        <div className="flex-1 text-center sm:text-left space-y-3" id="profile-metadata">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl text-white tracking-wide">{user.name}</h3>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500">
              <Mail className="w-3.5 h-3.5 text-zinc-600" />
              <span>{user.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1" id="profile-tags">
            {/* Tag Cargo */}
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-zinc-500" />
              <span>{user.role}</span>
            </span>

            {/* Tag Nível */}
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[9px] uppercase tracking-widest font-bold text-amber-500 flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>Acesso Nível {user.accessLevel}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Caixa Informativa de Benefícios do Nível de Acesso */}
      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl text-left space-y-4" id="profile-access-card">
        <h4 className="font-serif text-sm font-semibold text-white tracking-wide flex items-center gap-2">
          <Award className="w-4.5 h-4.5 text-amber-500" />
          <span>Sua Sintonização: {getPlanName(user.accessLevel)}</span>
        </h4>
        <div className="text-xs text-zinc-400 space-y-2 leading-relaxed font-sans">
          <p>Seu nível de acesso atual lhe garante os seguintes portais do aplicativo:</p>
          <ul className="space-y-1.5 pl-4 list-disc text-zinc-500">
            <li>Acesso completo à aba de <strong>Biblioteca</strong> (Até Livros Nível {user.accessLevel})</li>
            <li>Acesso completo aos <strong>Áudios e Mantras</strong> de sintonia (Até Áudios Nível {user.accessLevel})</li>
            <li>Acesso livre às lições da <strong>Escola de Mistérios</strong> correspondentes ao seu grau (Cursos Nível {user.accessLevel})</li>
          </ul>
        </div>
      </div>

      {/* Grid de Ações do Perfil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="profile-actions-grid">
        <button
          id="btn-edit-profile-open"
          onClick={() => {
            setEditName(user.name);
            setEditError(null);
            setEditSuccess(null);
            setIsEditingProfile(true);
          }}
          className="p-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-amber-500/20 text-zinc-300 hover:text-white rounded-2xl flex items-center justify-between transition-all duration-200 text-xs font-semibold cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <UserPen className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
            <span>Editar Meu Nome</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-zinc-700 group-hover:text-amber-500/40 transition-colors" />
        </button>

        <button
          id="btn-change-password-open"
          onClick={() => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPassError(null);
            setPassSuccess(null);
            setIsChangingPassword(true);
          }}
          className="p-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-amber-500/20 text-zinc-300 hover:text-white rounded-2xl flex items-center justify-between transition-all duration-200 text-xs font-semibold cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
            <span>Mudar Senha Sagrada</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-zinc-700 group-hover:text-amber-500/40 transition-colors" />
        </button>
      </div>

      {/* Relatório de Prompts */}
      <div className="p-6 bg-zinc-950 border border-zinc-900 hover:border-amber-500/10 rounded-3xl text-left space-y-4 relative overflow-hidden group transition-all" id="profile-prompts-pdf-card">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-serif text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Lock className="w-4.5 h-4.5 text-amber-500" />
              <span>Histórico de Prompts do Projeto (PDF)</span>
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-md">
              Faça o download do relatório completo contendo todos os prompts e etapas utilizadas para o desenvolvimento deste portal.
            </p>
          </div>
          <a
            href="/prompts_despertar_espiritualidade.pdf"
            download="prompts_despertar_espiritualidade.pdf"
            id="btn-download-prompts-pdf"
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-[10px] uppercase tracking-wider rounded-xl hover:from-amber-500 hover:to-amber-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/20 self-start sm:self-center"
          >
            <span>Baixar PDF</span>
          </a>
        </div>
      </div>

      {/* Botão de Logout de Destaque */}
      <div className="pt-4 border-t border-zinc-900/60" id="profile-footer-logout">
        <button
          id="btn-desconectar"
          onClick={onSignOut}
          className="w-full py-4 bg-black hover:bg-red-950/10 border border-zinc-900 hover:border-red-900/30 text-zinc-500 hover:text-red-400 font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Encerrar Conexão</span>
        </button>
      </div>
    </motion.div>
  );
}
