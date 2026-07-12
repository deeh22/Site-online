import { User } from '../types';

export interface PlanPriceOption {
  days: number;
  label: string;
  price: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description: string;
  allowedContentTypes: ('pdf' | 'audiobook' | 'video' | 'curso')[];
  isActive: boolean;
  priceOptions?: PlanPriceOption[];
  benefits?: string[];
}

export interface Purchase {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  price: number;
  purchaseDate: string;
  startDate: string;
  endDate: string;
  contentTypes: string[];
}

export interface PDFBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  coverGradient: string;
  pagesCount: number;
  content: string[];
  allowedPlans: string[]; // plan IDs or 'all'
  requiredLevel: 1 | 2 | 3;
  accessType?: 'free' | 'premium' | 'course'; // 'free' = Acesso Gratuito, 'premium' = Premium PDF + Audio, 'course' = Cursos
  downloadAllowed?: boolean;
}

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  description: string;
  duration: string;
  category: string;
  coverGradient: string;
  audioUrl?: string;
  accessType?: 'free' | 'premium'; // 'free' = Acesso Gratuito, 'premium' = Premium PDF + Audio
  downloadAllowed?: boolean;
  requiredLevel?: 1 | 2 | 3;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  coverGradient: string;
  modules: CourseModule[];
  accessType?: 'premium_courses' | 'all'; // 'premium_courses' = Cursos Premium
  downloadAllowed?: boolean;
  requiredLevel?: 1 | 2 | 3;
  instructor?: string;
  modulesCount?: number;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  bannerGradient: string;
  imageUrl?: string;
  badge?: string; // e.g. "NOVIDADE", "OFERTA", "CURSO NOVO"
  isActive: boolean;
  actionText?: string;
  price?: string; // customizable price representation
  buttonLink?: string; // custom button sale link
}

// --- NOVOS MODELOS DE CONFIGURAÇÃO ADMINISTRATIVA ---

export interface ButtonConfig {
  id: string;
  text: string;
  iconName: string;
  imageUrl?: string;
  destinationUrl: string;
  openInApp: boolean;
}

export interface ScreenToggles {
  offers: boolean;     // Tela de ofertas / banners
  courses: boolean;    // Tela de cursos
  audiobooks: boolean; // Tela de audiobooks
  pdfs: boolean;       // Tela de PDFs
  banners: boolean;    // Banners gerais
  notices: boolean;    // Notificações / Avisos
}

export interface CreatorConfig {
  name: string;
  photoUrl: string;
  bio: string;
  description: string;
  message: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

export interface FreePlanConfig {
  pdfLimit: number;
  audiobookLimit: number;
  allowedPdfs: string[];
  allowedAudiobooks: string[];
}

export interface AppConfig {
  appName: string;
  logoIcon: string;
  logoText: string;
  coverImage: string;
  homeTitle: string;
  homeSubtitle: string;
  insights: string[];
  contactWhatsApp: string;
  contactEmail: string;
  buttons: ButtonConfig[];
  screenToggles: ScreenToggles;
  creatorConfig?: CreatorConfig;
  freePlanConfig?: FreePlanConfig;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  targetGroup: 'all' | 'level_1' | 'level_2' | 'level_3' | 'admins' | 'subscribers';
  createdAt: string;
  isActive: boolean;
}

export interface UserManualPermissions {
  userId: string;
  allowedPdfs: string[];       // list of PDF IDs or 'all' or empty
  allowedAudiobooks: string[]; // list of Audiobook IDs or 'all' or empty
  allowedCourses: string[];    // list of Course IDs or 'all' or empty
  expirationDate: string;      // ISO Date or 'permanent'
}

export interface ContentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestType: 'pdf' | 'audiobook' | 'suggestion';
  title: string;
  message: string;
  date: string;
  status: 'pending' | 'fulfilled';
  reply?: string;
}

export interface PDFProgress {
  bookId: string;
  bookTitle: string;
  lastPage: number;
  totalPages: number;
  percentage: number;
  timestamp: string;
}

export interface AudiobookProgress {
  audioId: string;
  audioTitle: string;
  lastSecond: number;
  totalSeconds: number;
  percentage: number;
  timestamp: string;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  percentage: number;
  timestamp: string;
}

export interface ContinuityProgress {
  pdf?: PDFProgress;
  audiobook?: AudiobookProgress;
  course?: CourseProgress;
}

// Keys para LocalStorage
const PLANS_KEY = 'spirit_plans';
const PURCHASES_KEY = 'spirit_purchases';
const PDFS_KEY = 'spirit_pdfs';
const AUDIOBOOKS_KEY = 'spirit_audiobooks';
const COURSES_KEY = 'spirit_courses';
const ADS_KEY = 'spirit_ads';

// Novas Keys
const APP_CONFIG_KEY = 'spirit_app_config';
const NOTIFICATIONS_KEY = 'spirit_notifications';
const USER_PERMISSIONS_KEY = 'spirit_user_permissions';
const REQUESTS_KEY = 'spirit_requests';
const CONTINUITY_KEY = 'spirit_continuity';

