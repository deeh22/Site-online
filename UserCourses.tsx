import React, { useState, useEffect } from 'react';
import { 
  Award, Compass, BookOpen, CheckCircle, ChevronDown, ChevronUp, Play, 
  Lock, Eye, CheckCircle2, ChevronRight, X, Sparkles, LockKeyhole, Heart, Star, Printer 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService, Course, CourseModule, CourseLesson, EarnedCertificate, CertificateConfig } from '../lib/dataService';
import ReviewsList from './ReviewsList';

interface UserCoursesProps {
  user: User;
  onNavigateToTab?: (tab: string) => void;
}

export default function UserCourses({ user, onNavigateToTab }: UserCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [lockedCourseForModal, setLockedCourseForModal] = useState<Course | null>(null);
  
  // Modal de Certificado Ativo
  const [activeCertificate, setActiveCertificate] = useState<{ cert: EarnedCertificate, config: CertificateConfig } | null>(null);
  const [favoriteLessons, setFavoriteLessons] = useState<string[]>([]);

  const loadCourses = () => {
    setCourses(dataService.getCourses());
    const favsObj = dataService.getUserFavorites(user.id);
    setFavorites(favsObj.courses || []);
    setFavoriteLessons(favsObj.lessons || []);
  };

  const toggleFavoriteLesson = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dataService.toggleUserFavorite(user.id, 'lesson', lessonId);
    setFavoriteLessons(dataService.getUserFavorites(user.id).lessons || []);
  };

  useEffect(() => {
    loadCourses();

    const saved = localStorage.getItem(`spirit_completed_lessons_${user.id}`);
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, [user.id]);

  const toggleLessonCompleted = (lessonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    let updated;
    if (completedLessons.includes(lessonId)) {
      updated = completedLessons.filter(id => id !== lessonId);
    } else {
      updated = [...completedLessons, lessonId];
    }
    setCompletedLessons(updated);
    localStorage.setItem(`spirit_completed_lessons_${user.id}`, JSON.stringify(updated));
  };

  // Calcula o progresso de um curso
  const getCourseProgress = (course: Course): number => {
    let total = 0;
    let completed = 0;
    
    if (course.modules) {
      course.modules.forEach(m => {
        if (m.lessons) {
          m.lessons.forEach(l => {
            total++;
            if (completedLessons.includes(l.id)) {
              completed++;
            }
          });
        }
      });
    }

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const toggleModuleExpanded = (moduleId: string) => {
    if (expandedModules.includes(moduleId)) {
      setExpandedModules(expandedModules.filter(id => id !== moduleId));
    } else {
      setExpandedModules([...expandedModules, moduleId]);
    }
  };

  const handleOpenCourseDetails = (course: Course) => {
    // Verifica permissão dinâmica de acesso ao curso
    const hasAccess = dataService.canAccessContent(user.id, user.role, 'curso', [], course.id).allowed;

    if (!hasAccess) {
      setLockedCourseForModal(course);
      return;
    }

    setSelectedCourse(course);
    dataService.recordCourseView(course.id);
    
    // Abre todos os módulos por padrão
    if (course.modules) {
      const allModuleIds = course.modules.map(m => m.id);
      setExpandedModules(allModuleIds);
    }
  };

  const toggleFavorite = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dataService.toggleUserFavorite(user.id, 'course', courseId);
    setFavorites(dataService.getUserFavorites(user.id).courses);
  };

  const handleGenerateCertificate = (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const certConfig = dataService.getCertificateConfig();
    const newCert = dataService.issueCertificate(
      user.id,
      user.name,
      course.id,
      course.title,
      certConfig.hours
    );
    setActiveCertificate({ cert: newCert, config: certConfig });
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 text-left" id="user-courses-wrapper">
      
      {/* 1. MODAL DE CURSO BLOQUEADO */}
      <AnimatePresence>
        {lockedCourseForModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 text-left" id="locked-course-modal-overlay">
            <motion.div
              id="locked-course-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                id="close-locked-modal"
                onClick={() => setLockedCourseForModal(null)}
                className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4 pt-4" id="locked-course-modal-body">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <LockKeyhole className="w-6 h-6 animate-pulse text-amber-500" />
                </div>

                <div className="space-y-1 bg-transparent">
                  <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold block">Curso Iniciático</span>
                  <h4 className="font-serif font-bold text-white text-base leading-tight">{lockedCourseForModal.title}</h4>
                </div>

                <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-2xl text-xs text-zinc-400 font-sans leading-relaxed text-left space-y-2">
                  <span className="font-bold text-zinc-300 block">Como liberar este treinamento?</span>
                  <p>
                    Este treinamento e lições guiadas estão reservados. Sintonize um plano ativo que forneça acesso à Escola de Mistérios ou entre em contato com o administrador para habilitar permissões de estudos individuais.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setLockedCourseForModal(null);
                      if (onNavigateToTab) {
                        onNavigateToTab('inicio');
                        setTimeout(() => {
                          const el = document.getElementById('plans-pricing-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs uppercase tracking-widest rounded-2xl cursor-pointer"
                  >
                    Ver Planos de Acesso
                  </button>
                  <button
                    onClick={() => setLockedCourseForModal(null)}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. MODAL DE CERTIFICADO MÍSTICO */}
      <AnimatePresence>
        {activeCertificate && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-55 flex items-center justify-center p-4" id="certificate-modal-overlay">
            <motion.div
              id="certificate-modal-card"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-stone-100 text-stone-900 border-[16px] border-double border-amber-900 rounded-2xl w-full max-w-2xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative print:p-4 print:border-0"
            >
              <button
                id="close-cert-modal"
                onClick={() => setActiveCertificate(null)}
                className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-full transition-colors cursor-pointer print:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-8" id="certificate-print-area">
                {/* Mandala Logo */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-700 flex items-center justify-center text-amber-800">
                    <Compass className="w-8 h-8 animate-[spin_60s_linear_infinite]" />
                  </div>
                  <span className="font-serif text-[10px] tracking-widest uppercase font-bold text-amber-900">Despertar Espiritualidade</span>
                </div>

                {/* Título Principal */}
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl font-bold tracking-wide text-amber-950">Certificado de Ascensão</h3>
                  <div className="h-0.5 w-32 bg-amber-800 mx-auto" />
                </div>

                {/* Corpo do Certificado */}
                <div className="space-y-4 max-w-lg mx-auto font-serif">
                  <p className="text-xs text-stone-600 italic">Conferido solenemente a</p>
                  <h4 className="text-2xl font-bold text-stone-900 tracking-wide underline decoration-amber-600 decoration-wavy underline-offset-8">
                    {activeCertificate.cert.userName}
                  </h4>
                  <p className="text-stone-700 text-xs leading-relaxed leading-6 pt-4">
                    {activeCertificate.config.textTemplate}
                  </p>
                  <p className="text-xs text-amber-900 font-bold tracking-widest uppercase pt-2">
                    Jornada: {activeCertificate.cert.courseTitle}
                  </p>
                </div>

                {/* Rodapé e Assinaturas */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-stone-300 max-w-md mx-auto">
                  <div className="text-center space-y-1">
                    <div className="h-8 flex items-center justify-center">
                      <span className="font-serif italic text-amber-900 text-sm">Egrégora Iniciática</span>
                    </div>
                    <div className="h-px bg-stone-300 w-full" />
                    <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold block">Conselho Despertar</span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="h-8 flex items-center justify-center">
                      <span className="font-serif text-stone-800 font-bold text-xs">{new Date(activeCertificate.cert.dateEarned).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="h-px bg-stone-300 w-full" />
                    <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold block">Sintonizado em</span>
                  </div>
                </div>

                {/* ID de Registro */}
                <span className="block text-[8px] font-mono text-stone-400 uppercase tracking-widest pt-4">Autenticidade: REG-{activeCertificate.cert.id}</span>
              </div>

              {/* Botões do Painel */}
              <div className="mt-8 flex justify-center gap-4 print:hidden" id="cert-controls">
                <button
                  onClick={handlePrintCertificate}
                  className="px-6 py-2.5 bg-amber-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-amber-950 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setActiveCertificate(null)}
                  className="px-4 py-2.5 bg-stone-200 text-stone-600 hover:bg-stone-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. VISUALIZADOR DE TRANSMISSÃO DE VÍDEO ATIVO */}
      <AnimatePresence>
        {activeLesson && (
          <motion.div
            id="lesson-viewer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              id="lesson-viewer-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 text-zinc-100 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950" id="viewer-header">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-500/10 rounded-xl text-amber-500">
                    <Play className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div className="text-left bg-zinc-950">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Assistindo Aula</span>
                    <h4 className="font-serif font-bold text-xs text-white max-w-[220px] sm:max-w-md truncate">{activeLesson.title}</h4>
                  </div>
                </div>

                <button
                  id="close-viewer-btn"
                  onClick={() => setActiveLesson(null)}
                  className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Player Simulado */}
              <div className="bg-black aspect-video flex flex-col items-center justify-center relative p-6 border-b border-zinc-900" id="viewer-player-sim">
                <div className="absolute inset-0 bg-radial from-amber-500/5 to-transparent pointer-events-none" />
                
                {/* Mandala Giratória */}
                <div className="w-20 h-20 rounded-full border border-dashed border-amber-500/20 animate-[spin_40s_linear_infinite] flex items-center justify-center mb-4">
                  <div className="w-14 h-14 rounded-full border border-double border-amber-500/30 animate-[spin_10s_linear_infinite_reverse] flex items-center justify-center">
                    <Play className="w-6 h-6 text-amber-400 fill-amber-400 pl-1" />
                  </div>
                </div>

                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Vídeo de Transmissão Iniciática</span>
                <span className="text-zinc-400 text-xs font-serif mt-1">Duração Estimada: 15:00</span>
              </div>

              {/* Resumo */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-left flex-1 bg-zinc-950" id="viewer-info-body">
                <h5 className="font-serif font-bold text-sm text-white">Resumo e Orientações</h5>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {activeLesson.description || 'Aprofunde-se nesta transmissão, anote seus insights espirituais e incorpore a meditação prática recomendada em seu ritual diário.'}
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-900/60 text-xs">
                  <span className="text-zinc-500 font-sans italic">Revise os conceitos e pratique por 15 minutos.</span>
                  
                  <button
                    id="btn-toggle-completion-viewer"
                    onClick={() => {
                      toggleLessonCompleted(activeLesson.id);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                      completedLessons.includes(activeLesson.id)
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-amber-500 hover:bg-amber-400 text-black font-bold'
                    }`}
                  >
                    {completedLessons.includes(activeLesson.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 fill-amber-400/20 text-amber-400" />
                        <span>Aula Concluída</span>
                      </>
                    ) : (
                      <span>Marcar como Concluída</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!selectedCourse ? (
          // LISTAGEM GERAL DE CURSOS
          <motion.div
            key="courses-list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="space-y-1 text-left">
              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Escola de Mistérios</h2>
              <p className="text-xs text-zinc-500 font-sans">Expanda seus saberes teóricos e práticos com nossa grade sistemática permanente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="courses-grid">
              {courses.map((course) => {
                const progress = getCourseProgress(course);
                const hasAccess = dataService.canAccessContent(user.id, user.role, 'curso', [], course.id).allowed;
                const isFav = favorites.includes(course.id);
                
                // Calcular média mística de avaliações do curso
                const courseReviews = dataService.getReviews(course.id, 'course');
                const avgRating = courseReviews.length > 0 
                  ? (courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length).toFixed(1)
                  : null;

                return (
                  <motion.div
                    key={course.id}
                    id={`course-card-${course.id}`}
                    whileHover={{ y: -4 }}
                    onClick={() => handleOpenCourseDetails(course)}
                    className="bg-zinc-950 border rounded-3xl overflow-hidden shadow-lg flex flex-col h-full text-left transition-all border-zinc-900 hover:border-amber-500/20 cursor-pointer relative group"
                  >
                    {/* Capa */}
                    <div className={`h-40 bg-gradient-to-b ${course.coverGradient || 'from-amber-950 to-zinc-900'} p-5 flex flex-col justify-between border-b border-zinc-900/40 relative`}>
                      <div className="flex justify-between items-center bg-transparent z-10">
                        <span className="px-2.5 py-1 bg-black/60 border border-white/5 text-[9px] text-zinc-300 rounded-xl font-bold uppercase tracking-wider w-fit">
                          Transmissão Online
                        </span>
                        
                        <div className="flex items-center gap-2 bg-transparent">
                          {/* Botão Favoritar */}
                          <button
                            onClick={(e) => toggleFavorite(course.id, e)}
                            className="p-1.5 rounded-lg bg-black/60 border border-white/5 hover:border-amber-500/20 text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
                            title={isFav ? "Remover dos Favoritos" : "Favoritar Curso"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                          
                          {!hasAccess && (
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 relative z-10 text-left bg-transparent">
                        <h4 className="font-serif font-bold text-white text-base leading-snug">
                          {course.title}
                        </h4>
                      </div>

                      {/* Sparkle sutil de fundo */}
                      <div className="absolute bottom-3 right-3 text-amber-500/10 pointer-events-none">
                        <Compass className="w-12 h-12" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                      <div className="space-y-2">
                        {/* Média de Estrelas */}
                        {avgRating && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{avgRating} ({courseReviews.length} avaliações)</span>
                          </div>
                        )}
                        
                        <p className="text-xs text-zinc-500 font-sans leading-relaxed line-clamp-3">
                          {course.description}
                        </p>
                      </div>

                      {/* Progresso do Curso ou Botão Certificado */}
                      <div className="space-y-2 pt-3 border-t border-zinc-900" id={`course-progress-${course.id}`}>
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          <span>Sua Ascensão</span>
                          <span className="text-amber-500">{progress}% concluído</span>
                        </div>
                        
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>

                        {progress === 100 && (
                          <button
                            onClick={(e) => handleGenerateCertificate(course, e)}
                            className="w-full mt-2 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Obter Certificado</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          // TELA DE DETALHES DO CURSO SELECIONADO
          <motion.div
            key="course-detail-view"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6 text-left"
          >
            {/* Botão de Voltar */}
            <div className="flex justify-between items-center">
              <button
                id="btn-back-to-courses"
                onClick={() => setSelectedCourse(null)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-500 font-bold transition-all border border-zinc-900 bg-zinc-950 px-4 py-2 rounded-2xl cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Voltar aos Cursos</span>
              </button>

              {/* Botão Favoritar no topo dos detalhes */}
              <button
                onClick={(e) => toggleFavorite(selectedCourse.id, e)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  favorites.includes(selectedCourse.id)
                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorites.includes(selectedCourse.id) ? 'fill-red-500' : ''}`} />
                <span>{favorites.includes(selectedCourse.id) ? 'Favoritado' : 'Favoritar'}</span>
              </button>
            </div>

            {/* Banner do Curso */}
            <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${selectedCourse.coverGradient || 'from-amber-950 to-zinc-900'} border border-amber-500/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
              <div className="space-y-2 relative z-10 text-left bg-transparent">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Estudando Agora</span>
                <h3 className="font-serif font-bold text-white text-xl sm:text-2xl leading-tight">{selectedCourse.title}</h3>
                <p className="text-xs text-zinc-400 max-w-xl font-sans">{selectedCourse.description}</p>
              </div>

              {/* Progresso Grande / Botão Certificado */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center shrink-0 min-w-[140px] flex flex-col items-center justify-center gap-2" id="detail-progress-box">
                <span className="block text-2xl font-bold text-amber-500">{getCourseProgress(selectedCourse)}%</span>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block">Curso Concluído</span>
                
                {getCourseProgress(selectedCourse) === 100 && (
                  <button
                    onClick={() => handleGenerateCertificate(selectedCourse)}
                    className="mt-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer"
                  >
                    Emitir Certificado
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Módulos (Accordion) */}
            <div className="space-y-4 text-left font-sans" id="course-modules-list">
              <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-500">Grade de Ensino</h4>
              
              {selectedCourse.modules && selectedCourse.modules.map((module) => {
                const isExpanded = expandedModules.includes(module.id);

                return (
                  <div key={module.id} className="border border-zinc-900 bg-zinc-950 rounded-2xl overflow-hidden" id={`module-accordion-${module.id}`}>
                    {/* Header do Módulo */}
                    <div 
                      onClick={() => toggleModuleExpanded(module.id)}
                      className="p-4 sm:p-5 bg-black/40 flex items-center justify-between cursor-pointer hover:bg-zinc-900/10 transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4.5 h-4.5 text-amber-500/70" />
                        <h5 className="font-serif font-bold text-white text-xs sm:text-sm">{module.title}</h5>
                      </div>
                      <div className="text-zinc-500 flex items-center gap-2">
                        <span className="text-[10px] font-sans">{module.lessons ? module.lessons.length : 0} aulas</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Lições do Módulo */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-zinc-900/60"
                        >
                          <div className="p-2 sm:p-3 divide-y divide-zinc-900/40 bg-zinc-950">
                            {module.lessons && module.lessons.map((lesson) => {
                              const isCompleted = completedLessons.includes(lesson.id);

                              return (
                                <div
                                  key={lesson.id}
                                  id={`lesson-row-${lesson.id}`}
                                  onClick={() => {
                                    setActiveLesson(lesson);
                                    if (selectedCourse) {
                                      dataService.saveCourseProgress(
                                        user.id,
                                        selectedCourse.id,
                                        selectedCourse.title,
                                        module.id,
                                        module.title,
                                        lesson.id,
                                        lesson.title,
                                        getCourseProgress(selectedCourse)
                                      );
                                    }
                                  }}
                                  className="p-3 hover:bg-zinc-900/30 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 group"
                                >
                                  <div className="flex items-center gap-3 min-w-0 bg-transparent">
                                    {/* Botão de checkbox */}
                                    <button
                                      id={`btn-complete-lesson-${lesson.id}`}
                                      onClick={(e) => toggleLessonCompleted(lesson.id, e)}
                                      className="text-zinc-600 hover:text-amber-500 transition-colors shrink-0 cursor-pointer"
                                    >
                                      {isCompleted ? (
                                        <CheckCircle className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full border border-zinc-800 group-hover:border-amber-500/40" />
                                      )}
                                    </button>

                                    <div className="text-left min-w-0 bg-transparent">
                                      <h6 className={`text-xs font-semibold leading-tight truncate ${isCompleted ? 'text-zinc-500 line-through font-normal' : 'text-zinc-200 group-hover:text-amber-400'}`}>
                                        {lesson.title}
                                      </h6>
                                      <span className="block text-[9px] text-zinc-600 font-mono mt-0.5">Clique para assistir</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 shrink-0">
                                    {/* Botão Favoritar Aula */}
                                    <button
                                      id={`btn-fav-lesson-${lesson.id}`}
                                      onClick={(e) => toggleFavoriteLesson(lesson.id, e)}
                                      className="p-1.5 rounded-lg border border-transparent hover:border-zinc-850 hover:bg-zinc-900/30 text-zinc-600 hover:text-red-500 transition-all cursor-pointer"
                                      title={favoriteLessons.includes(lesson.id) ? "Remover dos Favoritos" : "Favoritar Aula"}
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${favoriteLessons.includes(lesson.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                    </button>

                                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 uppercase tracking-widest font-bold font-sans group-hover:text-amber-500 transition-colors">
                                      <span>Iniciar aula</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Seção de Comentários / Avaliações */}
            <div className="mt-8">
              <h4 className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-4">Avaliações dos Alunos</h4>
              <ReviewsList
                contentId={selectedCourse.id}
                contentType="course"
                userId={user.id}
                userName={user.name}
                isAdmin={user.role === 'ADMIN'}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
