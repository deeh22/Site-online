import React, { useState, useEffect } from 'react';
import { Download, BookOpen, Volume2, ArrowRight, Play, CloudOff, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService, PDFBook, Audiobook } from '../lib/dataService';

interface UserDownloadsTabProps {
  user: User;
  onNavigateToTab?: (tab: string) => void;
}

export default function UserDownloadsTab({ user, onNavigateToTab }: UserDownloadsTabProps) {
  const [downloadedBooks, setDownloadedBooks] = useState<PDFBook[]>([]);
  const [downloadedAudios, setDownloadedAudios] = useState<Audiobook[]>([]);

  const loadDownloads = () => {
    const downloadedIds = dataService.getDownloadedContents(user.id);

    const allBooks = dataService.getPDFs();
    const allAudios = dataService.getAudiobooks();

    setDownloadedBooks(allBooks.filter(b => downloadedIds.pdfs.includes(b.id)));
    setDownloadedAudios(allAudios.filter(a => downloadedIds.audiobooks.includes(a.id)));
  };

  useEffect(() => {
    loadDownloads();
  }, [user.id]);

  const deleteDownload = (type: 'pdf' | 'audiobook', id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dataService.toggleDownloadedContent(user.id, type, id, false);
    loadDownloads();
  };

  const totalDownloads = downloadedBooks.length + downloadedAudios.length;

  return (
    <div className="space-y-8 text-left" id="user-downloads-container">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-500">
          <Download className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Modo Offline Sintonizado</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-white tracking-wide">Meus Downloads</h2>
        <p className="text-xs text-zinc-500 max-w-xl font-sans">
          Acesse suas escrituras e sintonias de áudio mesmo sem conexão à rede de dados. Conteúdo sincronizado localmente.
        </p>
      </div>

      {totalDownloads === 0 ? (
        <div className="text-center py-16 bg-zinc-950 border border-zinc-900 rounded-3xl" id="downloads-empty">
          <CloudOff className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
          <h4 className="font-serif font-bold text-white text-base">Nenhum download armazenado</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">
            Abra a Biblioteca ou o painel de Áudios e clique no botão de baixar (quando permitido pelo administrador) para salvar o arquivo offline no seu dispositivo.
          </p>
        </div>
      ) : (
        <div className="space-y-8" id="downloads-content-sections">
          {/* OFFLINE BOOKS */}
          {downloadedBooks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500/80" />
                Livros Disponíveis Offline ({downloadedBooks.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {downloadedBooks.map((b) => (
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
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold font-sans">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Armazenado Offline</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteDownload('pdf', b.id, e)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                      title="Deletar cache offline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* OFFLINE AUDIOS */}
          {downloadedAudios.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-500/80" />
                Mantras e Frequências Offline ({downloadedAudios.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {downloadedAudios.map((a) => (
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
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold font-sans">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Disponível Offline</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteDownload('audiobook', a.id, e)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                      title="Deletar cache offline"
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
