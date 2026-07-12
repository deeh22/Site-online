import React, { useState, useEffect } from 'react';
import { Users, UserCheck, BookOpen, GraduationCap, Sparkles, TrendingUp, Compass, Calendar, DollarSign, Ban, FileText, Volume2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { authService } from '../lib/authService';
import { dataService } from '../lib/dataService';

interface AdminDashboardProps {
  onNavigateToSection: (section: string) => void;
}

export default function AdminDashboard({ onNavigateToSection }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubs: 0,
    expiredSubs: 0,
    accumulatedSales: 0,
    totalPDFs: 0,
    totalAudiobooks: 0,
    totalCourses: 0,
    totalAds: 0
  });

  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [engagementStats, setEngagementStats] = useState<any>(null);

  useEffect(() => {
    async function loadDashboardStats() {
      setLoading(true);
      try {
        // 1. Carrega perfis
        const { profiles } = await authService.getAllProfiles();
        const totalU = profiles.length;

        // 2. Carrega compras/vendas
        const purchases = dataService.getPurchases();
        
        // Calcula financeiro acumulado
        const salesSum = purchases.reduce((sum, p) => sum + (p.price || 0), 0);

        // Calcula usuários ativos vs expirados baseados nas assinaturas
        let activeCount = 0;
        let expiredCount = 0;

        profiles.forEach(p => {
          const sub = dataService.getUserSubscription(p.id);
          if (sub) {
            if (sub.isExpired) {
              expiredCount++;
            } else {
              activeCount++;
            }
          }
        });

        // 3. Conteúdos cadastrados
        const pdfsCount = dataService.getPDFs().length;
        const audiobooksCount = dataService.getAudiobooks().length;
        const coursesCount = dataService.getCourses().length;
        const adsCount = dataService.getAds().length;

        setStats({
          totalUsers: totalU,
          activeSubs: activeCount,
          expiredSubs: expiredCount,
          accumulatedSales: salesSum,
          totalPDFs: pdfsCount,
          totalAudiobooks: audiobooksCount,
          totalCourses: coursesCount,
          totalAds: adsCount
        });

        // Pega as últimas 5 compras
        const sortedPurchases = [...purchases]
          .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
          .slice(0, 5);
        setRecentPurchases(sortedPurchases);

        // Carrega relatórios administrativos de engajamento
        const rStats = dataService.getAdminStats();
        setEngagementStats(rStats);

      } catch (err) {
        console.error('Erro ao processar estatísticas do painel:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  // Dados elegantes para o gráfico com base no acumulado real
  const graphData = [
    { name: 'Jan', Vendas: stats.accumulatedSales * 0.1 || 120, Usuários: stats.totalUsers * 0.2 || 10 },
    { name: 'Fev', Vendas: stats.accumulatedSales * 0.25 || 240, Usuários: stats.totalUsers * 0.35 || 25 },
    { name: 'Mar', Vendas: stats.accumulatedSales * 0.4 || 420, Usuários: stats.totalUsers * 0.5 || 48 },
    { name: 'Abr', Vendas: stats.accumulatedSales * 0.6 || 610, Usuários: stats.totalUsers * 0.7 || 82 },
    { name: 'Mai', Vendas: stats.accumulatedSales * 0.8 || 890, Usuários: stats.totalUsers * 0.9 || 110 },
    { name: 'Jun', Vendas: stats.accumulatedSales * 1.0 || stats.accumulatedSales || 1250, Usuários: stats.totalUsers || 150 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12 text-left"
      id="admin-dashboard-wrapper"
    >
      {/* Header do Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-5" id="dashboard-header">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-amber-500 text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Painel Administrativo Avançado</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Estatísticas Gerais do Templo</h2>
          <p className="text-xs text-zinc-500">Acompanhe vendas, alunos ativos, expirações de planos de luz e conteúdos digitais cadastrados.</p>
        </div>

        {/* Data Atual */}
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-2xl text-xs text-zinc-400" id="dashboard-date">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span className="font-mono">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Grid de Cartões de Estatísticas - Bento Grid Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" id="dashboard-stats-grid">
        {/* Total de Alunos */}
        <div 
          onClick={() => onNavigateToSection('usuarios')}
          className="p-5 sm:p-6 bg-zinc-950 hover:bg-zinc-900/50 border border-zinc-900 hover:border-amber-500/20 rounded-3xl transition-all duration-300 cursor-pointer group space-y-4 relative overflow-hidden"
          id="stat-card-total-users"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total de Alunos</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-white block mt-1">
              {loading ? '...' : stats.totalUsers}
            </span>
          </div>
        </div>

        {/* Assinaturas Ativas */}
        <div 
          onClick={() => onNavigateToSection('usuarios')}
          className="p-5 sm:p-6 bg-zinc-950 hover:bg-zinc-900/50 border border-zinc-900 hover:border-amber-500/20 rounded-3xl transition-all duration-300 cursor-pointer group space-y-4 relative overflow-hidden"
          id="stat-card-active-subs"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <UserCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Assinaturas Ativas</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 block mt-1">
              {loading ? '...' : stats.activeSubs}
            </span>
          </div>
        </div>

        {/* Acessos Expirados */}
        <div 
          onClick={() => onNavigateToSection('usuarios')}
          className="p-5 sm:p-6 bg-zinc-950 hover:bg-zinc-900/50 border border-zinc-900 hover:border-amber-500/20 rounded-3xl transition-all duration-300 cursor-pointer group space-y-4 relative overflow-hidden"
          id="stat-card-expired-subs"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Acessos Expirados</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-red-400 block mt-1">
              {loading ? '...' : stats.expiredSubs}
            </span>
          </div>
        </div>

        {/* Financeiro Acumulado */}
        <div 
          onClick={() => onNavigateToSection('configuracoes')}
          className="p-5 sm:p-6 bg-zinc-950 hover:bg-zinc-900/50 border border-zinc-900 hover:border-amber-500/20 rounded-3xl transition-all duration-300 cursor-pointer group space-y-4 relative overflow-hidden"
          id="stat-card-sales"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Vendas Acumuladas</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-amber-500 block mt-1">
              {loading ? '...' : `R$ ${stats.accumulatedSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Intermediário: Gráfico de Crescimento & Estatísticas de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-mid-layout">
        {/* Gráfico Recharts - 8 Colunas */}
        <div className="lg:col-span-8 p-5 sm:p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6" id="dashboard-chart-card">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Sintonia Financeira & Expansão de Vendas</span>
            </h4>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Desempenho cumulativo simulado da egrégora de vendas por períodos</p>
          </div>

          <div className="h-64 w-full text-xs font-mono" id="recharts-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#09090b', 
                    borderColor: 'rgba(245, 158, 11, 0.2)', 
                    borderRadius: '16px',
                    color: '#fff',
                  }} 
                />
                <Area type="monotone" dataKey="Vendas" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição de Conteúdos - 4 Colunas */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5" id="dashboard-distribution-card">
          <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
            <GraduationCap className="w-4.5 h-4.5 text-amber-500" />
            <span>Biblioteca & Escola</span>
          </h4>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans">Quantidade de conteúdos disponíveis no portal de alunos.</p>

          <div className="space-y-4" id="distribution-stats-list">
            {/* PDFs */}
            <div className="p-3.5 bg-zinc-900/40 rounded-2xl border border-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-4.5 h-4.5 text-amber-500" />
                <div className="text-left">
                  <span className="block text-xs font-semibold text-white">E-books PDF</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Leituras de iniciação</span>
                </div>
              </div>
              <span className="font-mono font-bold text-sm text-white">{stats.totalPDFs}</span>
            </div>

            {/* Audiobooks */}
            <div className="p-3.5 bg-zinc-900/40 rounded-2xl border border-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4.5 h-4.5 text-amber-500" />
                <div className="text-left">
                  <span className="block text-xs font-semibold text-white">Audiobooks</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Mantras & meditações</span>
                </div>
              </div>
              <span className="font-mono font-bold text-sm text-white">{stats.totalAudiobooks}</span>
            </div>

            {/* Cursos */}
            <div className="p-3.5 bg-zinc-900/40 rounded-2xl border border-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4.5 h-4.5 text-amber-500" />
                <div className="text-left">
                  <span className="block text-xs font-semibold text-white">Cursos</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Graus e mistérios</span>
                </div>
              </div>
              <span className="font-mono font-bold text-sm text-white">{stats.totalCourses}</span>
            </div>

            {/* Anúncios */}
            <div className="p-3.5 bg-zinc-900/40 rounded-2xl border border-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                <div className="text-left">
                  <span className="block text-xs font-semibold text-white">Ofertas & Avisos</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Anúncios no carrossel</span>
                </div>
              </div>
              <span className="font-mono font-bold text-sm text-white">{stats.totalAds}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico Financeiro Recente */}
      <div className="p-5 sm:p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4" id="dashboard-recent-sales">
        <h4 className="font-serif font-bold text-sm text-white">Últimas Ativações / Vendas de Planos</h4>
        
        {recentPurchases.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs font-sans">Nenhuma compra simulada efetuada ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" id="recent-purchases-table">
              <thead>
                <tr className="border-b border-zinc-900 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  <th className="py-2.5">Aluno</th>
                  <th className="py-2.5">Plano Adquirido</th>
                  <th className="py-2.5">Valor</th>
                  <th className="py-2.5">Data Ativação</th>
                  <th className="py-2.5 text-right">Expiração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                {recentPurchases.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/10">
                    <td className="py-3">
                      <div>
                        <span className="block font-semibold text-white">{p.userName}</span>
                        <span className="block text-[10px] text-zinc-500 font-mono">{p.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 font-medium">{p.planName}</td>
                    <td className="py-3 font-mono font-bold text-amber-500">
                      {p.price === 0 ? 'CORTESIA / MANUAL' : `R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td className="py-3 text-zinc-400 font-sans">{new Date(p.purchaseDate).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 text-right font-mono text-zinc-500">{new Date(p.endDate).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Relatórios de Engajamento & Popularidade */}
      {engagementStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-engagement-reports">
          
          {/* Relatório de PDFs */}
          <div className="p-5 sm:p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4" id="report-pdfs">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-amber-500" />
                <span>Leituras do Acervo (E-books)</span>
              </h4>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans">Livros digitais com maior número de visualizações</p>
            </div>

            <div className="space-y-3">
              {dataService.getPDFs().map(pdf => {
                const count = engagementStats.bookAccess[pdf.id] || 0;
                const dls = engagementStats.downloads[pdf.id] || 0;
                const favs = engagementStats.favoritesCount[pdf.id] || 0;
                return (
                  <div key={pdf.id} className="p-3 bg-zinc-900/30 border border-zinc-900/60 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-0.5 max-w-[70%]">
                      <span className="font-bold text-zinc-200 block truncate">{pdf.title}</span>
                      <span className="text-[9px] text-zinc-500 block truncate">por {pdf.author}</span>
                    </div>
                    <div className="text-right space-y-0.5 shrink-0">
                      <span className="font-mono font-bold text-amber-500 block">{count} views</span>
                      <span className="text-[9px] text-zinc-500 block">{favs} favoritos • {dls} downloads</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relatório de Audiobooks */}
          <div className="p-5 sm:p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4" id="report-audiobooks">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <Volume2 className="w-4.5 h-4.5 text-amber-500" />
                <span>Mantras & Frequências</span>
              </h4>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans">Audiobooks e rituais mais reproduzidos</p>
            </div>

            <div className="space-y-3">
              {dataService.getAudiobooks().map(audio => {
                const count = engagementStats.audiobookPlay[audio.id] || 0;
                const dls = engagementStats.downloads[audio.id] || 0;
                const favs = engagementStats.favoritesCount[audio.id] || 0;
                return (
                  <div key={audio.id} className="p-3 bg-zinc-900/30 border border-zinc-900/60 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-0.5 max-w-[70%]">
                      <span className="font-bold text-zinc-200 block truncate">{audio.title}</span>
                      <span className="text-[9px] text-zinc-500 block truncate">{audio.duration} • {audio.category}</span>
                    </div>
                    <div className="text-right space-y-0.5 shrink-0">
                      <span className="font-mono font-bold text-amber-500 block">{count} plays</span>
                      <span className="text-[9px] text-zinc-500 block">{favs} salvos • {dls} downloads</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relatório de Cursos */}
          <div className="p-5 sm:p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4" id="report-courses">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-amber-500" />
                <span>Cursos & Trilhas</span>
              </h4>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans">Acessos e satisfação dos alunos por curso</p>
            </div>

            <div className="space-y-3">
              {dataService.getCourses().map(course => {
                const count = engagementStats.courseView[course.id] || 0;
                const favs = engagementStats.favoritesCount[course.id] || 0;
                const avgRating = engagementStats.ratingsAvg[course.id] ? engagementStats.ratingsAvg[course.id].toFixed(1) : 'Sem avaliações';
                const ratCount = engagementStats.ratingsCount[course.id] || 0;
                return (
                  <div key={course.id} className="p-3 bg-zinc-900/30 border border-zinc-900/60 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-0.5 max-w-[70%]">
                      <span className="font-bold text-zinc-200 block truncate">{course.title}</span>
                      <span className="text-[9px] text-zinc-500 block truncate">Mestre: {course.instructor || 'Conselho'}</span>
                    </div>
                    <div className="text-right space-y-0.5 shrink-0">
                      <span className="font-mono font-bold text-amber-500 block">{count} acessos</span>
                      <span className="text-[9px] text-amber-500 block font-semibold">★ {avgRating} ({ratCount})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}
