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
      regiaoStatus.textContent = 'Escaneando a vila em busca de missões do clã...';
      renderizarTarefas([]);
      break;

    case 'sucesso':
      regiaoStatus.textContent =
        `Exibindo ${dados.visiveis.length} de ${dados.total} missões do clã.`;
      renderizarTarefas(dados.visiveis);
      break;

    // Origem vazia: o dados.json não trouxe nenhuma missão
    case 'vazio':
      regiaoStatus.textContent =
        'O quartel-general está vazio. Nenhuma missão foi registrada ainda.';
      renderizarTarefas([]);
      break;

    // Resultado vazio: existem missões, mas os critérios não encontraram nenhuma
    case 'sem-resultados':
      regiaoStatus.textContent =
        'Nenhuma missão bate com esses critérios. Ajuste a busca ou limpe os filtros.';
      renderizarTarefas([]);
      break;

    case 'erro':
      regiaoStatus.textContent = `A conexão com a vila falhou: ${dados}`;
      renderizarTarefas([]);
      break;

    default:
      console.warn(`Estado desconhecido: ${estado}`);
  }
}
