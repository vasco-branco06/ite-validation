# Frozen tests: 1-email-triage

- Source: a Reddit comment by a person who is not the maintainer, replying to a post that showed only the one-line ideas. The post was removed by Reddit; the maintainer copied the replies before that. Author username and link not recorded.
- Message date: 2026-10-15 or 2026-10-16, as reported by the maintainer.
- Translated to English by Claude without changing the meaning. Original (Portuguese) below. This file is not edited after its commit.

## Checks

1. Given I have 20 new emails, among them one from my boss asking for something for today and a newsletter, when the agent runs in the morning, then the boss's email appears above the newsletter.
2. Given an email is marked as urgent, when the agent finishes, then a draft reply is saved in drafts and nothing was sent.
3. Given an email is not urgent, when the agent finishes, then there is no draft for it.
4. Given the agent ran, when I look at the inbox, then no email was deleted, archived or marked as read without me doing it.
5. Given I receive an urgent email written in English, when the agent writes the draft, then the reply is in English.
6. Given the inbox is empty, when the agent runs, then a message says there is nothing, with no error.
7. Given the agent cannot tell whether an email is urgent, when it sorts it, then it is marked as "uncertain" instead of being pushed to the bottom.
8. Given the urgent email is a long thread with 15 messages, when the agent writes the draft, then the reply takes the last message into account, not the first.

## Original

Dado que tenho 20 emails novos, entre eles um do meu chefe a pedir algo para hoje e uma newsletter, quando o agente corre de manhã, então o do chefe aparece acima da newsletter.
Dado que um email está marcado como urgente, quando o agente acaba, então existe um rascunho de resposta guardado nos rascunhos e nada foi enviado.
Dado que um email não é urgente, quando o agente acaba, então não existe rascunho para ele.
Dado que o agente correu, quando vou ver a caixa de entrada, então nenhum email foi apagado, arquivado ou marcado como lido sem eu ter feito isso.
Dado que recebo um email urgente escrito em inglês, quando o agente escreve o rascunho, então a resposta vem em inglês.
Dado que a caixa de entrada está vazia, quando o agente corre, então aparece uma mensagem a dizer que não há nada, sem erro.
Dado que o agente não percebe se um email é urgente, quando o ordena, então fica marcado como “incerto” em vez de ser empurrado para o fundo.
Dado que o email urgente é uma cadeia longa com 15 mensagens, quando o agente escreve o rascunho, então a resposta tem em conta a última mensagem e não a primeira.
