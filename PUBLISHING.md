# Publicacao da extensao

Este documento registra o que falta e como preparar a extensao `Leitor de Artigos` para publicacao publica.

## Estado atual

- Extensao Manifest V3 pronta para carga local sem compactacao.
- Nome de exibicao configurado: `Leitor de Artigos`.
- Icones locais gerados em `icons/`.
- Autoabertura configurada para `dropsdocotidiano.com` e para alguns padroes genericos de URL de artigo.
- Fluxo manual disponivel com `Selecionar bloco`.

## Antes de publicar

1. Revisar permissoes.
2. Validar comportamento no Edge e no Chrome com instalacao limpa.
3. Confirmar se `host_permissions: <all_urls>` eh realmente necessario.
4. Preparar imagens da loja:
   - icone da extensao
   - screenshots do uso da extensao
   - imagem promocional se a loja exigir ou recomendar
5. Preparar texto da listagem:
   - titulo
   - descricao curta
   - descricao completa
   - categoria
6. Preparar politica de privacidade, mesmo que a extensao nao envie dados.
7. Publicar `PRIVACY.md` em uma URL publica antes de preencher a loja.

## Pontos de revisao tecnica

- A extensao nao envia dados para servidor.
- A extensao opera no DOM da pagina para extrair conteudo de leitura.
- O maior ponto de escrutinio na revisao deve ser `host_permissions: <all_urls>`.
- Se for possivel reduzir para dominios ou ativacao manual mais restrita, a revisao tende a ficar mais simples.

## Empacotamento

Para publicar, gere um `.zip` contendo os arquivos da extensao na raiz do pacote:

- `manifest.json`
- `background.js`
- `content.js`
- `reader.css`
- pasta `icons/`

Nao incluir arquivos desnecessarios de trabalho se a loja nao precisar deles, por exemplo:

- `README.md`
- `PUBLISHING.md`
- `OPERACAO.md`

Atalho local de empacotamento:

- executar `.\package_extension.ps1`
- o pacote final sera gerado em `dist\LeitorDeArtigos.zip`

## Chrome Web Store

Fluxo resumido:

1. Criar conta de desenvolvedor no Chrome Web Store.
2. Pagar a taxa unica de registro.
3. Enviar o `.zip`.
4. Preencher os campos da listagem.
5. Responder as secoes de privacidade e uso de dados.
6. Enviar para revisao.

## Microsoft Edge Add-ons

Fluxo resumido:

1. Criar conta de desenvolvedor no Partner Center.
2. Criar submissao da extensao.
3. Enviar o `.zip`.
4. Preencher a listagem e mercados.
5. Aguardar certificacao.

## Checklist rapido de envio

- `manifest.json` valido
- icones presentes
- nome e descricao finais
- screenshots da extensao funcionando
- politica de privacidade pronta
- pacote `.zip` testado localmente
- permissao ampla justificada ou reduzida

## Sugestao de descricao curta

Abre um modo de leitura limpo em paginas de artigo onde o navegador nao libera a leitura avancada nativa.

## Sugestao de descricao completa

`Leitor de Artigos` adiciona um modo de leitura proprio para paginas em que o navegador nao oferece leitura avancada nativa. A extensao tenta identificar o conteudo principal do artigo, remove ruido visual comum como barras laterais e banners, e apresenta o texto em uma interface limpa. Quando a deteccao automatica nao eh suficiente, o usuario pode selecionar manualmente o bloco principal da pagina.
