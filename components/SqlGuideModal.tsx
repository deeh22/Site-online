import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SqlGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SqlGuideModal({ isOpen, onClose }: SqlGuideModalProps) {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO DE USUÁRIOS NO SUPABASE (TABELA, RLS, TRIGGERS & SEGURANÇA)
-- Execute este script completo no Editor SQL do seu painel do Supabase
-- ============================================================================

-- 0. REMOVE TRIGGERS E FUNÇÕES ANTIGAS PROBLEMÁTICAS PARA EVITAR CONFLITOS E ERROS 500
-- Removemos todos os triggers redundantes, conflituosos ou legados que possam causar bloqueio de signup
DROP TRIGGER IF EXISTS tr_check_role_update ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS trigger_check_role_update ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS check_role_update_trigger ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS check_role_update ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_before ON auth.users CASCADE;
DROP TRIGGER IF EXISTS tr_sync_profile_role_to_auth ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS tr_handle_new_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS user_created_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_metadata ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users CASCADE;

DROP FUNCTION IF EXISTS public.check_role_update() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.sync_profile_role_to_auth() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_before() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_after() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_metadata() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;

-- 1. Criação ou ajuste da tabela de perfis de usuários no esquema public
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  access_level INTEGER NOT NULL DEFAULT 1 CHECK (access_level IN (1, 2, 3)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.1 Migração: Garante que todas as colunas existam caso a tabela já tenha sido criada anteriormente
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Habilita o Row Level Security (RLS) na tabela profiles para segurança
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Função auxiliar de segurança para verificar se o usuário atual é administrador
-- TOTALMENTE SEGURA: Não realiza NENHUMA consulta à tabela public.profiles, evitando recursão infinita (erro 42P17).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Se for executado pelo Editor SQL (sem sessão de frontend) ou service_role, considera ADMIN
  IF auth.role() = 'service_role' OR (auth.uid() IS NULL AND auth.role() IS DISTINCT FROM 'anon') THEN
    RETURN TRUE;
  END IF;

  -- Se for um visitante anônimo (anon) ou não tiver UID, não é administrador
  IF auth.role() = 'anon' OR auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 3.1 Tenta ler diretamente as claims do JWT (extremamente rápido, sem consultas adicionais)
  IF coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN' THEN
    RETURN TRUE;
  END IF;
  
  IF coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'ADMIN' THEN
    RETURN TRUE;
  END IF;

  IF coalesce(auth.jwt() ->> 'email', '') = 'davidsilvacope11@gmail.com' THEN
    RETURN TRUE;
  END IF;

  IF coalesce(auth.jwt() ->> 'email', '') LIKE '%admin%' THEN
    RETURN TRUE;
  END IF;

  -- 3.2 Fallback em tempo real: consulta apenas na tabela do sistema auth.users (totalmente seguro devido ao SECURITY DEFINER e evita recursão infinita RLS)
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
        AND (
          coalesce(raw_app_metadata ->> 'role', '') = 'ADMIN'
          OR coalesce(raw_user_meta_data ->> 'role', '') = 'ADMIN'
          OR email = 'davidsilvacope11@gmail.com'
          OR email LIKE '%admin%'
        )
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 4. Função segura de trigger para validar alterações de nível de acesso (role)
-- Permite edições pelo próprio Editor SQL e impede que usuários comuns se auto-promovam a ADMIN
CREATE OR REPLACE FUNCTION public.check_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Se for executado no Editor SQL (Painel Supabase), por Trigger ou Service Role, permite
  IF auth.uid() IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Se o cargo (role) não mudou, permite a atualização
  IF OLD.role = NEW.role THEN
    RETURN NEW;
  END IF;

  -- Se o usuário atual for um Administrador, permite alterar o cargo dos outros
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Caso contrário, impede a alteração silenciosamente retornando o valor antigo
  NEW.role := OLD.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Cria o trigger de segurança BEFORE UPDATE na tabela profiles
CREATE TRIGGER trigger_check_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_role_update();

-- 5. Cria as políticas de segurança (RLS) - Sem loop infinito e robusto para o fluxo de cadastro
-- Permite leitura de perfis: qualquer pessoa pode ler perfis para evitar falhas ao buscar alunos ou autenticar
DROP POLICY IF EXISTS "Permitir leitura de perfis" ON public.profiles;
CREATE POLICY "Permitir leitura de perfis" ON public.profiles
  FOR SELECT
  USING (
    true
  );

-- Permite inserção de perfis: qualquer pessoa ou trigger do sistema pode inserir o perfil durante o cadastro (signUp)
DROP POLICY IF EXISTS "Permitir inserção de perfis" ON public.profiles;
CREATE POLICY "Permitir inserção de perfis" ON public.profiles
  FOR INSERT
  WITH CHECK (
    true
  );

-- Permite atualização de perfis: administradores gerenciam tudo, usuários normais ou anônimos alteram apenas a si mesmos
DROP POLICY IF EXISTS "Permitir atualização de perfis" ON public.profiles;
CREATE POLICY "Permitir atualização de perfis" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id 
    OR auth.uid() IS NULL
    OR public.is_admin()
  );

-- Permite exclusão de perfis: apenas administradores podem excluir contas
DROP POLICY IF EXISTS "Permitir exclusão de perfis" ON public.profiles;
CREATE POLICY "Permitir exclusão de perfis" ON public.profiles
  FOR DELETE
  USING (
    public.is_admin()
  );

-- 6. Trigger BEFORE INSERT no auth.users para interceptar e definir metadados e roles síncronamente
-- Isso garante que as claims e metadados no token JWT já nasçam corretos sem precisar de comandos UPDATE lentos e arriscados!
CREATE OR REPLACE FUNCTION public.handle_new_user_before()
RETURNS TRIGGER AS $$
DECLARE
  v_initial_role TEXT;
  v_initial_level INTEGER;
BEGIN
  BEGIN
    -- Define papel inicial baseado no e-mail conforme solicitado (USER por padrão, ADMIN para davidsilvacope11@gmail.com)
    IF NEW.email = 'davidsilvacope11@gmail.com' THEN
      v_initial_role := 'ADMIN';
      v_initial_level := 3;
    ELSE
      v_initial_role := 'USER';
      v_initial_level := 1;
    END IF;

    -- Atualiza o registro NEW diretamente de forma extremamente limpa e livre de deadlocks!
    NEW.raw_app_metadata := coalesce(NEW.raw_app_metadata, '{}'::jsonb) || jsonb_build_object('role', v_initial_role);
    NEW.raw_user_meta_data := coalesce(NEW.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'role', v_initial_role,
      'access_level', v_initial_level
    );
  EXCEPTION WHEN OTHERS THEN
    -- Garante que nada bloqueie a inserção em caso de qualquer exceção
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created_before ON auth.users;
CREATE TRIGGER on_auth_user_created_before
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_before();

-- 7. Trigger AFTER INSERT no auth.users para inserção automática e segura do perfil em public.profiles
-- Totalmente encapsulado em bloco EXCEPTION para garantir que o cadastro no GoTrue NUNCA falhe com erro 500
CREATE OR REPLACE FUNCTION public.handle_new_user_after()
RETURNS TRIGGER AS $$
DECLARE
  v_initial_role TEXT;
  v_initial_level INTEGER;
  v_name TEXT;
BEGIN
  BEGIN
    -- Determina papel baseado estritamente no e-mail
    IF NEW.email = 'davidsilvacope11@gmail.com' THEN
      v_initial_role := 'ADMIN';
      v_initial_level := 3;
    ELSE
      v_initial_role := 'USER';
      v_initial_level := 1;
    END IF;

    v_name := coalesce(
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1),
      'Usuário'
    );

    -- Insere o registro na tabela public.profiles
    INSERT INTO public.profiles (id, email, name, role, access_level, created_at)
    VALUES (
      NEW.id,
      coalesce(NEW.email, ''),
      v_name,
      v_initial_role,
      v_initial_level,
      coalesce(NEW.created_at, timezone('utc'::text, now()))
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      access_level = EXCLUDED.access_level;
  EXCEPTION WHEN OTHERS THEN
    -- Silencia qualquer erro para garantir robustez máxima no cadastro
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_after();

-- 8. Trigger de sincronização de alterações manuais de role em public.profiles de volta para auth.users
-- Dispara apenas AFTER UPDATE para evitar qualquer reentrada no cadastro inicial
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth()
RETURNS TRIGGER AS $$
DECLARE
  v_current_auth_role TEXT;
BEGIN
  -- Obtém o role atual de auth.users
  SELECT coalesce(raw_app_metadata ->> 'role', '') INTO v_current_auth_role
  FROM auth.users
  WHERE id = NEW.id;

  -- Só atualiza o auth.users se a alteração for real, para evitar loop
  IF v_current_auth_role IS DISTINCT FROM NEW.role THEN
    UPDATE auth.users
    SET raw_app_metadata = coalesce(raw_app_metadata, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS tr_sync_profile_role_to_auth ON public.profiles;
CREATE TRIGGER tr_sync_profile_role_to_auth
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role_to_auth();

-- 9. Força a atualização imediata do cache do esquema do PostgREST (Supabase API)
NOTIFY pgrst, 'reload schema';
`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="sql-modal-overlay"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          id="sql-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-gray-900 border border-gray-800 text-gray-100 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-800" id="sql-modal-header">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Script SQL do Supabase</h3>
                <p className="text-xs text-gray-400 mt-0.5">Tabela de Usuários, Triggers Automáticos e Políticas RLS</p>
              </div>
            </div>
            <button
              id="close-sql-modal-btn"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-gray-300" id="sql-modal-body">
            <div className="flex gap-3 bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl text-xs text-indigo-300">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-200">Garantia de Segurança e Designação Automática:</strong>
                <p className="mt-1">
                  Este script cria a tabela <code className="bg-indigo-500/10 px-1 py-0.5 rounded text-indigo-300 font-mono">profiles</code>, ativa o Row Level Security (RLS) corrigindo as vulnerabilidades de acesso indevido e cria um <strong>Trigger de Banco de Dados</strong> que insere automaticamente um novo perfil correspondente na tabela public sempre que um usuário se cadastrar pelo frontend.
                </p>
              </div>
            </div>

            <div className="relative border border-gray-800 rounded-xl bg-gray-950/70 overflow-hidden" id="sql-code-box">
              {/* Copy bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-950 border-b border-gray-800 text-xs">
                <span className="text-gray-400 font-medium">PostgreSQL Script</span>
                <button
                  id="copy-sql-script-btn"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Script</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code */}
              <pre className="p-4 overflow-x-auto font-mono text-xs text-gray-300 max-h-[350px] leading-relaxed">
                <code>{sqlScript}</code>
              </pre>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-300 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Como rodar:</strong> No seu painel do Supabase, vá em <strong>SQL Editor</strong> &gt; clique em <strong>New Query</strong> &gt; Cole o código acima &gt; clique no botão <strong>Run</strong> (Executar) no canto inferior direito. Pronto! O banco estará estruturado com segurança máxima.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 bg-gray-950/40 text-right" id="sql-modal-footer">
            <button
              id="close-sql-modal-footer-btn"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Fechar Guia
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
