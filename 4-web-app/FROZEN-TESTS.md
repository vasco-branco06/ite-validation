# Frozen tests: 4-web-app

- Source: a Reddit comment by a person who is not the maintainer, replying to a post that showed only the one-line ideas. The post was removed by Reddit; the maintainer copied the replies before that. Author username and link not recorded.
- Message date: 2026-10-15 or 2026-10-16, as reported by the maintainer.
- Translated to English by Claude without changing the meaning. Original (Portuguese) below. This file is not edited after its commit.

## Checks

1. Given I fill in the form with valid data, when I press submit, then the item appears in the list without me having to refresh the page.
2. Given I have just added an item, when I close the tab and open it again, then the item is still there.
3. Given I leave a required field empty, when I press submit, then a warning says which one and nothing is saved.
4. Given I press the submit button twice in a row, when I look at the list, then a single item appears.
5. Given I type in the text field something like <b>olá</b> or quotes and accents (ção, ñ), when I save, then the list shows exactly what I typed and the page does not break.
6. Given I type a text with 5000 characters, when I save, then it either accepts it and shows it properly or refuses with a clear message.
7. Given I open the app on my phone, when I use the form, then I can fill it in and see the list without zooming or scrolling sideways.
8. Given the database is unreachable, when I press submit, then I see an error message and not a blank screen.

## Original

Dado que preencho o formulário com dados válidos, quando carrego em enviar, então o item aparece na lista sem eu ter de atualizar a página.
Dado que acabei de adicionar um item, quando fecho o separador e volto a abrir, então o item continua lá.
Dado que deixo um campo obrigatório vazio, quando carrego em enviar, então aparece um aviso a dizer qual e nada é guardado.
Dado que carrego duas vezes seguidas no botão de enviar, quando olho para a lista, então aparece um único item.
Dado que escrevo no campo de texto algo como <b>olá</b> ou aspas e acentos (ção, ñ), quando guardo, então a lista mostra exatamente o que escrevi e a página não parte.
Dado que escrevo um texto com 5000 caracteres, quando guardo, então ou aceita e mostra bem, ou recusa com uma mensagem clara.
Dado que abro a app no telemóvel, quando uso o formulário, então consigo preencher e ver a lista sem ter de fazer zoom nem scroll para os lados.
Dado que a base de dados está inacessível, quando carrego em enviar, então vejo uma mensagem de erro e não um ecrã branco.
