# Frozen tests: 5-social-crosspost

- Source: a Reddit comment by a person who is not the maintainer, replying to a post that showed only the one-line ideas. The post was removed by Reddit; the maintainer copied the replies before that. Author username and link not recorded.
- Message date: 2026-10-15 or 2026-10-16, as reported by the maintainer.
- Translated to English by Claude without changing the meaning. Original (Portuguese) below. This file is not edited after its commit.

## Checks

1. Given I write a text and attach an image, when I press publish, then the same post appears on Instagram and on LinkedIn.
2. Given I write only text, without an image, when I press publish, then the tool warns that Instagram needs an image and does not publish to only one of the networks without me knowing.
3. Given the text has more characters than Instagram accepts, when I press publish, then the tool warns before publishing and does not cut the text in the middle.
4. Given Instagram fails and LinkedIn works, when publishing ends, then I see clearly which one went well and which failed, and I can retry only the one that failed without duplicating the other.
5. Given I schedule the post for tomorrow at 9:00, when the time comes, then it goes out at that time and not before.
6. Given the connection to one of the accounts has expired, when I try to publish, then the tool tells me to reconnect the account instead of failing silently.
7. Given the text has hashtags and emojis, when the post goes out, then they appear as I wrote them on both networks.
8. Given I see the published post, when I open it on each network, then there is a link or an indication of what was published, so I can confirm without guessing.

## Original

Dado que escrevo um texto e anexo uma imagem, quando carrego em publicar, então o mesmo post aparece no Instagram e no LinkedIn.
Dado que escrevo só texto, sem imagem, quando carrego em publicar, então a ferramenta avisa que o Instagram precisa de imagem e não publica só numa das redes sem eu saber.
Dado que o texto tem mais caracteres do que o Instagram aceita, quando carrego em publicar, então a ferramenta avisa antes de publicar e não corta o texto a meio.
Dado que o Instagram falha e o LinkedIn funciona, quando a publicação acaba, então vejo claramente qual correu bem e qual falhou, e posso repetir só a que falhou sem duplicar a outra.
Dado que marco a publicação para amanhã às 9h, quando chega a hora, então sai nessa hora e não antes.
Dado que a ligação a uma das contas expirou, quando tento publicar, então a ferramenta diz-me para voltar a ligar a conta em vez de falhar em silêncio.
Dado que o texto tem hashtags e emojis, quando o post sai, então aparecem tal como os escrevi nas duas redes.
Dado que vejo o post já publicado, quando o abro em cada rede, então tem um link ou uma indicação do que foi publicado, para eu confirmar sem adivinhar.
