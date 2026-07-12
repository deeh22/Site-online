import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Star, History, Bookmark, Lock, HelpCircle, X, 
  ChevronRight, Sparkles, BookMarked, Eye, ShieldAlert, RefreshCw, Sparkle, LockKeyhole,
  Download, CloudCheck, CheckCircle2, CloudLightning
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService, PDFBook } from '../lib/dataService';
import ReviewsList from './ReviewsList';

interface UserLibraryProps {
  user: User;
  onNavigateToTab?: (tab: string) => void;
}

export default function UserLibrary({ user, onNavigateToTab }: UserLibraryProps) {
  const [books, setBooks] = useState<PDFBook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // Favoritos e Histórico
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [downloaded, setDownloaded] = useState<string[]>([]);
  
  // Leitor Ativo
  const [activeBook, setActiveBook] = useState<PDFBook | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [readerFontSize, setReaderFontSize] = useState<'text-xs' | 'text-sm' | 'text-base' | 'text-lg'>('text-sm');

  // Modal para livros bloqueados
  const [lockedBookForModal, setLockedBookForModal] = useState<PDFBook | null>(null);

  const loadBooks = () => {
    setBooks(dataService.getPDFs());
  };

  useEffect(() => {
    loadBooks();

    // Sincroniza com favoritos do dataService
    const favs = dataService.getUserFavorites(user.id).pdfs;
    setFavorites(favs);

    // Carrega downloads offline
    const dls = dataService.getDownloadedContents(user.id).pdfs;
    setDownloaded(dls);

    const savedHist = localStorage.getItem(`spirit_hist_books_${user.id}`);
    if (savedHist) setHistory(JSON.parse(savedHist));
  }, [user.id]);

  // Alterna Favorito
  const toggleFavorite = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dataService.toggleUserFavorite(user.id, 'pdf', bookId);
    const favs = dataService.getUserFavorites(user.id).pdfs;
    setFavorites(favs);
    
    // Mantém compatibilidade com legado
    localStorage.setItem(`spirit_fav_books_${user.id}`, JSON.stringify(favs));
  };

  // Alterna Download Offline
  const toggleDownload = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isDownloaded = downloaded.includes(bookId);
    dataService.toggleDownloadedContent(user.id, 'pdf', bookId, !isDownloaded);
    const dls = dataService.getDownloadedContents(user.id).pdfs;
    setDownloaded(dls);
  };

  // Abre Livro ou exibe modal explicativo de bloqueio
  const handleBookClick = (book: PDFBook) => {
    const hasPlanAccess = dataService.canAccessContent(user.id, user.role, 'pdf', [], book.id).allowed;
    const isLevelBlocked = book.requiredLevel > user.accessLevel;

    if (isLevelBlocked || !hasPlanAccess) {
      setLockedBookForModal(book);
    } else {
      // Registrar abertura do conteúdo para limites gratuitos
      dataService.recordContentOpened(user.id, 'pdf', book.id);

      // Registrar estatística de acesso administrativo
      dataService.recordBookAccess(book.id);

      // Tenta recuperar progresso
      const savedProg = dataService.getContinuityProgress(user.id);
      let startChapter = 0;
      if (savedProg?.pdf?.bookId === book.id) {
        startChapter = Math.max(0, savedProg.pdf.lastPage - 1);
      }

      setActiveBook(book);
      setActiveChapter(startChapter);

      // Adiciona ao Histórico de leitura recente
      const updatedHist = [book.id, ...history.filter(id => id !== book.id)].slice(0, 5);
      setHistory(updatedHist);
      localStorage.setItem(`spirit_hist_books_${user.id}`, JSON.stringify(updatedHist));
    }
  };

  // Salva o progresso de leitura automaticamente
  useEffect(() => {
    if (activeBook) {
      dataService.savePDFProgress(
        user.id,
        activeBook.id,
        activeBook.title,
        activeChapter + 1,
        activeBook.content ? activeBook.content.length : 1
      );
    }
  }, [activeBook, activeChapter, user.id]);

  const categories = ['Todos', ...Array.from(new Set(books.map(b => b.category)))];

  // Filtros
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12 text-left" id="user-library-wrapper">
      
      {/* 1. MODAL DE LIVRO BLOQUEADO (Upgrade / Nível Espiritual) */}
      <AnimatePresence>
        {lockedBookForModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 text-left" id="locked-book-modal-overlay">
            <motion.div
              id="locked-book-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                id="close-locked-modal"
                onClick={() => setLockedBookForModal(null)}
                className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4 pt-4" id="locked-book-modal-body">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <LockKeyhole className="w-6 h-6 animate-pulse text-amber-500" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold block">{lockedBookForModal.category}</span>
                  <h4 className="font-serif font-bold text-white text-base leading-tight">{lockedBookForModal.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-sans">Escrito por {lockedBookForModal.author}</p>
                </div>

                <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-2xl text-xs text-zinc-400 font-sans leading-relaxed text-left space-y-2">
                  <span className="font-bold text-zinc-300 block">Como sintonizar esta escritura?</span>
                  
                  {lockedBookForModal.requiredLevel > user.accessLevel ? (
                    <p>
                      Este manuscrito requer o <strong className="text-amber-500">Grau Nível {lockedBookForModal.requiredLevel}</strong> de consciência espiritual. Seu grau atual é o Nível {user.accessLevel}. Fale com o administrador para receber uma elevação de grau.
                    </p>
                  ) : (
                    <p>
                      Este e-book está bloqueado pelo seu plano atual. Você precisa adquirir o <strong className="text-amber-500">Plano de E-books PDF</strong> ou superior para sintonizar a leitura.
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setLockedBookForModal(null);
                      if (onNavigateToTab) {
                        onNavigateToTab('inicio');
                        // Scroll para a seção de planos
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
                    onClick={() => setLockedBookForModal(null)}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. LEITOR DE LIVROS ATIVO */}
      <AnimatePresence>
        {activeBook && (
          <motion.div
            id="book-reader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              id="book-reader-content"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 text-zinc-100 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
            >
              {/* Leitor Header */}
              <div className="p-5 sm:p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 sticky top-0" id="reader-header">
                <div className="flex items-center gap-3 bg-transparent">
                  <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left bg-transparent">
                    <h3 className="font-serif font-bold text-sm text-white max-w-[260px] sm:max-w-[320px] truncate">{activeBook.title}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{activeBook.author}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-transparent">
                  {/* Font Size Selector */}
                  <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
                    <button 
                      onClick={() => setReaderFontSize('text-xs')}
                      className={`px-2 py-1 rounded-lg ${readerFontSize === 'text-xs' ? 'bg-amber-500 text-black font-bold' : 'hover:text-white'}`}
                    >
                      A-
                    </button>
                    <button 
                      onClick={() => setReaderFontSize('text-sm')}
                      className={`px-2 py-1 rounded-lg ${readerFontSize === 'text-sm' ? 'bg-amber-500 text-black font-bold' : 'hover:text-white'}`}
                    >
                      A
                    </button>
                    <button 
                      onClick={() => setReaderFontSize('text-base')}
                      className={`px-2 py-1 rounded-lg ${readerFontSize === 'text-base' ? 'bg-amber-500 text-black font-bold' : 'hover:text-white'}`}
                    >
                      A+
                    </button>
                  </div>

                  <button
                    id="close-reader-btn"
                    onClick={() => setActiveBook(null)}
                    className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Leitor Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-zinc-300 font-sans leading-relaxed text-left" id="reader-body">
                <div className="space-y-4 bg-transparent">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold block">Capítulo {activeChapter + 1} de {activeBook.content ? activeBook.content.length : 1}</span>
                  <div className={`${readerFontSize} text-zinc-200 transition-all font-sans whitespace-pre-wrap leading-loose max-w-prose mx-auto bg-transparent`}>
                    {activeBook.content && activeBook.content[activeChapter] ? activeBook.content[activeChapter] : "Este manuscrito não possui conteúdo textual definido pelo administrador."}
                  </div>
                </div>

                {/* Seção de comentários e avaliações no final do estudo */}
                {activeChapter === (activeBook.content ? activeBook.content.length - 1 : 0) && (
                  <div className="mt-12 bg-transparent border-t border-zinc-900 pt-6">
                    <ReviewsList 
                      contentId={activeBook.id} 
                      contentType="pdf" 
                      userId={user.id} 
                      userName={user.name} 
                      isAdmin={user.role === 'ADMIN'}
                    />
                  </div>
                )}
              </div>

              {/* Leitor Footer */}
              <div className="p-4 sm:p-5 border-t border-zinc-900 bg-zinc-950 flex justify-between items-center text-xs" id="reader-footer">
                <button
                  id="reader-prev-chapter"
                  onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
                  disabled={activeChapter === 0}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 rounded-xl font-semibold transition-colors disabled:pointer-events-none cursor-pointer"
                >
                  Anterior
                </button>
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Págs. {activeChapter + 1} / {activeBook.content ? activeBook.content.length : 1}</span>
                <button
                  id="reader-next-chapter"
                  onClick={() => {
                    if (activeBook.content && activeChapter < activeBook.content.length - 1) {
                      setActiveChapter(activeChapter + 1);
                    } else {
                      setActiveBook(null);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all cursor-pointer"
                >
                  {activeBook.content && activeChapter === activeBook.content.length - 1 ? 'Concluir Leitura' : 'Próximo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Titulo e Descrição */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="library-header-row">
        <div className="space-y-1 text-left">
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Biblioteca Iniciática</h2>
          <p className="text-xs text-zinc-500 font-sans">Aprofunde-se em manuscritos e livros sagrados.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64" id="library-search">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="library-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar escrituras..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-amber-500/40 text-white text-xs outline-none transition-all duration-300 placeholder-zinc-700"
          />
        </div>
      </div>

      {/* Categorias Filtro */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="library-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`cat-btn-${cat}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap tracking-wider transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-900 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Histórico e Favoritos Resumido */}
      {(favorites.length > 0 || history.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-zinc-950/50 border border-zinc-900/60 rounded-3xl" id="library-quick-lists">
          {/* Favoritos */}
          {favorites.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-amber-500/70 font-bold flex items-center gap-1.5 text-left">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Minhas Preferidas ({favorites.length})</span>
              </span>
              <div className="space-y-2">
                {books.filter(b => favorites.includes(b.id)).slice(0, 3).map(b => {
                  const hasPlanAccess = dataService.canAccessContent(user.id, user.role, 'pdf', [], b.id).allowed;
                  const isBlocked = b.requiredLevel > user.accessLevel || !hasPlanAccess;
                  return (
                    <div 
                      key={b.id}
                      onClick={() => handleBookClick(b)}
                      className="p-2.5 rounded-xl border border-zinc-900 flex items-center justify-between gap-3 text-xs bg-black hover:bg-zinc-900/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 max-w-[200px] truncate text-left bg-transparent">
                        <BookMarked className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                        <span className="font-medium text-zinc-300 truncate">{b.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-transparent">
                        {isBlocked && <Lock className="w-3 h-3 text-amber-500/80" />}
                        <span className="text-[9px] text-zinc-600 font-sans italic">{b.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Histórico de Leitura */}
          {history.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5 text-left">
                <History className="w-3.5 h-3.5 text-zinc-500" />
                <span>Lidos Recentemente</span>
              </span>
              <div className="space-y-2 text-left">
                {books.filter(b => history.includes(b.id)).slice(0, 3).map(b => {
                  const hasPlanAccess = dataService.canAccessContent(user.id, user.role, 'pdf', [], b.id).allowed;
                  const isBlocked = b.requiredLevel > user.accessLevel || !hasPlanAccess;
                  return (
                    <div 
                      key={b.id}
                      onClick={() => handleBookClick(b)}
                      className="p-2.5 rounded-xl border border-zinc-900 flex items-center justify-between gap-3 text-xs bg-black hover:bg-zinc-900/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 max-w-[200px] truncate bg-transparent">
                        <Bookmark className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span className="font-medium text-zinc-300 truncate">{b.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-transparent">
                        {isBlocked && <Lock className="w-3 h-3 text-amber-500/80" />}
                        <span className="text-[9px] text-zinc-600 font-sans italic">{b.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid de Livros */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-zinc-950 border border-zinc-900 rounded-3xl" id="library-empty">
          <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-xs text-zinc-500 font-sans">Nenhuma escritura sagrada encontrada com os critérios informados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="library-books-grid">
          {filteredBooks.map((b) => {
            const isFavorite = favorites.includes(b.id);
            const hasPlanAccess = dataService.canAccessContent(user.id, user.role, 'pdf', [], b.id).allowed;
            const isLevelBlocked = b.requiredLevel > user.accessLevel;
            const isBlocked = isLevelBlocked || !hasPlanAccess;

            return (
              <motion.div
                key={b.id}
                id={`book-card-${b.id}`}
                whileHover={{ y: -4 }}
                onClick={() => handleBookClick(b)}
                className="flex flex-col bg-zinc-950 border rounded-3xl overflow-hidden shadow-lg select-none relative group h-full border-zinc-900 hover:border-amber-500/20 cursor-pointer"
              >
                {/* Capa do Livro Premium */}
                <div className={`h-44 bg-gradient-to-b ${b.coverGradient} p-5 relative flex flex-col justify-between border-b border-zinc-900/40`} id={`book-cover-${b.id}`}>
                  <div className="flex justify-between items-start bg-transparent" id={`book-cover-header-${b.id}`}>
                    <span className="px-2.5 py-1 bg-black/60 border border-white/5 text-[9px] text-zinc-300 rounded-xl font-bold uppercase tracking-wider">
                      {b.category}
                    </span>

                    {/* Botão Favoritar & Download */}
                    {!isBlocked && (
                      <div className="flex items-center gap-1.5 bg-transparent">
                        {b.downloadAllowed && (
                          <button
                            id={`btn-dl-${b.id}`}
                            onClick={(e) => toggleDownload(b.id, e)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              downloaded.includes(b.id)
                                ? 'bg-amber-500 text-black border-amber-600'
                                : 'bg-black/50 border-white/5 text-zinc-400 hover:text-amber-500 hover:border-amber-500/40'
                            }`}
                            title={downloaded.includes(b.id) ? 'Download Concluído (Acesso Offline)' : 'Baixar para Acesso Offline'}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          id={`btn-fav-${b.id}`}
                          onClick={(e) => toggleFavorite(b.id, e)}
                          className="p-1.5 rounded-lg bg-black/50 border border-white/5 hover:border-amber-500/40 text-zinc-400 hover:text-amber-500 transition-all cursor-pointer"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-left mt-auto space-y-1 bg-transparent">
                    <h4 className="font-serif font-bold text-white text-base leading-tight drop-shadow-sm group-hover:text-amber-400 transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-sans tracking-wide drop-shadow-sm">
                      por {b.author}
                    </p>
                  </div>

                  {/* Símbolos místico sutil na capa */}
                  <div className="absolute bottom-3 right-3 text-amber-500/10 pointer-events-none group-hover:text-amber-500/20 transition-all">
                    <Sparkles className="w-12 h-12" />
                  </div>
                </div>

                {/* Descrição e Nível */}
                <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4" id={`book-info-${b.id}`}>
                  <p className="text-xs text-zinc-500 font-sans leading-relaxed flex-1 line-clamp-3">
                    {b.description}
                  </p>

                  <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between" id={`book-footer-${b.id}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-medium font-sans">
                        {b.pagesCount || 10} páginas
                      </span>
                      {(() => {
                        const bookReviews = dataService.getReviews(b.id, 'pdf');
                        const bookRatingCount = bookReviews.length;
                        const bookRatingAvg = bookRatingCount > 0 
                          ? (bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookRatingCount).toFixed(1)
                          : null;
                        if (!bookRatingAvg) return null;
                        return (
                          <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-bold bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>{bookRatingAvg} ({bookRatingCount})</span>
                          </span>
                        );
                      })()}
                    </div>

                    {isBlocked ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] text-amber-500 font-bold uppercase tracking-wider">
                        <Lock className="w-3 h-3 text-amber-500" />
                        <span>{isLevelBlocked ? `Grau ${b.requiredLevel}` : 'Trancado'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold group-hover:gap-1.5 transition-all uppercase tracking-widest">
                        <span>Ler escritura</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
