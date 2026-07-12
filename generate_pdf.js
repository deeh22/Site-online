import fs from 'fs';
import PDFDocument from 'pdfkit';

function createPromptPDF() {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    bufferPages: true
  });

  const writeStream = fs.createWriteStream('prompts_despertar_espiritualidade.pdf');
  doc.pipe(writeStream);

  // Colors
  const colors = {
    primary: '#09090b',     // Zinc 950
    secondary: '#27272a',   // Zinc 800
    accent: '#d4d4d8',      // Zinc 300
    text: '#3f3f46',        // Zinc 600
    title: '#18181b',       // Zinc 900
    lightBg: '#fafafa',     // Zinc 50
    border: '#e4e4e7',      // Zinc 200
    spiritual: '#4f46e5'    // Indigo 600
  };

  // Header - Cover Accent
  doc.rect(0, 0, doc.page.width, 15).fill(colors.spiritual);

  // Title Section
  doc.moveDown(2);
  doc.fillColor(colors.spiritual)
     .fontSize(10)
     .font('Helvetica-Bold')
     .text('PORTAL EVOLUÇÃO CONSCIENTE', { tracking: 2 });
  
  doc.moveDown(0.3);
  doc.fillColor(colors.title)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('Histórico de Prompts do Projeto');

  doc.moveDown(0.2);
  doc.fillColor(colors.text)
     .fontSize(10)
     .font('Helvetica')
     .text('Despertar Espiritualidade - Linha do Tempo de Desenvolvimento');

  // Horizontal divider
  doc.moveDown(1);
  doc.moveTo(50, doc.y)
     .lineTo(doc.page.width - 50, doc.y)
     .strokeColor(colors.border)
     .lineWidth(1)
     .stroke();

  doc.moveDown(1.5);

  const sections = [
    {
      title: 'Fase 1: Concepção e Estrutura Visual',
      prompts: [
        'Crie uma aplicação web moderna chamada "Despertar Espiritualidade" (ou "Evolução Consciente") com foco em espiritualidade, autoconhecimento e meditação.',
        'Desenvolva uma tela de introdução (IntroScreen) com transições suaves usando a biblioteca "motion/react" para recepcionar o usuário com opções elegantes de login e cadastro.',
        'Configure a estilização geral usando Tailwind CSS com uma paleta de cores escura e minimalista (tons de preto e cinza zinco) para transmitir paz, serenidade e uma atmosfera sagrada.'
      ]
    },
    {
      title: 'Fase 2: Autenticação e Integração com Banco de Dados',
      prompts: [
        'Implemente um sistema de autenticação completo integrado ao Supabase para cadastro de contas (RegisterScreen) e login (LoginScreen) dos usuários.',
        'Crie um serviço de autenticação ("authService.ts") que faça a ponte com o Supabase e, caso as chaves não estejam configuradas, utilize um modo de simulação (mock) elegante para que a aplicação continue funcional no ambiente de testes.',
        'Adicione um banner de aviso amigável ("EnvConfigAlert") no topo para alertar o usuário se as credenciais do Supabase estão ativas ou se o sistema está rodando em modo simulação.'
      ]
    },
    {
      title: 'Fase 3: Painel do Usuário (User Dashboard)',
      prompts: [
        'Desenvolva o painel principal do usuário ("UserDashboard") com um menu lateral ou abas contendo seções para Biblioteca de Áudios, Cursos, Downloads, Favoritos, Histórico de Créditos e Perfil.',
        'Crie a aba de Áudios ("UserAudios") com um player de áudio completo que mostre o progresso, tempo decorrido, controle de volume, botões de reproduzir/pausar e a opção de favoritar frequências sonoras/meditações.',
        'Crie a aba de Cursos ("UserCourses") onde o usuário possa ver os módulos disponíveis, assistir a aulas ou ler eBooks e guias sobre autoconhecimento.',
        'Adicione um sistema de créditos ("UserCredits") onde o usuário possa acompanhar seu saldo e adquirir novos conteúdos premium dentro da plataforma.'
      ]
    },
    {
      title: 'Fase 4: Painel de Administração (Admin Dashboard)',
      prompts: [
        'Implemente um painel administrativo ("AdminDashboard") robusto e seguro que só seja acessível por usuários com perfil de administrador.',
        'Adicione funcionalidades de gerenciamento no painel admin, como cadastro de novos conteúdos (áudios, cursos, textos), visualização e controle de usuários cadastrados e configurações gerais do sistema.',
        'Crie guias explicativos em modais elegantes ("GoogleGuideModal" e "SqlGuideModal") para orientar o administrador sobre como configurar as integrações de nuvem e gerenciar as tabelas do banco de dados SQL.'
      ]
    },
    {
      title: 'Fase 5: Estabilidade, Compilação e Entrega',
      prompts: [
        'Corrige o erro "Failed to initialize applet" ao iniciar a aplicação.',
        'Investigue a falha na compilação onde os artefatos de build aparecem vazios e garanta que o build de produção ("npm run build") gere corretamente a pasta "/dist" contendo todos os assets da SPA.',
        'Separa todos os prompts que eu usei e me manda por favor em um arquivo PDF estruturado.'
      ]
    }
  ];

  sections.forEach((section, sIndex) => {
    // Check space before writing section header
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
      doc.rect(0, 0, doc.page.width, 15).fill(colors.spiritual);
      doc.moveDown(2);
    }

    doc.fillColor(colors.spiritual)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(section.title);

    doc.moveDown(0.5);

    section.prompts.forEach((prompt, pIndex) => {
      const promptText = `"${prompt}"`;
      
      // Calculate text height to prevent orphaned prompts
      const textHeight = doc.heightOfString(promptText, { width: doc.page.width - 130, fontSize: 10 });
      if (doc.y + textHeight > doc.page.height - 70) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 15).fill(colors.spiritual);
        doc.moveDown(2);
      }

      const currentY = doc.y;

      // Bullet/Number column
      doc.fillColor(colors.spiritual)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text(`${sIndex + 1}.${pIndex + 1}`, 50, currentY, { width: 25, align: 'right' });

      // Prompt content column
      doc.fillColor(colors.title)
         .fontSize(10)
         .font('Helvetica-Oblique')
         .text(promptText, 85, currentY, {
           width: doc.page.width - 135,
           lineGap: 3,
           align: 'justify'
         });

      doc.moveDown(1.2);
    });

    doc.moveDown(1.5);
  });

  // Footer page numbering and stamp
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    doc.fillColor(colors.text)
       .fontSize(8)
       .font('Helvetica')
       .text(
         `Despertar Espiritualidade | Relatório de Desenvolvimento`,
         50,
         doc.page.height - 40,
         { width: doc.page.width - 100, align: 'left' }
       );

    doc.text(
      `Página ${i + 1} de ${range.count}`,
      50,
      doc.page.height - 40,
      { width: doc.page.width - 100, align: 'right' }
    );
  }

  doc.end();
  console.log('PDF gerado com sucesso!');
}

createPromptPDF();
