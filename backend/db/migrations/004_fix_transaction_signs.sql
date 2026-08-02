-- Corrige o sinal de transações já lançadas: despesa sempre negativa,
-- receita sempre positiva. Sem isso, transações antigas com sinal
-- inconsistente (por ex. um valor digitado como negativo) continuam
-- distorcendo o saldo mesmo depois do código corrigido.
-- Rode este arquivo no SQL Editor do Supabase.

UPDATE transactions
SET valor = CASE
  WHEN tipo = 'despesa' THEN -ABS(valor)
  ELSE ABS(valor)
END;
