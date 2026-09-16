import { renderizarTarefas } from './renderizacao.js';

/**
 * Decide qual tela está valendo.
 * Nenhuma requisição acontece aqui, nenhuma regra de filtro também.
 * O texto entra sempre por textContent, nunca por innerHTML.
 */
export function renderizarEstado(estado, dados = null) {
  const regiaoStatus = document.getElementById('regiao-status');

  switch (estado) {
    case 'carregando':
      regiaoStatus.textContent = 'Carregando tarefas...';
      renderizarTarefas([]);
      break;

    case 'sucesso':
      regiaoStatus.textContent =
        `Exibindo ${dados.visiveis.length} de ${dados.total} tarefas.`;
      renderizarTarefas(dados.visiveis);
      break;

    // Origem vazia: o dados.json não trouxe nenhuma tarefa
    case 'vazio':
      regiaoStatus.textContent =
        'Nenhuma tarefa cadastrada. A origem de dados está vazia.';
      renderizarTarefas([]);
      break;

    // Resultado vazio: existem tarefas, mas os critérios não encontraram nenhuma
    case 'sem-resultados':
      regiaoStatus.textContent =
        'Nenhuma tarefa corresponde aos critérios atuais. Altere a busca, os filtros ou use "Limpar filtros".';
      renderizarTarefas([]);
      break;

    case 'erro':
      regiaoStatus.textContent = `Erro ao carregar tarefas: ${dados}`;
      renderizarTarefas([]);
      break;

    default:
      console.warn(`Estado desconhecido: ${estado}`);
  }
}
