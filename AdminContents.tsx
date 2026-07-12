import React, { useState, useEffect } from 'react';
import { BookOpen, Volume2, GraduationCap, Plus, Trash2, Lock, Sparkles, CheckCircle2, AlertCircle, X, Megaphone, Edit3, ChevronRight, FileText, Play, Link, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService, PDFBook, Audiobook, Course, Advertisement } from '../lib/dataService';

export default function AdminContents() {
  const [activeTab, setActiveTab] = useState<'pdf' | 'audiobook' | 'curso' | 'ads'>('pdf');
  const [isAdding, setIsAdding] = useState(false);

  // Lists State loaded from dataService
  const [pdfs, setPdfs] = useState<PDFBook[]>([]);
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);

  // Feedback State
  const [success, setSuccess] = useState<string | null>(null);

  // --- FORM STATES ---
  // PDF Book Form
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfAuthor, setPdfAuthor] = useState('');
  const [pdfCategory, setPdfCategory] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfLevel, setPdfLevel] = useState<1 | 2 | 3>(1);
  const [pdfPages, setPdfPages] = useState(10);
  const [pdfChapter1, setPdfChapter1] = useState('');

  // Audiobook Form
  const [audioTitle, setAudioTitle] = useState('');
  const [audioAuthor, setAudioAuthor] = useState('');
  const [audioCategory, setAudioCategory] = useState('');
  const [audioDescription, setAudioDescription] = useState('');
  const [audioDuration, setAudioDuration] = useState('15:00');

  // Course Form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseLessonsCount, setCourseLessonsCount] = useState(1); // Simulado para gerar lições automaticamente

  // Advertisement Form
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adBadge, setAdBadge] = useState('OFERTA');
  const [adActionText, setAdActionText] = useState('Saber Mais');

  // Carrega listas do dataService ao montar ou salvar mudanças
  const refreshLists = () => {
    setPdfs(dataService.getPDFs());
    setAudiobooks(dataService.getAudiobooks());
    setCourses(dataService.getCourses());
    setAds(dataService.getAds());
  };

  useEffect(() => {
    refreshLists();
  }, []);

  // --- SUBMISSIONS HANDLERS ---
  const handleAddContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    try {
      if (activeTab === 'pdf') {
        const newPDF: PDFBook = {
          id: `pdf-${Math.random().toString(36).substring(2, 9)}`,
          title: pdfTitle,
          author: pdfAuthor,
          category: pdfCategory || 'Iniciação',
          description: pdfDescription,
          requiredLevel: pdfLevel,
          pagesCount: pdfPages,
          coverGradient: 'from-amber-950 via-zinc-950 to-amber-900',
          allowedPlans: ['all'],
          content: [
            pdfChapter1 || "Capítulo 1: A sintonia sutil do Todo emana sabedoria eterna para as almas dispostas a sintonizar a vibração hermética cósmica."
          ]
        };
        dataService.savePDF(newPDF);
        setSuccess('E-book em PDF publicado com êxito na biblioteca sagrada!');

        // Reset
        setPdfTitle('');
        setPdfAuthor('');
        setPdfCategory('');
        setPdfDescription('');
        setPdfChapter1('');
      } else if (activeTab === 'audiobook') {
        const newAudio: Audiobook = {
          id: `audio-${Math.random().toString(36).substring(2, 9)}`,
          title: audioTitle,
          author: audioAuthor,
          category: audioCategory || 'Meditação',
          description: audioDescription,
          duration: audioDuration || '30:00',
          coverGradient: 'from-zinc-950 via-amber-950 to-zinc-900'
        };
        dataService.saveAudiobook(newAudio);
        setSuccess('Sintonia em áudio publicada com êxito na rádio de frequências!');

        // Reset
        setAudioTitle('');
        setAudioAuthor('');
        setAudioCategory('');
        setAudioDescription('');
        setAudioDuration('15:00');
      } else if (activeTab === 'curso') {
        // Cria lições básicas simuladas baseadas na quantidade solicitada
        const lessons = [];
        for (let i = 1; i <= courseLessonsCount; i++) {
          lessons.push({
            id: `lesson-${Math.random().toString(36).substring(2, 5)}`,
            title: `Aula ${i}: Sintonizando os Fluxos do Ser`,
            description: `Transmissão teórica fundamental de autoconhecimento número ${i}.`
          });
        }

        const newCourse: Course = {
          id: `course-${Math.random().toString(36).substring(2, 9)}`,
          title: courseTitle,
          category: courseCategory || 'Grau de Formação',
          coverGradient: 'from-amber-900 via-zinc-950 to-zinc-950',
          description: courseDescription,
          modules: [
            {
              id: `module-${Math.random().toString(36).substring(2, 5)}`,
              title: 'Módulo 1: Portais do Despertar',
              lessons: lessons
            }
          ]
        };
        dataService.saveCourse(newCourse);
        setSuccess('Curso estruturado de grau permanente publicado com sucesso!');

        // Reset
        setCourseTitle('');
        setCourseCategory('');
        setCourseDescription('');
        setCourseLessonsCount(1);
      } else if (activeTab === 'ads') {
        const newAd: Advertisement = {
          id: `ad-${Math.random().toString(36).substring(2, 9)}`,
          title: adTitle,
          description: adDescription,
          bannerGradient: 'from-amber-950/80 via-zinc-950 to-zinc-900',
          badge: adBadge || 'PROMOÇÃO',
          isActive: true,
          actionText: adActionText || 'Garantir Acesso'
        };
        dataService.saveAd(newAd);
        setSuccess('Banner de oferta publicado. Ele estará visível para todos os alunos!');

        // Reset
        setAdTitle('');
        setAdDescription('');
        setAdBadge('OFERTA');
        setAdActionText('Saber Mais');
      }

      refreshLists();
      setTimeout(() => {
        setSuccess(null);
        setIsAdding(false);
      }, 2000);

    } catch (err) {
      console.error(err);
    }
  };

  // --- DELETE HANDLERS ---
  const handleDeleteItem = (id: string, type: 'pdf' | 'audiobook' | 'curso' | 'ads') => {
    if (type === 'pdf') {
      dataService.deletePDF(id);
    } else if (type === 'audiobook') {
      dataService.deleteAudiobook(id);
    } else if (type === 'curso') {
      dataService.deleteCourse(id);
    } else if (type === 'ads') {
      dataService.deleteAd(id);
    }
    refreshLists();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 text-left font-sans"
      id="admin-contents-wrapper"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-5" id="contents-header-row">
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">Acervo e Ofertas</h2>
          <p className="text-xs text-zinc-500">Cadastre, gerencie e modifique e-books PDFs, audiobooks, cursos de egrégora permanente e anúncios promocionais.</p>
        </div>

        {/* Adicionar Botão */}
        <button
          id="btn-open-add-content-modal"
          onClick={() => {
            setSuccess(null);
            setIsAdding(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:scale-101 active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar {activeTab === 'pdf' ? 'E-book' : activeTab === 'audiobook' ? 'Áudio' : activeTab === 'curso' ? 'Curso' : 'Anúncio'}</span>
        </button>
      </div>

      {/* MODAL DE CADASTRO DINÂMICO */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            id="add-content-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              id="add-content-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative my-8"
            >
              <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4" id="add-modal-header">
                <div>
                  <h4 className="text-lg font-serif font-bold text-white tracking-wide">
                    Cadastrar {activeTab === 'pdf' ? 'E-book' : activeTab === 'audiobook' ? 'Sintonia em Áudio' : activeTab === 'curso' ? 'Curso Escolar' : 'Anúncio / Oferta'}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Preencha os campos para sintonizar a nova obra digital.</p>
                </div>
                <button
                  id="close-add-modal"
                  onClick={() => setIsAdding(false)}
                  className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-all cursor-pointer border border-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 rounded-xl mb-4 flex gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-amber-500 animate-bounce" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleAddContentSubmit} className="space-y-4 text-left font-sans" id="add-content-form">
                {/* --- PDF FORM --- */}
                {activeTab === 'pdf' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Título do Livro</label>
                        <input
                          type="text"
                          required
                          value={pdfTitle}
                          onChange={(e) => setPdfTitle(e.target.value)}
                          placeholder="Ex: Segredos do Astral Superior"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none transition-all placeholder-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Autor / Canalizador</label>
                        <input
                          type="text"
                          required
                          value={pdfAuthor}
                          onChange={(e) => setPdfAuthor(e.target.value)}
                          placeholder="Ex: Hermes Trismegistus"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none transition-all placeholder-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Categoria</label>
                        <input
                          type="text"
                          required
                          value={pdfCategory}
                          onChange={(e) => setPdfCategory(e.target.value)}
                          placeholder="Ex: Iniciação, Alquimia, Prática"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none transition-all placeholder-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Número de Páginas</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={pdfPages}
                          onChange={(e) => setPdfPages(parseInt(e.target.value, 10) || 10)}
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Grau Espiritual Requerido</label>
                      <select
                        value={pdfLevel}
                        onChange={(e) => setPdfLevel(parseInt(e.target.value, 10) as any)}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-zinc-400 focus:text-white text-xs outline-none cursor-pointer transition-all"
                      >
                        <option value="1">Nível 1 (Básico / Despertar)</option>
                        <option value="2">Nível 2 (Intermediário / Senda Interior)</option>
                        <option value="3">Nível 3 (Avançado / Ascensão)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Breve Sinopse</label>
                      <textarea
                        required
                        value={pdfDescription}
                        onChange={(e) => setPdfDescription(e.target.value)}
                        placeholder="Insira uma descrição resumida e mística desta escritura espiritual..."
                        rows={2}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none resize-none transition-all placeholder-zinc-850"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Manuscrito (Conteúdo da Obra)</label>
                      <textarea
                        required
                        value={pdfChapter1}
                        onChange={(e) => setPdfChapter1(e.target.value)}
                        placeholder="Capítulo 1: Comece a escrever os ensinamentos sagrados que os alunos lerão no leitor interno..."
                        rows={4}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none font-sans leading-relaxed resize-none transition-all placeholder-zinc-850"
                      />
                    </div>
                  </>
                )}

                {/* --- AUDIOBOOK FORM --- */}
                {activeTab === 'audiobook' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Título da Sintonia</label>
                        <input
                          type="text"
                          required
                          value={audioTitle}
                          onChange={(e) => setAudioTitle(e.target.value)}
                          placeholder="Ex: Frequência Solfeggio 963Hz"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none placeholder-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Canalizador / Autor</label>
                        <input
                          type="text"
                          required
                          value={audioAuthor}
                          onChange={(e) => setAudioAuthor(e.target.value)}
                          placeholder="Ex: Frequências de Luz"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none placeholder-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Categoria</label>
                        <input
                          type="text"
                          required
                          value={audioCategory}
                          onChange={(e) => setAudioCategory(e.target.value)}
                          placeholder="Ex: Binaural, Meditação Guiada"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none placeholder-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Duração do Áudio (MM:SS)</label>
                        <input
                          type="text"
                          required
                          value={audioDuration}
                          onChange={(e) => setAudioDuration(e.target.value)}
                          placeholder="Ex: 25:00"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Descrição Curta</label>
                      <textarea
                        required
                        value={audioDescription}
                        onChange={(e) => setAudioDescription(e.target.value)}
                        placeholder="Qual a proposta de elevação vibracional deste som sagrado?"
                        rows={3}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none resize-none placeholder-zinc-850"
                      />
                    </div>
                  </>
                )}

                {/* --- COURSE FORM --- */}
                {activeTab === 'curso' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Título do Curso</label>
                        <input
                          type="text"
                          required
                          value={courseTitle}
                          onChange={(e) => setCourseTitle(e.target.value)}
                          placeholder="Ex: Alquimia Prática Vegetal"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none placeholder-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Categoria / Grade</label>
                        <input
                          type="text"
                          required
                          value={courseCategory}
                          onChange={(e) => setCourseCategory(e.target.value)}
                          placeholder="Ex: Teoria e Prática"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none placeholder-zinc-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Quantidade de Aulas Iniciais (Geração Automática)</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={courseLessonsCount}
                        onChange={(e) => setCourseLessonsCount(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none font-mono"
                      />
                      <span className="text-[9px] text-zinc-600 mt-1 block font-sans">Como os cursos são permanentes e nunca expiram, sintonizar o curso cria automaticamente sua grade de lições estruturada.</span>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Proposta Acadêmica do Grau</label>
                      <textarea
                        required
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        placeholder="Descreva o que o iniciado aprenderá ao trilhar essa jornada de conhecimento..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none resize-none placeholder-zinc-850"
                      />
                    </div>
                  </>
                )}

                {/* --- OFFER/ADS FORM --- */}
                {activeTab === 'ads' && (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Título do Anúncio / Oferta</label>
                      <input
                        type="text"
                        required
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="Ex: Desconto de 30% em Audiobooks"
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none placeholder-zinc-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Crachá / Badge</label>
                        <input
                          type="text"
                          required
                          value={adBadge}
                          onChange={(e) => setAdBadge(e.target.value)}
                          placeholder="Ex: PROMOÇÃO, NOVIDADE, AVISO"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none placeholder-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Texto do Botão de Ação</label>
                        <input
                          type="text"
                          required
                          value={adActionText}
                          onChange={(e) => setAdActionText(e.target.value)}
                          placeholder="Ex: Garantir Vantagem, Ver Agora"
                          className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none placeholder-zinc-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5">Descrição do Aviso / Oferta</label>
                      <textarea
                        required
                        value={adDescription}
                        onChange={(e) => setAdDescription(e.target.value)}
                        placeholder="Escreva a mensagem clara da campanha que irá aparecer em destaque no carrossel do aplicativo..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none resize-none placeholder-zinc-850"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-2xl active:scale-98 transition-all cursor-pointer shadow-md mt-2"
                >
                  Sintonizar Publicação
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ABAS DO ADMIN DE CONTEÚDO */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-900" id="contents-admin-tabs">
        {(['pdf', 'audiobook', 'curso', 'ads'] as const).map((tab) => {
          const label = tab === 'pdf' ? 'E-books (PDF)' : tab === 'audiobook' ? 'Audiobooks' : tab === 'curso' ? 'Cursos' : 'Ofertas & Avisos';
          const Icon = tab === 'pdf' ? BookOpen : tab === 'audiobook' ? Volume2 : tab === 'curso' ? GraduationCap : Megaphone;

          return (
            <button
              key={tab}
              id={`tab-btn-${tab}`}
              onClick={() => {
                setActiveTab(tab);
                setIsAdding(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-900 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* LISTAGEM DOS CONTEÚDOS DENTRO DA ABA SELECIONADA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="contents-rendering-grid">
        
        {/* PDFs List */}
        {activeTab === 'pdf' && (
          pdfs.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-zinc-950 border border-zinc-900 rounded-3xl" id="empty-pdfs">
              <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-sans">Nenhum livro PDF cadastrado na egrégora.</p>
            </div>
          ) : (
            pdfs.map((p) => (
              <div key={p.id} className="p-5 bg-zinc-950 border border-zinc-900 hover:border-amber-500/10 rounded-3xl flex flex-col justify-between transition-all h-full" id={`pdf-item-${p.id}`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 text-[8px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-500" />
                      <span>{p.category}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-400 font-bold uppercase rounded-lg">
                      Grau {p.requiredLevel}
                    </span>
                  </div>

                  <div className="text-left space-y-1">
                    <h4 className="font-serif font-bold text-white text-sm line-clamp-1">{p.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-sans truncate">por {p.author}</p>
                    <p className="text-[10px] text-zinc-600 font-sans line-clamp-2 leading-relaxed pt-1">{p.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900/60 mt-4 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-mono">{p.pagesCount} páginas</span>
                  <button
                    id={`btn-del-pdf-${p.id}`}
                    onClick={() => handleDeleteItem(p.id, 'pdf')}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Excluir obra"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* Audiobooks List */}
        {activeTab === 'audiobook' && (
          audiobooks.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-zinc-950 border border-zinc-900 rounded-3xl" id="empty-audios">
              <Volume2 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-sans">Nenhuma sintonia em áudio cadastrada na egrégora.</p>
            </div>
          ) : (
            audiobooks.map((a) => (
              <div key={a.id} className="p-5 bg-zinc-950 border border-zinc-900 hover:border-amber-500/10 rounded-3xl flex flex-col justify-between transition-all h-full" id={`audio-item-${a.id}`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 text-[8px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-amber-500" />
                      <span>{a.category}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-400 font-bold uppercase rounded-lg">
                      Sintonia Ativa
                    </span>
                  </div>

                  <div className="text-left space-y-1">
                    <h4 className="font-serif font-bold text-white text-sm line-clamp-1">{a.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-sans truncate">por {a.author}</p>
                    <p className="text-[10px] text-zinc-600 font-sans line-clamp-2 leading-relaxed pt-1">{a.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900/60 mt-4 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-mono">Duração: {a.duration}</span>
                  <button
                    id={`btn-del-audio-${a.id}`}
                    onClick={() => handleDeleteItem(a.id, 'audiobook')}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Excluir áudio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* Courses List */}
        {activeTab === 'curso' && (
          courses.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-zinc-950 border border-zinc-900 rounded-3xl" id="empty-courses">
              <GraduationCap className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-sans">Nenhum curso cadastrado na Escola de Mistérios.</p>
            </div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="p-5 bg-zinc-950 border border-zinc-900 hover:border-amber-500/10 rounded-3xl flex flex-col justify-between transition-all h-full" id={`course-item-${c.id}`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 text-[8px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-amber-500" />
                      <span>{c.category}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-400 font-bold uppercase rounded-lg">
                      Livre / Permanente
                    </span>
                  </div>

                  <div className="text-left space-y-1">
                    <h4 className="font-serif font-bold text-white text-sm line-clamp-1">{c.title}</h4>
                    <p className="text-[10px] text-zinc-600 font-sans line-clamp-2 leading-relaxed pt-1">{c.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900/60 mt-4 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-mono">Módulos: {c.modules ? c.modules.length : 0}</span>
                  <button
                    id={`btn-del-course-${c.id}`}
                    onClick={() => handleDeleteItem(c.id, 'curso')}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Excluir curso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* Ofertas List */}
        {activeTab === 'ads' && (
          ads.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-zinc-950 border border-zinc-900 rounded-3xl" id="empty-ads">
              <Megaphone className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-sans">Nenhuma oferta ou aviso cadastrado na plataforma.</p>
            </div>
          ) : (
            ads.map((ad) => (
              <div key={ad.id} className="p-5 bg-zinc-950 border border-zinc-900 hover:border-amber-500/10 rounded-3xl flex flex-col justify-between transition-all h-full" id={`ad-item-${ad.id}`}>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-amber-500 text-black text-[8px] font-extrabold uppercase tracking-widest rounded-lg">
                      {ad.badge}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono">ID: {ad.id}</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-white text-sm line-clamp-1">{ad.title}</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans line-clamp-2">{ad.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900/60 mt-4 flex items-center justify-between text-[10px]">
                  <span className="text-amber-500 font-bold uppercase tracking-wider text-[8px]">Botão: {ad.actionText}</span>
                  <button
                    id={`btn-del-ad-${ad.id}`}
                    onClick={() => handleDeleteItem(ad.id, 'ads')}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Excluir aviso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )
        )}

      </div>
    </motion.div>
  );
}
