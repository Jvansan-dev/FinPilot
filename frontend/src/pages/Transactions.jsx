import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../api/client.js';

const hojeISO = () => new Date().toLocaleDateString('sv-SE'); // formato YYYY-MM-DD no fuso local

export default function Transactions() {
  const [transacoes, setTransacoes] = useState([]);
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    account_id: '', category_id: '', valor: '', tipo: 'despesa', descricao: '', data: hojeISO(),
  });

  async function carregarTudo() {
    try {
      const [tx, ct, cat] = await Promise.all([
        api.getTransactions(),
        api.getAccounts(),
        api.getCategories(),
      ]);
      setTransacoes(tx);
      setContas(ct);
      setCategorias(cat);
    } catch (err) {
      setErro(err.message);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.createTransaction({ ...form, valor: Number(form.valor) });
      setForm({ account_id: '', category_id: '', valor: '', tipo: 'despesa', descricao: '', data: hojeISO() });
      carregarTudo();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteTransaction(id);
      carregarTudo();
    } catch (err) {
      setErro(err.message);
    }
  }

  const inputClass =
    'border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50';

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-800 dark:text-white mb-6">Transações</h1>

      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-5 mb-6 grid grid-cols-6 gap-3 items-end">
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className={`col-span-1 ${inputClass}`}
        >
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>

        <select
          value={form.account_id}
          onChange={(e) => setForm({ ...form, account_id: e.target.value })}
          className={`col-span-1 ${inputClass}`}
          required
        >
          <option value="">Conta</option>
          {contas.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className={`col-span-1 ${inputClass}`}
        >
          <option value="">Categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Descrição"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className={`col-span-1 ${inputClass}`}
        />

        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Valor"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          className={`col-span-1 ${inputClass}`}
          required
        />

        <input
          type="date"
          value={form.data}
          onChange={(e) => setForm({ ...form, data: e.target.value })}
          className={`col-span-1 ${inputClass}`}
          required
        />

        <button type="submit" className="col-span-6 bg-brand-gradient hover:opacity-90 text-white py-2 rounded-md text-sm font-medium shadow-glow-sm transition-opacity">
          Adicionar
        </button>
      </form>

      {erro && <p className="text-sm text-red-500 dark:text-red-400 mb-3">{erro}</p>}

      <div className="glass-card rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800">
        {transacoes.length === 0 && (
          <p className="p-5 text-sm text-neutral-400 dark:text-neutral-500">Nenhuma transação lançada ainda.</p>
        )}
        {transacoes.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">{t.descricao || '(sem descrição)'}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{t.data?.slice(0, 10)}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${Number(t.valor) < 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                {Number(t.valor) < 0 ? '-' : '+'} R$ {Math.abs(Number(t.valor)).toFixed(2)}
              </span>
              <button onClick={() => handleDelete(t.id)} className="text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
