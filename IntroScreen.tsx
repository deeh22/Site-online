import React from 'react';
import { Sparkles, Compass, Eye, Heart, BookOpen, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface IntroScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export default function IntroScreen({ onNavigateToLogin, onNavigateToRegister }: IntroScreenProps) {
  return (
    <motion.div
      id="intro-screen-wrapper"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto bg-zinc-950/60 border border-amber-500/10 rounded-3xl shadow-[0_0_50px_rgba(217,119,6,0.05)] overflow-hidden backdrop-blur-xl relative"
    >
      {/* Luz mística de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="p-10 sm:p-12 text-center relative z-10 flex flex-col items-center" id="intro-card-body">
        {/* Ícone/Logo Sagrado Central */}
        <motion.div
          initial={{ rotate: -10, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
          className="relative w-24 h-24 mb-8"
          id="intro-logo-container"
        >
          {/* Círculo místico externo */}
          <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/20 animate-[spin_60s_linear_infinite]" />
          {/* Círculo místico interno */}
          <div className="absolute inset-2 rounded-full border border-amber-500/40 animate-[spin_20s_linear_infinite_reverse] flex items-center justify-center bg-black/50" />
          
          <div className="absolute inset-0 flex items-center justify-center text-amber-400">
            <Compass className="w-10 h-10 stroke-[1.25] animate-pulse" />
          </div>
          
          <div className="absolute -top-1 -right-1 text-amber-500 animate-bounce">
            <Sparkles className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Nome do Aplicativo */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-3"
          id="intro-title-area"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide" id="intro-app-name">
            DESPERTAR
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500/50" />
            <span className="text-xs uppercase tracking-[0.3em] font-sans text-amber-500 font-semibold">Espiritualidade</span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
        </motion.div>

        {/* Frase de boas-vindas */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-sm text-zinc-400 mt-6 max-w-sm mx-auto leading-relaxed font-sans"
          id="intro-welcome-text"
        >
          O portal sagrado para a sua expansão de consciência, sintonia de frequências sonoras e meditação profunda.
        </motion.p>

        {/* Benefícios em pilares elegantes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-3 gap-2 w-full mt-8 pt-6 border-t border-zinc-900/50"
          id="intro-features"
        >
          <div className="flex flex-col items-center p-2 rounded-xl hover:bg-zinc-900/20 transition-all">
            <BookOpen className="w-4 h-4 text-amber-500/70 mb-1.5" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Leitura</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl hover:bg-zinc-900/20 transition-all">
            <Flame className="w-4 h-4 text-amber-500/70 mb-1.5" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Mantras</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl hover:bg-zinc-900/20 transition-all">
            <Eye className="w-4 h-4 text-amber-500/70 mb-1.5" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Cursos</span>
          </div>
        </motion.div>

        {/* Botões moderníssimos com aparência premium */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full space-y-4 mt-10"
          id="intro-buttons"
        >
          {/* Botão Entrar - Ouro Polido */}
          <button
            id="intro-btn-entrar"
            onClick={onNavigateToLogin}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:via-amber-400 hover:to-amber-300 text-black font-semibold rounded-2xl text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(245,158,11,0.15)] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-amber-400/20"
          >
            <span>Conectar-se</span>
          </button>

          {/* Botão Criar Conta - Bordas de Ouro e Fundo Preto */}
          <button
            id="intro-btn-cadastrar"
            onClick={onNavigateToRegister}
            className="w-full py-4 px-6 bg-black hover:bg-zinc-900 text-amber-500 hover:text-amber-400 border border-amber-500/30 hover:border-amber-500/60 font-semibold rounded-2xl text-xs uppercase tracking-widest active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Iniciar Jornada</span>
          </button>
        </motion.div>

        {/* Indicador de segurança sutil */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-[9px] text-zinc-600 uppercase tracking-widest flex items-center gap-1.5"
          id="intro-privacy-note"
        >
          <Heart className="w-2.5 h-2.5 text-amber-500/40" />
          <span>Ambiente de Conexão Segura</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
