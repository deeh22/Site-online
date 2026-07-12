import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Database, Terminal, Sparkles, HelpCircle, AlertTriangle, 
  KeyRound, RefreshCw, ToggleLeft, ToggleRight, Settings, Plus, Edit, 
  Trash, Check, CheckCircle2, DollarSign, Clock, FileText, Volume2, 
  GraduationCap, X, ChevronRight, Compass, MessageCircle, Link2, 
  Bell, Sliders, Eye, Globe, Info, MessageSquare, ListPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isConfigured, supabaseUrl } from '../supabaseClient';
import { authService } from '../lib/authService';
import { dataService, Plan, AppConfig, ButtonConfig, ScreenToggles, Notification, ContentRequest } from '../lib/dataService';
import SqlGuideModal from './SqlGuideModal';

export default function AdminSettings() {
  // Modal Supabase SQL
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  
  // Abas de Configuração
  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'identity' | 'links' | 'screens' | 'notifications' | 'freePlan' | 'requests' | 'creatorCredits'>('plans');

  // Forçar Modo de Simulação
  const [forceMock, setForceMock] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('supabase_force_mock') === 'true';
    }
    return false;
  });

  // --- ESTADO GERAL DO SISTEMA ---
  const [plans, setPlans] = useState<Plan[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>(() => dataService.getAppConfig());
  const [notifications, setNotifications] = useState<Notification[]>(() => dataService.getNotifications());
  
  // Feedbacks de Sucesso
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- ESTADO DE COMPONENTES DE PLANOS ---
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreatingNewPlan, setIsCreatingNewPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('19.99');
  const [planDuration, setPlanDuration] = useState('30');
  const [planDescription, setPlanDescription] = useState('');
  const [planIsActive, setPlanIsActive] = useState(true);
  const [planAllowedPdf, setPlanAllowedPdf] = useState(true);
  const [planAllowedAudio, setPlanAllowedAudio] = useState(false);
  const [planAllowedVideo, setPlanAllowedVideo] = useState(false);
  const [planAllowedCurso, setPlanAllowedCurso] = useState(false);

  // --- ESTADO DE COMPONENTES DE IDENTIDADE ---
  const [appName, setAppName] = useState(appConfig.appName);
  const [logoIcon, setLogoIcon] = useState(appConfig.logoIcon);
  const [logoText, setLogoText] = useState(appConfig.logoText);
  const [coverImage, setCoverImage] = useState(appConfig.coverImage);
  const [homeTitle, setHomeTitle] = useState(appConfig.homeTitle);
  const [homeSubtitle, setHomeSubtitle] = useState(appConfig.homeSubtitle);
  const [contactWhatsApp, setContactWhatsApp] = useState(appConfig.contactWhatsApp);
  const [contactEmail, setContactEmail] = useState(appConfig.contactEmail);
  const [insights, setInsights] = useState<string[]>(appConfig.insights);
  const [newInsightText, setNewInsightText] = useState('');

  // --- ESTADO DE COMPONENTES DE LINKS/BOTÕES ---
  const [editingButton, setEditingButton] = useState<ButtonConfig | null>(null);
  const [btnText, setBtnText] = useState('');
  const [btnIconName, setBtnIconName] = useState('');
  const [btnDestinationUrl, setBtnDestinationUrl] = useState('');
  const [btnOpenInApp, setBtnOpenInApp] = useState(true);

  // --- ESTADO DE COMPONENTES DE NOTIFICAÇÕES ---
  const [newNotification, setNewNotification] = useState<Omit<Notification, 'id' | 'createdAt'>>({
    title: '',
    message: '',
    buttonText: 'Acessar',
    buttonUrl: 'biblioteca',
    targetGroup: 'all',
    isActive: true
  });

  // --- ESTADO DE CONFIGURAÇÃO DO PLANO GRATUITO ---
  const [allPDFs, setAllPDFs] = useState<any[]>([]);
  const [allAudiobooks, setAllAudiobooks] = useState<any[]>([]);
  const [freePdfLimit, setFreePdfLimit] = useState(3);
  const [freeAudioLimit, setFreeAudioLimit] = useState(3);
  const [freeAllowedPdfs, setFreeAllowedPdfs] = useState<string[]>([]);
  const [freeAllowedAudios, setFreeAllowedAudios] = useState<string[]>([]);

  // --- ESTADO DE CONFIGURAÇÃO DO CRIADOR ---
  const [creatorName, setCreatorName] = useState('');
  const [creatorPhotoUrl, setCreatorPhotoUrl] = useState('');
  const [creatorBio, setCreatorBio] = useState('');
  const [creatorDescription, setCreatorDescription] = useState('');
  const [creatorMessage, setCreatorMessage] = useState('');
  const [creatorInstagram, setCreatorInstagram] = useState('');
  const [creatorFacebook, setCreatorFacebook] = useState('');
  const [creatorYoutube, setCreatorYoutube] = useState('');

  // --- ESTADO DE PEDIDOS DOS ALUNOS ---
  const [studentRequests, setStudentRequests] = useState<ContentRequest[]>([]);
  const [replyText, setReplyText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ContentRequest | null>(null);

  // Carregamento de dados inicial
  useEffect(() => {
    setPlans(dataService.getPlans());
    const config = dataService.getAppConfig();
    setAppConfig(config);
    setNotifications(dataService.getNotifications());

    const pdfList = dataService.getPDFs();
    const audioList = dataService.getAudiobooks();
    setAllPDFs(pdfList);
    setAllAudiobooks(audioList);

    if (config.freePlanConfig) {
      setFreePdfLimit(config.freePlanConfig.pdfLimit ?? 3);
      setFreeAudioLimit(config.freePlanConfig.audiobookLimit ?? 3);
      setFreeAllowedPdfs(config.freePlanConfig.allowedPdfs ?? []);
      setFreeAllowedAudios(config.freePlanConfig.allowedAudiobooks ?? []);
    } else {
      setFreePdfLimit(3);
      setFreeAudioLimit(3);
      setFreeAllowedPdfs(pdfList.map(p => p.id));
      setFreeAllowedAudios(audioList.map(a => a.id));
    }

    const creator = config.creatorConfig || {
      name: "Mestre Gabriel",
      photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      bio: "Iniciado nas artes herméticas e meditação prânica há mais de 15 anos. Dedicado a guiar almas no despertar da consciência e cura interior.",
      description: "Criador e mentor espiritual do portal Despertar Espiritualidade, auxiliando milhares de buscadores ao redor do mundo.",
      message: "A luz que você busca fora já brilha intensamente no altar do seu próprio coração. Permita-se silenciar e recordar.",
      instagram: "https://instagram.com/despertar",
      facebook: "https://facebook.com/despertar",
      youtube: "https://youtube.com/despertar"
    };
    setCreatorName(creator.name);
    setCreatorPhotoUrl(creator.photoUrl);
    setCreatorBio(creator.bio);
    setCreatorDescription(creator.description);
    setCreatorMessage(creator.message);
    setCreatorInstagram(creator.instagram);
    setCreatorFacebook(creator.facebook);
    setCreatorYoutube(creator.youtube);

    setStudentRequests(dataService.getRequests());
  }, []);

  const handleToggleMock = () => {
    const newValue = !forceMock;
    setForceMock(newValue);
    authService.toggleForceMock(newValue);
    showFeedback('Status de simulação alterado com sucesso!');
  };

  const showFeedback = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // --- OPERAÇÕES DE PLANOS ---
  const startEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsCreatingNewPlan(false);
    setPlanName(plan.name);
    setPlanPrice(plan.price.toString());
    setPlanDuration(plan.durationDays.toString());
    setPlanDescription(plan.description);
    setPlanIsActive(plan.isActive);
    setPlanAllowedPdf(plan.allowedContentTypes.includes('pdf'));
    setPlanAllowedAudio(plan.allowedContentTypes.includes('audiobook'));
    setPlanAllowedVideo(plan.allowedContentTypes.includes('video'));
    setPlanAllowedCurso(plan.allowedContentTypes.includes('curso'));
  };

  const startNewPlan = () => {
    setEditingPlan(null);
    setIsCreatingNewPlan(true);
    setPlanName('');
    setPlanPrice('19.99');
    setPlanDuration('30');
    setPlanDescription('');
    setPlanIsActive(true);
    setPlanAllowedPdf(true);
    setPlanAllowedAudio(false);
    setPlanAllowedVideo(false);
    setPlanAllowedCurso(false);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(planPrice) || 0;
    const durationNum = parseInt(planDuration, 10) || 30;
    const allowedTypes: ('pdf' | 'audiobook' | 'video' | 'curso')[] = [];
    if (planAllowedPdf) allowedTypes.push('pdf');
    if (planAllowedAudio) allowedTypes.push('audiobook');
    if (planAllowedVideo) allowedTypes.push('video');
    if (planAllowedCurso) allowedTypes.push('curso');

    const updatedPlan: Plan = {
      id: editingPlan ? editingPlan.id : `plan-${Math.random().toString(36).substring(2, 9)}`,
      name: planName.trim(),
      price: priceNum,
      durationDays: durationNum,
      description: planDescription.trim(),
      allowedContentTypes: allowedTypes,
      isActive: planIsActive
    };

    dataService.savePlan(updatedPlan);
    setPlans(dataService.getPlans());
    setEditingPlan(null);
    setIsCreatingNewPlan(false);
    showFeedback('Plano de assinatura salvo com sucesso!');
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Tem certeza de que deseja remover permanentemente este plano?')) {
      dataService.deletePlan(planId);
      setPlans(dataService.getPlans());
      showFeedback('Plano de assinatura removido!');
    }
  };

  // --- OPERAÇÕES DE CONFIGURAÇÃO DE IDENTIDADE ---
  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: AppConfig = {
      ...appConfig,
      appName: appName.trim(),
      logoIcon,
      logoText: logoText.trim(),
      coverImage: coverImage.trim(),
      homeTitle: homeTitle.trim(),
      homeSubtitle: homeSubtitle.trim(),
      contactWhatsApp: contactWhatsApp.trim(),
      contactEmail: contactEmail.trim(),
      insights: insights
    };
    dataService.saveAppConfig(updatedConfig);
    setAppConfig(updatedConfig);
    showFeedback('Identidade visual do portal salva com sucesso!');
  };

  const handleAddInsight = () => {
    if (!newInsightText.trim()) return;
    const updated = [...insights, newInsightText.trim()];
    setInsights(updated);
    setNewInsightText('');
  };

  const handleRemoveInsight = (index: number) => {
    const updated = insights.filter((_, idx) => idx !== index);
    setInsights(updated);
  };

  // --- OPERAÇÕES DE LINKS E BOTÕES ---
  const startEditButton = (btn: ButtonConfig) => {
    setEditingButton(btn);
    setBtnText(btn.text);
    setBtnIconName(btn.iconName);
    setBtnDestinationUrl(btn.destinationUrl);
    setBtnOpenInApp(btn.openInApp);
  };

  const handleSaveButton = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingButton) return;

    const updatedButtons = appConfig.buttons.map(b => {
      if (b.id === editingButton.id) {
        return {
          ...b,
          text: btnText.trim(),
          iconName: btnIconName,
          destinationUrl: btnDestinationUrl.trim(),
          openInApp: btnOpenInApp
        };
      }
      return b;
    });

    const updatedConfig: AppConfig = {
      ...appConfig,
      buttons: updatedButtons
    };

    dataService.saveAppConfig(updatedConfig);
    setAppConfig(updatedConfig);
    setEditingButton(null);
    showFeedback('Configuração de botão sintonizada com sucesso!');
  };

  // --- OPERAÇÕES DE TELAS (TOGGLES) ---
  const handleToggleScreen = (key: keyof ScreenToggles) => {
    const updatedToggles = {
      ...appConfig.screenToggles,
      [key]: !appConfig.screenToggles[key]
    };
    const updatedConfig = {
      ...appConfig,
      screenToggles: updatedToggles
    };
    dataService.saveAppConfig(updatedConfig);
    setAppConfig(updatedConfig);
    showFeedback(`Módulo de tela ${key} sintonizado!`);
  };

  // --- OPERAÇÕES DE NOTIFICAÇÕES ---
  const handleSaveNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const notif: Notification = {
      id: `notif-${Math.random().toString(36).substring(2, 9)}`,
      title: newNotification.title.trim(),
      message: newNotification.message.trim(),
      buttonText: newNotification.buttonText?.trim(),
      buttonUrl: newNotification.buttonUrl?.trim(),
      targetGroup: newNotification.targetGroup,
      createdAt: new Date().toISOString(),
      isActive: newNotification.isActive
    };

    dataService.saveNotification(notif);
    setNotifications(dataService.getNotifications());
    setNewNotification({
      title: '',
      message: '',
      buttonText: 'Acessar',
      buttonUrl: 'biblioteca',
      targetGroup: 'all',
      isActive: true
    });
    showFeedback('Notificação sagrada sintonizada e enviada!');
  };

  const handleDeleteNotification = (id: string) => {
    if (confirm('Deseja excluir esta notificação/aviso?')) {
      dataService.deleteNotification(id);
      setNotifications(dataService.getNotifications());
      showFeedback('Notificação removida do portal.');
    }
  };

  // --- OPERAÇÕES DO PLANO GRATUITO ---
  const handleSaveFreePlanConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig = {
      ...appConfig,
      freePlanConfig: {
        pdfLimit: freePdfLimit,
        audiobookLimit: freeAudioLimit,
        allowedPdfs: freeAllowedPdfs,
        allowedAudiobooks: freeAllowedAudios
      }
    };
    dataService.saveAppConfig(updatedConfig);
    setAppConfig(updatedConfig);
    showFeedback('Configurações do plano gratuito salvas com sucesso!');
  };

  const toggleFreePdfAllowed = (id: string) => {
    if (freeAllowedPdfs.includes(id)) {
      setFreeAllowedPdfs(freeAllowedPdfs.filter(x => x !== id));
    } else {
      setFreeAllowedPdfs([...freeAllowedPdfs, id]);
    }
  };

  const toggleFreeAudioAllowed = (id: string) => {
    if (freeAllowedAudios.includes(id)) {
      setFreeAllowedAudios(freeAllowedAudios.filter(x => x !== id));
    } else {
      setFreeAllowedAudios([...freeAllowedAudios, id]);
    }
  };

  // --- OPERAÇÕES DOS CRÉDITOS DO CRIADOR ---
  const handleSaveCreatorConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig = {
      ...appConfig,
      creatorConfig: {
        name: creatorName.trim(),
        photoUrl: creatorPhotoUrl.trim(),
        bio: creatorBio.trim(),
        description: creatorDescription.trim(),
        message: creatorMessage.trim(),
        instagram: creatorInstagram.trim(),
        facebook: creatorFacebook.trim(),
        youtube: creatorYoutube.trim()
      }
    };
    dataService.saveAppConfig(updatedConfig);
    setAppConfig(updatedConfig);
    showFeedback('Informações de créditos do criador salvas com sucesso!');
  };

  // --- OPERAÇÕES DE PEDIDOS/SOLICITAÇÕES ---
  const handleReplyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    const updated: ContentRequest = {
      ...selectedRequest,
      reply: replyText.trim(),
      status: 'fulfilled'
    };
    dataService.saveRequest(updated);
    setStudentRequests(dataService.getRequests());
    setSelectedRequest(null);
    setReplyText('');
    showFeedback('Resposta do pedido gravada com sucesso!');
  };

  const handleDeleteRequest = (id: string) => {
    if (confirm('Deseja excluir definitivamente este pedido?')) {
      dataService.deleteRequest(id);
      setStudentRequests(dataService.getRequests());
      showFeedback('Pedido de aluno excluído!');
    }
  };

  const handleToggleFulfillRequest = (req: ContentRequest) => {
    const updated: ContentRequest = {
      ...req,
      status: req.status === 'fulfilled' ? 'pending' : 'fulfilled'
    };
    dataService.saveRequest(updated);
    setStudentRequests(dataService.getRequests());
    showFeedback('Status do pedido atualizado!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 text-left font-sans"
      id="admin-settings-wrapper"
    >
      {/* Header Geral */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-5" id="settings-header-row">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-amber-500 text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Configuração Total do Portal</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">Gerenciamento de Ferramentas</h2>
          <p className="text-xs text-zinc-500">Ajuste a identidade visual, configure planos, sintonize botões de venda, gerencie notificações e ative telas.</p>
        </div>

        {activeSubTab === 'plans' && !isCreatingNewPlan && !editingPlan && (
          <button
            id="btn-create-plan"
            onClick={startNewPlan}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Criar Novo Plano</span>
          </button>
        )}
      </div>

      {/* Feedbacks de Operações */}
      {successMsg && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 rounded-2xl flex gap-2.5 items-center animate-pulse" id="settings-success-alert">
          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Sub-Navegação Administrativa (Filtros Premium em Dourado e Cinza Escuro) */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-3" id="settings-subtabs">
        <button
          onClick={() => { setActiveSubTab('plans'); setEditingPlan(null); setIsCreatingNewPlan(false); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'plans' 
              ? 'bg-amber-500 text-black border-amber-400' 
              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Planos de Assinatura</span>
        </button>

        <button
          onClick={() => setActiveSubTab('identity')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'identity' 
              ? 'bg-amber-500 text-black border-amber-400' 
              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Identidade do Portal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('links')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'links' 
              ? 'bg-amber-500 text-black border-amber-400' 
              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Links & Botões</span>
        </button>

        <button
          onClick={() => setActiveSubTab('screens')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'screens' 
              ? 'bg-amber-500 text-black border-amber-400' 
              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Controle de Telas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'notifications' 
              ? 'bg-amber-500 text-black border-amber-400' 
              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notificações / Avisos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('freePlan')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'freePlan' 
              ? 'bg-amber-500 text-black border-amber-400' 
              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configuração Gratuita</span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'requests' 
              ? 'bg-amber-500 text-black border-amber-400' 
              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Pedidos ({studentRequests.filter(r => r.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('creatorCredits')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'creatorCredits' 
              ? 'bg-amber-500 text-black border-amber-400' 
              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Ajustar Créditos</span>
        </button>
      </div>

      {/* --- CONTEÚDO DA ABA: PLANOS --- */}
      {activeSubTab === 'plans' && (
        <div className="space-y-6" id="tab-plans-content">
          <AnimatePresence mode="wait">
            {(editingPlan || isCreatingNewPlan) && (
              <motion.div
                id="plan-form-card"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-zinc-950 border border-amber-500/20 rounded-3xl space-y-6"
              >
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4" id="plan-form-header">
                  <h3 className="font-serif font-bold text-white text-sm">
                    {editingPlan ? `Editando Plano: ${editingPlan.name}` : 'Criar Novo Plano de Assinatura'}
                  </h3>
                  <button
                    id="btn-close-plan-form"
                    onClick={() => { setEditingPlan(null); setIsCreatingNewPlan(false); }}
                    className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer border border-zinc-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSavePlan} className="space-y-4" id="plan-settings-form">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Nome */}
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Nome do Plano</label>
                      <input
                        type="text"
                        required
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="Ex: Plano Intermediário - Audiobooks"
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none transition-all placeholder-zinc-800"
                      />
                    </div>

                    {/* Preço (R$) */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Preço (R$)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500 font-mono">R$</span>
                        <input
                          type="text"
                          required
                          value={planPrice}
                          onChange={(e) => setPlanPrice(e.target.value)}
                          placeholder="39.99"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Duração (Dias) */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Duração (Dias)</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        required
                        value={planDuration}
                        onChange={(e) => setPlanDuration(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Descrição Curta</label>
                    <textarea
                      required
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      placeholder="Escreva as vantagens sagradas e conteúdos incluídos neste plano de luz..."
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none resize-none transition-all placeholder-zinc-850"
                    />
                  </div>

                  {/* Conteúdos Liberados (Checkboxes) */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500">Conteúdos Sintonizados (Liberados)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <label className="flex items-center gap-2.5 p-3.5 bg-black border border-zinc-900 rounded-xl cursor-pointer hover:border-zinc-800 transition-all select-none">
                        <input
                          type="checkbox"
                          checked={planAllowedPdf}
                          onChange={(e) => setPlanAllowedPdf(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-800 accent-amber-500"
                        />
                        <span className="text-xs font-bold text-white">E-books PDF</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3.5 bg-black border border-zinc-900 rounded-xl cursor-pointer hover:border-zinc-800 transition-all select-none">
                        <input
                          type="checkbox"
                          checked={planAllowedAudio}
                          onChange={(e) => setPlanAllowedAudio(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-800 accent-amber-500"
                        />
                        <span className="text-xs font-bold text-white">Audiobooks</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3.5 bg-black border border-zinc-900 rounded-xl cursor-pointer hover:border-zinc-800 transition-all select-none">
                        <input
                          type="checkbox"
                          checked={planAllowedVideo}
                          onChange={(e) => setPlanAllowedVideo(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-800 accent-amber-500"
                        />
                        <span className="text-xs font-bold text-white">Vídeos</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-3.5 bg-black border border-zinc-900 rounded-xl cursor-pointer hover:border-zinc-800 transition-all select-none">
                        <input
                          type="checkbox"
                          checked={planAllowedCurso}
                          onChange={(e) => setPlanAllowedCurso(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-800 accent-amber-500"
                        />
                        <span className="text-xs font-bold text-white">Cursos</span>
                      </label>
                    </div>
                  </div>

                  {/* Status Ativo/Inativo e Botão Salvar */}
                  <div className="pt-3 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4" id="plan-form-footer-row">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400 font-sans">Status de Vendas do Plano:</span>
                      <button
                        type="button"
                        onClick={() => setPlanIsActive(!planIsActive)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded-xl border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full ${planIsActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span>{planIsActive ? 'Ativo (Vender)' : 'Inativo (Pausado)'}</span>
                      </button>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        type="submit"
                        className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-md active:scale-98"
                      >
                        Salvar Plano
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingPlan(null); setIsCreatingNewPlan(false); }}
                        className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TABELA DE GESTÃO DE PLANOS DE ASSINATURA */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 space-y-4" id="plans-management-card">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4.5 h-4.5 text-amber-500" />
              <span>Configuração dos Planos de Luz</span>
            </h3>

            <div className="overflow-x-auto" id="plans-table-wrapper">
              <table className="w-full text-xs text-left" id="plans-admin-table">
                <thead>
                  <tr className="border-b border-zinc-900 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    <th className="py-2.5">Plano de Assinatura</th>
                    <th className="py-2.5">Valor (R$)</th>
                    <th className="py-2.5">Duração</th>
                    <th className="py-2.5">Conteúdos Liberados</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                  {plans.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/10" id={`plan-row-${p.id}`}>
                      <td className="py-3.5 pr-4 text-left">
                        <div>
                          <span className="block font-bold text-white">{p.name}</span>
                          <span className="block text-[10px] text-zinc-500 max-w-xs truncate leading-relaxed mt-0.5">{p.description}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-amber-500">
                        R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 font-medium font-sans">
                        {p.durationDays} dias
                      </td>
                      <td className="py-3.5">
                        <div className="flex gap-1.5" id={`liberados-icons-${p.id}`}>
                          {p.allowedContentTypes.includes('pdf') && (
                            <span className="p-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400" title="PDFs Incluídos">
                              <FileText className="w-3.5 h-3.5 text-amber-500/80" />
                            </span>
                          )}
                          {p.allowedContentTypes.includes('audiobook') && (
                            <span className="p-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400" title="Audiobooks Incluídos">
                              <Volume2 className="w-3.5 h-3.5 text-amber-500/80" />
                            </span>
                          )}
                          {p.allowedContentTypes.includes('curso') && (
                            <span className="p-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400" title="Cursos Incluídos">
                              <GraduationCap className="w-3.5 h-3.5 text-amber-500/80" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-lg ${
                          p.isActive 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                        }`}>
                          {p.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-edit-plan-${p.id}`}
                            onClick={() => startEditPlan(p)}
                            className="p-1.5 bg-zinc-900 border border-zinc-900 hover:border-amber-500/20 text-zinc-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                            title="Editar plano"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-del-plan-${p.id}`}
                            onClick={() => handleDeletePlan(p.id)}
                            className="p-1.5 bg-zinc-900 border border-zinc-900 hover:border-red-900/30 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Deletar plano"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTEÚDO DA ABA: IDENTIDADE DO PORTAL --- */}
      {activeSubTab === 'identity' && (
        <form onSubmit={handleSaveIdentity} className="space-y-6" id="tab-identity-content">
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-amber-500" />
              <span>Identidade Visual & Textos de Entrada</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Nome do Aplicativo */}
              <div className="sm:col-span-6">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Nome do Aplicativo</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none"
                />
              </div>

              {/* Logo Text */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Texto do Logo</label>
                <input
                  type="text"
                  required
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none"
                />
              </div>

              {/* Logo Icon */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Ícone do Logo</label>
                <select
                  value={logoIcon}
                  onChange={(e) => setLogoIcon(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none"
                >
                  <option value="Compass">Compass (Bússola)</option>
                  <option value="Sparkles">Sparkles (Brilhos)</option>
                  <option value="Flame">Flame (Chama)</option>
                  <option value="Award">Award (Prêmio)</option>
                  <option value="Bell">Bell (Sino)</option>
                  <option value="GraduationCap">GraduationCap (Capelo)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Título de Entrada */}
              <div className="sm:col-span-6">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Título da Tela Inicial</label>
                <input
                  type="text"
                  required
                  value={homeTitle}
                  onChange={(e) => setHomeTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none"
                />
              </div>

              {/* Gradiente de Capa */}
              <div className="sm:col-span-6">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Esquema de Cores de Capa (Tailwind Class / CSS)</label>
                <input
                  type="text"
                  required
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Ex: from-black via-zinc-950 to-black"
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono"
                />
              </div>
            </div>

            {/* Subtítulo de Entrada */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Mensagem / Subtítulo da Tela Inicial</label>
              <textarea
                required
                value={homeSubtitle}
                onChange={(e) => setHomeSubtitle(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* WhatsApp Contato */}
              <div className="sm:col-span-6">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Link do WhatsApp Oficial de Atendimento</label>
                <input
                  type="text"
                  required
                  value={contactWhatsApp}
                  onChange={(e) => setContactWhatsApp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono"
                />
              </div>

              {/* E-mail de Atendimento */}
              <div className="sm:col-span-6">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">E-mail de Suporte ao Aluno</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* FRASES DE DESTAQUE / SABEDORIAS */}
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              <span>Gerenciar Sabedorias do Dia (Insights)</span>
            </h3>
            <p className="text-xs text-zinc-500">As frases cadastradas abaixo sintonizam o aluno diariamente com reflexões místicas na tela inicial.</p>

            <div className="space-y-3" id="insights-list">
              {insights.map((ins, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-black border border-zinc-900 rounded-2xl text-xs gap-3">
                  <span className="text-zinc-300 italic">"{ins}"</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInsight(idx)}
                    className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 pt-2" id="add-insight-bar">
              <input
                type="text"
                value={newInsightText}
                onChange={(e) => setNewInsightText(e.target.value)}
                placeholder="Insira uma nova sabedoria espiritual de destaque..."
                className="flex-1 px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none placeholder-zinc-800"
              />
              <button
                type="button"
                onClick={handleAddInsight}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-amber-500/20 text-xs font-bold text-amber-500 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2" id="identity-save-row">
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-lg active:scale-98"
            >
              Salvar Identidade do Portal
            </button>
          </div>
        </form>
      )}

      {/* --- CONTEÚDO DA ABA: GERENCIAR LINKS & BOTÕES --- */}
      {activeSubTab === 'links' && (
        <div className="space-y-6" id="tab-links-content">
          <AnimatePresence mode="wait">
            {editingButton && (
              <motion.div
                id="edit-button-form-card"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-zinc-950 border border-amber-500/20 rounded-3xl space-y-6"
              >
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                  <h3 className="font-serif font-bold text-white text-sm">Sintonizar Propriedades do Botão</h3>
                  <button
                    onClick={() => setEditingButton(null)}
                    className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveButton} className="space-y-4" id="btn-config-form">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Texto */}
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Texto do Botão</label>
                      <input
                        type="text"
                        required
                        value={btnText}
                        onChange={(e) => setBtnText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none"
                      />
                    </div>

                    {/* Ícone */}
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Ícone do Botão (Lucide Icon Name)</label>
                      <select
                        value={btnIconName}
                        onChange={(e) => setBtnIconName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none cursor-pointer"
                      >
                        <option value="BookOpen">BookOpen (Livro)</option>
                        <option value="Volume2">Volume2 (Áudio)</option>
                        <option value="GraduationCap">GraduationCap (Curso)</option>
                        <option value="MessageCircle">MessageCircle (WhatsApp)</option>
                        <option value="Sparkles">Sparkles (Estrelas)</option>
                        <option value="ShoppingBag">ShoppingBag (Compra)</option>
                      </select>
                    </div>
                  </div>

                  {/* URL de destino */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">URL de Redirecionamento (Link de Checkout ou Contato)</label>
                    <input
                      type="text"
                      required
                      value={btnDestinationUrl}
                      onChange={(e) => setBtnDestinationUrl(e.target.value)}
                      placeholder="Ex: #plans-pricing-section ou https://link-de-pagamento.com"
                      className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono"
                    />
                  </div>

                  {/* Open In App / Open Browser */}
                  <div className="pt-2">
                    <span className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Comportamento de Clique</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                        <input
                          type="radio"
                          name="open_mode"
                          checked={btnOpenInApp}
                          onChange={() => setBtnOpenInApp(true)}
                          className="accent-amber-500"
                        />
                        <span>Abrir dentro do aplicativo (SPA / Link Interno)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                        <input
                          type="radio"
                          name="open_mode"
                          checked={!btnOpenInApp}
                          onChange={() => setBtnOpenInApp(false)}
                          className="accent-amber-500"
                        />
                        <span>Navegador externo (Link de Checkout/Suporte)</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-900 flex justify-end gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Salvar Configurações do Botão
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingButton(null)}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Link2 className="w-4.5 h-4.5 text-amber-500" />
              <span>Gerenciar Botões & Links Dinâmicos</span>
            </h3>
            <p className="text-xs text-zinc-500">Configure cada botão de ofertas, compras ou WhatsApp do aplicativo. Os usuários serão redirecionados automaticamente para os links inseridos aqui.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="buttons-grid">
              {appConfig.buttons.map((btn) => (
                <div key={btn.id} className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold font-mono text-amber-500 uppercase">{btn.id}</span>
                      <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-md ${
                        btn.openInApp ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {btn.openInApp ? 'App Interno' : 'Link Externo'}
                      </span>
                    </div>
                    <span className="block font-bold text-white text-xs mt-1">{btn.text}</span>
                    <span className="block text-[10px] text-zinc-500 truncate font-mono">{btn.destinationUrl}</span>
                  </div>

                  <button
                    onClick={() => startEditButton(btn)}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Sintonizar Botão</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- CONTEÚDO DA ABA: CONTROLE DE TELAS (TOGGLES) --- */}
      {activeSubTab === 'screens' && (
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6" id="tab-screens-content">
          <div className="space-y-1">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-amber-500" />
              <span>Controle de Telas & Seções Visuais</span>
            </h3>
            <p className="text-xs text-zinc-500">Ative ou desative seções inteiras do aplicativo com um único clique. Seções desativadas ficarão invisíveis para usuários normais.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="screens-toggles-grid">
            {/* PDFs */}
            <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex justify-between items-center">
              <div className="text-left space-y-0.5">
                <span className="block font-bold text-white text-xs">Biblioteca de E-books PDFs</span>
                <span className="block text-[10px] text-zinc-500 font-sans">Visualização da aba biblioteca</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleScreen('pdfs')}
                className="cursor-pointer transition-transform"
              >
                {appConfig.screenToggles.pdfs ? (
                  <ToggleRight className="w-10 h-10 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-zinc-800" />
                )}
              </button>
            </div>

            {/* Audiobooks */}
            <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex justify-between items-center">
              <div className="text-left space-y-0.5">
                <span className="block font-bold text-white text-xs">Mantras & Audiobooks</span>
                <span className="block text-[10px] text-zinc-500 font-sans">Visualização da aba de sintonias de áudios</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleScreen('audiobooks')}
                className="cursor-pointer transition-transform"
              >
                {appConfig.screenToggles.audiobooks ? (
                  <ToggleRight className="w-10 h-10 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-zinc-800" />
                )}
              </button>
            </div>

            {/* Cursos */}
            <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex justify-between items-center">
              <div className="text-left space-y-0.5">
                <span className="block font-bold text-white text-xs">Escola de Cursos (Graus)</span>
                <span className="block text-[10px] text-zinc-500 font-sans">Visualização das trilhas de cursos sintonizadas</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleScreen('courses')}
                className="cursor-pointer transition-transform"
              >
                {appConfig.screenToggles.courses ? (
                  <ToggleRight className="w-10 h-10 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-zinc-800" />
                )}
              </button>
            </div>

            {/* Ofertas e Ads */}
            <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex justify-between items-center">
              <div className="text-left space-y-0.5">
                <span className="block font-bold text-white text-xs">Ofertas & Anúncios</span>
                <span className="block text-[10px] text-zinc-500 font-sans">Visualização de caixas de anúncios de planos</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleScreen('offers')}
                className="cursor-pointer transition-transform"
              >
                {appConfig.screenToggles.offers ? (
                  <ToggleRight className="w-10 h-10 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-zinc-800" />
                )}
              </button>
            </div>

            {/* Banners */}
            <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex justify-between items-center">
              <div className="text-left space-y-0.5">
                <span className="block font-bold text-white text-xs">Carrosséis / Banners Principais</span>
                <span className="block text-[10px] text-zinc-500 font-sans">Ativa ou desativa layouts de banners destacados</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleScreen('banners')}
                className="cursor-pointer transition-transform"
              >
                {appConfig.screenToggles.banners ? (
                  <ToggleRight className="w-10 h-10 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-zinc-800" />
                )}
              </button>
            </div>

            {/* Avisos */}
            <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex justify-between items-center">
              <div className="text-left space-y-0.5">
                <span className="block font-bold text-white text-xs">Avisos e Notificações Flutuantes</span>
                <span className="block text-[10px] text-zinc-500 font-sans">Visualização do carrossel superior de avisos</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleScreen('notices')}
                className="cursor-pointer transition-transform"
              >
                {appConfig.screenToggles.notices ? (
                  <ToggleRight className="w-10 h-10 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-zinc-800" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTEÚDO DA ABA: NOTIFICAÇÕES & AVISOS --- */}
      {activeSubTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="tab-notifications-content">
          {/* Form de Criar Notificação */}
          <div className="lg:col-span-5 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-amber-500" />
              <span>Emitir Aviso / Notificação</span>
            </h3>
            <p className="text-xs text-zinc-500 font-sans">Dispare uma nova mensagem destacada no mural para os alunos sintonizados.</p>

            <form onSubmit={handleSaveNotification} className="space-y-4" id="new-notification-form">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Título do Aviso</label>
                <input
                  type="text"
                  required
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Ex: Novo Livro Liberado no Acervo!"
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Mensagem do Aviso</label>
                <textarea
                  required
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Escreva a mensagem mística ou aviso importante para a egrégora..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Texto do botão */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Texto do Botão</label>
                  <input
                    type="text"
                    value={newNotification.buttonText}
                    onChange={(e) => setNewNotification({ ...newNotification, buttonText: e.target.value })}
                    placeholder="Ex: Ler Agora"
                    className="w-full px-3 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                {/* URL de ação */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">URL de Ação (Aba/Link)</label>
                  <select
                    value={newNotification.buttonUrl}
                    onChange={(e) => setNewNotification({ ...newNotification, buttonUrl: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="inicio">Aba Início</option>
                    <option value="biblioteca">Biblioteca (PDFs)</option>
                    <option value="audios">Áudios / Mantras</option>
                    <option value="cursos">Senda de Cursos</option>
                    <option value="perfil">Perfil do Usuário</option>
                  </select>
                </div>
              </div>

              {/* Público-alvo */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Segmentação de Envio (Público-alvo)</label>
                <select
                  value={newNotification.targetGroup}
                  onChange={(e) => setNewNotification({ ...newNotification, targetGroup: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none cursor-pointer"
                >
                  <option value="all">Todos os Alunos (Público Geral)</option>
                  <option value="level_1">Apenas Grau Nível 1</option>
                  <option value="level_2">Apenas Grau Nível 2</option>
                  <option value="level_3">Apenas Grau Nível 3 (Ascensão)</option>
                  <option value="subscribers">Iniciados com Assinatura Ativa</option>
                  <option value="admins">Apenas Gestores / Administradores</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-md"
              >
                Disparar Aviso no Mural
              </button>
            </form>
          </div>

          {/* Histórico/Lista de Notificações */}
          <div className="lg:col-span-7 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">Avisos Emitidos Ativos</h3>
              <p className="text-xs text-zinc-500">Histórico de notificações em circulação no mural de alunos.</p>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1" id="notifications-list">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600 text-xs italic">Nenhuma notificação ativa no momento.</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-2 relative text-left">
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="absolute top-4 right-4 p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Deletar aviso"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1 pr-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-md ${
                            notif.targetGroup === 'all' 
                              ? 'bg-zinc-800 text-zinc-300' 
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            Público: {notif.targetGroup === 'all' ? 'Todos' : notif.targetGroup}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-mono font-medium">Disparado em {new Date(notif.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <h4 className="font-serif font-bold text-white text-xs leading-tight mt-1">{notif.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{notif.message}</p>
                      </div>

                      {notif.buttonText && (
                        <span className="inline-block text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Ação: {notif.buttonText} &rarr; {notif.buttonUrl}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTEÚDO DA ABA: PLANO GRATUITO --- */}
      {activeSubTab === 'freePlan' && (
        <form onSubmit={handleSaveFreePlanConfig} className="space-y-6" id="tab-freeplan-content">
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-amber-500" />
              <span>Controle do Plano Gratuito (Acesso de Entrada)</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Configure as cotas de liberação de consumo e quais conteúdos estarão abertos aos alunos que sintonizarem sem assinatura ativa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Limite de PDFs */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Limite de PDFs Gratuitos Liberados para Leitura</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={freePdfLimit}
                  onChange={(e) => setFreePdfLimit(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono font-bold"
                />
                <span className="text-[10px] text-zinc-500 block mt-1">Quantidade máxima de e-books distintos que um usuário gratuito pode abrir.</span>
              </div>

              {/* Limite de Audiobooks */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Limite de Audiobooks Gratuitos Liberados para Escuta</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={freeAudioLimit}
                  onChange={(e) => setFreeAudioLimit(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono font-bold"
                />
                <span className="text-[10px] text-zinc-500 block mt-1">Quantidade máxima de audiobooks distintos que um usuário gratuito pode sintonizar.</span>
              </div>
            </div>

            {/* PDFs Gratuitos Selecionáveis */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500">Selecionar PDFs Ativos no Plano Gratuito</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allPDFs.map((pdf) => {
                  const isChecked = freeAllowedPdfs.includes(pdf.id);
                  return (
                    <div 
                      key={pdf.id}
                      onClick={() => toggleFreePdfAllowed(pdf.id)}
                      className={`p-3 bg-black border rounded-2xl cursor-pointer transition-all flex items-center justify-between select-none ${
                        isChecked ? 'border-amber-500/40 bg-amber-500/5' : 'border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 max-w-[80%]">
                        <FileText className={`w-4 h-4 ${isChecked ? 'text-amber-500' : 'text-zinc-500'}`} />
                        <span className="text-xs font-bold text-white truncate">{pdf.title}</span>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-700'}`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audiobooks Gratuitos Selecionáveis */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500">Selecionar Audiobooks Ativos no Plano Gratuito</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allAudiobooks.map((audio) => {
                  const isChecked = freeAllowedAudios.includes(audio.id);
                  return (
                    <div 
                      key={audio.id}
                      onClick={() => toggleFreeAudioAllowed(audio.id)}
                      className={`p-3 bg-black border rounded-2xl cursor-pointer transition-all flex items-center justify-between select-none ${
                        isChecked ? 'border-amber-500/40 bg-amber-500/5' : 'border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 max-w-[80%]">
                        <Volume2 className={`w-4 h-4 ${isChecked ? 'text-amber-500' : 'text-zinc-500'}`} />
                        <span className="text-xs font-bold text-white truncate">{audio.title}</span>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-700'}`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botão Salvar Plano Gratuito */}
            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-md active:scale-98"
              >
                Salvar Configurações Gratuitas
              </button>
            </div>
          </div>
        </form>
      )}

      {/* --- CONTEÚDO DA ABA: PEDIDOS DOS ALUNOS --- */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6" id="tab-requests-content">
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-amber-500" />
              <span>Pedidos de Conteúdos & Sugestões Personalizadas</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Acompanhe o que seus alunos estão buscando. Aprove, envie respostas ou marque pedidos como sintonizados / resolvidos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lista de Pedidos */}
            <div className="lg:col-span-7 space-y-3">
              {studentRequests.length === 0 ? (
                <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-3xl text-zinc-600 text-xs italic">
                  Nenhum pedido de conteúdo registrado no momento.
                </div>
              ) : (
                studentRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className={`p-5 bg-zinc-950 border rounded-3xl text-left space-y-3 transition-all relative ${
                      selectedRequest?.id === req.id ? 'border-amber-500' : 'border-zinc-900'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded ${
                            req.requestType === 'pdf' 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                              : req.requestType === 'audiobook'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {req.requestType === 'pdf' ? 'PDF' : req.requestType === 'audiobook' ? 'Áudio' : 'Sugestão'}
                          </span>
                          <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded ${
                            req.status === 'fulfilled'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 animate-pulse'
                          }`}>
                            {req.status === 'fulfilled' ? 'Atendido' : 'Pendente'}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs">{req.title}</h4>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleFulfillRequest(req)}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                          title="Alternar Status"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(req); setReplyText(req.reply || ''); }}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                          title="Responder Aluno"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Pedido"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 bg-black/40 p-3 rounded-2xl border border-zinc-900/40 italic">
                      "{req.message}"
                    </p>

                    <div className="flex flex-wrap justify-between items-center text-[10px] text-zinc-500 font-sans border-t border-zinc-900/60 pt-2 gap-2">
                      <div>
                        <span className="block font-bold text-zinc-400">{req.userName}</span>
                        <span className="block">{req.userEmail}</span>
                      </div>
                      <span className="font-mono">{new Date(req.date).toLocaleDateString('pt-BR')} às {new Date(req.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>

                    {req.reply && (
                      <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl text-xs space-y-1 text-left">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-400 block">Resposta Enviada:</span>
                        <p className="text-zinc-300">{req.reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Painel de Responder Pedido */}
            <div className="lg:col-span-5">
              {selectedRequest ? (
                <div className="p-6 bg-zinc-950 border border-amber-500/20 rounded-3xl space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-white">Responder Pedido</h3>
                    <button 
                      onClick={() => setSelectedRequest(null)}
                      className="p-1 bg-zinc-950 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Aluno(a)</span>
                    <p className="font-bold text-white">{selectedRequest.userName}</p>
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-wider mt-2">Item Solicitado</span>
                    <p className="font-medium text-amber-500 italic">"{selectedRequest.title}"</p>
                  </div>

                  <form onSubmit={handleReplyRequest} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Sua Resposta / Ação de Sucesso</label>
                      <textarea
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Ex: O seu livro foi adicionado com sucesso ao acervo. Já está liberado para leitura!"
                        rows={4}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-md"
                      >
                        Enviar Resposta
                      </button>
                      <a
                        href={`https://wa.me/55${appConfig.contactWhatsApp.replace(/\D/g, '')}?text=Olá ${encodeURIComponent(selectedRequest.userName)}, referente ao seu pedido de "${encodeURIComponent(selectedRequest.title)}" no portal...`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center transition-all"
                        title="Responder pelo WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl text-center text-zinc-600 text-xs italic">
                  Selecione um pedido clicando no ícone de edição para responder diretamente e liberar o acesso.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CONTEÚDO DA ABA: AJUSTAR CRÉDITOS DO CRIADOR --- */}
      {activeSubTab === 'creatorCredits' && (
        <form onSubmit={handleSaveCreatorConfig} className="space-y-6" id="tab-creator-content">
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6">
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-amber-500" />
              <span>Configuração dos Créditos do Criador</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Ajuste as informações pessoais, redes sociais e foto do mentor / criador do aplicativo para exibição sintonizada no perfil do aluno.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome do Mentor */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Nome do Criador / Mentor</label>
                <input
                  type="text"
                  required
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Ex: Mestre Gabriel"
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none"
                />
              </div>

              {/* URL da Foto */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">URL da Foto do Criador (Avatar)</label>
                <input
                  type="text"
                  required
                  value={creatorPhotoUrl}
                  onChange={(e) => setCreatorPhotoUrl(e.target.value)}
                  placeholder="Ex: https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mini Bio */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Biografia Curta (Subtítulo)</label>
                <input
                  type="text"
                  required
                  value={creatorBio}
                  onChange={(e) => setCreatorBio(e.target.value)}
                  placeholder="Ex: Iniciado nas artes herméticas e meditação prânica..."
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none"
                />
              </div>

              {/* Mensagem de Inspiração */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Frase Inspiradora Oficial</label>
                <input
                  type="text"
                  required
                  value={creatorMessage}
                  onChange={(e) => setCreatorMessage(e.target.value)}
                  placeholder="Ex: A luz que você busca fora já brilha intensamente no altar..."
                  className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Descrição Longa */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Descrição Detalhada do Criador (Histórico)</label>
              <textarea
                required
                value={creatorDescription}
                onChange={(e) => setCreatorDescription(e.target.value)}
                placeholder="Escreva a trajetória cósmica do mentor, suas formações, de forma a inspirar os iniciados..."
                rows={4}
                className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none resize-none"
              />
            </div>

            {/* Redes Sociais */}
            <div className="space-y-4 pt-4 border-t border-zinc-900/60">
              <h4 className="text-xs uppercase tracking-widest font-bold text-white">Canais de Conexão (Redes Sociais)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Instagram */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Instagram URL</label>
                  <input
                    type="text"
                    value={creatorInstagram}
                    onChange={(e) => setCreatorInstagram(e.target.value)}
                    placeholder="Ex: https://instagram.com/..."
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Facebook URL</label>
                  <input
                    type="text"
                    value={creatorFacebook}
                    onChange={(e) => setCreatorFacebook(e.target.value)}
                    placeholder="Ex: https://facebook.com/..."
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono"
                  />
                </div>

                {/* Youtube */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">YouTube URL</label>
                  <input
                    type="text"
                    value={creatorYoutube}
                    onChange={(e) => setCreatorYoutube(e.target.value)}
                    placeholder="Ex: https://youtube.com/..."
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl text-white text-xs outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Botão Salvar Créditos */}
            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-md active:scale-98"
              >
                Salvar Informações do Criador
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Cartão de Status de Conexão - Banco de Dados */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6" id="settings-status-card">
        <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4.5 h-4.5 text-amber-500" />
          <span>Status do Supabase e Sincronização</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="status-widgets">
          <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex items-center gap-3 text-left">
            <div className={`w-3 h-3 rounded-full shrink-0 ${authService.isMock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
            <div className="text-left bg-transparent">
              <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Modo de Serviço</span>
              <span className="text-xs font-bold text-white">
                {authService.isMock ? 'Modo Simulação Local' : 'Conectado ao Supabase Real'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 flex items-center gap-3 text-left">
            <Database className="w-4 h-4 text-zinc-600" />
            <div className="text-left overflow-hidden w-full bg-transparent">
              <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Endpoint Ativo</span>
              <span className="text-xs font-mono text-zinc-400 truncate block">
                {supabaseUrl.replace('https://', '')}
              </span>
            </div>
          </div>
        </div>

        {/* Botão de abrir modal com o Script SQL */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 text-left" id="sql-trigger-button-row">
          <div className="text-left space-y-0.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono">PostgreSQL Script</span>
            <p className="text-xs text-zinc-400 font-medium">Copie o script para criar as tabelas, triggers e RLS no seu painel.</p>
          </div>
          
          <button
            id="btn-open-sql-guide-settings"
            onClick={() => setIsSqlModalOpen(true)}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/20 text-xs font-bold text-amber-500 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Terminal className="w-4 h-4 text-amber-500" />
            <span>Ver Script SQL</span>
          </button>
        </div>
      </div>

      {/* Modal do Guia SQL */}
      <SqlGuideModal 
        isOpen={isSqlModalOpen} 
        onClose={() => setIsSqlModalOpen(false)} 
      />
    </motion.div>
  );
}
