import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../api/client.js';

const TIPOS = [
  { valor: 'carteira', label: 'Carteira' },
  { valor: 'conta_corrente', label: 'Conta corrente' },
  { valor: 'poupanca', label: 'Poupança' },
  { valor: 'cartao_credito', label: 'Cartão de crédito' },
  { valor: 'investimento', label: 'Investimento' },
];

export default function Accounts() {
  const [contas, setContas] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ nome: '', tipo: 'carteira', saldo_inicial: '', cor: '#6366f1' });

  async function carregar() {
    try {
      setContas(await api.getAccounts());
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.createAccount({
        ...form,
        saldo_inicial: form.saldo_inicial ? Number(form.saldo_inicial) : 0,
      });
      setForm({ nome: '', tipo: 'carteira', saldo_inicial: '', cor: '#6366f1' });
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteAccount(id);
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  const inputClass =
    'border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50';

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-800 dark:text-white mb-6">Contas</h1>

      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-5 mb-6 grid grid-cols-5 gap-3 items-end">
        <input
          type="text"
          placeholder="Nome (ex: Nubank, Carteira)"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className={`col-span-2 ${inputClass}`}
          required
        />

        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className={`col-span-1 ${inputClass}`}
        >
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>{t.label}</option>
          ))}
        </select>

        <input
          type="number"
          step="0.01"
          placeholder="Saldo inicial"
          value={form.saldo_inicial}
          onChange={(e) => setForm({ ...form, saldo_inicial: e.target.value })}
          className={`col-span-1 ${inputClass}`}
        />

        <input
          type="color"
          value={form.cor}
          onChange={(e) => setForm({ ...form, cor: e.target.value })}
          className="col-span-1 h-10 border border-neutral-300 dark:border-neutral-700 rounded-md bg-transparent"
          title="Cor da conta"
        />

        <button type="submit" className="col-span-5 bg-brand-gradient hover:opacity-90 text-white py-2 rounded-md text-sm font-medium shadow-glow-sm transition-opacity">
          Adicionar conta
        </button>
      </form>

      {erro && <p className="text-sm text-red-500 dark:text-red-400 mb-3">{erro}</p>}

      <div className="glass-card rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800">
        {!carregando && contas.length === 0 && (
          <p className="p-5 text-sm text-neutral-400 dark:text-neutral-500">Nenhuma conta cadastrada ainda.</p>
        )}
        {contas.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.cor }} />
              <div>
                <p className="text-sm text-neutral-800 dark:text-neutral-200">{c.nome}</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {TIPOS.find((t) => t.valor === c.tipo)?.label || c.tipo} · saldo inicial:{' '}
                  {Number(c.saldo_inicial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