// SEED DATA INICIAIS
const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-free',
    name: 'Acesso Gratuito',
    price: 0,
    durationDays: 3650,
    description: 'Acesso básico gratuito aos e-books e sintonias em áudio configurados pela administração.',
    allowedContentTypes: ['pdf', 'audiobook'],
    isActive: true,
    benefits: ['Acesso a livros selecionados', 'Acesso a áudios selecionados', 'Limites diários configurados pela administração']
  },
  {
    id: 'plan-premium',
    name: 'PDF + Audiobooks Premium',
    price: 29.99,
    durationDays: 30,
    description: 'Acesso total ilimitado aos livros digitais e sintonias em áudio de alta fidelidade espiritual.',
    allowedContentTypes: ['pdf', 'audiobook'],
    isActive: true,
    priceOptions: [
      { days: 15, label: '15 dias', price: 14.99 },
      { days: 30, label: '30 dias', price: 29.99 },
      { days: 365, label: '1 ano', price: 249.99 }
    ],
    benefits: ['Acesso ilimitado diário aos PDFs', 'Acesso ilimitado diário aos audiobooks', 'Suporte prioritário por canal exclusivo']
  },
  {
    id: 'plan-courses',
    name: 'Cursos Premium',
    price: 99.99,
    durationDays: 30,
    description: 'Acesso à Escola de Mistérios com lições integradas, meditações guiadas, aulas em vídeo e materiais exclusivos.',
    allowedContentTypes: ['pdf', 'audiobook', 'curso'],
    isActive: true,
    priceOptions: [
      { days: 30, label: '30 dias', price: 49.99 },
      { days: 90, label: '90 dias', price: 119.99 },
      { days: 365, label: 'Acesso Permanente', price: 299.99 }
    ],
    benefits: ['Todos os cursos liberados', 'Aulas em vídeo integradas', 'Acompanhamento do progresso de aulas']
  }
];

const INITIAL_PDFS: PDFBook[] = [
  {
    id: 'b1',
    title: 'O Despertar da Alma',
    author: 'Hermes Trismegistus',
    category: 'Iniciação',
    description: 'Um estudo introdutório sobre os princípios herméticos, a vibração do ser e como alinhar seus corpos sutis à harmonia universal.',
    requiredLevel: 1,
    coverGradient: 'from-amber-950 via-zinc-950 to-amber-900',
    pagesCount: 14,
    allowedPlans: ['all'],
    accessType: 'free',
    content: [
      "Capítulo 1: O Princípio do Mentalismo. O Todo é Mente; o Universo é Mental. Compreender este princípio é dominar a chave da alquimia mental.",
      "Capítulo 2: A Lei da Correspondência. O que está em cima é como o que está embaixo. O macrocosmo reflete o microcosmo celular de sua própria alma.",
      "Capítulo 3: A Vibração Sagrada. Nada está parado; tudo se move; tudo vibra. Sintonize sua intenção com frequências mais elevadas de amor e paz."
    ]
  },
  {
    id: 'b2',
    title: 'Cura pelos Chacras e Prana',
    author: 'Swami Sivananda',
    category: 'Práticas',
    description: 'Guia prático para desobstrução, alinhamento e fluxo energético dos sete vórtices principais que regulam a biologia e as emoções.',
    requiredLevel: 1,
    coverGradient: 'from-zinc-950 via-amber-950 to-zinc-900',
    pagesCount: 22,
    allowedPlans: ['all'],
    accessType: 'free',
    content: [
      "Capítulo 1: Muladhara, a Raiz da Estabilidade. Localizado na base da espinha, este centro regula sua conexão segura com a Terra e sua vitalidade.",
      "Capítulo 2: Swadhisthana e Manipura. O fluxo da criatividade líquida e o centro de força de vontade, localizados no sacro e plexo solar.",
      "Capítulo 3: Anahata, o Templo do Coração. O portal que une o físico ao divino através do amor incondicional e da compaixão cósmica."
    ]
  },
  {
    id: 'b3',
    title: 'Cabalá Prática e Sincronicidade',
    author: 'Dr. Isaac Luria',
    category: 'Mistérios',
    description: 'Segredos da árvore da vida, a geometria sagrada das dez Sephiroth e como ler as sintonias que o Universo coloca no seu cotidiano.',
    requiredLevel: 2,
    coverGradient: 'from-amber-900 via-zinc-950 to-zinc-950',
    pagesCount: 38,
    allowedPlans: ['plan-premium'],
    accessType: 'premium',
    content: [
      "Capítulo 1: As Dez Emanações. Da coroa insondável de Kether até o reino físico de Malkuth, as forças moldam toda a realidade visível.",
      "Capítulo 2: Sincronicidade de Jung e a Cabalá. Quando eventos internos e externos se alinham sem causa aparente, as letras sagradas estão operando.",
      "Capítulo 3: Exercício de Tikkun (Reparação). Como curar fragmentos de sua própria alma através de pequenas meditações ativas diárias."
    ]
  }
];

