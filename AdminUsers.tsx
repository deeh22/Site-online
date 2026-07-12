import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldAlert, Award, Trash2, ArrowUpDown, ChevronDown, 
  CheckCircle2, AlertCircle, X, Shield, Sparkles, Key, Calendar, 
  PlusCircle, UserPlus, Clock, FileText, Volume2, GraduationCap, ShieldCheck, HelpCircle, Lock, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { authService } from '../lib/authService';
import { dataService, Plan, PDFBook, Audiobook, Course, UserManualPermissions } from '../lib/dataService';
import SqlGuideModal from './SqlGuideModal';

interface AdminUsersProps {
  currentUser: UserType;
}

export default function AdminUsers({ currentUser }: AdminUsersProps) {
  const [profiles, setProfiles] = useState<UserType[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('Todos');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('Todos');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  
  // Feedbacks
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Confirmação de exclusão modal
  const [deletingUser, setDeletingUser] = useState<UserType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Controle de Liberação de Acesso Manual
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<UserType | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [customDays, setCustomDays] = useState<string>('30');
  const [accessLoading, setAccessLoading] = useState(false);

  // Estados para permissões granulares
  const [isGranularMode, setIsGranularMode] = useState(false);
  const [allPdfs, setAllPdfs] = useState<PDFBook[]>([]);
  const [allAudiobooks, setAllAudiobooks] = useState<Audiobook[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]); // list of IDs or 'all'
  const [selectedAudiobooks, setSelectedAudiobooks] = useState<string[]>([]); // list of IDs or 'all'
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]); // list of IDs or 'all'
  const [isPermanent, setIsPermanent] = useState(false);
  const [expDateString, setExpDateString] = useState('');

  // Carrega perfis e dados de conteúdos
  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { profiles: list, error } = await authService.getAllProfiles();
      if (error) {
        setErrorMsg(error.message);
        if (list && list.length > 0) {
          setProfiles(list);
        }
      } else {
        setProfiles(list);
      }
      const activePlans = dataService.getPlans();
      setPlans(activePlans);
      if (activePlans.length > 0) {
        setSelectedPlanId(activePlans[0].id);
      }

      setAllPdfs(dataService.getPDFs());
      setAllAudiobooks(dataService.getAudiobooks());
      setAllCourses(dataService.getCourses());
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao carregar os perfis de usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateRoleAndLevel = async (userId: string, role: 'ADMIN' | 'USER', level: 1 | 2 | 3) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await authService.updateProfileRoleAndLevel(userId, role, level);
      if (error) {
        setErrorMsg(error.message || 'Erro ao atualizar dados do usuário.');
      } else {
        setSuccessMsg('Nível de acesso e cargo atualizados com sucesso!');
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setDeleteLoading(true);

    try {
      const { error } = await authService.deleteProfile(deletingUser.id);
      if (error) {
        setErrorMsg(error.message || 'Erro ao excluir perfil. Verifique as políticas de RLS.');
      } else {
        setSuccessMsg(`O perfil de ${deletingUser.name} foi removido com sucesso.`);
        setDeletingUser(null);
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado ao excluir perfil.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Abre modal de concessão de acesso carregando permissões atuais
  const handleOpenAccessModal = (user: UserType) => {
    setSelectedUserForAccess(user);
    const existing = dataService.getUserManualPermissions(user.id);
    
    if (existing) {
      setIsGranularMode(true);
      setSelectedPdfs(existing.allowedPdfs);
      setSelectedAudiobooks(existing.allowedAudiobooks);
      setSelectedCourses(existing.allowedCourses);
      
      const perm = existing.expirationDate === 'permanent';
      setIsPermanent(perm);
      if (!perm) {
        // Corta para YYYY-MM-DD
        setExpDateString(existing.expirationDate.split('T')[0]);
      } else {
        setExpDateString('');
      }
    } else {
      setIsGranularMode(false);
      setSelectedPdfs([]);
      setSelectedAudiobooks([]);
      setSelectedCourses([]);
      setIsPermanent(false);
      setExpDateString('');
      setCustomDays('30');
    }
  };

  // Salvar acesso manual ou permissões granulares
  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAccess) return;

    setAccessLoading(true);
    try {
      if (isGranularMode) {
        // Salva as permissões granulares
        let finalExp = 'permanent';
        if (!isPermanent) {
          if (!expDateString) {
            throw new Error('Por favor, informe uma data de vencimento válida.');
          }
          finalExp = new Date(expDateString).toISOString();
        }

        const perms: UserManualPermissions = {
          userId: selectedUserForAccess.id,
          allowedPdfs: selectedPdfs,
          allowedAudiobooks: selectedAudiobooks,
          allowedCourses: selectedCourses,
          expirationDate: finalExp
        };

        dataService.saveUserManualPermissions(perms);
        setSuccessMsg(`Permissões granulares atualizadas para ${selectedUserForAccess.name}!`);
      } else {
        // Salva plano inteiro clássico
        if (!selectedPlanId) {
          throw new Error('Por favor, selecione um plano.');
        }
        const days = parseInt(customDays, 10) || 30;
        dataService.grantManualAccess(
          selectedUserForAccess.id,
          selectedUserForAccess.email,
          selectedUserForAccess.name,
          selectedPlanId,
          days
        );
        // Remove quaisquer permissões individuais redundantes
        dataService.deleteUserManualPermissions(selectedUserForAccess.id);
        setSuccessMsg(`Acesso manual ao plano liberado com sucesso para ${selectedUserForAccess.name}!`);
      }

      setSelectedUserForAccess(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conceder acesso manual.');
    } finally {
      setAccessLoading(false);
    }
  };

  // Revogar todos os acessos
  const handleRevokeAllAccess = () => {
    if (!selectedUserForAccess) return;
    if (confirm(`Deseja mesmo revogar TODOS os acessos manuais de ${selectedUserForAccess.name}?`)) {
      setAccessLoading(true);
      try {
        // Deleta as compras manuais (preço = 0)
        const purchases = dataService.getPurchases().filter(p => p.userId === selectedUserForAccess.id && p.price === 0);
        purchases.forEach(p => dataService.deletePurchase(p.id));
        
        // Deleta as permissões granulares
        dataService.deleteUserManualPermissions(selectedUserForAccess.id);
        
        setSuccessMsg(`Acessos manuais de ${selectedUserForAccess.name} revogados com sucesso!`);
        setSelectedUserForAccess(null);
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err: any) {
        setErrorMsg('Erro ao revogar acessos manuais.');
      } finally {
        setAccessLoading(false);
      }
    }
  };

  // Helpers de seleção múltipla granular
  const toggleSelectPdf = (id: string) => {
    if (selectedPdfs.includes('all')) {
      setSelectedPdfs([id]);
    } else if (selectedPdfs.includes(id)) {
      setSelectedPdfs(selectedPdfs.filter(x => x !== id));
    } else {
      setSelectedPdfs([...selectedPdfs, id]);
    }
  };

  const toggleSelectAllPdfs = () => {
    if (selectedPdfs.includes('all')) {
      setSelectedPdfs([]);
    } else {
      setSelectedPdfs(['all']);
    }
  };

  const toggleSelectAudiobook = (id: string) => {
    if (selectedAudiobooks.includes('all')) {
      setSelectedAudiobooks([id]);
    } else if (selectedAudiobooks.includes(id)) {
      setSelectedAudiobooks(selectedAudiobooks.filter(x => x !== id));
    } else {
      setSelectedAudiobooks([...selectedAudiobooks, id]);
    }
  };

  const toggleSelectAllAudiobooks = () => {
    if (selectedAudiobooks.includes('all')) {
      setSelectedAudiobooks([]);
    } else {
      setSelectedAudiobooks(['all']);
    }
  };

  const toggleSelectCourse = (id: string) => {
    if (selectedCourses.includes('all')) {
      setSelectedCourses([id]);
    } else if (selectedCourses.includes(id)) {
      setSelectedCourses(selectedCourses.filter(x => x !== id));
    } else {
      setSelectedCourses([...selectedCourses, id]);
    }
  };

  const toggleSelectAllCourses = () => {
    if (selectedCourses.includes('all')) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(['all']);
    }
  };

  // Filtros
  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'Todos' || p.role === selectedRoleFilter;
    const matchesLevel = selectedLevelFilter === 'Todos' || p.accessLevel.toString() === selectedLevelFilter;
    return matchesSearch && matchesRole && matchesLevel;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 text-left font-sans"
      id="admin-users-wrapper"
    >
      {/* Modal de confirmação de exclusão */}
      <AnimatePresence>
        {deletingUser && (
          <motion.div
            id="delete-user-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              id="delete-user-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-red-900/30 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center mb-4" id="delete-modal-header">
                <h4 className="text-lg font-serif font-bold text-red-400 tracking-wide">Excluir Aluno</h4>
                <button
                  id="close-delete-modal"
                  onClick={() => setDeletingUser(null)}
                  className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4" id="delete-modal-body">
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Tem certeza de que deseja banir e excluir permanentemente a conta de <strong className="text-white">{deletingUser.name}</strong>? Esta ação removerá o acesso a todo o acervo.
                </p>

                <div className="flex gap-3 pt-2" id="delete-modal-actions">
                  <button
                    id="btn-confirm-delete-user"
                    onClick={handleDeleteUserConfirm}
                    disabled={deleteLoading}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-2xl active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {deleteLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </button>
                  <button
                    id="btn-cancel-delete-user"
                    onClick={() => setDeletingUser(null)}
                    disabled={deleteLoading}
                    className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-2xl active:scale-98 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Concessão de Acesso Manual com Abas para Granularidade */}
      <AnimatePresence>
        {selectedUserForAccess && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" id="grant-access-modal-overlay">
            <motion.div
              id="grant-access-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl text-left my-8"
            >
              <div className="flex justify-between items-center mb-4" id="grant-access-header">
                <div>
                  <h4 className="text-base font-serif font-bold text-white tracking-wide">Configurar Permissões de Acesso</h4>
                  <p className="text-[10px] text-zinc-500">Sintonize os acessos do iniciante de forma global ou individual.</p>
                </div>
                <button
                  id="close-access-modal"
                  onClick={() => setSelectedUserForAccess(null)}
                  className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informações Básicas do Aluno */}
              <div className="p-3.5 bg-zinc-900/40 rounded-2xl border border-zinc-900 text-xs flex justify-between items-center mb-4">
                <div className="text-left bg-transparent">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Iniciado Beneficiário</span>
                  <span className="block text-white font-bold text-sm mt-0.5">{selectedUserForAccess.name}</span>
                  <span className="block text-[10px] text-zinc-500 font-mono">{selectedUserForAccess.email}</span>
                </div>
                <div className="text-right bg-transparent">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Nível Atual</span>
                  <span className="block text-amber-500 font-bold text-xs">Grau Nível {selectedUserForAccess.accessLevel}</span>
                </div>
              </div>

              {/* Seletor de Tipo de Liberação */}
              <div className="flex gap-2 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-900 mb-4" id="modal-access-tabs">
                <button
                  type="button"
                  onClick={() => setIsGranularMode(false)}
                  className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all cursor-pointer ${
                    !isGranularMode
                      ? 'bg-amber-500 text-black font-extrabold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Liberação Global (Planos)
                </button>
                <button
                  type="button"
                  onClick={() => setIsGranularMode(true)}
                  className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all cursor-pointer ${
                    isGranularMode
                      ? 'bg-amber-500 text-black font-extrabold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Controle Individual (Conteúdo)
                </button>
              </div>

              <form onSubmit={handleGrantAccess} className="space-y-4" id="grant-access-form">
                
                {/* MODO PLANO GLOBAL */}
                {!isGranularMode ? (
                  <div className="space-y-4" id="mode-global-fields">
                    {/* Seleção de Plano */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Escolha o Plano de Acesso</label>
                      <select
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none cursor-pointer"
                        required={!isGranularMode}
                      >
                        <option value="" disabled>Selecione um plano...</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Duração personalizada */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Duração do Acesso (Quantidade de Dias)</label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {['7', '15', '30', '45', '60', '90', '365'].map((d) => (
                          <button
                            type="button"
                            key={d}
                            onClick={() => setCustomDays(d)}
                            className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              customDays === d
                                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                                : 'bg-black hover:bg-zinc-900 border-zinc-900 text-zinc-400'
                            }`}
                          >
                            {d}d
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-xs font-medium font-sans">Dias personalizados:</span>
                        <input
                          type="number"
                          min="1"
                          max="3650"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          className="w-20 px-3 py-1.5 bg-black border border-zinc-900 rounded-xl text-white font-bold font-mono text-xs outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MODO GRANULAR INDIVIDUAL (Checkboxes de PDFs, Audiobooks, Cursos) */
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 text-left" id="mode-granular-fields">
                    
                    {/* 1. SELEÇÃO DE E-BOOKS PDF */}
                    <div className="p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Liberar E-books PDF</span>
                        </span>
                        <button
                          type="button"
                          onClick={toggleSelectAllPdfs}
                          className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white cursor-pointer"
                        >
                          {selectedPdfs.includes('all') ? 'Desmarcar Todos' : 'Liberar Todos'}
                        </button>
                      </div>

                      {!selectedPdfs.includes('all') && (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {allPdfs.map(pdf => {
                            const active = selectedPdfs.includes(pdf.id);
                            return (
                              <button
                                type="button"
                                key={pdf.id}
                                onClick={() => toggleSelectPdf(pdf.id)}
                                className={`px-3 py-2 rounded-xl text-left border text-xs transition-all flex justify-between items-center cursor-pointer ${
                                  active 
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                    : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <span>{pdf.title} ({pdf.author})</span>
                                {active && <Check className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {selectedPdfs.includes('all') && (
                        <div className="p-2.5 bg-amber-500/[0.02] border border-dashed border-amber-500/10 rounded-xl text-center text-[10px] text-amber-500 italic font-mono">
                          Todos os E-books PDFs do portal liberados
                        </div>
                      )}
                    </div>

                    {/* 2. SELEÇÃO DE AUDIOBOOKS */}
                    <div className="p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Liberar Audiobooks / Mantras</span>
                        </span>
                        <button
                          type="button"
                          onClick={toggleSelectAllAudiobooks}
                          className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white cursor-pointer"
                        >
                          {selectedAudiobooks.includes('all') ? 'Desmarcar Todos' : 'Liberar Todos'}
                        </button>
                      </div>

                      {!selectedAudiobooks.includes('all') && (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {allAudiobooks.map(aud => {
                            const active = selectedAudiobooks.includes(aud.id);
                            return (
                              <button
                                type="button"
                                key={aud.id}
                                onClick={() => toggleSelectAudiobook(aud.id)}
                                className={`px-3 py-2 rounded-xl text-left border text-xs transition-all flex justify-between items-center cursor-pointer ${
                                  active 
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                    : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <span>{aud.title} ({aud.duration})</span>
                                {active && <Check className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {selectedAudiobooks.includes('all') && (
                        <div className="p-2.5 bg-amber-500/[0.02] border border-dashed border-amber-500/10 rounded-xl text-center text-[10px] text-amber-500 italic font-mono">
                          Todos os Audiobooks & Frequências liberados
                        </div>
                      )}
                    </div>

                    {/* 3. SELEÇÃO DE CURSOS */}
                    <div className="p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Liberar Trilha de Cursos</span>
                        </span>
                        <button
                          type="button"
                          onClick={toggleSelectAllCourses}
                          className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white cursor-pointer"
                        >
                          {selectedCourses.includes('all') ? 'Desmarcar Todos' : 'Liberar Todos'}
                        </button>
                      </div>

                      {!selectedCourses.includes('all') && (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {allCourses.map(course => {
                            const active = selectedCourses.includes(course.id);
                            return (
                              <button
                                type="button"
                                key={course.id}
                                onClick={() => toggleSelectCourse(course.id)}
                                className={`px-3 py-2 rounded-xl text-left border text-xs transition-all flex justify-between items-center cursor-pointer ${
                                  active 
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                    : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <span>{course.title}</span>
                                {active && <Check className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {selectedCourses.includes('all') && (
                        <div className="p-2.5 bg-amber-500/[0.02] border border-dashed border-amber-500/10 rounded-xl text-center text-[10px] text-amber-500 italic font-mono">
                          Todos os Cursos de Ascensão liberados
                        </div>
                      )}
                    </div>

                    {/* VENCIMENTO DO ACESSO INDIVIDUAL */}
                    <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl space-y-3 text-left">
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-zinc-400">Vigência dos Conteúdos</span>
                      
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                          <input
                            type="checkbox"
                            checked={isPermanent}
                            onChange={(e) => {
                              setIsPermanent(e.target.checked);
                              if (e.target.checked) setExpDateString('');
                            }}
                            className="w-4 h-4 rounded bg-zinc-950 accent-amber-500"
                          />
                          <span>Acesso Permanente (Não Expira / Vitalício)</span>
                        </label>
                      </div>

                      {!isPermanent && (
                        <div>
                          <label className="block text-[9px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Escolher Data de Vencimento</label>
                          <input
                            type="date"
                            value={expDateString}
                            required={isGranularMode && !isPermanent}
                            onChange={(e) => setExpDateString(e.target.value)}
                            className="px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* BOTÕES DE CONFIRMAÇÃO / REVOGAÇÃO */}
                <div className="pt-3 flex flex-col gap-2.5" id="grant-access-actions">
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={accessLoading}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider rounded-2xl active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{accessLoading ? 'Concedendo...' : 'Sintonizar Permissões'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUserForAccess(null)}
                      className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Botão de Revogação de Acesso */}
                  <button
                    type="button"
                    onClick={handleRevokeAllAccess}
                    disabled={accessLoading}
                    className="w-full py-2.5 bg-red-950/20 border border-red-900/20 hover:bg-red-900/10 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Revogar Todos os Acessos Manuais</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-5" id="users-header-row">
        <div className="space-y-1 text-left">
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">Gerenciador de Alunos</h2>
          <p className="text-xs text-zinc-500">Controle permissões de cargos, egrégora de graus de acesso e liberação manual de planos temporários ou individuais.</p>
        </div>

        {/* Botoes de acao do cabecalho */}
        <div className="flex items-center gap-2 flex-wrap" id="users-header-actions">
          <button
            id="btn-open-sql-guide-direct"
            onClick={() => setIsSqlModalOpen(true)}
            className="px-4 py-2 bg-zinc-950 border border-zinc-900 hover:border-amber-500/20 text-xs font-bold text-amber-500 hover:text-amber-400 rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Script SQL do Supabase</span>
          </button>

          <button
            id="btn-reload-users"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-zinc-950 border border-zinc-900 hover:border-amber-500/20 text-xs font-bold text-zinc-400 hover:text-white rounded-2xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Aviso educativo sobre RLS do Supabase se retornar apenas 1 usuario no banco real */}
      {!loading && !authService.isMock && profiles.length <= 1 && (
        <div className="p-4 bg-zinc-950 border border-amber-500/10 rounded-2xl flex items-start gap-3 text-xs text-amber-200" id="rls-warning-alert">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-left">
            <span className="font-bold text-white block">Sintonia das Contas de Alunos</span>
            <p className="text-zinc-400 leading-relaxed">
              O banco de dados do Supabase está ativo. Se a contagem de usuários parecer incompleta ou mostrar apenas você, isso indica que as políticas de segurança (RLS) do Supabase ou os triggers automáticos de sincronização precisam ser aplicados no seu painel.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-1">
              Para corrigir isso e permitir que todas as contas passem direto e apareçam com precisão para o administrador, clique no botão <strong className="text-amber-500 font-semibold cursor-pointer hover:underline" onClick={() => setIsSqlModalOpen(true)}>Script SQL do Supabase</strong> ao lado, copie o código e execute-o uma vez no SQL Editor do seu painel do Supabase.
            </p>
          </div>
        </div>
      )}

      {/* Feedbacks de Operações */}
      {errorMsg && (
        <div className="p-4 bg-red-950/10 border border-red-900/30 text-xs text-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="users-error-alert">
          <div className="flex gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <p className="leading-relaxed text-left">{errorMsg}</p>
          </div>
          {errorMsg.includes('profiles') && (
            <button
              id="btn-open-sql-guide-from-alert"
              onClick={() => setIsSqlModalOpen(true)}
              className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/35 border border-red-500/40 text-[10px] font-bold text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
            >
              Script SQL do Supabase
            </button>
          )}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 rounded-2xl flex gap-2.5 animate-pulse" id="users-success-alert">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4" id="users-filter-bar">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            id="users-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all duration-300 placeholder-zinc-700"
          />
        </div>

        {/* Cargo Filter */}
        <div className="sm:col-span-3">
          <select
            id="users-role-filter"
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-zinc-400 hover:text-white text-xs outline-none cursor-pointer transition-all"
          >
            <option value="Todos">Cargo: Todos</option>
            <option value="ADMIN">Administradores</option>
            <option value="USER">Usuários</option>
          </select>
        </div>

        {/* Level Filter */}
        <div className="sm:col-span-3">
          <select
            id="users-level-filter"
            value={selectedLevelFilter}
            onChange={(e) => setSelectedLevelFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-zinc-400 hover:text-white text-xs outline-none cursor-pointer transition-all"
          >
            <option value="Todos">Grau: Todos</option>
            <option value="1">Nível 1 (Despertar)</option>
            <option value="2">Nível 2 (Senda Interior)</option>
            <option value="3">Nível 3 (Ascensão)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="border border-zinc-900 rounded-3xl overflow-hidden bg-zinc-950/40" id="users-table-container">
        {loading ? (
          <div className="text-center py-16" id="users-table-loading">
            <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs text-zinc-500">Recuperando egrégora de alunos...</span>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-16" id="users-table-empty">
            <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-xs text-zinc-500">Nenhum membro encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" id="admin-users-table">
              <thead>
                <tr className="border-b border-zinc-900 bg-black/40 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Aluno</th>
                  <th className="p-4">Cargo / Tipo</th>
                  <th className="p-4">Grau Espiritual</th>
                  <th className="p-4">Plano / Validade Ativa</th>
                  <th className="p-4 pr-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-xs">
                {filteredProfiles.map((p) => {
                  const isSelf = p.id === currentUser.id;
                  
                  // Detalhes da assinatura deste usuário no dataService
                  const sub = dataService.getUserSubscription(p.id);
                  const manualPerms = dataService.getUserManualPermissions(p.id);

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-zinc-900/10 transition-colors ${isSelf ? 'bg-amber-500/[0.01]' : ''}`}
                      id={`user-row-${p.id}`}
                    >
                      {/* Avatar e Nome */}
                      <td className="p-4 pl-6 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-serif font-bold text-amber-500">
                            {p.name ? p.name[0].toUpperCase() : '?'}
                          </div>
                          <div className="text-left">
                            <span className="block font-semibold text-white truncate max-w-[130px] sm:max-w-xs flex items-center gap-1.5">
                              {p.name}
                              {isSelf && (
                                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-500 rounded font-bold uppercase tracking-wider">Você</span>
                              )}
                            </span>
                            <span className="block text-[10px] text-zinc-500 font-mono truncate max-w-[130px] sm:max-w-xs">{p.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cargo Select */}
                      <td className="p-4">
                        <select
                          disabled={isSelf}
                          value={p.role}
                          onChange={(e) => handleUpdateRoleAndLevel(p.id, e.target.value as any, p.accessLevel)}
                          className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-900 rounded-xl focus:border-amber-500/40 text-zinc-300 outline-none text-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all"
                        >
                          <option value="USER font-sans">USER (Aluno)</option>
                          <option value="ADMIN font-sans">ADMIN (Gestor)</option>
                        </select>
                      </td>

                      {/* Grau de Acesso Select */}
                      <td className="p-4">
                        <select
                          disabled={isSelf}
                          value={p.accessLevel}
                          onChange={(e) => handleUpdateRoleAndLevel(p.id, p.role, parseInt(e.target.value, 10) as any)}
                          className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-900 rounded-xl focus:border-amber-500/40 text-zinc-300 outline-none text-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all"
                        >
                          <option value="1">Nível 1 (Despertar)</option>
                          <option value="2">Nível 2 (Senda Interior)</option>
                          <option value="3">Nível 3 (Ascensão)</option>
                        </select>
                      </td>

                      {/* Plano e Validade atual */}
                      <td className="p-4">
                        {manualPerms ? (
                          <div className="space-y-0.5 text-left">
                            <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded font-bold uppercase tracking-widest">
                              Customizado (Granular)
                            </span>
                            <span className="block text-[10px] text-zinc-500 font-mono">
                              {manualPerms.expirationDate === 'permanent' 
                                ? 'Acesso Permanente' 
                                : `Expira em: ${new Date(manualPerms.expirationDate).toLocaleDateString('pt-BR')}`
                              }
                            </span>
                          </div>
                        ) : sub ? (
                          <div className="space-y-0.5 text-left">
                            <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold uppercase tracking-widest ${
                              sub.isExpired 
                                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            }`}>
                              {sub.planName}
                            </span>
                            <span className="block text-[10px] text-zinc-500 font-mono">
                              {sub.isExpired 
                                ? `Venceu em: ${new Date(sub.endDate).toLocaleDateString('pt-BR')}`
                                : `Vence em: ${new Date(sub.endDate).toLocaleDateString('pt-BR')} ({sub.daysRemaining} dias)`
                              }
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-600 italic">Sem plano sintonizado</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="p-4 pr-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Botão de Liberação Manual */}
                          <button
                            id={`btn-manual-access-${p.id}`}
                            onClick={() => handleOpenAccessModal(p)}
                            className="p-2 bg-zinc-900 border border-zinc-900 hover:border-amber-500/30 text-zinc-400 hover:text-amber-500 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            title="Liberar/Sintonizar acesso manual e granular"
                          >
                            <Clock className="w-4 h-4" />
                            <span className="hidden xl:inline text-[9px] font-bold uppercase tracking-wider">Acesso</span>
                          </button>

                          {/* Excluir Aluno */}
                          <button
                            id={`btn-delete-user-row-${p.id}`}
                            disabled={isSelf}
                            onClick={() => setDeletingUser(p)}
                            className="p-2 bg-zinc-900 border border-zinc-900 hover:border-red-900/30 text-zinc-500 hover:text-red-400 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Remover conta do usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal do Guia SQL do Supabase */}
      <SqlGuideModal 
        isOpen={isSqlModalOpen} 
        onClose={() => setIsSqlModalOpen(false)} 
      />
    </motion.div>
  );
}
