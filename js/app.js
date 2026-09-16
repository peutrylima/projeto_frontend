import { carregarTarefas } from './api.js';
import { renderizarEstado } from './estados.js';

/* =========================================================
   1. ESTADO ÚNICO DA APLICAÇÃO (fonte da verdade)
   A tela é sempre uma projeção deste objeto.
   Não existe segunda lista filtrada guardada aqui.
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

// Rótulos legíveis para a ficha de detalhes
const ROTULOS_STATUS = {
  'a-fazer': 'A fazer',
  'em-andamento': 'Em andamento',
  'em-revisao': 'Em revisão',
  'concluida': 'Concluída'
};

const ROTULOS_PRIORIDADE = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta'
};

/* =========================================================
   2. DERIVAÇÃO
   Recebe o estado e devolve a lista visível.
   Não consulta o DOM. Não altera o estado nem estado.tarefas.
   ========================================================= */
export function derivarTarefasVisiveis(estadoAtual) {
  const termo = estadoAtual.busca.trim().toLowerCase();

  // filter() já devolve um array novo: o original permanece intacto
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
  // por isso ele nunca é chamado diretamente sobre estado.tarefas.
  if (estadoAtual.ordenacao === 'prazo-asc') {
    return [...filtradas].sort((a, b) => String(a.prazo).localeCompare(String(b.prazo)));
  }
  if (estadoAtual.ordenacao === 'prazo-desc') {
    return [...filtradas].sort((a, b) => String(b.prazo).localeCompare(String(a.prazo)));
  }
  return filtradas;
}

/* =========================================================
   3. PONTO ÚNICO DE RENDERIZAÇÃO
   Todo evento termina aqui. Cartões, contagem e mensagem
   saem sempre da mesma derivação.
   ========================================================= */
function renderizar() {
  if (estado.carregando) {
    renderizarEstado('carregando');
    return;
  }

  if (estado.erro) {
    renderizarEstado('erro', estado.erro);
    return;
  }

  // Origem vazia: o JSON não trouxe tarefa nenhuma
  if (estado.tarefas.length === 0) {
    renderizarEstado('vazio');
    return;
  }

  const visiveis = derivarTarefasVisiveis(estado);

  // Resultado vazio: existem tarefas, mas nenhuma atende aos critérios.
  // Decidido pela lista derivada, nunca pelo catch.
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
   4. FICHA DE DETALHES
   Lê a tarefa do estado, nunca do DOM. O texto entra por
   textContent, nunca por innerHTML.
   ========================================================= */
function abrirDetalhes(tarefa) {
  const dialogo = document.getElementById('dialogo-tarefa');

  document.getElementById('dialogo-titulo').textContent = tarefa.titulo;
  document.getElementById('detalhe-projeto').textContent =
    tarefa.projeto || 'Não informado';
  document.getElementById('detalhe-responsavel').textContent =
    tarefa.responsavel || 'Não atribuído';
  document.getElementById('detalhe-status').textContent =
    ROTULOS_STATUS[tarefa.status] || tarefa.status;
  document.getElementById('detalhe-prioridade').textContent =
    ROTULOS_PRIORIDADE[tarefa.prioridade] || tarefa.prioridade;
  document.getElementById('detalhe-prazo').textContent =
    formatarData(tarefa.prazo);
  document.getElementById('detalhe-descricao').textContent =
    tarefa.descricao || 'Sem descrição cadastrada.';

  // showModal() prende o foco dentro do diálogo e o devolve ao
  // botão de origem quando ele fecha. Esc também fecha, de graça.
  dialogo.showModal();
}

function formatarData(dataISO) {
  if (!dataISO) return '';
  const partes = String(dataISO).split('-');
  if (partes.length !== 3) return String(dataISO);
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/* =========================================================
   5. OUVINTES: cada um altera o estado e chama renderizar()
   ========================================================= */
function registrarOuvintes() {
  const campoBusca = document.getElementById('busca-titulo');
  const formFiltros = document.querySelector('.filters-form');
  const selectOrdenacao = document.getElementById('ordenacao-prazo');
  const botaoLimpar = document.getElementById('limpar-filtros');
  const quadro = document.querySelector('.board-grid');
  const dialogo = document.getElementById('dialogo-tarefa');
  const botaoFechar = document.getElementById('fechar-dialogo');

  // Não recarregar a página se o usuário apertar Enter na busca
  formFiltros.addEventListener('submit', (evento) => evento.preventDefault());

  campoBusca.addEventListener('input', (evento) => {
    estado.busca = evento.target.value;
    renderizar();
  });

  // Delegação nos rádios de status e prioridade
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
    // Restaura o estado...
    estado.busca = VALORES_INICIAIS.busca;
    estado.status = VALORES_INICIAIS.status;
    estado.prioridade = VALORES_INICIAIS.prioridade;
    estado.ordenacao = VALORES_INICIAIS.ordenacao;

    // ...e sincroniza os controles a partir dele (uma única fonte da verdade)
    campoBusca.value = estado.busca;
    document.getElementById('status-todos').checked = true;
    document.getElementById('prio-todas').checked = true;
    selectOrdenacao.value = estado.ordenacao;

    renderizar();
  });

  // EVENTO DELEGADO: instalado uma única vez, no container que nunca é
  // substituído. Os botões dentro dos cartões são recriados a cada
  // renderização, mas continuam funcionando porque o ouvinte não está
  // preso a eles, e sim ao quadro.
  quadro.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao="detalhes"]');
    if (!botao) return;

    // A tarefa é procurada no estado, não lida do DOM
    const tarefa = estado.tarefas.find(
      (item) => String(item.id) === botao.dataset.id
    );
    if (!tarefa) return;

    abrirDetalhes(tarefa);
  });

  botaoFechar.addEventListener('click', () => dialogo.close());

  // Clique fora do conteúdo (no backdrop) também fecha
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
}

/* =========================================================
   6. INICIALIZAÇÃO
   ========================================================= */
async function iniciarApp() {
  registrarOuvintes();

  estado.carregando = true;   // aplicado ANTES do await
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