const INITIAL_AUDIOBOOKS: Audiobook[] = [
  {
    id: 'a1',
    title: 'Frequência de Cura Solfeggio 528Hz',
    author: 'Sintonias de Luz',
    description: 'Frequência sagrada conhecida como tom de milagre e transformação celular. Ideal para reparações profundas de DNA.',
    duration: '45:12',
    category: 'Binaural',
    accessType: 'free',
    coverGradient: 'from-zinc-950 via-amber-950 to-amber-950'
  },
  {
    id: 'a2',
    title: 'Meditação Guiada: Ancorando a Presença',
    author: 'Mestre Gabriel',
    description: 'Ancoragem profunda no silêncio cósmico do Agora. Exercícios de respiração prânica e desapego.',
    duration: '24:05',
    category: 'Meditação',
    accessType: 'premium',
    coverGradient: 'from-amber-900 via-zinc-950 to-zinc-950'
  }
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Senda de Introdução ao Autoconhecimento',
    category: 'Teoria e Prática',
    coverGradient: 'from-zinc-950 via-amber-950 to-zinc-950',
    description: 'Desperte seu potential interno através do estudo fundamental da mente, respiração consciente e iniciação aos corpos sutis.',
    accessType: 'premium_courses',
    modules: [
      {
        id: 'c1-m1',
        title: 'Módulo 1: O Observador Silencioso',
        lessons: [
          {
            id: 'c1-m1-l1',
            title: 'Aula 1: Introdução ao Silêncio Ativo',
            description: 'Aprenda a sentar em silêncio e observar seus pensamentos sem se identificar com eles.',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            pdfUrl: 'Básico de meditação prática'
          },
          {
            id: 'c1-m1-l2',
            title: 'Aula 2: Respiração de Fogo (Pranayama)',
            description: 'Técnica de purificação do canal sutil central e elevação energética imediata.',
            audioUrl: 'Guia de respiração pranayama'
          }
        ]
      }
    ]
  }
];

const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'Desconto Exclusivo de Inverno',
    description: 'Atualize seu plano para o pacote PDF + Audiobooks e economize 30% na renovação anual.',
    bannerGradient: 'from-amber-950/80 via-zinc-950 to-amber-900/40',
    badge: 'PROMOÇÃO',
    isActive: true,
    actionText: 'Garantir Desconto',
    price: 'R$ 249,99',
    buttonLink: 'https://wa.me/5521959589856?text=Quero%20o%20desconto%20de%20inverno%20anual!'
  },
  {
    id: 'ad-2',
    title: 'Novo Curso: Alquimia da Flor da Vida',
    description: 'Aprenda as fórmulas geométricas dos antigos mestres. Acesso vitalício livre de expiração!',
    bannerGradient: 'from-zinc-950/90 via-zinc-900 to-amber-950/40',
    badge: 'CURSO NOVO',
    isActive: true,
    actionText: 'Explorar Curso',
    price: 'R$ 49,99',
    buttonLink: 'https://wa.me/5521959589856?text=Quero%20o%20curso%20Alquimia%20da%20Flor%20da%20Vida!'
  }
];

// Seed Inicial de Configuração do App
const DEFAULT_APP_CONFIG: AppConfig = {
  appName: "Despertar Espiritualidade",
  logoIcon: "Compass",
  logoText: "Despertar",
  coverImage: "from-black via-zinc-950 to-black",
  homeTitle: "Despertar Espiritualidade",
  homeSubtitle: "Sua jornada de autoconhecimento, frequências sonoras e meditação profunda.",
  insights: [
    "A espiritualidade não é um destino, mas a sintonia fina do seu olhar sobre a vida.",
    "Silencie o barulho do mundo lá fora e escute a sabedoria que já habita em você.",
    "Cada respiração é uma oportunidade de se reconectar com a energia criadora do Universo.",
    "Sua vibração atrai a sua realidade. Cultive pensamentos de gratidão, paz e elevação espiritual.",
    "O autoconhecimento é a única chave capaz de abrir os portais da verdadeira liberdade e paz interior."
  ],
  contactWhatsApp: "21959589856",
  contactEmail: "contato@despertarespiritualidade.com",
  buttons: [
    {
      id: 'btn-buy-pdf',
      text: 'Comprar Acesso PDF',
      iconName: 'BookOpen',
      destinationUrl: '#plans-pricing-section',
      openInApp: true
    },
    {
      id: 'btn-buy-premium',
      text: 'Comprar PDF + Audiobooks',
      iconName: 'Volume2',
      destinationUrl: '#plans-pricing-section',
      openInApp: true
    },
    {
      id: 'btn-support-whatsapp',
      text: 'Suporte no WhatsApp',
      iconName: 'MessageCircle',
      destinationUrl: 'https://wa.me/5521959589856',
      openInApp: false
    }
  ],
  screenToggles: {
    offers: true,
    courses: true,
    audiobooks: true,
    pdfs: true,
    banners: true,
    notices: true
  },
  creatorConfig: {
    name: "Mestre Gabriel",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    bio: "Iniciado nas artes herméticas e meditação prânica há mais de 15 anos. Dedicado a guiar almas no despertar da consciência e cura interior.",
    description: "Criador e mentor espiritual do portal Despertar Espiritualidade, auxiliando milhares de buscadores ao redor do mundo.",
    message: "A luz que você busca fora já brilha intensamente no altar do seu próprio coração. Permita-se silenciar e recordar.",
    instagram: "https://instagram.com/despertar",
    facebook: "https://facebook.com/despertar",
    youtube: "https://youtube.com/despertar"
  },
  freePlanConfig: {
    pdfLimit: 3,
    audiobookLimit: 3,
    allowedPdfs: ['b1', 'b2'],
    allowedAudiobooks: ['a1']
  }
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Boas-vindas ao Portal Sagrado!',
    message: 'Explore nosso acervo sintonizado de livros digitais, mantras e sintonias de cura.',
    targetGroup: 'all',
    createdAt: new Date().toISOString(),
    isActive: true,
    buttonText: 'Explorar Acervo',
    buttonUrl: 'biblioteca'
  }
];

