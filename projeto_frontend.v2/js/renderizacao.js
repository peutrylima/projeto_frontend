const ROTULOS_CUSTO = {
  baixa: '🟡 Ouro',
  media: '💜 Elixir',
  alta: '⬛ Elixir Negro'
};

export function renderizarTarefas(tarefas = []) {
  // Mapeamento dos elementos das 4 colunas do quadro
  const colunas = {
    'a-fazer': document.querySelector('.status-todo'),
    'em-andamento': document.querySelector('.status-in-progress'),
    'em-revisao': document.querySelector('.status-review'),
    'concluida': document.querySelector('.status-done')
  };

  const contadores = {
    'a-fazer': 0,
    'em-andamento': 0,
    'em-revisao': 0,
    'concluida': 0
  };

  // 1. Limpa o conteúdo das 4 listas
  Object.values(colunas).forEach(coluna => {
    if (coluna) {
      const lista = coluna.querySelector('.task-list');
      if (lista) lista.innerHTML = '';
    }
  });

  // 2. Se a lista for vazia (ou inválida), zera os contadores e encerra
  if (!Array.isArray(tarefas) || tarefas.length === 0) {
    atualizarContadores(colunas, contadores);
    return;
  }

  // 3. Monta e insere cada cartão de missão na coluna correspondente
  tarefas.forEach(tarefa => {
    const colunaAlvo = colunas[tarefa.status];
    if (!colunaAlvo) return;

    const lista = colunaAlvo.querySelector('.task-list');
    if (!lista) return;

    contadores[tarefa.status] = (contadores[tarefa.status] || 0) + 1;

    const li = document.createElement('li');
    const prioridade = tarefa.prioridade || '';
    const custoTexto = ROTULOS_CUSTO[prioridade] || prioridade;
    const titulo = sanitizarTexto(tarefa.titulo);

    li.innerHTML = `
      <article class="task-card">
        <span class="custo-badge custo-${prioridade}">${custoTexto}</span>
        <h3 class="task-title" title="${titulo}">${titulo}</h3>
        <p class="project-info"><strong>Clã:</strong> ${sanitizarTexto(tarefa.projeto || 'Não informado')}</p>
        <p class="assignee-info"><strong>Tropa:</strong> ${sanitizarTexto(tarefa.responsavel || 'Não designada')}</p>
        <div class="card-footer">
          <span class="due-date">⏱️ <time datetime="${sanitizarTexto(tarefa.prazo)}">${formatarData(tarefa.prazo)}</time></span>
          <button
            type="button"
            class="btn-detalhes"
            data-acao="detalhes"
            data-id="${sanitizarTexto(tarefa.id)}"
            aria-haspopup="dialog"
            aria-label="Ver detalhes da missão: ${titulo}">Ver missão</button>
        </div>
      </article>
    `;

    lista.appendChild(li);
  });

  // 4. Atualiza os contadores no topo de cada coluna
  atualizarContadores(colunas, contadores);
}

// Funções auxiliares
function atualizarContadores(colunas, contadores) {
  Object.keys(colunas).forEach(status => {
    const coluna = colunas[status];
    if (coluna) {
      const contadorEl = coluna.querySelector('.task-count');
      if (contadorEl) {
        contadorEl.textContent = contadores[status] || 0;
      }
    }
  });
}

function formatarData(dataISO) {
  if (!dataISO) return '';
  const partes = String(dataISO).split('-');
  if (partes.length !== 3) return String(dataISO);
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function sanitizarTexto(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
