import { carregarTarefas } from './api.js';
import { renderizarEstado } from './estados.js';

/* =========================================================
   1. ESTADO ÚNICO DA APLICAÇÃO (fonte da verdade)
   A tela é sempre uma projeção deste objeto.
   ========================================================= */
const VALORES_INICIAIS = {
  busca: '',
  status: 'todos',
  prioridade: 'todas',
  ordenacao: 'padrao'
};

const estado = {
  tarefas: [],        // array original vindo de carregarTarefas(), nunca alterado
  busca: '',
  status: 'todos',
  prioridade: 'todas',
  ordenacao: 'padrao',
  carregando: false,
  erro: null
};

let primeiraCargaConcluida = false;

const ROTULOS_FASE = {
  'a-fazer': 'Fila de Construção',
  'em-andamento': 'Em Batalha',
  'em-revisao': 'Sala do Conselho',
  'concluida': 'Troféus'
};

const ROTULOS_CUSTO = {
  baixa: '🟡 Ouro',
  media: '💜 Elixir',
  alta: '⬛ Elixir Negro'
};

/* =========================================================
   2. DERIVAÇÃO
   Recebe o estado e devolve a lista visível.
   Não consulta o DOM. Não altera o estado nem estado.tarefas.
   ========================================================= */
export function derivarTarefasVisiveis(estadoAtual) {
  const termo = estadoAtual.busca.trim().toLowerCase();

  const filtradas = estadoAtual.tarefas.filter((tarefa) => {
    const casaBusca =
      termo === '' || String(tarefa.titulo).toLowerCase().includes(termo);
    const casaStatus =
      estadoAtual.status === 'todos' || tarefa.status === estadoAtual.status;
    const casaPrioridade =
      estadoAtual.prioridade === 'todas' ||
      tarefa.prioridade === estadoAtual.prioridade;
    return casaBusca && casaStatus && casaPrioridade;
  });

  // Cópia explícita antes de ordenar: sort() altera o array em que opera,
  // por isso nunca é chamado diretamente sobre estado.tarefas.
  if (estadoAtual.ordenacao === 'prazo-asc') {
    return [...filtradas].sort((a, b) => String(a.prazo).localeCompare(String(b.prazo)));
  }
  if (estadoAtual.ordenacao === 'prazo-desc') {
    return [...filtradas].sort((a, b) => String(b.prazo).localeCompare(String(a.prazo)));
  }
  return filtradas;
}

/* =========================================================
   3. PAINEL DE RECURSOS (contadores + anel de troféus)
   Deriva sempre de estado.tarefas inteiro — não dos filtros —
   porque é o progresso geral da vila, não da busca atual.
   ========================================================= */
function atualizarPainel() {
  const contagens = {
    'a-fazer': 0,
    'em-andamento': 0,
    'em-revisao': 0,
    'concluida': 0
  };

  estado.tarefas.forEach((tarefa) => {
    if (contagens[tarefa.status] !== undefined) {
      contagens[tarefa.status] += 1;
    }
  });

  const total = estado.tarefas.length;
  const concluidas = contagens.concluida;
  const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  const definirTexto = (id, texto) => {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
  };

  definirTexto('contagem-fila', contagens['a-fazer']);
  definirTexto('contagem-batalha', contagens['em-andamento']);
  definirTexto('contagem-conselho', contagens['em-revisao']);
  definirTexto('contagem-trofeus', concluidas);
  definirTexto('progresso-texto', `${concluidas}/${total}`);

  const anel = document.getElementById('anel-trofeu');
  if (anel) {
    anel.style.setProperty('--progresso', String(percentual));
    anel.setAttribute('aria-valuenow', String(percentual));

    // O "estouro" de troféu é o único movimento de destaque da página,
    // e acontece uma única vez: quando os dados chegam pela primeira vez.
    if (!primeiraCargaConcluida && total > 0) {
      primeiraCargaConcluida = true;
      anel.classList.remove('trofeu-revelado');
      void anel.offsetWidth; // força o navegador a registrar a remoção da classe
      anel.classList.add('trofeu-revelado');
    }
  }
}

/* =========================================================
   4. PONTO ÚNICO DE RENDERIZAÇÃO
   ========================================================= */
function renderizar() {
  atualizarPainel();

  if (estado.carregando) {
    renderizarEstado('carregando');
    return;
  }

  if (estado.erro) {
    renderizarEstado('erro', estado.erro);
    return;
  }

  if (estado.tarefas.length === 0) {
    renderizarEstado('vazio');
    return;
  }

  const visiveis = derivarTarefasVisiveis(estado);

  if (visiveis.length === 0) {
    renderizarEstado('sem-resultados');
    return;
  }

  renderizarEstado('sucesso', {
    visiveis,
    total: estado.tarefas.length
  });
}

/* =========================================================
   5. FICHA DA MISSÃO (dialog)
   Lê a tarefa do estado, nunca do DOM.
   ========================================================= */
