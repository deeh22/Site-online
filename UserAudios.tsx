import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Play, Pause, SkipForward, SkipBack, Lock, Sparkles, Sliders, 
  ChevronRight, HelpCircle, RefreshCw, X, LockKeyhole, Star, Download, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService, Audiobook } from '../lib/dataService';
import ReviewsList from './ReviewsList';

interface UserAudiosProps {
  user: User;
  onNavigateToTab?: (tab: string) => void;
}

export default function UserAudios({ user, onNavigateToTab }: UserAudiosProps) {
  const [tracks, setTracks] = useState<Audiobook[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Audiobook | null>(null);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // em segundos
  const [speed, setSpeed] = useState<number>(1.0);
  const [showingResumeNotice, setShowingResumeNotice] = useState(false);

  // Favoritos e Downloads
  const [favorites, setFavorites] = useState<string[]>([]);
  const [downloaded, setDownloaded] = useState<string[]>([]);

  // Modal para sintonias trancadas
  const [lockedTrackForModal, setLockedTrackForModal] = useState<Audiobook | null>(null);

  // Intervalo do Player Simulado
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega sintonias do dataService
  const loadTracks = () => {
    const list = dataService.getAudiobooks();
    setTracks(list);

    // Carrega favoritos e downloads
    setFavorites(dataService.getUserFavorites(user.id).audiobooks);
    setDownloaded(dataService.getDownloadedContents(user.id).audiobooks);

    const lastTrackId = localStorage.getItem(`spirit_last_track_id_${user.id}`);
    if (lastTrackId) {
      const found = list.find(t => t.id === lastTrackId);
      if (found) {
        // Verifica se a última track ainda possui acesso ou abre bloqueado
        setSelectedTrack(found);
        
        // Restaura o progresso
        const savedProgress = localStorage.getItem(`spirit_track_progress_${found.id}_${user.id}`);
        if (savedProgress) {
          setProgress(parseInt(savedProgress, 10));
        }
        return;
      }
    }
    // Caso contrário, pega a primeira disponível
    if (list.length > 0) {
      setSelectedTrack(list[0]);
    }
  };

  useEffect(() => {
    loadTracks();
  }, [user.id]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auxiliar para parsear duração "MM:SS" em segundos
  const getDurationInSeconds = (durStr: string): number => {
    if (!durStr) return 300;
    const parts = durStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parseInt(durStr, 10) || 300;
  };

  const trackDurationSec = selectedTrack ? getDurationInSeconds(selectedTrack.duration) : 300;

  // Efeito principal de simulação de reprodução do áudio
  useEffect(() => {
    if (isPlaying && selectedTrack) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1 * speed;
          if (next >= trackDurationSec) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            localStorage.setItem(`spirit_track_progress_${selectedTrack.id}_${user.id}`, '0');
            return 0;
          }
          localStorage.setItem(`spirit_track_progress_${selectedTrack.id}_${user.id}`, Math.floor(next).toString());
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, selectedTrack, speed, user.id, trackDurationSec]);

  // Alterna Favorito
  const toggleFavorite = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dataService.toggleUserFavorite(user.id, 'audiobook', trackId);
    setFavorites(dataService.getUserFavorites(user.id).audiobooks);
  };

  // Alterna Download Offline
  const toggleDownload = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isDownloaded = downloaded.includes(trackId);
    dataService.toggleDownloadedContent(user.id, 'audiobook', trackId, !isDownloaded);
    setDownloaded(dataService.getDownloadedContents(user.id).audiobooks);
  };

  // Ao trocar de áudio, salva histórico e carrega progresso antigo
  const handleSelectTrack = (track: Audiobook) => {
    const hasAccess = dataService.canAccessContent(user.id, user.role, 'audiobook', [], track.id).allowed;

    if (!hasAccess) {
      setLockedTrackForModal(track);
      return;
    }

    // Registrar abertura do conteúdo para limites gratuitos
    dataService.recordContentOpened(user.id, 'audiobook', track.id);
    
    // Registrar estatística de escuta administrativa
    dataService.recordAudiobookPlay(track.id);

    setIsPlaying(false);
    setSelectedTrack(track);
    localStorage.setItem(`spirit_last_track_id_${user.id}`, track.id);
    
    // Tenta restaurar progresso salvo
    const savedProgress = localStorage.getItem(`spirit_track_progress_${track.id}_${user.id}`);
    if (savedProgress) {
      const parsed = parseInt(savedProgress, 10);
      setProgress(parsed);
      if (parsed > 0) {
        setShowingResumeNotice(true);
        setTimeout(() => setShowingResumeNotice(false), 3000);
      }
    } else {
      setProgress(0);
    }
  };

  // Salva o progresso global de sintonias para continuidade
  useEffect(() => {
    if (selectedTrack && progress > 0) {
      dataService.saveAudiobookProgress(
        user.id,
        selectedTrack.id,
        selectedTrack.title,
        Math.floor(progress),
        trackDurationSec
      );
    }
  }, [selectedTrack, progress, user.id, trackDurationSec]);

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value, 10);
    setProgress(newProgress);
    if (selectedTrack) {
      localStorage.setItem(`spirit_track_progress_${selectedTrack.id}_${user.id}`, newProgress.toString());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isSelectedTrackLocked = selectedTrack 
    ? !dataService.canAccessContent(user.id, user.role, 'audiobook', [], selectedTrack.id).allowed
    : false;

  return (
    <div className="space-y-8 pb-12" id="user-audios-wrapper">
      
      {/* 1. MODAL DE SINTONIA BLOQUEADA */}
      <AnimatePresence>
        {lockedTrackForModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 text-left" id="locked-track-modal-overlay">
            <motion.div
              id="locked-track-modal-card"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-amber-500/20 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                id="close-locked-modal"
                onClick={() => setLockedTrackForModal(null)}
                className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4 pt-4" id="locked-track-modal-body">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <LockKeyhole className="w-6 h-6 animate-pulse text-amber-500" />
                </div>

                <div className="space-y-1 bg-transparent">
                  <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold block">{lockedTrackForModal.category || 'Mantra'}</span>
                  <h4 className="font-serif font-bold text-white text-base leading-tight">{lockedTrackForModal.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-sans">Duração de {lockedTrackForModal.duration}</p>
                </div>

                <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-2xl text-xs text-zinc-400 font-sans leading-relaxed text-left space-y-2">
                  <span className="font-bold text-zinc-300 block">Como liberar esta frequência sonora?</span>
                  <p>
                    Este audiobook ou frequência binaural está bloqueado pelo seu plano atual. Você precisa adquirir o <strong className="text-amber-500">Plano de PDFs + Audiobooks</strong> ou superior para liberar este áudio.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setLockedTrackForModal(null);
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
                    Adquirir Plano de Audiobooks
                  </button>
                  <button
                    onClick={() => setLockedTrackForModal(null)}
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

      <div className="space-y-1 text-left">
        <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Frequências e Mantras</h2>
        <p className="text-xs text-zinc-500 font-sans">Acalme sua mente e eleve seu estado vibracional através do som sagrado.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="audios-layout-grid text-left">
        {/* Lado Esquerdo: O Player Premium */}
        <div className="lg:col-span-7 space-y-6" id="player-column">
          {selectedTrack && !isSelectedTrackLocked ? (
            <div className="p-6 sm:p-8 bg-zinc-950 border border-amber-500/10 rounded-3xl relative overflow-hidden flex flex-col items-center shadow-2xl text-left" id="premium-audio-player">
              {/* Notificação de Continuidade */}
              <AnimatePresence>
                {showingResumeNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full z-20 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Continuando de onde parou...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Capa Gigante do Áudio */}
              <div className={`w-48 h-48 rounded-2xl bg-gradient-to-br ${selectedTrack.coverGradient || 'from-emerald-950 to-zinc-900'} border border-amber-500/20 shadow-lg flex items-center justify-center relative group overflow-hidden mb-6`} id="player-cover">
                {isPlaying ? (
                  <div className="flex items-end gap-1 h-12" id="soundwave-container">
                    <span className="w-1 bg-amber-500 rounded-full animate-[bounce_1.2s_infinite_ease-in-out_200ms] h-8" />
                    <span className="w-1 bg-amber-400 rounded-full animate-[bounce_1s_infinite_ease-in-out_400ms] h-11" />
                    <span className="w-1 bg-amber-300 rounded-full animate-[bounce_0.8s_infinite_ease-in-out_100ms] h-6" />
                    <span className="w-1 bg-amber-500 rounded-full animate-[bounce_1.1s_infinite_ease-in-out_600ms] h-12" />
                    <span className="w-1 bg-amber-400 rounded-full animate-[bounce_1.3s_infinite_ease-in-out_300ms] h-9" />
                  </div>
                ) : (
                  <Volume2 className="w-16 h-16 text-amber-500/20 group-hover:text-amber-500/40 transition-colors" />
                )}

                <div className="absolute top-3 right-3 text-amber-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              {/* Informações do Áudio */}
              <div className="text-center space-y-2 mb-6 w-full" id="player-info">
                <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                  {selectedTrack.category || 'Áudio'}
                </span>
                <h3 className="font-serif font-bold text-white text-lg max-w-md mx-auto leading-snug">
                  {selectedTrack.title}
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed font-sans">
                  {selectedTrack.description}
                </p>
              </div>

              {/* Progresso e Controles */}
              <div className="w-full space-y-4" id="player-controls-container">
                {/* Barra de Progresso */}
                <div className="space-y-1.5" id="progress-bar-area">
                  <input
                    type="range"
                    min="0"
                    max={trackDurationSec}
                    value={Math.floor(progress)}
                    onChange={handleProgressBarChange}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    style={{
                      background: `linear-gradient(to right, #d97706 0%, #d97706 ${(progress / trackDurationSec) * 100}%, #18181b ${(progress / trackDurationSec) * 100}%, #18181b 100%)`
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono" id="time-labels">
                    <span>{formatTime(progress)}</span>
                    <span>-{formatTime(trackDurationSec - progress)}</span>
                  </div>
                </div>

                {/* Botões do Player */}
                <div className="flex items-center justify-between pt-2" id="controls-toolbar">
                  {/* Velocidade */}
                  <div className="flex items-center gap-1 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 text-[10px] font-bold text-zinc-400">
                    <Sliders className="w-3.5 h-3.5 text-zinc-600" />
                    <button 
                      onClick={() => setSpeed(speed === 1.0 ? 1.5 : speed === 1.5 ? 2.0 : speed === 2.0 ? 0.5 : 1.0)}
                      className="hover:text-amber-500 transition-colors cursor-pointer uppercase"
                    >
                      {speed.toFixed(1)}x
                    </button>
                  </div>

                  {/* Play / Pause / Skip */}
                  <div className="flex items-center gap-4" id="play-pause-buttons">
                    <button
                      onClick={() => setProgress(Math.max(0, progress - 15))}
                      className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-900 rounded-full transition-all cursor-pointer"
                      title="Voltar 15s"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-[0.97] transition-all cursor-pointer border border-amber-400/20"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black pl-0.5" />}
                    </button>

                    <button
                      onClick={() => setProgress(Math.min(trackDurationSec, progress + 15))}
                      className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-900 rounded-full transition-all cursor-pointer"
                      title="Avançar 15s"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Controles Extras: Favorito, Download, Reiniciar */}
                  <div className="flex items-center gap-1.5 bg-transparent">
                    {selectedTrack.downloadAllowed && (
                      <button
                        onClick={(e) => toggleDownload(selectedTrack.id, e)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          downloaded.includes(selectedTrack.id)
                            ? 'bg-amber-500 text-black border-amber-600'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-amber-500'
                        }`}
                        title={downloaded.includes(selectedTrack.id) ? 'Download Concluído (Offline)' : 'Baixar para Ouvir Offline'}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => toggleFavorite(selectedTrack.id, e)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        favorites.includes(selectedTrack.id)
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-amber-500'
                      }`}
                      title="Favoritar"
                    >
                      <Star className={`w-3.5 h-3.5 ${favorites.includes(selectedTrack.id) ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        setProgress(0);
                      }}
                      className="p-2 text-zinc-500 hover:text-amber-500 transition-all rounded-xl cursor-pointer"
                      title="Reiniciar"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Avaliações do Audiobook */}
              <div className="mt-6 bg-zinc-950 p-6 rounded-3xl border border-zinc-900 text-left">
                <ReviewsList 
                  contentId={selectedTrack.id} 
                  contentType="audiobook" 
                  userId={user.id} 
                  userName={user.name} 
                  isAdmin={user.role === 'ADMIN'}
                />
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-center items-center space-y-4" id="locked-player-fallback">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <LockKeyhole className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-white font-bold text-sm">Nenhum áudio ativo selecionado</h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-sans">
                Selecione uma sintonia disponível na playlist ao lado para carregar no player místico.
              </p>
            </div>
          )}
        </div>

        {/* Lado Direito: A Playlist de Sintonias */}
        <div className="lg:col-span-5 space-y-4 text-left" id="playlist-column">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Lista de Sintonias de Luz</h4>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" id="playlist-tracks">
            {tracks.map((track) => {
              const isActive = selectedTrack?.id === track.id;
              const hasAccess = dataService.canAccessContent(user.id, user.role, 'audiobook', [], track.id).allowed;

              return (
                <div
                  key={track.id}
                  id={`track-item-${track.id}`}
                  onClick={() => handleSelectTrack(track)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                    isActive && hasAccess
                      ? 'bg-zinc-900/60 border-amber-500/30 shadow-md'
                      : 'bg-zinc-950 hover:bg-zinc-900/20 border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3 bg-transparent">
                    {/* Mini Capa */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${track.coverGradient || 'from-emerald-950 to-zinc-900'} border border-white/5 flex items-center justify-center text-zinc-500 shrink-0`}>
                      <Volume2 className={`w-4 h-4 ${isActive && isPlaying && hasAccess ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
                    </div>
                    
                    <div className="space-y-0.5 text-left bg-transparent">
                      <div className="flex items-center gap-1.5 bg-transparent">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">{track.category || 'Áudio'}</span>
                        {(() => {
                          const ratingReviews = dataService.getReviews(track.id, 'audiobook');
                          const ratingCount = ratingReviews.length;
                          const ratingAvg = ratingCount > 0 
                            ? (ratingReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount).toFixed(1)
                            : null;
                          if (!ratingAvg) return null;
                          return (
                            <span className="flex items-center gap-0.5 text-[8px] text-amber-500 font-bold bg-zinc-900 px-1 py-0.5 rounded">
                              <Star className="w-2 h-2 fill-amber-500 text-amber-500" />
                              <span>{ratingAvg}</span>
                            </span>
                          );
                        })()}
                      </div>
                      <h5 className="font-serif font-bold text-xs text-white leading-tight max-w-[130px] sm:max-w-[180px] truncate">{track.title}</h5>
                      <span className="block text-[9px] text-zinc-500">{track.duration} de duração</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-transparent">
                    {!hasAccess && (
                      <Lock className="w-3.5 h-3.5 text-amber-500/80 mr-1" />
                    )}
                    
                    {isActive && hasAccess ? (
                      <div className="text-amber-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">
                        {isPlaying ? 'Sintonizando' : 'Selecionado'}
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500/10 border border-zinc-800 text-zinc-400 hover:text-amber-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
