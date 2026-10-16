# Frozen tests: 2-invoice-pdfs

- Source: a Reddit comment by a person who is not the maintainer, replying to a post that showed only the one-line ideas. The post was removed by Reddit; the maintainer copied the replies before that. Author username and link not recorded.
- Message date: 2026-10-15 or 2026-10-16, as reported by the maintainer.
- Translated to English by Claude without changing the meaning. Original (Portuguese) below. This file is not edited after its commit.

## Checks

1. Given I upload a normal invoice PDF with 3 product lines, when the flow runs, then 3 rows appear in the sheet, each with supplier, invoice number, date, description, quantity, unit price and total.
2. Given I upload the same invoice twice, when the flow runs again, then the rows are not duplicated in the sheet.
3. Given I upload a scanned PDF (a photo or a crooked scan), when the flow runs, then either the rows come out correct or the invoice is marked "needs review". Invented numbers never go in silently.
4. Given the invoice has values with a decimal comma (1.234,50 €), when the flow runs, then the sheet stores 1234,50 as a number and not as text.
5. Given the sum of the lines does not match the invoice total, when the flow runs, then that invoice is flagged with the difference.
6. Given I upload a PDF that is not an invoice (a contract, a blank page), when the flow runs, then nothing goes into the sheet and the reason is recorded.
7. Given I upload 10 invoices at once and number 4 is corrupted, when the flow runs, then the other 9 go into the sheet and number 4 appears in an error log.
8. Given the invoice has two pages and the products continue on the second, when the flow runs, then the lines from the second page also go in, without repeating the header as if it were a product.

## Original

Dado que carrego um PDF de fatura normal com 3 linhas de produtos, quando o fluxo corre, então aparecem 3 linhas na folha, cada uma com fornecedor, número da fatura, data, descrição, quantidade, preço unitário e total.
Dado que carrego a mesma fatura duas vezes, quando o fluxo corre outra vez, então as linhas não ficam duplicadas na folha.
Dado que carrego um PDF digitalizado (foto ou scan torto), quando o fluxo corre, então ou as linhas saem corretas, ou a fatura fica marcada como “precisa de revisão”. Nunca entram números inventados em silêncio.
Dado que a fatura tem os valores com vírgula decimal (1.234,50 €), quando o fluxo corre, então a folha guarda 1234,50 como número e não como texto.
Dado que a soma das linhas não bate com o total da fatura, quando o fluxo corre, então essa fatura aparece sinalizada com a diferença.
Dado que carrego um PDF que não é uma fatura (um contrato, uma página em branco), quando o fluxo corre, então não entra nada na folha e fica registado o motivo.
Dado que carrego 10 faturas de uma vez e a número 4 está corrompida, quando o fluxo corre, então as outras 9 entram na folha e a 4 aparece num registo de erros.
Dado que a fatura tem duas páginas e os produtos continuam na segunda, quando o fluxo corre, então as linhas da segunda página também entram, sem repetir o cabeçalho como se fosse um produto.
