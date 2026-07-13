import React, { useState } from 'react';
import { ShieldCheck, X, Code, AlertTriangle } from 'lucide-react';
import SqlGuideModal from './SqlGuideModal';
import { authService } from '../lib/authService';

export default function EnvConfigAlert() {
  const [dismissed, setDismissed] = useState(false);
  const [isSqlOpen, setIsSqlOpen] = useState(false);

  if (dismissed) return null;

  const isMock = authService.isMock;

  return (
    <div className="w-full max-w-md mx-auto mb-8" id="env-config-alert-container">
      <div 
        id="alert-card"
        className={`rounded-2xl p-4 border text-sm shadow-xl transition-all duration-300 bg-zinc-950/80 text-zinc-300 ${
          isMock ? 'border-amber-500/25' : 'border-emerald-500/20'
        }`}
      >
        <div className="flex items-start gap-3 justify-between" id="alert-header">
          <div className="flex items-start gap-3" id="alert-status">
            <div className={`p-2 rounded-xl mt-0.5 border ${
              isMock 
                ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' 
                : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
            }`} id="alert-icon-wrapper">
              {isMock ? (
                <AlertTriangle className="w-4 h-4" id="icon-warning" />
              ) : (
                <ShieldCheck className="w-4 h-4" id="icon-shield" />
              )}
            </div>
            <div id="alert-text-content">
              <p className="font-semibold text-white tracking-tight" id="alert-title">
                {isMock ? 'Modo Simulação Ativo (Offline)' : 'Sincronizado via Supabase'}
              </p>
              <p className="text-xs mt-1.5 text-zinc-400 leading-relaxed" id="alert-desc">
                {isMock ? (
                  <>
                    Sua chave anon do Supabase no <code>.env</code> parece inválida ou do Stripe (como <code>sb_publishable_...</code>). 
                    Para garantir que você possa testar o sistema livremente sem erros de rede, ativamos a <strong>Simulação Local via LocalStorage</strong>. 
                    Seus cadastros, logins e perfis serão salvos localmente na memória do seu navegador!
                  </>
                ) : (
                  'Sua aplicação está integrada com segurança ao banco de dados real do Supabase.'
                )}
              </p>
            </div>
          </div>
          
          <button 
            id="dismiss-button"
            onClick={() => setDismissed(true)} 
            className="text-zinc-600 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Dispensar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Linha de Ações Rápidas */}
        <div className="mt-4 pt-3.5 border-t border-zinc-900 flex flex-wrap gap-2.5 items-center justify-between" id="alert-quick-actions">
          <button
            id="btn-open-sql-guide"
            onClick={() => setIsSqlOpen(true)}
            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              isMock 
                ? 'bg-amber-950/10 hover:bg-amber-900/20 text-amber-300 border-amber-900/20'
                : 'bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-300 border-emerald-900/30'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Script SQL Supabase 📋
          </button>

          <button
            id="btn-toggle-mock-mode"
            onClick={() => {
              authService.isMock = !isMock;
              window.location.reload();
            }}
            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              isMock 
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                : 'bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-zinc-800'
            }`}
          >
            {isMock ? 'Usar Supabase Real 🌐' : 'Ativar Simulação Local ⚡'}
          </button>
        </div>
      </div>

      {/* Modal do Guia SQL */}
      <SqlGuideModal isOpen={isSqlOpen} onClose={() => setIsSqlOpen(false)} />
    </div>
  );
}
