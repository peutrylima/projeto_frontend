export function renderizarTarefas(tarefas = []) {
  // Mapeamento dos elementos das 4 colunas do Kanban
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

  // 2. Se a lista for vazia (ou inválida), atualiza contadores para 0 e encerra
  if (!Array.isArray(tarefas) || tarefas.length === 0) {
    atualizarContadores(colunas, contadores);
    return;
  }

  // 3. Monta e insere cada cartão na coluna correspondente
  tarefas.forEach(tarefa => {
    const colunaAlvo = colunas[tarefa.status];
    if (!colunaAlvo) return;

    const lista = colunaAlvo.querySelector('.task-list');
    if (!lista) return;

    // Incrementa a contagem do status
    contadores[tarefa.status] = (contadores[tarefa.status] || 0) + 1;

    const li = document.createElement('li');
    const prioridadeTexto = tarefa.prioridade
      ? tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)
      : '';

    li.innerHTML = `
      <article class="task-card">
        <h3 class="task-title">${sanitizarTexto(tarefa.titulo)}</h3>
        <div class="card-footer">
          <span class="priority priority-${tarefa.prioridade}">Prioridade: ${prioridadeTexto}</span>
          <p class="due-date"><time datetime="${tarefa.prazo}">${formatarData(tarefa.prazo)}</time></p>
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
  const partes = dataISO.split('-');
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function sanitizarTexto(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}