import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Chrome, Settings, KeyRound, Database, RefreshCw, AlertTriangle } from 'lucide-react';

interface GoogleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleGuideModal({ isOpen, onClose }: GoogleGuideModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="google-guide-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-300"
          id="google-guide-modal"
        >
          {/* Close button */}
          <button
            id="google-guide-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6" id="google-guide-header">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500" id="google-guide-icon-box">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide" id="google-guide-title">
                Como Ativar o Login Google no Supabase
              </h2>
              <p className="text-xs text-zinc-500 mt-1" id="google-guide-subtitle">
                O provedor do Google não está habilitado no console do seu Supabase. Siga os passos para resolver.
              </p>
            </div>
          </div>

          {/* Step-by-step Guide */}
          <div className="space-y-6" id="google-guide-steps-container">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2">
              Passo a Passo para Conexão Real (Supabase)
            </h3>

            {/* Step 1 */}
            <div className="flex gap-4" id="google-step-1">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="w-[1px] flex-1 bg-zinc-900 my-1"></div>
              </div>
              <div className="pb-4" id="google-step-1-content">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Chrome className="w-4 h-4 text-blue-400" /> Ativar Provedor no Supabase
                </h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Acesse seu painel do <strong>Supabase</strong> (supabase.com), entre no seu projeto, clique no ícone de chave (<strong>Authentication</strong>) no menu lateral esquerdo, vá em <strong>Settings &gt; Providers</strong> e expanda a aba do <strong>Google</strong>. Ative o botão para "Enable Google provider".
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4" id="google-step-2">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="w-[1px] flex-1 bg-zinc-900 my-1"></div>
              </div>
              <div className="pb-4" id="google-step-2-content">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-zinc-400" /> Obter Callback URL
                </h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Na mesma aba do Google no Supabase, copie o endereço de redirecionamento (<strong>Redirect URI</strong>). Ele se parece com isso: <br />
                  <code className="block bg-black/40 p-2 rounded-lg text-[10px] font-mono mt-1 text-zinc-500 border border-zinc-900 select-all truncate">
                    https://[seu-projeto].supabase.co/auth/v1/callback
                  </code>
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4" id="google-step-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="w-[1px] flex-1 bg-zinc-900 my-1"></div>
              </div>
              <div className="pb-4" id="google-step-3-content">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-500" /> Criar Credenciais na Google Cloud
                </h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Acesse o <strong>Google Cloud Console</strong> (console.cloud.google.com), crie um projeto, configure a "Tela de permissão OAuth" (OAuth Consent Screen) e crie uma credencial do tipo <strong>ID do cliente OAuth 2.0 (Aplicativo Web)</strong>. <br />
                  Cole a <strong>Redirect URI</strong> obtida do Supabase no campo <strong>"URIs de redirecionamento autorizados"</strong>.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4" id="google-step-4">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 flex items-center justify-center shrink-0">
                  4
                </div>
              </div>
              <div id="google-step-4-content">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-emerald-400" /> Preencher no Supabase
                </h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Copie o <strong>Client ID</strong> e o <strong>Client Secret</strong> gerados pelo Google Cloud Console, cole-os nos respectivos campos na página de provedores do Supabase e clique em <strong>Save (Salvar)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-8 pt-5 border-t border-zinc-900 flex justify-end" id="google-guide-footer">
            <button
              id="google-guide-btn-entendi"
              onClick={onClose}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold tracking-wider transition-colors cursor-pointer border border-zinc-800"
            >
              Entendi, obrigado!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
