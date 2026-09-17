export async function carregarTarefas() {
  const resposta = await fetch('./dados.json');

  // Verifica erro de protocolo (ex: 404, 500) antes de tentar ler o corpo
  if (!resposta.ok) {
    throw new Error(`Erro de rede/protocolo: ${resposta.status}`);
  }

  const dados = await resposta.json();
  return dados.tarefas;
}