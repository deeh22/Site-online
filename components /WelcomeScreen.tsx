import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { 
  Compass, BookOpen, Volume2, GraduationCap, User as UserIcon, 
  LayoutDashboard, Users, FolderOpen, Settings, LogOut, Sparkles, 
  AlertCircle, Award, Eye, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService, AppConfig } from '../lib/dataService';

// Importando componentes modulares premium
import UserDashboard from './UserDashboard';
import UserLibrary from './UserLibrary';
import UserAudios from './UserAudios';
import UserCourses from './UserCourses';
import UserProfile from './UserProfile';
import UserRequests from './UserRequests';
import UserCredits from './UserCredits';
import UserFavoritesTab from './UserFavoritesTab';
import UserSearchTab from './UserSearchTab';
import UserDownloadsTab from './UserDownloadsTab';

import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminContents from './AdminContents';
import AdminSettings from './AdminSettings';

interface WelcomeScreenProps {
  user: User;
  onSignOut: () => Promise<void>;
  loading: boolean;
  onUpdateUserSession?: (updatedUser: User) => void;
}

export default function WelcomeScreen({ user, onSignOut, loading, onUpdateUserSession }: WelcomeScreenProps) {
  const [activeUser, setActiveUser] = useState<User>(user);
  const [isAdminViewMode, setIsAdminViewMode] = useState(user.role === 'ADMIN');
  const [studentTab, setStudentTab] = useState('inicio');
  const [adminTab, setAdminTab] = useState('dashboard');
  
  // Estado para Carregar Configuração do App
  const [config, setConfig] = useState<AppConfig>(() => dataService.getAppConfig());

  // Recarrega configurações sempre que o componente focar ou quando as abas alterarem
  useEffect(() => {
    setConfig(dataService.getAppConfig());
  }, [isAdminViewMode, studentTab, adminTab]);

  useEffect(() => {
    setActiveUser(user);
  }, [user]);

  const handleUpdateSession = (updatedUser: User) => {
    setActiveUser(updatedUser);
    if (onUpdateUserSession) {
      onUpdateUserSession(updatedUser);
    }
  };

  // Renderizador do Ícone Dinâmico do Logo
  const renderLogoIcon = () => {
    const IconComponent = (Icons as any)[config.logoIcon];
    if (IconComponent) {
      return <IconComponent className="w-4 h-4 stroke-[1.5]" />;
    }
    return <Compass className="w-4 h-4 stroke-[1.5]" />;
  };

  // Renderiza a aba ativa do Aluno
  const renderStudentContent = () => {
    switch (studentTab) {
      case 'inicio':
        return <UserDashboard user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} />;
      case 'biblioteca':
        return config.screenToggles.pdfs ? <UserLibrary user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} /> : <UserDashboard user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} />;
      case 'audios':
        return config.screenToggles.audiobooks ? <UserAudios user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} /> : <UserDashboard user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} />;
      case 'cursos':
        return config.screenToggles.courses ? <UserCourses user={activeUser} /> : <UserDashboard user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} />;
      case 'pedidos':
        return <UserRequests user={activeUser} />;
      case 'creditos':
        return <UserCredits />;
      case 'favoritos':
        return <UserFavoritesTab user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} />;
      case 'pesquisa':
        return <UserSearchTab user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} />;
      case 'downloads':
        return <UserDownloadsTab user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} />;
      case 'perfil':
        return (
          <UserProfile 
            user={activeUser} 
            onSignOut={onSignOut} 
            onUpdateUserSession={handleUpdateSession} 
          />
        );
      default:
        return <UserDashboard user={activeUser} onNavigateToTab={(tab) => setStudentTab(tab)} />;
    }
  };

  // Renderiza a aba ativa do Administrador
  const renderAdminContent = () => {
    switch (adminTab) {
      case 'dashboard':
        return <AdminDashboard onNavigateToSection={(section) => setAdminTab(section)} />;
      case 'usuarios':
        return <AdminUsers currentUser={activeUser} />;
      case 'conteudos':
        return <AdminContents />;
      case 'configuracoes':
        return <AdminSettings />;
      default:
        return <AdminDashboard onNavigateToSection={(section) => setAdminTab(section)} />;
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[70vh] relative" id="portal-screen-wrapper">
      
      {/* Header Superior do Portal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-2xl mb-6 shadow-md" id="portal-top-bar">
        
        {/* Identidade Logo Dinâmico do Aplicativo */}
        <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black border border-amber-500/20 flex items-center justify-center text-amber-500">
              {renderLogoIcon()}
            </div>
            <span className="font-serif font-bold text-xs text-white tracking-widest uppercase">{config.logoText || "Despertar"}</span>
          </div>

          {/* Alternador Administrativo de Visualização (Exclusivo para ADMIN) - Mobile layout */}
          {user.role === 'ADMIN' && (
            <button
              id="btn-toggle-admin-student-view-mobile"
              onClick={() => {
                setIsAdminViewMode(!isAdminViewMode);
                setStudentTab('inicio');
                setAdminTab('dashboard');
              }}
              className="sm:hidden px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-[9px] font-bold uppercase tracking-wider text-amber-500 rounded-lg flex items-center gap-1"
            >
              <Eye className="w-3 h-3 text-amber-500" />
              <span>{isAdminViewMode ? 'Aluno' : 'Admin'}</span>
            </button>
          )}
        </div>

        {/* Quick Tabs para Alunos */}
        {!isAdminViewMode && (
          <div className="flex items-center justify-center gap-1 bg-zinc-900/40 border border-zinc-900 p-1 rounded-xl mx-auto sm:mx-0" id="top-quick-nav">
            <button
              onClick={() => setStudentTab('pesquisa')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                studentTab === 'pesquisa' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title="Pesquisa Global"
            >
              <Icons.Search className="w-3.5 h-3.5" />
              <span>Busca</span>
            </button>
            <button
              onClick={() => setStudentTab('favoritos')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                studentTab === 'favoritos' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title="Meus Favoritos"
            >
              <Icons.Heart className={`w-3.5 h-3.5 ${studentTab === 'favoritos' ? 'fill-black text-black' : 'text-zinc-400'}`} />
              <span>Favoritos</span>
            </button>
            <button
              onClick={() => setStudentTab('downloads')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                studentTab === 'downloads' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title="Downloads Offline"
            >
              <Icons.Download className="w-3.5 h-3.5" />
              <span>Downloads</span>
            </button>
          </div>
        )}

        {/* Alternador Administrativo de Visualização (Exclusivo para ADMIN) - Desktop layout */}
        {user.role === 'ADMIN' && (
          <div className="hidden sm:flex items-center gap-2" id="admin-view-toggle">
            <button
              id="btn-toggle-admin-student-view"
              onClick={() => {
                setIsAdminViewMode(!isAdminViewMode);
                setStudentTab('inicio');
                setAdminTab('dashboard');
              }}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-855 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-98"
            >
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAdminViewMode ? 'Ver como Aluno' : 'Voltar ao Admin'}</span>
            </button>
          </div>
        )}

        {/* Boas Vindas Resumida */}
        <div className="hidden sm:flex items-center gap-2" id="top-user-indicator">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Olá, {activeUser.name.split(' ')[0]}</span>
          <div className="w-6 h-6 rounded-full bg-zinc-900 border border-amber-500/30 flex items-center justify-center text-[10px] font-serif font-bold text-amber-400">
            {activeUser.name[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Painel */}
      <div className="flex-1 min-h-[50vh]" id="portal-panel-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={isAdminViewMode ? `admin-${adminTab}` : `student-${studentTab}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            {isAdminViewMode ? renderAdminContent() : renderStudentContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Barra de Navegação Inferior para o Aluno (Respeita Toggles de Tela do Admin) */}
      {!isAdminViewMode && (
        <div 
          id="student-bottom-navigation"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-black/85 border border-amber-500/15 p-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl z-40 flex justify-around items-center"
        >
          {/* Aba Inicio */}
          <button
            id="nav-btn-inicio"
            onClick={() => setStudentTab('inicio')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${studentTab === 'inicio' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Compass className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Início</span>
          </button>

          {/* Aba Biblioteca (Check Toggled) */}
          {config.screenToggles.pdfs && (
            <button
              id="nav-btn-biblioteca"
              onClick={() => setStudentTab('biblioteca')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${studentTab === 'biblioteca' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <BookOpen className="w-5 h-5 stroke-[1.5]" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Biblioteca</span>
            </button>
          )}

          {/* Aba Áudios (Check Toggled) */}
          {config.screenToggles.audiobooks && (
            <button
              id="nav-btn-audios"
              onClick={() => setStudentTab('audios')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${studentTab === 'audios' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Volume2 className="w-5 h-5 stroke-[1.5]" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Áudios</span>
            </button>
          )}

          {/* Aba Cursos (Check Toggled) */}
          {config.screenToggles.courses && (
            <button
              id="nav-btn-cursos"
              onClick={() => setStudentTab('cursos')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${studentTab === 'cursos' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <GraduationCap className="w-5 h-5 stroke-[1.5]" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Cursos</span>
            </button>
          )}

           {/* Aba Pedidos */}
          <button
            id="nav-btn-pedidos"
            onClick={() => setStudentTab('pedidos')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${studentTab === 'pedidos' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Icons.MessageSquare className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Pedidos</span>
          </button>

          {/* Aba Créditos */}
          <button
            id="nav-btn-creditos"
            onClick={() => setStudentTab('creditos')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${studentTab === 'creditos' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Sparkles className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Créditos</span>
          </button>

          {/* Aba Perfil */}
          <button
            id="nav-btn-perfil"
            onClick={() => setStudentTab('perfil')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${studentTab === 'perfil' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <UserIcon className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Perfil</span>
          </button>
        </div>
      )}

      {/* Barra de Navegação Inferior Exclusiva para o Administrador */}
      {isAdminViewMode && (
        <div 
          id="admin-bottom-navigation"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-zinc-950/90 border border-amber-500/15 p-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl z-40 flex justify-around items-center"
        >
          {/* Dashboard */}
          <button
            id="admin-nav-btn-dashboard"
            onClick={() => setAdminTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${adminTab === 'dashboard' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutDashboard className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Dashboard</span>
          </button>

          {/* Usuários */}
          <button
            id="admin-nav-btn-usuarios"
            onClick={() => setAdminTab('usuarios')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${adminTab === 'usuarios' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Users className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Usuários</span>
          </button>

          {/* Conteúdos */}
          <button
            id="admin-nav-btn-conteudos"
            onClick={() => setAdminTab('conteudos')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${adminTab === 'conteudos' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <FolderOpen className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Acervo</span>
          </button>

          {/* Configurações */}
          <button
            id="admin-nav-btn-configuracoes"
            onClick={() => setAdminTab('configuracoes')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${adminTab === 'configuracoes' ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Settings className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Ajustes</span>
          </button>

          {/* Sair */}
          <button
            id="admin-nav-btn-sair"
            onClick={onSignOut}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-zinc-600 hover:text-red-400 transition-all cursor-pointer"
            title="Encerrar conexão"
          >
            <LogOut className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Sair</span>
          </button>
        </div>
      )}

      {/* Espaçamento compensatório para as barras de navegacao flutuantes inferiores */}
      <div className="h-24 pointer-events-none" />
    </div>
  );
}
