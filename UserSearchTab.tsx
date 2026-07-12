import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Volume2, GraduationCap, ArrowRight, Star, FileText, Check, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService, PDFBook, Audiobook, Course } from '../lib/dataService';

interface UserSearchTabProps {
  user: User;
  onNavigateToTab?: (tab: string) => void;
}

export default function UserSearchTab({ user, onNavigateToTab }: UserSearchTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros ativos
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'audio' | 'course'>('all');
  const [filterPricing, setFilterPricing] = useState<'all' | 'free' | 'premium'>('all');

  // Resultados
  const [booksResults, setBooksResults] = useState<PDFBook[]>([]);
  const [audiosResults, setAudiosResults] = useState<Audiobook[]>([]);
  const [coursesResults, setCoursesResults] = useState<Course[]>([]);
  
  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();

    // 1. Carrega todos os dados do banco local
    let pdfs = dataService.getPDFs();
    let audios = dataService.getAudiobooks();
    let courses = dataService.getCourses();

    // 2. Filtra por termo se fornecido
    if (term) {
      pdfs = pdfs.filter(p => 
        p.title.toLowerCase().includes(term) ||
        p.author.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );

      audios = audios.filter(a => 
        a.title.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term)
      );

      courses = courses.filter(c => 
        c.title.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        c.instructor.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        (c.modules && c.modules.some(m => m.title.toLowerCase().includes(term) || m.lessons.some(l => l.title.toLowerCase().includes(term))))
      );
    }

    // 3. Aplica filtro de tipo de conteúdo
    if (filterType === 'pdf') {
      audios = [];
      courses = [];
    } else if (filterType === 'audio') {
      pdfs = [];
      courses = [];
    } else if (filterType === 'course') {
      pdfs = [];
      audios = [];
    }

    // 4. Aplica filtro de preço (Gratuitos vs Premium)
    // Definimos "Gratuitos" como exigindo accessLevel <= 1 ou nível de acesso básico sem bloqueios de plano.
    if (filterPricing === 'free') {
      pdfs = pdfs.filter(p => p.requiredLevel <= 1);
      audios = audios.filter(a => a.requiredLevel <= 1);
      courses = courses.filter(c => c.requiredLevel <= 1);
    } else if (filterPricing === 'premium') {
      pdfs = pdfs.filter(p => p.requiredLevel > 1);
      audios = audios.filter(a => a.requiredLevel > 1);
      courses = courses.filter(c => c.requiredLevel > 1);
    }

    setBooksResults(pdfs);
    setAudiosResults(audios);
    setCoursesResults(courses);
  };

  // Dispara busca ao alterar o termo ou os filtros
  useEffect(() => {
    handleSearch();
  }, [searchTerm, filterType, filterPricing]);

  const totalResults = booksResults.length + audiosResults.length + coursesResults.length;

  return (
    <div className="space-y-8 text-left" id="user-search-container">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-500">
          <Search className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Oráculo de Ensinamentos</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-white tracking-wide">Busca Inteligente</h2>
        <p className="text-xs text-zinc-500 max-w-xl font-sans">
          Encontre sabedorias sagradas, e-books, sintonias binaurais ou caminhos de aprendizado com filtros rápidos e precisos.
        </p>
      </div>

      {/* Input de Busca Principal */}
      <div className="relative max-w-2xl" id="search-input-field">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por título, autor, assunto, módulos, mantras..."
          className="w-full px-6 py-4 bg-zinc-950 border border-zinc-900 focus:border-amber-500/40 rounded-2xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all pr-12 font-sans font-medium"
        />
        <div className="absolute top-1/2 -translate-y-1/2 right-4 text-zinc-600">
          <Search className="w-5 h-5" />
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900/60" id="search-filters-panel">
        {/* Filtro de Categoria/Tipo */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Sintonia por Conteúdo</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('pdf')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'pdf' ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Livros PDF</span>
            </button>
            <button
              onClick={() => setFilterType('audio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'audio' ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audiobooks</span>
            </button>
            <button
              onClick={() => setFilterType('course')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'course' ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Cursos</span>
            </button>
          </div>
        </div>

        {/* Filtro de Preço/Acesso */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Sintonia por Nível / Plano</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterPricing('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterPricing === 'all' ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Qualquer Nível
            </button>
            <button
              onClick={() => setFilterPricing('free')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterPricing === 'free' ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Gratuitos (Nível 1)
            </button>
            <button
              onClick={() => setFilterPricing('premium')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterPricing === 'premium' ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Estudos Premium
            </button>
          </div>
        </div>
      </div>

      {/* Resultados de Busca */}
      <div className="space-y-8" id="search-results-section">
        {totalResults === 0 ? (
          <div className="text-center py-16 bg-zinc-950 border border-zinc-900 rounded-3xl" id="search-results-empty">
            <Layers className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-xs text-zinc-500 font-sans">Sua busca não revelou escrituras no momento. Tente outros termos.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between" id="search-results-counter">
              <span className="text-xs text-zinc-500 font-semibold">{totalResults} sintonias sagradas encontradas</span>
            </div>

            {/* LIVROS RESULTS */}
            {booksResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Livros Digitais ({booksResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {booksResults.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        if (onNavigateToTab) onNavigateToTab('biblioteca');
                      }}
                      className="p-4 bg-zinc-950 hover:bg-zinc-900/40 border border-zinc-900 hover:border-amber-500/20 rounded-2xl flex gap-4 transition-all cursor-pointer text-left group"
                    >
                      <div className={`w-14 h-18 rounded-xl bg-gradient-to-br ${b.coverGradient} flex-shrink-0 flex items-center justify-center border border-white/5`}>
                        <FileText className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wider block">{b.category}</span>
                          <h4 className="font-serif font-bold text-xs text-white truncate leading-tight group-hover:text-amber-400 transition-colors">{b.title}</h4>
                          <p className="text-[9px] text-zinc-500 truncate">por {b.author}</p>
                        </div>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Nível Exigido: Grau {b.requiredLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIOBOOKS RESULTS */}
            {audiosResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-500" />
                  Mantras e Audiobooks ({audiosResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {audiosResults.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        if (onNavigateToTab) onNavigateToTab('audios');
                      }}
                      className="p-4 bg-zinc-950 hover:bg-zinc-900/40 border border-zinc-900 hover:border-amber-500/20 rounded-2xl flex gap-4 transition-all cursor-pointer text-left group"
                    >
                      <div className={`w-14 h-18 rounded-xl bg-gradient-to-br ${a.coverGradient} flex-shrink-0 flex items-center justify-center border border-white/5`}>
                        <Volume2 className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wider block">{a.category}</span>
                          <h4 className="font-serif font-bold text-xs text-white truncate leading-tight group-hover:text-amber-400 transition-colors">{a.title}</h4>
                          <p className="text-[9px] text-zinc-500 line-clamp-1">{a.description}</p>
                        </div>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Duração: {a.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COURSES RESULTS */}
            {coursesResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  Cursos e Aulas ({coursesResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coursesResults.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (onNavigateToTab) onNavigateToTab('cursos');
                      }}
                      className="p-4 bg-zinc-950 hover:bg-zinc-900/40 border border-zinc-900 hover:border-amber-500/20 rounded-2xl flex gap-4 transition-all cursor-pointer text-left group"
                    >
                      <div className={`w-14 h-18 rounded-xl bg-gradient-to-br ${c.coverGradient || 'from-amber-950 to-zinc-900'} flex-shrink-0 flex items-center justify-center border border-white/5`}>
                        <GraduationCap className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wider block">{c.category}</span>
                          <h4 className="font-serif font-bold text-xs text-white truncate leading-tight group-hover:text-amber-400 transition-colors">{c.title}</h4>
                          <p className="text-[9px] text-zinc-500 truncate">Mestre: {c.instructor}</p>
                        </div>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">{c.modules?.length || 0} Portais Teológicos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
