# Leitor de Artigos

Extensao Manifest V3 para Chromium/Edge que adiciona um modo de leitura proprio em paginas nas quais o navegador nao libera o botao nativo de "Leitura Avancada".

## Limite importante

Esta extensao **nao consegue habilitar o botao nativo/F9 do navegador**. Esse botao depende de heuristicas internas do navegador e nao eh exposto para extensoes.

O que ela faz:

- injeta um botao flutuante `Leitura Avancada`;
- injeta um botao `Selecionar bloco` para escolher manualmente a parte principal da pagina;
- abre automaticamente o leitor em dominios configurados com padrao de artigo;
- permite abrir o modo pelo icone da extensao;
- permite abrir pelo atalho `Alt+Shift+R`;
- extrai o conteudo principal da pagina e mostra em um painel limpo.

## Como instalar

1. Abra `edge://extensions` ou `chrome://extensions`.
2. Ative `Modo do desenvolvedor`.
3. Clique em `Carregar sem compactacao`.
4. Selecione esta pasta: `ExtencaoLeitura`.

## Como usar

- Clique no botao flutuante da pagina.
- Se a extracao automatica falhar, clique em `Selecionar bloco` e depois clique no trecho principal do texto.
- Ou clique no icone da extensao.
- Ou use `Alt+Shift+R`.
- `Esc` fecha o modo de leitura.

## Autoabertura configurada

- `dropsdocotidiano.com`: abre automaticamente em URLs de artigo no formato `/{ano}/{mes}/{dia}/...`
- qualquer dominio: tenta autoabrir em URLs com padrao de artigo `/{ano}/{mes}/{dia}/...`
- qualquer dominio: tenta autoabrir em URLs com prefixos `/blog/`, `/noticia/`, `/noticias/`, `/artigo/`, `/artigos/`, `/post/` e `/posts/`

## Estrutura

- `LICENSE`: licenca MIT do projeto
- `manifest.json`: declaracao da extensao
- `background.js`: acao do icone e atalho
- `content.js`: injecao do botao e montagem do leitor
- `reader.css`: interface do leitor
- `icons/`: icones da extensao
- `PUBLISHING.md`: checklist para publicar no Chrome Web Store e no Edge Add-ons
- `OPERACAO.md`: notas operacionais do projeto, incluindo a regra global de prints
- `PRIVACY.md`: politica de privacidade base
- `package_extension.ps1`: gera um `.zip` limpo em `dist/`