function abrirDetalhes(tarefa) {
  const dialogo = document.getElementById('dialogo-tarefa');

  document.getElementById('dialogo-titulo').textContent = tarefa.titulo;
  document.getElementById('detalhe-projeto').textContent =
    tarefa.projeto || 'Não informado';
  document.getElementById('detalhe-responsavel').textContent =
    tarefa.responsavel || 'Não designada';
  document.getElementById('detalhe-status').textContent =
    ROTULOS_FASE[tarefa.status] || tarefa.status;
  document.getElementById('detalhe-prioridade').textContent =
    ROTULOS_CUSTO[tarefa.prioridade] || tarefa.prioridade;
  document.getElementById('detalhe-prazo').textContent =
    formatarData(tarefa.prazo);
  document.getElementById('detalhe-descricao').textContent =
    tarefa.descricao || 'Sem registro de campo para esta missão.';

  dialogo.showModal();
}

function formatarData(dataISO) {
  if (!dataISO) return '';
  const partes = String(dataISO).split('-');
  if (partes.length !== 3) return String(dataISO);
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/* =========================================================
   6. ALTERNADOR DE BASE (Base Principal / Base do Construtor)
   Troca só a aparência (variáveis de cor). Nenhum dado muda.
   ========================================================= */
function configurarAlternadorDeBase() {
  const botao = document.getElementById('alternar-base');
  const rotulo = document.getElementById('rotulo-base');
  const raiz = document.documentElement;
  if (!botao || !rotulo) return;

  function aplicarBase(tema) {
    if (tema === 'construtor') {
      raiz.setAttribute('data-tema', 'construtor');
      rotulo.textContent = 'Base Principal';
      botao.setAttribute('aria-pressed', 'true');
    } else {
      raiz.removeAttribute('data-tema');
      rotulo.textContent = 'Base do Construtor';
      botao.setAttribute('aria-pressed', 'false');
    }
  }

  botao.addEventListener('click', () => {
    const atual = raiz.getAttribute('data-tema') === 'construtor' ? 'construtor' : 'principal';
    const proximo = atual === 'principal' ? 'construtor' : 'principal';
    aplicarBase(proximo);
    try {
      localStorage.setItem('vila-missoes-tema', proximo);
    } catch (erro) {
      // Sem suporte a localStorage: a preferência simplesmente não persiste
    }
  });

  let temaSalvo = null;
  try {
    temaSalvo = localStorage.getItem('vila-missoes-tema');
  } catch (erro) {
    temaSalvo = null;
  }
  if (temaSalvo === 'construtor') aplicarBase('construtor');
}

/* =========================================================
   7. OUVINTES: cada um altera o estado e chama renderizar()
   ========================================================= */
function registrarOuvintes() {
  const campoBusca = document.getElementById('busca-titulo');
  const formFiltros = document.querySelector('.filters-form');
  const selectOrdenacao = document.getElementById('ordenacao-prazo');
  const botaoLimpar = document.getElementById('limpar-filtros');
  const quadro = document.querySelector('.board-grid');
  const dialogo = document.getElementById('dialogo-tarefa');
  const botaoFechar = document.getElementById('fechar-dialogo');

  formFiltros.addEventListener('submit', (evento) => evento.preventDefault());

  campoBusca.addEventListener('input', (evento) => {
    estado.busca = evento.target.value;
    renderizar();
  });

  formFiltros.addEventListener('change', (evento) => {
    const alvo = evento.target;
    if (alvo.name === 'filtro-status') {
      estado.status = alvo.value;
      renderizar();
    } else if (alvo.name === 'filtro-prioridade') {
      estado.prioridade = alvo.value;
      renderizar();
    }
  });

  selectOrdenacao.addEventListener('change', (evento) => {
    estado.ordenacao = evento.target.value;
    renderizar();
  });

  botaoLimpar.addEventListener('click', () => {
    estado.busca = VALORES_INICIAIS.busca;
    estado.status = VALORES_INICIAIS.status;
    estado.prioridade = VALORES_INICIAIS.prioridade;
    estado.ordenacao = VALORES_INICIAIS.ordenacao;

    campoBusca.value = estado.busca;
    document.getElementById('status-todos').checked = true;
    document.getElementById('prio-todas').checked = true;
    selectOrdenacao.value = estado.ordenacao;

    renderizar();
  });

  // Evento delegado no container que nunca é substituído: continua
  // funcionando mesmo depois de cada nova renderização dos cartões.
  quadro.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao="detalhes"]');
    if (!botao) return;

    const tarefa = estado.tarefas.find(
      (item) => String(item.id) === botao.dataset.id
    );
    if (!tarefa) return;

    abrirDetalhes(tarefa);
  });

  botaoFechar.addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });

  configurarAlternadorDeBase();
}

/* =========================================================
   8. INICIALIZAÇÃO
   ========================================================= */
async function iniciarApp() {
  registrarOuvintes();

  estado.carregando = true;
  estado.erro = null;
  renderizar();

  try {
    const tarefas = await carregarTarefas();
    estado.tarefas = Array.isArray(tarefas) ? tarefas : [];
    estado.erro = null;
  } catch (erro) {
    if (erro.name === 'TypeError') {
      estado.erro = 'Falha na conexão de rede ou servidor indisponível.';
    } else if (erro.name === 'SyntaxError') {
      estado.erro = 'O arquivo de dados possui um formato inválido.';
    } else {
      estado.erro = erro.message;
    }
    estado.tarefas = [];
  } finally {
    estado.carregando = false;
    renderizar();
  }
}

document.addEventListener('DOMContentLoaded', iniciarApp);