// Recupera de forma segura as listas do LocalStorage
const getStored = <T>(key: string, initial: T[]): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  } catch {
    return initial;
  }
};

const saveStored = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Erro ao salvar no localStorage: ${key}`, e);
  }
};

export const dataService = {
  // --- PLANOS ---
  getPlans(): Plan[] {
    const plans = getStored<Plan>(PLANS_KEY, INITIAL_PLANS);
    if (plans.length === 0) {
      saveStored(PLANS_KEY, INITIAL_PLANS);
      return INITIAL_PLANS;
    }
    return plans;
  },

  savePlan(plan: Plan): void {
    const plans = this.getPlans();
    const index = plans.findIndex(p => p.id === plan.id);
    if (index >= 0) {
      plans[index] = plan;
    } else {
      plans.push(plan);
    }
    saveStored(PLANS_KEY, plans);
  },

  deletePlan(planId: string): void {
    const plans = this.getPlans().filter(p => p.id !== planId);
    saveStored(PLANS_KEY, plans);
  },

  // --- COMPRAS / TRANSAÇÕES / VALIDADES ---
  getPurchases(): Purchase[] {
    return getStored<Purchase>(PURCHASES_KEY, []);
  },

  createPurchase(purchase: Omit<Purchase, 'id'>): Purchase {
    const purchases = this.getPurchases();
    const newPurchase: Purchase = {
      ...purchase,
      id: `purch-${Math.random().toString(36).substring(2, 9)}`,
    };
    purchases.push(newPurchase);
    saveStored(PURCHASES_KEY, purchases);
    return newPurchase;
  },

  deletePurchase(id: string): void {
    const purchases = this.getPurchases().filter(p => p.id !== id);
    saveStored(PURCHASES_KEY, purchases);
  },

  // Retorna o status de inscrição do usuário
  getUserSubscription(userId: string): {
    active: boolean;
    planId: string;
    planName: string;
    endDate: string;
    daysRemaining: number;
    allowedTypes: string[];
    isExpired: boolean;
  } | null {
    const purchases = this.getPurchases();
    const userPurchases = purchases
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    if (userPurchases.length === 0) {
      return null;
    }

    const latest = userPurchases[0];
    const now = new Date();
    const expiration = new Date(latest.endDate);
    const isExpired = expiration.getTime() < now.getTime();
    
    const diffTime = expiration.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      active: !isExpired,
      planId: latest.planId,
      planName: latest.planName,
      endDate: latest.endDate,
      daysRemaining,
      allowedTypes: latest.contentTypes,
      isExpired
    };
  },

  // Liberação manual pelo Administrador
  grantManualAccess(userId: string, userEmail: string, userName: string, planId: string, durationDays: number): Purchase {
    const plans = this.getPlans();
    const plan = plans.find(p => p.id === planId) || plans[0];
    
    const now = new Date();
    const expDate = new Date();
    expDate.setDate(now.getDate() + durationDays);

    return this.createPurchase({
      userId,
      userEmail,
      userName,
      planId: plan.id,
      planName: plan.name,
      price: 0, // Manual / Cortesia
      purchaseDate: now.toISOString(),
      startDate: now.toISOString(),
      endDate: expDate.toISOString(),
      contentTypes: plan.allowedContentTypes
    });
  },

  // --- LIVROS PDF ---
  getPDFs(): PDFBook[] {
    return getStored<PDFBook>(PDFS_KEY, INITIAL_PDFS);
  },

  savePDF(pdf: PDFBook): void {
    const pdfs = this.getPDFs();
    const index = pdfs.findIndex(p => p.id === pdf.id);
    if (index >= 0) {
      pdfs[index] = pdf;
    } else {
      pdfs.push(pdf);
    }
    saveStored(PDFS_KEY, pdfs);
  },

  deletePDF(id: string): void {
    const pdfs = this.getPDFs().filter(p => p.id !== id);
    saveStored(PDFS_KEY, pdfs);
  },

  // --- AUDIOBOOKS ---
  getAudiobooks(): Audiobook[] {
    return getStored<Audiobook>(AUDIOBOOKS_KEY, INITIAL_AUDIOBOOKS);
  },

  saveAudiobook(audio: Audiobook): void {
    const audios = this.getAudiobooks();
    const index = audios.findIndex(a => a.id === audio.id);
    if (index >= 0) {
      audios[index] = audio;
    } else {
      audios.push(audio);
    }
    saveStored(AUDIOBOOKS_KEY, audios);
  },

  deleteAudiobook(id: string): void {
    const audios = this.getAudiobooks().filter(a => a.id !== id);
    saveStored(AUDIOBOOKS_KEY, audios);
  },

  // --- CURSOS ---
  getCourses(): Course[] {
    return getStored<Course>(COURSES_KEY, INITIAL_COURSES);
  },

  saveCourse(course: Course): void {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    saveStored(COURSES_KEY, courses);
  },

  deleteCourse(id: string): void {
    const courses = this.getCourses().filter(c => c.id !== id);
    saveStored(COURSES_KEY, courses);
  },

  // --- ANÚNCIOS / OFERTAS ---
  getAds(): Advertisement[] {
    return getStored<Advertisement>(ADS_KEY, INITIAL_ADS);
  },

  saveAd(ad: Advertisement): void {
    const ads = this.getAds();
    const index = ads.findIndex(a => a.id === ad.id);
    if (index >= 0) {
      ads[index] = ad;
    } else {
      ads.push(ad);
    }
    saveStored(ADS_KEY, ads);
  },

  deleteAd(id: string): void {
    const ads = this.getAds().filter(a => a.id !== id);
    saveStored(ADS_KEY, ads);
  },

  // --- CONTROLE DE CONFIGURAÇÕES GERAIS DO APP ---
  getAppConfig(): AppConfig {
    try {
      const data = localStorage.getItem(APP_CONFIG_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Garante que novos campos inseridos fiquem preenchidos com os defaults
        return { ...DEFAULT_APP_CONFIG, ...parsed };
      }
    } catch (e) {
      console.error('Erro ao ler AppConfig:', e);
    }
    return DEFAULT_APP_CONFIG;
  },

  saveAppConfig(config: AppConfig): void {
    try {
      localStorage.setItem(APP_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Erro ao salvar AppConfig:', e);
    }
  },

  // --- SISTEMA DE NOTIFICAÇÕES ---
  getNotifications(): Notification[] {
    return getStored<Notification>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
  },

  saveNotification(notification: Notification): void {
    const notifs = this.getNotifications();
    const index = notifs.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      notifs[index] = notification;
    } else {
      notifs.push(notification);
    }
    saveStored(NOTIFICATIONS_KEY, notifs);
  },

  deleteNotification(id: string): void {
    const notifs = this.getNotifications().filter(n => n.id !== id);
    saveStored(NOTIFICATIONS_KEY, notifs);
  },

  // --- CONTROLE DE ACESSO MANUAL INDIVIDUAL ---
  getUserManualPermissionsList(): UserManualPermissions[] {
    return getStored<UserManualPermissions>(USER_PERMISSIONS_KEY, []);
  },

  getUserManualPermissions(userId: string): UserManualPermissions | null {
    const list = this.getUserManualPermissionsList();
    const found = list.find(p => p.userId === userId);
    return found || null;
  },

  saveUserManualPermissions(perms: UserManualPermissions): void {
    const list = this.getUserManualPermissionsList();
    const index = list.findIndex(p => p.userId === perms.userId);
    if (index >= 0) {
      list[index] = perms;
    } else {
      list.push(perms);
    }
    saveStored(USER_PERMISSIONS_KEY, list);
  },

  deleteUserManualPermissions(userId: string): void {
    const list = this.getUserManualPermissionsList().filter(p => p.userId !== userId);
    saveStored(USER_PERMISSIONS_KEY, list);
  },

  // --- VERIFICAÇÃO DE SEGURANÇA / BLOQUEIOS (ATUALIZADA COM ACESSO GRATUITO E LIMITES) ---
  canAccessContent(
    userId: string, 
    userRole: string, 
    contentType: 'pdf' | 'audiobook' | 'video' | 'curso', 
    planRestriction?: string[],
    contentId?: string
  ): {
    allowed: boolean;
    reason: 'expired' | 'no_plan' | 'unauthorized' | 'ok' | 'limit_reached';
  } {
    // Administrador tem acesso irrestrito absoluto
    if (userRole === 'ADMIN') {
      return { allowed: true, reason: 'ok' };
    }

    // 1. VERIFICA SOBREPOSIÇÃO DE PERMISSÕES MANUAIS INDIVIDUAIS
    const manualPerms = this.getUserManualPermissions(userId);
    if (manualPerms) {
      const isPermanent = manualPerms.expirationDate === 'permanent';
      const isNotExpired = isPermanent || new Date(manualPerms.expirationDate).getTime() > Date.now();
      
      if (isNotExpired) {
        let allowedByManual = false;
        if (contentType === 'pdf') {
          if (manualPerms.allowedPdfs.includes('all') || (contentId && manualPerms.allowedPdfs.includes(contentId))) {
            allowedByManual = true;
          }
        } else if (contentType === 'audiobook') {
          if (manualPerms.allowedAudiobooks.includes('all') || (contentId && manualPerms.allowedAudiobooks.includes(contentId))) {
            allowedByManual = true;
          }
        } else if (contentType === 'video' || contentType === 'curso') {
          if (manualPerms.allowedCourses.includes('all') || (contentId && manualPerms.allowedCourses.includes(contentId))) {
            allowedByManual = true;
          }
        }

        if (allowedByManual) {
          return { allowed: true, reason: 'ok' };
        }
      }
    }

    // 2. REGRA PARA CURSOS (Acesso Restrito)
    if (contentType === 'curso') {
      const coursesPurchased = localStorage.getItem(`spirit_purchased_courses_${userId}`);
      const courseList = coursesPurchased ? JSON.parse(coursesPurchased) : [];
      if (contentId && courseList.includes(contentId)) {
        return { allowed: true, reason: 'ok' };
      }
      
      const sub = this.getUserSubscription(userId);
      if (sub && !sub.isExpired && sub.allowedTypes.includes('curso')) {
        return { allowed: true, reason: 'ok' };
      }

      if (contentId === 'c1') {
        return { allowed: true, reason: 'ok' };
      }

      return { allowed: false, reason: 'no_plan' };
    }

    // 3. REGRA DE PLANO ATIVO (Sintonizado)
    const sub = this.getUserSubscription(userId);
    if (sub && !sub.isExpired) {
      if (sub.allowedTypes.includes(contentType)) {
        if (planRestriction && planRestriction.length > 0 && !planRestriction.includes('all')) {
          if (planRestriction.includes(sub.planId)) {
            return { allowed: true, reason: 'ok' };
          }
        } else {
          return { allowed: true, reason: 'ok' };
        }
      }
    }

    // 4. REGRA DE ACESSO GRATUITO FALLBACK COM LIMITES CONFIGURÁVEIS
    const appConfig = this.getAppConfig();
    const freeConfig = appConfig.freePlanConfig;
    const limit = contentType === 'pdf' 
      ? (freeConfig?.pdfLimit ?? 3) 
      : (freeConfig?.audiobookLimit ?? 3);

    let isContentFree = false;
    if (contentType === 'pdf') {
      const pdfs = this.getPDFs();
      const pdf = pdfs.find(p => p.id === contentId);
      isContentFree = pdf?.accessType === 'free' || (freeConfig?.allowedPdfs ?? []).includes(contentId || '');
    } else if (contentType === 'audiobook') {
      const audios = this.getAudiobooks();
      const audio = audios.find(a => a.id === contentId);
      isContentFree = audio?.accessType === 'free' || (freeConfig?.allowedAudiobooks ?? []).includes(contentId || '');
    }

    if (!isContentFree) {
      return { allowed: false, reason: sub?.isExpired ? 'expired' : 'no_plan' };
    }

    // Verifica limite de conteúdos abertos
    if (contentId) {
      const openedKey = `spirit_free_opened_${contentType}s_${userId}`;
      const openedList = getStored<string>(openedKey, []);
      if (openedList.includes(contentId)) {
        return { allowed: true, reason: 'ok' };
      }
      if (openedList.length >= limit) {
        return { allowed: false, reason: 'limit_reached' };
      }
    }

    return { allowed: true, reason: 'ok' };
  },

  // Registrar abertura de conteúdo gratuito para controle de limites
  recordContentOpened(userId: string, contentType: 'pdf' | 'audiobook', contentId: string): void {
    const openedKey = `spirit_free_opened_${contentType}s_${userId}`;
    const openedList = getStored<string>(openedKey, []);
    if (!openedList.includes(contentId)) {
      openedList.push(contentId);
      saveStored(openedKey, openedList);
    }
  },

  // --- SOLICITAÇÕES / PEDIDOS DE CONTEÚDO (PEDIDOS) ---
  getRequests(): ContentRequest[] {
    return getStored<ContentRequest>(REQUESTS_KEY, []);
  },

  saveRequest(req: ContentRequest): void {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === req.id);
    if (index >= 0) {
      requests[index] = req;
    } else {
      requests.push(req);
    }
    saveStored(REQUESTS_KEY, requests);
  },

  deleteRequest(id: string): void {
    const requests = this.getRequests().filter(r => r.id !== id);
    saveStored(REQUESTS_KEY, requests);
  },

  // --- SISTEMA DE CONTINUIDADE (PROGRESSO) ---
  getContinuityProgress(userId: string): ContinuityProgress {
    try {
      const data = localStorage.getItem(`${CONTINUITY_KEY}_${userId}`);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  savePDFProgress(userId: string, bookId: string, bookTitle: string, lastPage: number, totalPages: number): void {
    const progress = this.getContinuityProgress(userId);
    const percentage = Math.round((lastPage / totalPages) * 100);
    progress.pdf = {
      bookId,
      bookTitle,
      lastPage,
      totalPages,
      percentage,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`${CONTINUITY_KEY}_${userId}`, JSON.stringify(progress));
  },

  saveAudiobookProgress(userId: string, audioId: string, audioTitle: string, lastSecond: number, totalSeconds: number): void {
    const progress = this.getContinuityProgress(userId);
    const percentage = Math.round((lastSecond / totalSeconds) * 100);
    progress.audiobook = {
      audioId,
      audioTitle,
      lastSecond,
      totalSeconds,
      percentage,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`${CONTINUITY_KEY}_${userId}`, JSON.stringify(progress));
  },

  saveCourseProgress(
    userId: string, 
    courseId: string, 
    courseTitle: string, 
    moduleId: string, 
    moduleTitle: string, 
    lessonId: string, 
    lessonTitle: string, 
    percentage: number
  ): void {
    const progress = this.getContinuityProgress(userId);
    progress.course = {
      courseId,
      courseTitle,
      moduleId,
      moduleTitle,
      lessonId,
      lessonTitle,
      percentage,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`${CONTINUITY_KEY}_${userId}`, JSON.stringify(progress));
  },

  clearContinuityProgress(userId: string): void {
    localStorage.removeItem(`${CONTINUITY_KEY}_${userId}`);
  },

  // --- AVALIAÇÕES / COMENTÁRIOS ---
  getReviews(contentId?: string, contentType?: string): ContentReview[] {
    const reviews = getStored<ContentReview>(REVIEWS_KEY, INITIAL_REVIEWS);
    if (contentId && contentType) {
      return reviews.filter(r => r.contentId === contentId && r.contentType === contentType);
    }
    if (contentId) {
      return reviews.filter(r => r.contentId === contentId);
    }
    return reviews;
  },

  addReview(review: Omit<ContentReview, 'id' | 'date' | 'isHidden'>): ContentReview {
    const reviews = getStored<ContentReview>(REVIEWS_KEY, INITIAL_REVIEWS);
    const newReview: ContentReview = {
      ...review,
      id: `rev-${Math.random().toString(36).substring(2, 9)}`,
      date: new Date().toISOString(),
      isHidden: false
    };
    reviews.push(newReview);
    saveStored(REVIEWS_KEY, reviews);
    return newReview;
  },

  deleteReview(reviewId: string): void {
    const reviews = getStored<ContentReview>(REVIEWS_KEY, INITIAL_REVIEWS).filter(r => r.id !== reviewId);
    saveStored(REVIEWS_KEY, reviews);
  },

  toggleHideReview(reviewId: string): void {
    const reviews = getStored<ContentReview>(REVIEWS_KEY, INITIAL_REVIEWS);
    const index = reviews.findIndex(r => r.id === reviewId);
    if (index >= 0) {
      reviews[index].isHidden = !reviews[index].isHidden;
      saveStored(REVIEWS_KEY, reviews);
    }
  },

  // --- FAVORITOS ---
  getUserFavorites(userId: string): { pdfs: string[], audiobooks: string[], courses: string[], lessons: string[] } {
    try {
      const data = localStorage.getItem(`spirit_user_favorites_${userId}`);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          pdfs: parsed.pdfs || [],
          audiobooks: parsed.audiobooks || [],
          courses: parsed.courses || [],
          lessons: parsed.lessons || []
        };
      }
    } catch (e) {
      console.error(e);
    }
    return { pdfs: [], audiobooks: [], courses: [], lessons: [] };
  },

  toggleUserFavorite(userId: string, contentType: 'pdf' | 'audiobook' | 'course' | 'lesson', contentId: string): void {
    const favorites = this.getUserFavorites(userId);
    let key: 'pdfs' | 'audiobooks' | 'courses' | 'lessons' = 'pdfs';
    if (contentType === 'pdf') key = 'pdfs';
    else if (contentType === 'audiobook') key = 'audiobooks';
    else if (contentType === 'course') key = 'courses';
    else if (contentType === 'lesson') key = 'lessons';

    if (!favorites[key]) favorites[key] = [];

    if (favorites[key].includes(contentId)) {
      favorites[key] = favorites[key].filter(id => id !== contentId);
    } else {
      favorites[key].push(contentId);
    }
    localStorage.setItem(`spirit_user_favorites_${userId}`, JSON.stringify(favorites));
  },

  // --- CERTIFICADOS ---
  getCertificateConfig(): CertificateConfig {
    try {
      const data = localStorage.getItem(CERT_CONFIG_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return {
      model: 'mystic',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&q=80',
      signatureUrl: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=200&q=80',
      textTemplate: 'Certificamos que o aluno sintonizou e concluiu com êxito todas as lições da jornada de sabedoria em nossa Escola de Mistérios, adquirindo compreensão e elevação de consciência.',
      hours: 12
    };
  },

  saveCertificateConfig(config: CertificateConfig): void {
    localStorage.setItem(CERT_CONFIG_KEY, JSON.stringify(config));
  },

  getEarnedCertificates(userId: string): EarnedCertificate[] {
    const certs = getStored<EarnedCertificate>(EARNED_CERTS_KEY, []);
    return certs.filter(c => c.userId === userId);
  },

  issueCertificate(userId: string, userName: string, courseId: string, courseTitle: string, hours: number): EarnedCertificate {
    const certs = getStored<EarnedCertificate>(EARNED_CERTS_KEY, []);
    const exists = certs.find(c => c.userId === userId && c.courseId === courseId);
    if (exists) return exists;

    const newCert: EarnedCertificate = {
      id: `cert-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      userName,
      courseId,
      courseTitle,
      dateEarned: new Date().toISOString(),
      hours
    };
    certs.push(newCert);
    saveStored(EARNED_CERTS_KEY, certs);
    return newCert;
  },

  // --- DOWNLOADS (OFFLINE ACCESS) ---
  getDownloadedContents(userId: string): { pdfs: string[], audiobooks: string[], courses: string[] } {
    try {
      const data = localStorage.getItem(`spirit_downloaded_${userId}`);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          pdfs: parsed.pdfs || [],
          audiobooks: parsed.audiobooks || [],
          courses: parsed.courses || []
        };
      }
    } catch {}
    return { pdfs: [], audiobooks: [], courses: [] };
  },

  toggleDownloadedContent(userId: string, contentType: 'pdf' | 'audiobook' | 'course', contentId: string, isDownloaded: boolean): void {
    const downloaded = this.getDownloadedContents(userId);
    let key: 'pdfs' | 'audiobooks' | 'courses' = 'pdfs';
    if (contentType === 'pdf') key = 'pdfs';
    else if (contentType === 'audiobook') key = 'audiobooks';
    else if (contentType === 'course') key = 'courses';

    if (!downloaded[key]) downloaded[key] = [];

    if (isDownloaded) {
      if (!downloaded[key].includes(contentId)) {
        downloaded[key].push(contentId);
        this.recordDownloadStat(contentId);
      }
    } else {
      downloaded[key] = downloaded[key].filter(id => id !== contentId);
    }
    localStorage.setItem(`spirit_downloaded_${userId}`, JSON.stringify(downloaded));
  },

  // --- CONTROLE DE ESTATÍSTICAS DE ACESSO ---
  recordBookAccess(bookId: string): void {
    try {
      const data = localStorage.getItem('spirit_stats_pdf_access');
      const stats = data ? JSON.parse(data) : {};
      stats[bookId] = (stats[bookId] || 0) + 1;
      localStorage.setItem('spirit_stats_pdf_access', JSON.stringify(stats));
    } catch {}
  },

  recordAudiobookPlay(audioId: string): void {
    try {
      const data = localStorage.getItem('spirit_stats_audiobook_play');
      const stats = data ? JSON.parse(data) : {};
      stats[audioId] = (stats[audioId] || 0) + 1;
      localStorage.setItem('spirit_stats_audiobook_play', JSON.stringify(stats));
    } catch {}
  },

  recordCourseView(courseId: string): void {
    try {
      const data = localStorage.getItem('spirit_stats_course_view');
      const stats = data ? JSON.parse(data) : {};
      stats[courseId] = (stats[courseId] || 0) + 1;
      localStorage.setItem('spirit_stats_course_view', JSON.stringify(stats));
    } catch {}
  },

  recordDownloadStat(contentId: string): void {
    try {
      const data = localStorage.getItem('spirit_stats_download');
      const stats = data ? JSON.parse(data) : {};
      stats[contentId] = (stats[contentId] || 0) + 1;
      localStorage.setItem('spirit_stats_download', JSON.stringify(stats));
    } catch {}
  },

  getAdminStats(): {
    bookAccess: Record<string, number>;
    audiobookPlay: Record<string, number>;
    courseView: Record<string, number>;
    downloads: Record<string, number>;
    favoritesCount: Record<string, number>;
    ratingsAvg: Record<string, number>;
    ratingsCount: Record<string, number>;
  } {
    const favoritesCount: Record<string, number> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('spirit_user_favorites_')) {
          const favs = JSON.parse(localStorage.getItem(key) || '{}');
          ['pdfs', 'audiobooks', 'courses', 'lessons'].forEach(k => {
            if (favs && Array.isArray(favs[k])) {
              favs[k].forEach((id: string) => {
                favoritesCount[id] = (favoritesCount[id] || 0) + 1;
              });
            }
          });
        }
      }
    } catch {}

    const ratingsAvg: Record<string, number> = {};
    const ratingsCount: Record<string, number> = {};
    try {
      const reviews = getStored<ContentReview>(REVIEWS_KEY, INITIAL_REVIEWS);
      const contentRatings: Record<string, number[]> = {};
      reviews.forEach(r => {
        if (!contentRatings[r.contentId]) contentRatings[r.contentId] = [];
        contentRatings[r.contentId].push(r.rating);
      });
      Object.keys(contentRatings).forEach(id => {
        const ratings = contentRatings[id];
        ratingsCount[id] = ratings.length;
        ratingsAvg[id] = ratings.reduce((sum, val) => sum + val, 0) / ratings.length;
      });
    } catch {}

    const loadStat = (key: string, initial: Record<string, number>): Record<string, number> => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : initial;
      } catch {
        return initial;
      }
    };

    return {
      bookAccess: loadStat('spirit_stats_pdf_access', { 'pdf-1': 24, 'pdf-2': 18, 'pdf-3': 12 }),
      audiobookPlay: loadStat('spirit_stats_audiobook_play', { 'audio-1': 42, 'audio-2': 31, 'audio-3': 15 }),
      courseView: loadStat('spirit_stats_course_view', { 'c1': 55, 'c2': 12, 'c3': 8 }),
      downloads: loadStat('spirit_stats_download', { 'pdf-1': 14, 'audio-1': 22, 'c1': 30 }),
      favoritesCount,
      ratingsAvg,
      ratingsCount
    };
  }
};

