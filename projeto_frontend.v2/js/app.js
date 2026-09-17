// Base de dados inicial das missões
const estado = {
  tarefas: [
    { 
      id: 1, 
      titulo: "Modelagem de Banco de Dados Relacional", 
      projeto: "Campanha do Cálice de Dados", 
      responsavel: "Mago Alatar", 
      status: "a-fazer", 
      prioridade: "alta", 
      prazo: "2026-08-20", 
      descricao: "Criar a estrutura do diagrama entidade-relacionamento da guilda." 
    },
    { 
      id: 2, 
      titulo: "Elaboração dos Diagramas UML", 
      projeto: "A Visão Estrutural", 
      responsavel: "Arquiteta Elara", 
      status: "a-fazer", 
      prioridade: "media", 
      prazo: "2026-08-22", 
      descricao: "Mapear casos de uso e diagramas de classe." 
    },
    { 
      id: 3, 
      titulo: "Desenvolvimento do HTML Semântico", 
      projeto: "A Fundação da Teia", 
      responsavel: "Kael, o Construtor", 
      status: "em-andamento", 
      prioridade: "alta", 
      prazo: "2026-08-11", 
      descricao: "Estruturar a página principal com boas práticas de acessibilidade." 
    },
    { 
      id: 4, 
      titulo: "Pesquisa de Requisitos de Acessibilidade", 
      projeto: "Inclusão Universal", 
      responsavel: "Clériga Lumis", 
      status: "em-andamento", 
      prioridade: "baixa", 
      prazo: "2026-08-14", 
      descricao: "Analisar contraste de cores e navegabilidade por teclado." 
    },
    { 
      id: 5, 
      titulo: "Revisão de Validação do HTML W3C", 
      projeto: "O Julgamento dos Sábios W3C", 
      responsavel: "Inquisidor Thales", 
      status: "em-revisao", 
      prioridade: "alta", 
      prazo: "2026-08-12", 
      descricao: "Validar marcação semântica nos padrões oficiais." 
    },
    { 
      id: 6, 
      titulo: "Documentação dos Casos de Uso", 
      projeto: "As Crônicas de Interação", 
      responsavel: "Bardo Jaskier", 
      status: "em-revisao", 
      prioridade: "media", 
      prazo: "2026-08-13", 
      descricao: "Escrever os fluxos principal e alternativo do sistema." 
    },
    { 
      id: 7, 
      titulo: "Configuração Inicial do Repositório", 
      projeto: "O Controle do Tempo", 
      responsavel: "Chrono, o Guardião", 
      status: "concluida", 
      prioridade: "media", 
      prazo: "2026-08-05", 
      descricao: "Inicialização do repositório Git com README bem detalhado." 
    },
    { 
      id: 8, 
      titulo: "Definição do Tema do Projeto", 
      projeto: "A Grande Escolha", 
      responsavel: "Conselho da Guilda", 
      status: "concluida", 
      prioridade: "baixa", 
      prazo: "2026-08-01", 
      descricao: "Aprovação unânime do tema RPG para o gerenciador de tarefas." 
    }
  ],
  filtros: {
    busca: '',
    status: 'todos',
    prioridade: 'todas',
    ordenacao: 'padrao'
  }
};

// Mapeamento dos elementos DOM
function obterListasDOM() {
  return {
    'a-fazer': document.getElementById('lista-a-fazer'),
    'em-andamento': document.getElementById('lista-em-andamento'),
    'em-revisao': document.getElementById('lista-em-revisao'),
    'concluida': document.getElementById('lista-concluida')
  };
}

// Inicialização segura após carregamento da página
document.addEventListener('DOMContentLoaded', () => {
  configurarEventos();
  renderizarBoard();
});

function renderizarBoard() {
  const listas = obterListasDOM();

  // Limpa o conteúdo das listas
  Object.values(listas).forEach(lista => {
    if (lista) lista.innerHTML = '';
  });

  // Filtra as missões
  const tarefasFiltradas = estado.tarefas.filter(tarefa => {
    const buscaMatch = tarefa.titulo.toLowerCase().includes(estado.filtros.busca.toLowerCase());
    const statusMatch = estado.filtros.status === 'todos' || tarefa.status === estado.filtros.status;
    const prioMatch = estado.filtros.prioridade === 'todas' || tarefa.prioridade === estado.filtros.prioridade;
    return buscaMatch && statusMatch && prioMatch;
  });

  // Ordena se necessário
  if (estado.filtros.ordenacao === 'prazo-asc') {
    tarefasFiltradas.sort((a, b) => new Date(a.prazo) - new Date(b.prazo));
  } else if (estado.filtros.ordenacao === 'prazo-desc') {
    tarefasFiltradas.sort((a, b) => new Date(b.prazo) - new Date(a.prazo));
  }

  // Renderiza cartões
  tarefasFiltradas.forEach(tarefa => {
    const card = criarCartaoTarefa(tarefa);
    if (listas[tarefa.status]) {
      listas[tarefa.status].appendChild(card);
    }
  });

  atualizarProgressoEDashboards();
}

