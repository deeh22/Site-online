import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Plus, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService, ContentReview } from '../lib/dataService';

interface ReviewsListProps {
  contentId: string;
  contentType: 'pdf' | 'audiobook' | 'course' | 'lesson';
  userId: string;
  userName: string;
  isAdmin?: boolean;
}

export default function ReviewsList({ contentId, contentType, userId, userName, isAdmin = false }: ReviewsListProps) {
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [contentId, contentType]);

  const loadReviews = () => {
    // Carrega avaliações do serviço
    const all = dataService.getReviews(contentId, contentType);
    setReviews(all.filter(r => !r.isHidden || isAdmin));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    setIsSubmitting(true);

    try {
      dataService.addReview({
        contentId,
        contentType,
        userId,
        userName,
        rating,
        comment: comment.trim()
      });

      setComment('');
      setRating(5);
      setSuccessMsg('Avaliação enviada com sucesso à egrégora!');
      loadReviews();

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    dataService.deleteReview(id);
    loadReviews();
  };

  const handleToggleHide = (id: string) => {
    dataService.toggleHideReview(id);
    loadReviews();
  };

  // Calcular estatísticas
  const count = reviews.length;
  const average = count > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 text-left border-t border-zinc-900 pt-6" id={`reviews-container-${contentId}`}>
      {/* Resumo de Avaliações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-900" id="reviews-summary-box">
        <div className="flex items-center gap-4 bg-transparent">
          <div className="text-center bg-transparent">
            <span className="block text-3xl font-serif font-bold text-amber-500 font-mono">{average}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-bold">Nota Média</span>
          </div>
          <div className="h-10 w-px bg-zinc-900" />
          <div className="bg-transparent">
            <div className="flex gap-0.5 text-amber-500 bg-transparent">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-3.5 h-3.5 ${Number(average) >= s ? 'fill-amber-500' : 'text-zinc-800'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-zinc-500 block mt-1 font-sans font-bold">
              {count} {count === 1 ? 'avaliação realizada' : 'avaliações realizadas'}
            </span>
          </div>
        </div>
        <span className="text-[9px] text-zinc-600 font-mono italic">
          O que as mentes despertas acharam deste estudo
        </span>
      </div>

      {/* Formulário de Nova Avaliação */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-900" id="review-add-form">
        <div className="flex justify-between items-center bg-transparent">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>Sintonizar Opinião</span>
          </span>
          {/* Estrelas Interativas */}
          <div className="flex gap-1 bg-transparent">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                id={`star-select-${s}`}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-0.5 text-amber-500 hover:scale-110 transition-all bg-transparent cursor-pointer"
              >
                <Star 
                  className={`w-4 h-4 ${
                    (hoverRating !== null ? hoverRating >= s : rating >= s) 
                      ? 'fill-amber-500 text-amber-500' 
                      : 'text-zinc-800'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        <div className="relative bg-transparent">
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Compartilhe sua vibração, reflexão ou lição aprendida..."
            rows={2}
            maxLength={300}
            className="w-full px-3 py-2.5 bg-black border border-zinc-900 rounded-xl focus:border-amber-500/40 text-white text-xs outline-none resize-none placeholder-zinc-800"
          />
          <span className="absolute bottom-2 right-3 text-[9px] text-zinc-700 font-mono">
            {comment.length}/300
          </span>
        </div>

        <div className="flex justify-between items-center bg-transparent">
          <div className="bg-transparent">
            {successMsg && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
          >
            Avaliar
          </button>
        </div>
      </form>

      {/* Listagem de Comentários */}
      <div className="space-y-3" id="reviews-history-list">
        {reviews.length === 0 ? (
          <p className="text-[10px] text-zinc-600 font-sans italic py-4 text-center">Nenhum comentário sintonizado para este estudo ainda. Seja o primeiro!</p>
        ) : (
          <div className="space-y-3.5">
            {reviews.map((r) => (
              <div 
                key={r.id} 
                className={`p-4 bg-black border rounded-2xl text-xs space-y-2 relative transition-all ${
                  r.isHidden ? 'border-dashed border-red-900 bg-red-950/5' : 'border-zinc-900'
                }`}
                id={`review-item-${r.id}`}
              >
                <div className="flex justify-between items-start bg-transparent">
                  <div className="text-left bg-transparent">
                    <span className="font-bold text-zinc-300 block">{r.userName}</span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {new Date(r.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-transparent">
                    {/* Estrelas */}
                    <div className="flex gap-0.5 text-amber-500 bg-transparent">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-3 h-3 ${r.rating >= s ? 'fill-amber-500' : 'text-zinc-800'}`} 
                        />
                      ))}
                    </div>

                    {/* Controles Admin */}
                    {(isAdmin || r.userId === userId) && (
                      <div className="flex items-center gap-1.5 bg-transparent ml-1">
                        {isAdmin && (
                          <button
                            id={`btn-hide-review-${r.id}`}
                            onClick={() => handleToggleHide(r.id)}
                            className={`p-1 rounded-lg border text-[9px] font-bold uppercase cursor-pointer transition-colors ${
                              r.isHidden 
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                            title={r.isHidden ? "Mostrar Comentário" : "Ocultar Comentário"}
                          >
                            {r.isHidden ? "Mostrar" : "Ocultar"}
                          </button>
                        )}
                        <button
                          id={`btn-del-review-${r.id}`}
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-zinc-400 text-left font-sans leading-relaxed whitespace-pre-wrap pl-1 bg-transparent">
                  {r.comment}
                </p>

                {r.isHidden && (
                  <div className="flex items-center gap-1 text-[9px] text-red-400 font-bold bg-transparent">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    <span>Ocultado pela Moderação</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