export interface ContentReview {
  id: string;
  contentId: string;
  contentType: 'pdf' | 'audiobook' | 'course' | 'lesson';
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  isHidden: boolean;
}

export interface CertificateConfig {
  model: 'modern' | 'classic' | 'mystic';
  logoUrl: string;
  signatureUrl: string;
  textTemplate: string;
  hours: number;
}

export interface EarnedCertificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  dateEarned: string;
  hours: number;
}

const REVIEWS_KEY = 'spirit_reviews';
const CERT_CONFIG_KEY = 'spirit_certificate_config';
const EARNED_CERTS_KEY = 'spirit_earned_certificates';

const INITIAL_REVIEWS: ContentReview[] = [
  {
    id: 'rev-1',
    contentId: 'pdf-1',
    contentType: 'pdf',
    userId: 'mock-david-seed',
    userName: 'David Silva',
    rating: 5,
    comment: 'Uma leitura extremamente profunda. Me trouxe muita paz e clareza nos ensinamentos do Caibalion.',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isHidden: false
  },
  {
    id: 'rev-2',
    contentId: 'audio-1',
    contentType: 'audiobook',
    userId: 'mock-maria-seed',
    userName: 'Maria Oliveira',
    rating: 5,
    comment: 'A sintonia sutil dessa frequência é fantástica. Uso todas as noites antes de deitar.',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isHidden: false
  }
];
