import React, { useState, useEffect } from 'react';
import { 
  Send, MessageSquare, Clock, CheckCircle2, HelpCircle, 
  FileText, Volume2, Sparkles, Trash2, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService, ContentRequest } from '../lib/dataService';

interface UserRequestsProps {
  user: User;
}

export default function UserRequests({ user }: UserRequestsProps) {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [requestType, setRequestType] = useState<'pdf' | 'audiobook' | 'suggestion'>('pdf');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Carrega os pedidos feitos por esse usuário
  const loadRequests = () => {
    const all = dataService.getRequests();
    const userReqs = all.filter(r => r.userId === user.id);
    setRequests(userReqs);
  };

  useEffect(() => {
    loadRequests();
  }, [user.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);

    const newReq: ContentRequest = {
      id: `req-${Math.random().toString(36).substring(2, 9)}`,
      userId: user.id,
      userName: user.name || user.email.split('@')[0],
      userEmail: user.email,
      requestType,
      title: title.trim(),
      message: message.trim(),
      date: new Date().toISOString(),
      status: 'pending'
    };

    setTimeout(() => {
      dataService.saveRequest(newReq);
      setSubmitting(false);
      setSuccess(true);
      setTitle('');
      setMessage('');
      loadRequests();
      
      setTimeout(() => setSuccess(false), 4000);
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente cancelar este pedido?')) {
      dataService.deleteRequest(id);
      loadRequests();
    }
  };

  return (
    <div className="space-y-8 pb-12 text-left" id="user-requests-wrapper">
      {/* Cabeçalho */}
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Pedidos de Conteúdo</h2>
        </div>
        <p className="text-xs text-zinc-500 font-sans">
          Solicite audiobooks, livros PDF ou envie sugestões de ensinamentos para sintonizarmos no portal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Formulário de Envio (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Nova Solicitação
              </span>
              <h3 className="font-serif font-bold text-white text-lg">Faça o seu pedido</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              {/* Tipo de Pedido */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">O que você deseja sintonizar?</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestType('pdf')}
                    className={`py-3 rounded-2xl border transition-all text-[11px] font-semibold cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      requestType === 'pdf'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Livro PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('audiobook')}
                    className={`py-3 rounded-2xl border transition-all text-[11px] font-semibold cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      requestType === 'audiobook'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Audiobook</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('suggestion')}
                    className={`py-3 rounded-2xl border transition-all text-[11px] font-semibold cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      requestType === 'suggestion'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Sugestão</span>
                  </button>
                </div>
              </div>

              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Nome do Livro ou Áudio</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: O Caibalion, Mantra de Shiva..."
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-white outline-none focus:border-amber-500/30 transition-all placeholder-zinc-700 font-sans"
                />
              </div>

              {/* Mensagem / Detalhes */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Por que você deseja este conteúdo?</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva detalhes sobre o autor, finalidade ou sua mensagem sintonizada..."
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-white outline-none focus:border-amber-500/30 transition-all placeholder-zinc-700 font-sans resize-none"
                />
              </div>

              {/* Botão de Enviar */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Sintonizando...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitação</span>
                  </>
                )}
              </button>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-center font-semibold text-[11px] flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pedido enviado com sucesso ao Administrador!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Atendimento direto pelo WhatsApp */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 text-left flex flex-col justify-between space-y-4">
            <div className="space-y-1 bg-transparent">
              <h4 className="font-serif font-bold text-sm text-white">Prefere um contato imediato?</h4>
              <p className="text-[11px] text-zinc-500 font-sans">
                Fale conosco diretamente pelo WhatsApp para solicitar a liberação de conteúdos específicos ou solucionar pendências.
              </p>
            </div>
            <a
              href={`https://wa.me/55${dataService.getAppConfig().contactWhatsApp}?text=Olá!%20Gostaria%20de%20solicitar%20um%20conteúdo%20específico%20para%20o%20portal.`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 bg-zinc-900 border border-zinc-800 hover:border-amber-500/20 text-zinc-300 hover:text-white rounded-2xl text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Pedir via WhatsApp</span>
              <ArrowUpRight className="w-4 h-4 text-amber-500" />
            </a>
          </div>
        </div>

        {/* Histórico de Pedidos (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-serif font-bold text-zinc-400 text-sm tracking-wide">Suas Solicitações Recentes</h3>

          {requests.length === 0 ? (
            <div className="bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 bg-zinc-900/50 rounded-2xl flex items-center justify-center text-zinc-600 mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-zinc-500 text-xs font-sans">Nenhuma solicitação enviada até o momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div 
                  key={req.id} 
                  className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 space-y-4 relative"
                  id={`req-card-${req.id}`}
                >
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="absolute top-4 right-4 p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-900 cursor-pointer"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3 bg-transparent">
                    <div className="p-2 bg-amber-500/5 text-amber-500 rounded-xl border border-amber-500/10">
                      {req.requestType === 'pdf' ? (
                        <FileText className="w-4 h-4" />
                      ) : req.requestType === 'audiobook' ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <HelpCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-left bg-transparent">
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 block font-sans">
                        {req.requestType === 'pdf' ? 'Livro PDF' : req.requestType === 'audiobook' ? 'Audiobook' : 'Sugestão'}
                      </span>
                      <h4 className="font-serif font-bold text-white text-xs sm:text-sm leading-tight">{req.title}</h4>
                    </div>
                  </div>

                  <div className="text-zinc-400 text-xs font-sans leading-relaxed whitespace-pre-wrap pl-1">
                    {req.message}
                  </div>

                  {/* Status do Pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-zinc-900 gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 text-zinc-600 font-sans">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(req.date).toLocaleDateString('pt-BR')}</span>
                    </div>

                    <div className="flex items-center bg-transparent">
                      {req.status === 'fulfilled' ? (
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-bold uppercase tracking-wider">
                          Atendido
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500/5 border border-amber-500/10 text-amber-500 rounded-full font-bold uppercase tracking-wider">
                          Em Análise
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Resposta do Administrador se houver */}
                  {req.reply && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-left space-y-1.5">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-amber-500 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Resposta da Administração:
                      </span>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {req.reply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
