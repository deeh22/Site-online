import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { 
  Sparkles, Compass, Flame, Eye, BookOpen, Clock, Heart, Award, 
  Volume2, ArrowRight, ShieldAlert, CheckCircle2, ShoppingBag, 
  CreditCard, HelpCircle, Calendar, CalendarRange, Lock, LockOpen, 
  Bell, ArrowUpRight, MessageSquare, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService, Plan, Purchase, Advertisement, AppConfig, Notification } from '../lib/dataService';

interface UserDashboardProps {
  user: User;
  onNavigateToTab: (tab: string) => void;
}

interface DurationOption {
  days: number;
  label: string;
  price: number;
}

const PLAN_DURATIONS: Record<string, DurationOption[]> = {
  'plan-livros': [
    { days: 15, label: '15 dias', price: 14.99 },
    { days: 30, label: '30 dias', price: 19.99 },
    { days: 60, label: '60 dias', price: 29.99 },
    { days: 365, label: '1 ano', price: 299.99 }
  ],
  'plan-premium': [
    { days: 15, label: '15 dias', price: 19.99 },
    { days: 30, label: '30 dias', price: 39.99 },
    { days: 60, label: '60 dias', price: 59.99 },
    { days: 365, label: '1 ano', price: 349.99 }
  ]
};

