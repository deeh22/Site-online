import React, { useEffect, useState } from 'react';
import { 
  Instagram, Facebook, Youtube, Compass, Sparkles, Heart, Sparkle
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataService, AppConfig } from '../lib/dataService';

export default function UserCredits() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    setConfig(dataService.getAppConfig());
  }, []);

  if (!config) return null;

  const creator = config.creatorConfig || {
    name: "Mestre Gabriel",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    bio: "Iniciado nas artes herméticas e meditação prânica há mais de 15 anos. Dedicado a guiar almas no despertar da consciência e cura interior.",
    description: "Criador e mentor espiritual do portal Despertar Espiritualidade, auxiliando milhares de buscadores ao redor do mundo.",
    message: "A luz que você busca fora já brilha intensamente no altar do seu próprio coração. Permita-se silenciar e recordar.",
    instagram: "https://instagram.com/despertar",
    facebook: "https://facebook.com/despertar",
    youtube: "https://youtube.com/despertar"
  };

  return (
    <div className="space-y-8 pb-12 text-left" id="user-credits-wrapper">
      {/* Cabeçalho */}
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Créditos do Criador</h2>
        </div>
        <p className="text-xs text-zinc-500 font-sans">
          Conheça a mentoria espiritual por trás do portal Despertar Espiritualidade.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
        {/* Sparkle sutil de fundo */}
        <div className="absolute top-0 right-0 p-8 text-amber-500/5 pointer-events-none">
          <Compass className="w-48 h-48 animate-[spin_60s_linear_infinite]" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative z-10">
          {/* Foto */}
          <div className="shrink-0 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl blur-md opacity-25" />
            <img
              src={creator.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"}
              alt={creator.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-amber-500/20 object-cover shadow-2xl relative z-10"
            />
          </div>

          {/* Nome, Bio e Redes Sociais */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-amber-500 font-bold font-sans">Guia e Mentor</span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">{creator.name}</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">{creator.description}</p>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              {creator.instagram && (
                <a
                  href={creator.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-xl transition-all border border-zinc-850 cursor-pointer"
                  title="Instagram"
                >
                  <Instagram className="w-4.5 h-4.5" />
                </a>
              )}
              {creator.facebook && (
                <a
                  href={creator.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-xl transition-all border border-zinc-850 cursor-pointer"
                  title="Facebook"
                >
                  <Facebook className="w-4.5 h-4.5" />
                </a>
              )}
              {creator.youtube && (
                <a
                  href={creator.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-xl transition-all border border-zinc-850 cursor-pointer"
                  title="YouTube"
                >
                  <Youtube className="w-4.5 h-4.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Biografia Detalhada */}
        <div className="space-y-3 pt-6 border-t border-zinc-900 text-left relative z-10">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Trajetória Sagrada</h4>
          <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
            {creator.bio}
          </p>
        </div>

        {/* Mensagem Inspiradora */}
        {creator.message && (
          <div className="p-5 sm:p-6 bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl text-left relative z-10 space-y-3">
            <span className="text-[9px] uppercase tracking-widest font-bold text-amber-500 flex items-center gap-1.5 font-sans">
              <Heart className="w-3.5 h-3.5 fill-amber-500/10 text-amber-500" /> Mensagem aos Buscadores:
            </span>
            <p className="text-xs sm:text-sm text-zinc-300 italic font-serif leading-relaxed pl-1">
              "{creator.message}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