function criarCartaoTarefa(tarefa) {
  const li = document.createElement('li');
  li.className = 'task-card';

  const prioridadeLabels = { baixa: '🥉 Bronze', media: '🥈 Prata', alta: '🥇 Ouro' };
  const dataFormatada = new Date(tarefa.prazo).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  li.innerHTML = `
    <h3 class="task-title">${tarefa.titulo}</h3>
    <p class="project-info"><strong>Campanha:</strong> ${tarefa.projeto}</p>
    <p class="assignee-info"><strong>Aventureiro(a):</strong> ${tarefa.responsavel}</p>
    <div class="card-footer">
      <span class="priority priority-${tarefa.prioridade}">${prioridadeLabels[tarefa.prioridade]}</span>
      <span class="due-date">${dataFormatada}</span>
    </div>
    <button type="button" class="btn-detalhes" data-id="${tarefa.id}">Ver Missão</button>
  `;

  // Adiciona evento ao botão do cartão
  const btn = li.querySelector('.btn-detalhes');
  btn.addEventListener('click', () => abrirDetalhes(tarefa.id));

  return li;
}

function atualizarProgressoEDashboards() {
  const total = estado.tarefas.length;
  const concluidas = estado.tarefas.filter(t => t.status === 'concluida').length;
  const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  // 1. Atualizar progresso circular
  const progressoCircular = document.getElementById('progresso-circular');
  const nivelEl = document.getElementById('nivel-guilda');
  const textoEl = document.getElementById('progresso-texto');

  if (progressoCircular) {
    progressoCircular.style.setProperty('--progresso', percentual);
    progressoCircular.setAttribute('aria-valuenow', percentual);
  }

  let emojiNivel = '🌱';
  if (percentual >= 25) emojiNivel = '⚔️';
  if (percentual >= 75) emojiNivel = '🧙‍♂️';
  if (percentual === 100) emojiNivel = '👑';

  if (nivelEl) nivelEl.textContent = emojiNivel;
  if (textoEl) textoEl.textContent = `${concluidas}/${total}`;

  // 2. Contagens por fase
  const countMural = estado.tarefas.filter(t => t.status === 'a-fazer').length;
  const countCurso = estado.tarefas.filter(t => t.status === 'em-andamento').length;
  const countVerificacao = estado.tarefas.filter(t => t.status === 'em-revisao').length;

  // Atualizar caixas do topo
  document.getElementById('count-mural').textContent = countMural;
  document.getElementById('count-curso').textContent = countCurso;
  document.getElementById('count-verificacao').textContent = countVerificacao;
  document.getElementById('count-conquista').textContent = concluidas;

  // Atualizar cabeçalhos das colunas
  document.getElementById('header-count-mural').textContent = countMural;
  document.getElementById('header-count-curso').textContent = countCurso;
  document.getElementById('header-count-verificacao').textContent = countVerificacao;
  document.getElementById('header-count-conquista').textContent = concluidas;
}

function configurarEventos() {
  // Alternância entre Modo Guerra (Escuro) e Modo Paz (Claro)
  const btnTema = document.getElementById('btn-modo-tema');
  if (btnTema) {
    btnTema.addEventListener('click', () => {
      const modoGuerraAtivo = document.body.classList.toggle('modo-guerra');
      btnTema.textContent = modoGuerraAtivo ? '🕊️ Modo Paz' : '⚔️ Modo Guerra';
    });
  }

  // Campo de busca
  const buscaInput = document.getElementById('busca-titulo');
  if (buscaInput) {
    buscaInput.addEventListener('input', (e) => {
      estado.filtros.busca = e.target.value;
      renderizarBoard();
    });
  }

  // Radios de status
  document.querySelectorAll('input[name="filtro-status"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      estado.filtros.status = e.target.value;
      renderizarBoard();
    });
  });

  // Radios de prioridade
  document.querySelectorAll('input[name="filtro-prioridade"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      estado.filtros.prioridade = e.target.value;
      renderizarBoard();
    });
  });

  // Select de ordenação
  const selectOrdenacao = document.getElementById('ordenacao-prazo');
  if (selectOrdenacao) {
    selectOrdenacao.addEventListener('change', (e) => {
      estado.filtros.ordenacao = e.target.value;
      renderizarBoard();
    });
  }

  // Botão limpar filtros
  const btnLimpar = document.getElementById('limpar-filtros');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      document.getElementById('form-filtros').reset();
      estado.filtros = { busca: '', status: 'todos', prioridade: 'todas', ordenacao: 'padrao' };
      renderizarBoard();
    });
  }

  // Dialog
  const btnFecharDialog = document.getElementById('fechar-dialogo');
  if (btnFecharDialog) {
    btnFecharDialog.addEventListener('click', () => {
      document.getElementById('dialogo-tarefa').close();
    });
  }
}

function abrirDetalhes(id) {
  const tarefa = estado.tarefas.find(t => t.id === id);
  if (!tarefa) return;

  const prioridadeLabels = { baixa: 'Bronze', media: 'Prata', alta: 'Ouro' };
  const statusLabels = { 
    'a-fazer': 'Mural', 
    'em-andamento': 'Em Curso', 
    'em-revisao': 'Verificação', 
    'concluida': 'Conquista' 
  };
  const dataFormatada = new Date(tarefa.prazo).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  document.getElementById('dialogo-titulo').textContent = tarefa.titulo;
  document.getElementById('detalhe-projeto').textContent = tarefa.projeto;
  document.getElementById('detalhe-responsavel').textContent = tarefa.responsavel;
  document.getElementById('detalhe-status').textContent = statusLabels[tarefa.status];
  document.getElementById('detalhe-prioridade').textContent = prioridadeLabels[tarefa.prioridade];
  document.getElementById('detalhe-prazo').textContent = dataFormatada;
  document.getElementById('detalhe-descricao').textContent = tarefa.descricao;

  document.getElementById('dialogo-tarefa').showModal();
}