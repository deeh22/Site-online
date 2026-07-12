import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Volume2, GraduationCap, Star, ArrowRight, Trash2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService, PDFBook, Audiobook, Course, CourseLesson } from '../lib/dataService';

interface UserFavoritesTabProps {
  user: User;
  onNavigateToTab?: (tab: string) => void;
}

interface FavLessonItem {
  lesson: CourseLesson;
  courseTitle: string;
}

export default function UserFavoritesTab({ user, onNavigateToTab }: UserFavoritesTabProps) {
  const [favoriteBooks, setFavoriteBooks] = useState<PDFBook[]>([]);
  const [favoriteAudios, setFavoriteAudios] = useState<Audiobook[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([]);
  const [favoriteLessons, setFavoriteLessons] = useState<FavLessonItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'pdf' | 'audio' | 'course' | 'lesson'>('all');

  const loadFavorites = () => {
    const favIds = dataService.getUserFavorites(user.id);
    
    const allBooks = dataService.getPDFs();
    const allAudios = dataService.getAudiobooks();
    const allCourses = dataService.getCourses();

    setFavoriteBooks(allBooks.filter(b => favIds.pdfs.includes(b.id)));
    setFavoriteAudios(allAudios.filter(a => favIds.audiobooks.includes(a.id)));
    setFavoriteCourses(allCourses.filter(c => favIds.courses.includes(c.id)));

    // Resolve favorited lessons
    const resolvedLessons: FavLessonItem[] = [];
    allCourses.forEach(course => {
      if (course.modules) {
        course.modules.forEach(m => {
          if (m.lessons) {
            m.lessons.forEach(l => {
              if (favIds.lessons && favIds.lessons.includes(l.id)) {
                resolvedLessons.push({
                  lesson: l,
                  courseTitle: course.title
                });
              }
            });
          }
        });
      }
    });
    setFavoriteLessons(resolvedLessons);
  };

  useEffect(() => {
    loadFavorites();
  }, [user.id]);

  const removeFavorite = (type: 'pdf' | 'audiobook' | 'course' | 'lesson', id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dataService.toggleUserFavorite(user.id, type, id);
    loadFavorites();
  };

  const totalFavsCount = favoriteBooks.length + favoriteAudios.length + favoriteCourses.length + favoriteLessons.length;

  return (
    <div className="space-y-8 text-left" id="user-favorites-container">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-500">
          <Heart className="w-5 h-5 fill-amber-500" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Espaço Sagrado</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-white tracking-wide">Meus Favoritos</h2>
        <p className="text-xs text-zinc-500 max-w-xl font-sans">
          Os ensinamentos, frequências, cursos e aulas que mais tocaram seu coração, guardados para acesso rápido e sintonias profundas.
        </p>
      </div>

      {/* Sub-Tabs de Filtro */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-4" id="fav-sub-tabs">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
            activeSubTab === 'all'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Todos ({totalFavsCount})
        </button>
        <button
          onClick={() => setActiveSubTab('pdf')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
            activeSubTab === 'pdf'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Livros PDF ({favoriteBooks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('audio')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
            activeSubTab === 'audio'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Audiobooks ({favoriteAudios.length})
        </button>
        <button
          onClick={() => setActiveSubTab('course')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
            activeSubTab === 'course'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Cursos ({favoriteCourses.length})
        </button>
        <button
          onClick={() => setActiveSubTab('lesson')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
            activeSubTab === 'lesson'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Aulas ({favoriteLessons.length})
        </button>
      </div>

      {totalFavsCount === 0 ? (
        <div className="text-center py-16 bg-zinc-950 border border-zinc-900 rounded-3xl" id="favorites-empty">
          <Heart className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
          <h4 className="font-serif font-bold text-white text-base">Seu santuário de favoritos está vazio</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">
            Navegue pelos módulos e clique no ícone de estrela ou coração para salvar seus e-books, áudios, cursos e lições individuais aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-10" id="favorites-content-grid">
          {/* E-BOOKS SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'pdf') && favoriteBooks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500/80" />
                Livros e Manuscritos Guardados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteBooks.map((b) => (
                  <motion.div
                    key={b.id}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      if (onNavigateToTab) onNavigateToTab('biblioteca');
                    }}
                    className="p-4 bg-zinc-950 border border-zinc-900 hover:border-amber-500/10 rounded-2xl flex gap-4 cursor-pointer relative group text-left"
                  >
                    <div className={`w-16 h-20 rounded-xl bg-gradient-to-br ${b.coverGradient} flex-shrink-0 flex items-center justify-center border border-white/5`}>
                      <BookOpen className="w-6 h-6 text-white/50" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-8">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">{b.category}</span>
                        <h4 className="font-serif font-bold text-sm text-white truncate leading-tight group-hover:text-amber-400 transition-colors">{b.title}</h4>
                        <p className="text-[10px] text-zinc-400 truncate">por {b.author}</p>
                      </div>
                      <span className="text-[10px] text-zinc-500">{b.pagesCount || 10} páginas</span>
                    </div>
                    <button
                      onClick={(e) => removeFavorite('pdf', b.id, e)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIOBOOKS SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'audio') && favoriteAudios.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-500/80" />
                Mantras e Audiobooks Frequenciais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteAudios.map((a) => (
                  <motion.div
                    key={a.id}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      if (onNavigateToTab) onNavigateToTab('audios');
                    }}
                    className="p-4 bg-zinc-950 border border-zinc-900 hover:border-amber-500/10 rounded-2xl flex gap-4 cursor-pointer relative group text-left"
                  >
                    <div className={`w-16 h-20 rounded-xl bg-gradient-to-br ${a.coverGradient} flex-shrink-0 flex items-center justify-center border border-white/5`}>
                      <Volume2 className="w-6 h-6 text-white/50" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-8">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">{a.category}</span>
                        <h4 className="font-serif font-bold text-sm text-white truncate leading-tight group-hover:text-amber-400 transition-colors">{a.title}</h4>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{a.description}</p>
                      </div>
                      <span className="text-[10px] text-zinc-500">{a.duration}</span>
                    </div>
                    <button
                      onClick={(e) => removeFavorite('audiobook', a.id, e)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* CURSES SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'course') && favoriteCourses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-500/80" />
                Estudos e Jornadas Iniciáticas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteCourses.map((c) => (
                  <motion.div
                    key={c.id}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      if (onNavigateToTab) onNavigateToTab('cursos');
                    }}
                    className="p-4 bg-zinc-950 border border-zinc-900 hover:border-amber-500/10 rounded-2xl flex gap-4 cursor-pointer relative group text-left"
                  >
                    <div className={`w-16 h-20 rounded-xl bg-gradient-to-br ${c.coverGradient || 'from-amber-950 to-zinc-900'} flex-shrink-0 flex items-center justify-center border border-white/5`}>
                      <GraduationCap className="w-6 h-6 text-white/50" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-8">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">{c.category}</span>
                        <h4 className="font-serif font-bold text-sm text-white truncate leading-tight group-hover:text-amber-400 transition-colors">{c.title}</h4>
                        <p className="text-[10px] text-zinc-400 truncate">por {c.instructor || 'Guia Espiritual'}</p>
                      </div>
                      <span className="text-[10px] text-zinc-500">{c.modulesCount || 4} Portais sintonizados</span>
                    </div>
                    <button
                      onClick={(e) => removeFavorite('course', c.id, e)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* LESSONS SECTION */}
          {(activeSubTab === 'all' || activeSubTab === 'lesson') && favoriteLessons.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-500/80" />
                Aulas e Transmissões Gravadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteLessons.map(({ lesson, courseTitle }) => (
                  <motion.div
                    key={lesson.id}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      if (onNavigateToTab) onNavigateToTab('cursos');
                    }}
                    className="p-4 bg-zinc-950 border border-zinc-900 hover:border-amber-500/10 rounded-2xl flex gap-4 cursor-pointer relative group text-left"
                  >
                    <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-amber-950 to-zinc-950 flex-shrink-0 flex items-center justify-center border border-white/5">
                      <Play className="w-6 h-6 text-white/50 fill-white/10" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-8">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">{courseTitle}</span>
                        <h4 className="font-serif font-bold text-sm text-white truncate leading-tight group-hover:text-amber-400 transition-colors">{lesson.title}</h4>
                        <p className="text-[10px] text-zinc-500 line-clamp-2">{lesson.description || 'Assista a esta transmissão gravada.'}</p>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">Transmissão Gravada</span>
                    </div>
                    <button
                      onClick={(e) => removeFavorite('lesson', lesson.id, e)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
