# Operacao do projeto

Este documento registra decisoes praticas e regras operacionais importantes para manter continuidade neste projeto.

## Resumo funcional

- Nome atual: `Leitor de Artigos`
- Objetivo: oferecer um modo de leitura proprio para sites em que o navegador nao habilita leitura avancada nativa
- Ativacao:
  - clique no icone da extensao
  - clique no botao flutuante `Leitura Avancada`
  - atalho `Alt+Shift+R`
  - autoabertura em alguns padroes de URL de artigo
- Escape fecha o leitor
- `Selecionar bloco` permite marcar manualmente a area principal

## Arquivos principais

- `LICENSE`
- `manifest.json`
- `background.js`
- `content.js`
- `reader.css`
- `icons/`

## Regra operacional sobre prints

Esta regra nao nasceu neste projeto, mas precisa ser observada aqui tambem para evitar erro de procedimento.

Referencia de memoria global:

- `C:\Users\jairs\.codex\memories\prints_location.md`

Procedimento obrigatorio quando o usuario mencionar `print`, `prints`, `captura`, `capturas de tela` ou equivalente sem anexar arquivo:

1. Consultar `C:\Users\jairs\.codex\memories\prints_location.md`.
2. Verificar os arquivos mais recentes em `D:\Backup\Dropbox\Capturas de tela`.
3. Usar o print mais recente como hipotese principal.
4. So depois disso expandir para outras fontes ou concluir que ha ambiguidade.

O que nao fazer:

- nao responder que nao ha print antes dessa verificacao
- nao presumir que a imagem estaria apenas no workspace atual
- nao substituir essa sequencia por busca em docs, web ou anexos presumidos

## Observacao importante

Neste projeto ja ocorreu uma falha operacional por ignorar a memoria global de prints no primeiro momento. Este arquivo existe justamente para reduzir a chance de repeticao.

## Licenca

- Este projeto usa licenca `MIT`.
- Regra global registrada em `C:\Users\jairs\.codex\memories\github_license_policy.md`: projetos publicados no GitHub devem ter licenca explicita.
