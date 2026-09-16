# Gerenciador de Tarefas Acadêmicas

Projeto da disciplina **Desenvolvimento Frontend — 2026.2**
Autor: Peutry de Lima Silva

## Aplicação publicada

<!-- TROQUE "SEU-USUARIO" e "SEU-REPOSITORIO" pelos seus valores reais -->
https://SEU-USUARIO.github.io/SEU-REPOSITORIO/

## Etapas

- **E1** — Estrutura semântica e acessível (HTML)
- **E2** — Layout responsivo com Flexbox e Grid (CSS mobile-first)
- **E3** — Consumo de `dados.json` com `fetch` e os quatro estados da tela
- **E4** — Estado único da interface, busca, filtros, ordenação e publicação

## Estrutura de arquivos

```
index.html
style.css
dados.json
README.md
js/
  api.js           -> carregarTarefas(): só obtém dados, não toca no DOM
  estados.js       -> renderizarEstado(): decide qual tela está valendo
  renderizacao.js  -> renderizarTarefas(): recebe um array e desenha os cartões
  app.js           -> estado único, derivação, ouvintes e ciclo de renderização
```

## Como rodar localmente

A página precisa ser servida por HTTP (módulos ES e `fetch` não funcionam em `file:`):

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000

## Arquitetura da E4

O fluxo é sempre: **evento → altera o estado → deriva a lista → renderiza**.

- `estado` é o objeto único com `tarefas`, `busca`, `status`, `prioridade`, `ordenacao`, `carregando` e `erro`.
- `derivarTarefasVisiveis(estado)` combina busca, filtros e ordenação e devolve um array novo. Não lê o DOM e não altera `estado.tarefas`.
- `renderizar()` é o único ponto de saída: decide entre carregando, erro, origem vazia, resultado vazio e sucesso.
- A lista filtrada nunca é guardada no estado: ela é recalculada a cada ciclo, para não existir uma segunda fonte da verdade.
