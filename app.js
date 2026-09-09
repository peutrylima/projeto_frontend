import { carregarTarefas } from './api.js';
import { renderizarEstado } from './estados.js';

async function iniciarApp() {
  renderizarEstado('carregando');

  try {
    const tarefas = await carregarTarefas();

    if (!tarefas || tarefas.length === 0) {
      renderizarEstado('vazio');
    } else {
      renderizarEstado('sucesso', tarefas);
    }
  } catch (erro) {
    let mensagemErro = 'Ocorreu um erro ao carregar os dados.';

    if (erro.name === 'TypeError') {
      mensagemErro = 'Falha na conexão de rede ou servidor indisponível.';
    } else if (erro.name === 'SyntaxError') {
      mensagemErro = 'O arquivo JSON possui um formato inválido.';
    } else {
      mensagemErro = erro.message;
    }

    renderizarEstado('erro', mensagemErro);
  }
}
document.addEventListener('DOMContentLoaded', iniciarApp);