export default function UserDashboard({ user, onNavigateToTab }: UserDashboardProps) {
   const [config, setConfig] = useState<AppConfig>(() => dataService.getAppConfig());
  const [insight, setInsight] = useState('');
  const [greeting, setGreeting] = useState('');
  const [subStatus, setSubStatus] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [continuity, setContinuity] = useState<any>(null);
  
  // Mural de avisos/notificações recebidos pelo usuário
  const [receivedNotifs, setReceivedNotifs] = useState<Notification[]>([]);
  const [dismissedNotifs, setDismissedNotifs] = useState<string[]>([]);

  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [customDays, setCustomDays] = useState<string>('7');
  const [customPrice, setCustomPrice] = useState<string>('9.99');
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [simulationMode, setSimulationMode] = useState<'normal' | 'expired' | 'expires_soon'>('normal');
  const [checkoutStep, setCheckoutStep] = useState<'options' | 'payment' | 'success'>('options');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Carrega dados iniciais do serviço
  const loadData = () => {
    const currentConfig = dataService.getAppConfig();
    setConfig(currentConfig);

    const sub = dataService.getUserSubscription(user.id);
    setSubStatus(sub);
    setPlans(dataService.getPlans().filter(p => p.isActive));
    setAds(dataService.getAds().filter(a => a.isActive));

    // Carrega progresso de continuidade
    const cont = dataService.getContinuityProgress(user.id);
    setContinuity(cont);

    // Carregar e filtrar notificações sintonizadas para o usuário
    const allNotifs = dataService.getNotifications().filter(n => n.isActive);
    const filtered = allNotifs.filter(notif => {
      if (notif.targetGroup === 'all') return true;
      if (notif.targetGroup === 'level_1' && user.accessLevel === 1) return true;
      if (notif.targetGroup === 'level_2' && user.accessLevel === 2) return true;
      if (notif.targetGroup === 'level_3' && user.accessLevel === 3) return true;
      if (notif.targetGroup === 'admins' && user.role === 'ADMIN') return true;
      if (notif.targetGroup === 'subscribers' && sub && !sub.isExpired) return true;
      return false;
    });
    setReceivedNotifs(filtered);
  };

  useEffect(() => {
    loadData();

    // Escolhe um insight aleatório a partir das frases de destaque cadastradas
    const currentConfig = dataService.getAppConfig();
    const loadedInsights = currentConfig.insights && currentConfig.insights.length > 0 
      ? currentConfig.insights 
      : [
          "A espiritualidade não é um destino, mas a sintonia fina do seu olhar sobre a vida.",
          "Silencie o barulho do mundo lá fora e escute a sabedoria que já habita em você."
        ];
    
    const index = Math.abs(user.email.charCodeAt(0) + new Date().getDate()) % loadedInsights.length;
    setInsight(loadedInsights[index]);

    // Define saudação baseada na hora
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) setGreeting('Bom dia');
    else if (hr >= 12 && hr < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, [user]);

  const handleOpenCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    const durations = PLAN_DURATIONS[plan.id] || [];
    if (durations.length > 0) {
      setSelectedDuration(durations[1]); // Seleciona a opção de 30 dias por padrão
      setIsCustomDuration(false);
    } else {
      setIsCustomDuration(true);
    }
    setCheckoutStep('options');
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setCheckoutLoading(true);
    // Simula processamento místico do pagamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    let finalDays = 30;
    let finalPrice = 19.99;

    if (isCustomDuration) {
      finalDays = parseInt(customDays, 10) || 7;
      finalPrice = parseFloat(customPrice) || 9.99;
    } else if (selectedDuration) {
      finalDays = selectedDuration.days;
      finalPrice = selectedDuration.price;
    }

    const now = new Date();
    const purchaseDate = now.toISOString();
    const startDate = now.toISOString();
    let endDate = new Date();

    if (simulationMode === 'expired') {
      endDate = new Date(now.getTime() - 60 * 60 * 1000); // Expirado há 1 hora
    } else if (simulationMode === 'expires_soon') {
      endDate.setDate(now.getDate() + 4); // Expira em 4 dias
    } else {
      endDate.setDate(now.getDate() + finalDays);
    }

    dataService.createPurchase({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      price: finalPrice,
      purchaseDate,
      startDate,
      endDate: endDate.toISOString(),
      contentTypes: selectedPlan.allowedContentTypes
    });

    setCheckoutLoading(false);
    setCheckoutStep('success');
    loadData();
  };

  const dismissNotification = (id: string) => {
    setDismissedNotifs([...dismissedNotifs, id]);
  };

  // Filtra as notificações não descartadas pelo usuário
  const visibleNotifications = receivedNotifs.filter(n => !dismissedNotifs.includes(n.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
      id="user-dashboard-wrapper"
    >
      {/* 1. SEÇÃO DE NOTIFICAÇÕES SINTONIZADAS DO ADMIN (Respeita Toggles de Avisos) */}
      {config.screenToggles.notices && visibleNotifications.length > 0 && (
        <div className="space-y-3" id="notices-dashboard-bar">
          <AnimatePresence>
            {visibleNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/20 to-black border border-amber-500/20 text-xs rounded-3xl relative flex gap-3 text-left items-start shadow-md"
                id={`notif-alert-${notif.id}`}
              >
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="absolute top-4 right-4 p-1 text-zinc-600 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <XIcon className="w-4 h-4" />
                </button>

                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
                  <Bell className="w-4 h-4" />
                </div>

                <div className="space-y-1 pr-6 flex-1 bg-transparent">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider rounded">Aviso Oficial</span>
                    <span className="text-[9px] text-zinc-500 font-mono font-medium">{new Date(notif.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h4 className="font-serif font-bold text-white text-sm leading-snug mt-1">{notif.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{notif.message}</p>
                  
                  {notif.buttonText && (
                    <button
                      onClick={() => {
                        const tab = notif.buttonUrl || 'inicio';
                        if (['inicio', 'biblioteca', 'audios', 'cursos', 'perfil'].includes(tab)) {
                          onNavigateToTab(tab);
                        } else if (tab.startsWith('http')) {
                          window.open(tab, '_blank');
                        }
                      }}
                      className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      {notif.buttonText}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Alerta de Vencimento iminente ou Expirado */}
      {subStatus && subStatus.isExpired && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-xs text-red-200 rounded-3xl flex gap-3 text-left items-start" id="expired-alert-banner">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-white text-sm">Seu acesso espiritual expirou!</h4>
            <p className="leading-relaxed">Seu plano <strong className="text-red-400 font-mono">{subStatus.planName}</strong> venceu em {new Date(subStatus.endDate).toLocaleDateString('pt-BR')}. PDFs, Audiobooks e conteúdos temporários foram bloqueados automaticamente. Renove seu plano abaixo para continuar sua jornada.</p>
          </div>
        </div>
      )}

      {subStatus && !subStatus.isExpired && subStatus.daysRemaining <= 5 && (
        <div className="p-4 bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 rounded-3xl flex gap-3 text-left items-start animate-pulse" id="expires-soon-alert-banner">
          <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-white text-sm">Seu acesso vence em breve!</h4>
            <p className="leading-relaxed">Atenção, seu acesso vence em <strong className="text-amber-400 font-bold">{subStatus.daysRemaining} {subStatus.daysRemaining === 1 ? 'dia' : 'dias'}</strong> (vencimento em {new Date(subStatus.endDate).toLocaleDateString('pt-BR')}). Garanta a continuidade dos seus estudos renovando seu plano.</p>
          </div>
        </div>
      )}

      {/* Header de boas vindas com saudações - DINÂMICO baseados na Config */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden" id="dashboard-header-card">
        {/* Luz dourada mística */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10 text-left">
          <div className="flex items-center gap-2 text-amber-500 text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Portal Aluno</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">{user.name}</span>
          </h1>
          <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
            {config.homeSubtitle || "Seja muito bem-vindo ao seu refúgio de paz. Seu nível de sintonia espiritual inicial é o Nível X."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10" id="dashboard-plan-tag">
          {subStatus && !subStatus.isExpired ? (
            <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-2xl flex items-center gap-2.5 shadow-sm">
              <Award className="w-4 h-4 text-emerald-500 animate-bounce" />
              <div className="text-left bg-transparent">
                <span className="block text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Inscrição Ativa</span>
                <span className="text-[11px] font-bold text-white max-w-[140px] truncate block">{subStatus.planName}</span>
                <span className="text-[9px] text-emerald-500 font-mono font-medium block">Vence em: {new Date(subStatus.endDate).toLocaleDateString('pt-BR')} ({subStatus.daysRemaining}d)</span>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold rounded-2xl flex items-center gap-2.5 shadow-sm">
              <Lock className="w-4 h-4 text-zinc-600 animate-pulse" />
              <div className="text-left bg-transparent">
                <span className="block text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Inscrição</span>
                <span className="text-[11px] font-bold text-zinc-300 block">Sem Plano Ativo</span>
                <span className="text-[9px] text-zinc-500 block">Escolha um plano de luz abaixo</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTINUAR DE ONDE PAROU (SISTEMA DE CONTINUIDADE) */}
      {continuity && (continuity.pdf || continuity.audiobook || continuity.course) && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 text-left space-y-4" id="continuity-section">
          <div className="flex items-center gap-1.5 text-amber-500 text-[10px] uppercase tracking-widest font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Continuar de Onde Parou</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PDF Progress */}
            {continuity.pdf && (
              <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-1 bg-transparent">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold font-sans">Livro Digital</span>
                  <h4 className="font-serif font-bold text-white text-xs truncate">{continuity.pdf.bookTitle}</h4>
                  <p className="text-[10px] text-zinc-400 font-sans">Página {continuity.pdf.lastPage} de {continuity.pdf.totalPages}</p>
                </div>
                
                <div className="space-y-1.5 bg-transparent">
                  <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${continuity.pdf.percentage}%` }} />
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem(`spirit_resume_pdf_${user.id}`, 'true');
                      onNavigateToTab('biblioteca');
                    }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Continuar Lendo
                  </button>
                </div>
              </div>
            )}

            {/* Audiobook Progress */}
            {continuity.audiobook && (
              <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-1 bg-transparent">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold font-sans">Mantra / Audiobook</span>
                  <h4 className="font-serif font-bold text-white text-xs truncate">{continuity.audiobook.audioTitle}</h4>
                  <p className="text-[10px] text-zinc-400 font-sans">
                    {Math.floor(continuity.audiobook.lastSecond / 60)}m / {Math.floor(continuity.audiobook.totalSeconds / 60)}m
                  </p>
                </div>
                
                <div className="space-y-1.5 bg-transparent">
                  <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${continuity.audiobook.percentage}%` }} />
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem(`spirit_last_track_id_${user.id}`, continuity.audiobook.audioId);
                      onNavigateToTab('audios');
                    }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Continuar Ouvindo
                  </button>
                </div>
              </div>
            )}

            {/* Course Progress */}
            {continuity.course && (
              <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-1 bg-transparent">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold font-sans">Escola de Mistérios</span>
                  <h4 className="font-serif font-bold text-white text-xs truncate">{continuity.course.courseTitle}</h4>
                  <p className="text-[10px] text-zinc-400 font-sans truncate">{continuity.course.lessonTitle}</p>
                </div>
                
                <div className="space-y-1.5 bg-transparent">
                  <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${continuity.course.percentage}%` }} />
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem(`spirit_resume_course_${user.id}`, continuity.course.courseId);
                      onNavigateToTab('cursos');
                    }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Continuar Estudando
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ÁREA DE OFERTAS E ANÚNCIOS (Somente se ofertas estiverem ativas nas configurações) */}
      {config.screenToggles.offers && ads.length > 0 && (
        <div className="space-y-4 text-left" id="dashboard-ads-section">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Ofertas e Avisos</span>
            <div className="h-px bg-zinc-900 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="ads-grid">
            {ads.map((ad) => (
              <div 
                key={ad.id}
                className={`p-5 rounded-3xl bg-gradient-to-br ${ad.bannerGradient} border border-zinc-900 hover:border-amber-500/10 transition-all flex flex-col justify-between text-left space-y-4`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    {ad.badge && (
                      <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-500 font-bold uppercase tracking-widest rounded-lg">
                        {ad.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-white text-base leading-tight">{ad.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">{ad.description}</p>
                </div>

                {ad.actionText && (
                  <button 
                    onClick={() => {
                      if (ad.badge?.includes('CURSO')) {
                        onNavigateToTab('cursos');
                      } else {
                        const el = document.getElementById('plans-pricing-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-amber-500 rounded-xl transition-all w-fit cursor-pointer"
                  >
                    {ad.actionText}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cartão de Insight Espiritual do Dia (Respeita toggles de banner) */}
      {config.screenToggles.banners && (
        <div className="p-6 sm:p-8 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 border border-amber-500/10 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6" id="dashboard-insight-card">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
            <Flame className="w-7 h-7" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left bg-transparent">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-500">Sabedoria do Dia</span>
            <p className="text-sm text-zinc-300 font-sans italic leading-relaxed">
              "{insight}"
            </p>
          </div>
        </div>
      )}

      {/* Grid de Seções e Conteúdos (Respeita Toggles de Tela) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-sections-grid">
        {/* Biblioteca Card */}
        {config.screenToggles.pdfs && (
          <div 
            onClick={() => onNavigateToTab('biblioteca')}
            className="p-6 bg-zinc-950 hover:bg-zinc-900/50 border border-zinc-900 hover:border-amber-500/20 rounded-3xl transition-all duration-300 cursor-pointer group space-y-4 text-left"
            id="section-card-library"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base">Biblioteca de E-books</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Leituras profundas, pergaminhos e sabedorias milenares para iluminar sua jornada.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold group-hover:gap-2.5 transition-all pt-2">
              <span>Explorar acervo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Áudios Card */}
        {config.screenToggles.audiobooks && (
          <div 
            onClick={() => onNavigateToTab('audios')}
            className="p-6 bg-zinc-950 hover:bg-zinc-900/50 border border-zinc-900 hover:border-amber-500/20 rounded-3xl transition-all duration-300 cursor-pointer group space-y-4 text-left"
            id="section-card-audios"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base">Sons e Mantras Binaurais</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Frequências de cura, mantras sagrados e meditações guiadas de alta vibração sonora.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold group-hover:gap-2.5 transition-all pt-2">
              <span>Sintonizar agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Cursos Card */}
        {config.screenToggles.courses && (
          <div 
            onClick={() => onNavigateToTab('cursos')}
            className="p-6 bg-zinc-950 hover:bg-zinc-900/50 border border-zinc-900 hover:border-amber-500/20 rounded-3xl transition-all duration-300 cursor-pointer group space-y-4 text-left"
            id="section-card-courses"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base">Escola de Mistérios</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Treinamentos guiados, aulas de ascensão, chacras e expansão com vídeos e lições.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold group-hover:gap-2.5 transition-all pt-2">
              <span>Acessar as aulas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* 2. GESTÃO DOS BOTÕES/LINKS CONFIGURÁVEIS DO ADMINISTRADOR */}
      {config.buttons && config.buttons.length > 0 && (
        <div className="p-6 sm:p-8 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 text-left" id="dynamic-shortcuts-section">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-500 text-xs uppercase tracking-widest font-semibold">
              <Compass className="w-4 h-4" />
              <span>Canais de Luz Recomendados</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-white tracking-wide">Canais de Atendimento & Checkout</h3>
            <p className="text-xs text-zinc-500">Acesse diretamente os checkouts, canais promocionais e redes sintonizados pela administração.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1" id="shortcuts-grid">
            {config.buttons.map((btn) => {
              const BtnIcon = (Icons as any)[btn.iconName] || Icons.Compass;
              
              const handleButtonClick = (e: React.MouseEvent) => {
                if (btn.destinationUrl.startsWith('#')) {
                  e.preventDefault();
                  const targetId = btn.destinationUrl.substring(1);
                  const el = document.getElementById(targetId);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else if (btn.destinationUrl === 'biblioteca' || btn.destinationUrl === 'audios' || btn.destinationUrl === 'cursos') {
                  e.preventDefault();
                  onNavigateToTab(btn.destinationUrl);
                }
              };

              return (
                <a
                  key={btn.id}
                  href={btn.destinationUrl}
                  onClick={handleButtonClick}
                  target={btn.openInApp ? "_self" : "_blank"}
                  rel="noreferrer"
                  className="px-4 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-2xl transition-all duration-300 flex items-center justify-between text-xs font-semibold cursor-pointer group hover:border-amber-500/25 active:scale-99"
                  id={`shortcut-btn-${btn.id}`}
                >
                  <div className="flex items-center gap-2.5 bg-transparent">
                    <BtnIcon className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>{btn.text}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTATO DIRETO WHATSAPP (SUPORTE & SINTONIAS) */}
      <div className="p-6 sm:p-8 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 text-left" id="whatsapp-quick-contacts-section">
        <div className="space-y-1 bg-transparent">
          <div className="flex items-center gap-1.5 text-emerald-500 text-xs uppercase tracking-widest font-semibold">
            <Icons.Phone className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Atendimento Rápido pelo WhatsApp</span>
          </div>
          <h3 className="text-lg font-serif font-bold text-white tracking-wide">Suporte & Sintonias Diretas</h3>
          <p className="text-xs text-zinc-500">Conecte-se com a administração pelo WhatsApp para renovações, sintonias de acesso e suporte individual.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Renovar Acesso */}
          <a
            href={`https://wa.me/55${config.contactWhatsApp || '21959589856'}?text=Olá!%20Gostaria%20de%20renovar%20meu%20acesso%20aos%20conteúdos%20do%20portal.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/20 text-zinc-300 hover:text-white rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
          >
            <Icons.RefreshCw className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Renovar Acesso</span>
          </a>

          {/* Comprar Plano */}
          <a
            href={`https://wa.me/55${config.contactWhatsApp || '21959589856'}?text=Olá!%20Quero%20adquirir%20um%20plano%20premium%20de%20estudos%20no%20Despertar%20Espiritualidade.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/20 text-zinc-300 hover:text-white rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
          >
            <Icons.ShoppingBag className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Comprar Plano</span>
          </a>

          {/* Pedir Conteúdo */}
          <button
            onClick={() => onNavigateToTab('pedidos')}
            className="px-4 py-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/20 text-zinc-300 hover:text-white rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
          >
            <Icons.MessageSquarePlus className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Pedir Conteúdo</span>
          </button>

          {/* Falar com Suporte */}
          <a
            href={`https://wa.me/55${config.contactWhatsApp || '21959589856'}?text=Olá!%20Preciso%20de%20ajuda%20ou%20suporte%20técnico%20com%20minha%20conta%20no%20portal.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/20 text-zinc-300 hover:text-white rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
          >
            <Icons.LifeBuoy className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Falar com Suporte</span>
          </a>
        </div>
      </div>

      {/* SEÇÃO DE PLANOS E PREÇOS */}
      <div className="p-6 sm:p-8 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 text-left" id="plans-pricing-section">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-amber-500 text-xs uppercase tracking-widest font-semibold">
            <ShoppingBag className="w-4 h-4" />
            <span>Planos de Luz</span>
          </div>
          <h3 className="text-lg font-serif font-bold text-white tracking-wide">Selecione Seu Grau de Acesso</h3>
          <p className="text-xs text-zinc-500">Adquira e sintonize seu plano sagrado de estudos. Valores listados em Real Brasileiro (R$).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="plans-grid">
          {plans.map((plan) => {
            const isUserCurrentPlan = subStatus && !subStatus.isExpired && subStatus.planId === plan.id;
            const priceOptions = plan.priceOptions && plan.priceOptions.length > 0
              ? plan.priceOptions
              : (PLAN_DURATIONS[plan.id] || []);

            return (
              <div 
                key={plan.id}
                className={`p-6 rounded-3xl bg-zinc-900/40 border flex flex-col justify-between space-y-6 relative ${
                  isUserCurrentPlan ? 'border-amber-500/40 bg-amber-500/[0.01]' : 'border-zinc-900'
                }`}
              >
                {isUserCurrentPlan && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-500 font-bold uppercase tracking-widest rounded-lg">
                    Seu Plano Atual
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-serif font-bold text-white leading-tight">{plan.name}</h4>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Preços e Períodos */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block">Opções de Duração:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {priceOptions.map((opt, idx) => (
                        <div key={idx} className="p-2 bg-black/40 rounded-xl border border-zinc-900 flex flex-col items-center">
                          <span className="text-[10px] text-zinc-400 font-medium">{opt.label}</span>
                          <span className="font-mono font-bold text-amber-500 mt-0.5">R$ {opt.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conteúdos Liberados */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block">Acervo Liberado:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {plan.allowedContentTypes.map((type, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[9px] uppercase tracking-wider font-mono text-zinc-400 rounded-md">
                          {type === 'pdf' ? 'E-books PDF' : type === 'audiobook' ? 'Audiobooks' : type === 'video' ? 'Vídeos' : 'Cursos'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  id={`btn-adquire-plan-${plan.id}`}
                  onClick={() => handleOpenCheckout(plan)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    isUserCurrentPlan
                      ? 'bg-zinc-900 text-amber-500 hover:text-amber-400 border border-zinc-800'
                      : 'bg-gradient-to-r from-amber-600 to-amber-500 text-black hover:scale-[1.01]'
                  }`}
                >
                  {isUserCurrentPlan ? 'Renovar / Estender' : 'Sintonizar Plano'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" id="checkout-modal-overlay">
            <motion.div
              id="checkout-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl text-left flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5" id="checkout-header">
                <h4 className="text-lg font-serif font-bold text-white tracking-wide">Checkout Sagrado</h4>
                <button
                  id="btn-close-checkout"
                  onClick={() => setSelectedPlan(null)}
                  className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 cursor-pointer"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {checkoutStep !== 'success' ? (
                <form onSubmit={handleProcessCheckout} className="space-y-4 overflow-y-auto pr-1 flex-1 text-left" id="checkout-form">
                  <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900 space-y-1 text-left">
                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest font-mono">Produto Selecionado</span>
                    <h5 className="font-serif font-bold text-white text-sm">{selectedPlan.name}</h5>
                    <p className="text-[11px] text-zinc-500 font-sans">{selectedPlan.description}</p>
                  </div>

                  {/* Seleção de Duração */}
                  <div className="space-y-2">
                    <span className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500">Selecione o Ciclo de Acesso</span>
                    
                    <div className="flex gap-2.5 pb-2 animate-none" id="checkout-tab-options">
                      <button
                        type="button"
                        onClick={() => setIsCustomDuration(false)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          !isCustomDuration
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-zinc-900 border-zinc-900 text-zinc-500'
                        }`}
                      >
                        Ciclos Predefinidos
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomDuration(true)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          isCustomDuration
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-zinc-900 border-zinc-900 text-zinc-500'
                        }`}
                      >
                        Período Personalizado
                      </button>
                    </div>

                    {!isCustomDuration ? (
                      <div className="grid grid-cols-2 gap-2" id="predefined-durations">
                        {(PLAN_DURATIONS[selectedPlan.id] || []).map((opt, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setSelectedDuration(opt)}
                            className={`p-3 rounded-xl border cursor-pointer text-center transition-all flex flex-col justify-between ${
                              selectedDuration?.days === opt.days
                                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                                : 'bg-black hover:bg-zinc-900/60 border-zinc-900 text-zinc-300'
                            }`}
                          >
                            <span className="text-[11px] uppercase tracking-wider font-bold block">{opt.label}</span>
                            <span className="text-[12px] font-mono font-bold mt-1 block">
                              R$ {opt.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 p-3 bg-zinc-900/30 rounded-2xl border border-zinc-900" id="custom-duration-fields">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Duração (Dias)</label>
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={customDays}
                              onChange={(e) => setCustomDays(e.target.value)}
                              className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-white font-bold font-mono text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Valor (R$)</label>
                            <input
                              type="text"
                              value={customPrice}
                              onChange={(e) => setCustomPrice(e.target.value)}
                              className="w-full px-3 py-2 bg-black border border-zinc-800 rounded-xl text-white font-bold font-mono text-xs outline-none"
                            />
                          </div>
                        </div>
                        <span className="text-[9px] text-zinc-500 italic font-mono block">Escolha livremente qualquer período (Ex: 7, 45, 90 dias) conforme o requisito.</span>
                      </div>
                    )}
                  </div>

                  {/* DEV TOOL / SIMULAÇÃO DE EXPIRAÇÃO */}
                  <div className="p-3 bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl space-y-2 text-left animate-none" id="simulation-helper">
                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider block">Módulo de Simulação para Testes</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSimulationMode('normal')}
                        className={`py-1.5 px-1 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer border ${
                          simulationMode === 'normal'
                            ? 'bg-zinc-800 border-zinc-700 text-white'
                            : 'bg-black border-zinc-900 text-zinc-500'
                        }`}
                      >
                        Acesso Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulationMode('expired')}
                        className={`py-1.5 px-1 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer border ${
                          simulationMode === 'expired'
                            ? 'bg-red-950 text-red-400 border-red-900'
                            : 'bg-black border-zinc-900 text-zinc-500'
                        }`}
                        title="Vence instantaneamente para testar o bloqueio místico do acervo"
                      >
                        Já Expirado
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulationMode('expires_soon')}
                        className={`py-1.5 px-1 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer border ${
                          simulationMode === 'expires_soon'
                            ? 'bg-amber-950 text-amber-400 border-amber-900'
                            : 'bg-black border-zinc-900 text-zinc-500'
                        }`}
                        title="Vence em 4 dias para testar o banner amarelo piscando"
                      >
                        Vence em 4d
                      </button>
                    </div>
                  </div>

                  {/* Botão Confirmar */}
                  <div className="pt-4 border-t border-zinc-900 text-left" id="checkout-actions">
                    <button
                      type="submit"
                      disabled={checkoutLoading}
                      className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{checkoutLoading ? 'Sintonizando Portal...' : 'Confirmar Sintonização'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center space-y-4 flex-1 flex flex-col justify-center items-center" id="checkout-success-view">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
                  </div>
                  <h5 className="font-serif font-bold text-white text-base">Sintonia Estabelecida!</h5>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Seu pagamento místico foi confirmado com sucesso. O portal está totalmente desbloqueado para o seu novo patamar.
                  </p>
                  
                  <button
                    id="btn-finish-checkout-success"
                    onClick={() => {
                      setSelectedPlan(null);
                      loadData();
                    }}
                    className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest text-amber-500 rounded-xl transition-all border border-zinc-800 cursor-pointer"
                  >
                    Começar Estudos
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status da Jornada Espiritual */}
      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 text-left" id="dashboard-jornada-card">
        <h4 className="font-serif text-sm font-semibold text-white tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Sua Jornada de Prática</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="dashboard-stats-grid">
          <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-900 text-center">
            <span className="block text-xl font-bold text-amber-500">1º Dia</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Sincronização</span>
          </div>
          <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-900 text-center">
            <span className="block text-xl font-bold text-zinc-300">Nível {user.accessLevel}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Consciência</span>
          </div>
          <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-900 text-center">
            {subStatus && !subStatus.isExpired ? (
              <span className="block text-xl font-bold text-emerald-400 flex items-center justify-center gap-1">
                <LockOpen className="w-4 h-4" />
                <span>Ativo</span>
              </span>
            ) : (
              <span className="block text-xl font-bold text-red-400 flex items-center justify-center gap-1">
                <Lock className="w-4 h-4" />
                <span>Bloqueado</span>
              </span>
            )}
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Acesso Acervo</span>
          </div>
          <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-900 text-center">
            <span className="block text-xl font-bold text-zinc-300">
              {subStatus && !subStatus.isExpired ? `${subStatus.daysRemaining}d` : 'Expirado'}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Validade</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Pequeno helper de fechar avisos inline
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
