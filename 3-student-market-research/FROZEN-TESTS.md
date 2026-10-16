# Frozen tests: 3-student-market-research

- Source: a Reddit comment by a person who is not the maintainer, replying to a post that showed only the one-line ideas. The post was removed by Reddit; the maintainer copied the replies before that. Author username and link not recorded.
- Message date: 2026-10-15 or 2026-10-16, as reported by the maintainer.
- Translated to English by Claude without changing the meaning. Original (Portuguese) below. This file is not edited after its commit.

## Checks

1. Given I type a field of study (for example, "digital marketing"), when the tool runs, then it first shows a list of new topics before doing any analysis.
2. Given I see the list of topics, when I pick one, then the analysis covers only that topic and not the whole sector.
3. Given the analysis is ready, when I read it, then it has the six parts (political, economic, social, technological, environmental, legal), each with its own content and without repeating the same sentence.
4. Given the tool states a number or a date, when I look for the source, then there is a link that opens and that really says that.
5. Given one of the links does not open or the page does not say what the tool claims, when I check, then that counts as a failure, because inventing sources is the worst possible mistake here.
6. Given I type an absurd or vague field ("stuff"), when the tool runs, then it asks me to be more specific instead of returning junk.
7. Given I run the tool twice with the same field, when I compare, then the topics may change, but all of them are still recent and make sense.
8. Given the chosen topic is very new and has almost no information, when the analysis comes out, then it says clearly that there is little information instead of padding.

## Original

Dado que escrevo uma área de estudo (por exemplo, “marketing digital”), quando a ferramenta corre, então mostra primeiro uma lista de temas novos antes de fazer qualquer análise.
Dado que vejo a lista de temas, quando escolho um, então a análise só trata desse tema e não do setor inteiro.
Dado que a análise está pronta, quando a leio, então tem as seis partes (política, económica, social, tecnológica, ambiental, legal), cada uma com conteúdo próprio e sem repetir a mesma frase.
Dado que a ferramenta afirma um número ou uma data, quando procuro a fonte, então existe um link que abre e que diz mesmo isso.
Dado que um dos links não abre ou a página não diz o que a ferramenta afirma, quando verifico, então isso conta como falha, porque inventar fontes é o pior erro possível aqui.
Dado que escrevo uma área absurda ou vaga (“coisas”), quando a ferramenta corre, então pede-me para ser mais específico em vez de devolver lixo.
Dado que corro a ferramenta duas vezes com a mesma área, quando comparo, então os temas podem mudar, mas todos continuam a ser recentes e a fazer sentido.
Dado que o tema escolhido é muito novo e quase não tem informação, quando a análise sai, então diz claramente que há pouca informação em vez de encher.
