import { renderizarTarefas } from './renderizacao.js';

export function renderizarEstado(estado, dados = null) {
  const regiaoStatus = document.getElementById('regiao-status');

  switch (estado) {
    case 'carregando':
      regiaoStatus.textContent = 'Carregando tarefas...';
      renderizarTarefas([]); // Limpa os cartões anteriores da tela
      break;

    case 'sucesso':
      regiaoStatus.textContent = `${dados.length} tarefas carregadas com sucesso.`;
      renderizarTarefas(dados);
      break;

    case 'vazio':
      regiaoStatus.textContent = 'Nenhuma tarefa encontrada.';
      renderizarTarefas([]); // Garante que a tela não exiba cartões antigos
      break;

    case 'erro':
      regiaoStatus.textContent = `Erro ao carregar tarefas: ${dados}`;
      renderizarTarefas([]); // Limpa o quadro para não manter dados antigos
      break;

    default:
      console.warn(`Estado desconhecido: ${estado}`);
  }
}
