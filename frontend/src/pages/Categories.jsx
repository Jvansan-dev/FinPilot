import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../api/client.js';

export default function Categories() {
  const [categorias, setCategorias] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ nome: '', tipo: 'despesa', cor: '#6366f1' });

  async function carregar() {
    try {
      setCategorias(await api.getCategories());
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
      await api.createCategory(form);
      setForm({ nome: '', tipo: 'despesa', cor: '#6366f1' });
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteCategory(id);
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  const despesas = categorias.filter((c) => c.tipo === 'despesa');
  const receitas = categorias.filter((c) => c.tipo === 'receita');
  const inputClass =
    'border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50';

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Categorias</h1>

      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-5 mb-6 grid grid-cols-4 gap-3 items-end">
        <input
          type="text"
          placeholder="Nome (ex: Moradia, Salário)"
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
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>

        <input
          type="color"
          value={form.cor}
          onChange={(e) => setForm({ ...form, cor: e.target.value })}
          className="col-span-1 h-10 border border-gray-300 dark:border-slate-700 rounded-md bg-transparent"
          title="Cor da categoria"
        />

        <button type="submit" className="col-span-4 bg-brand-gradient hover:opacity-90 text-white py-2 rounded-md text-sm font-medium shadow-glow-sm transition-opacity">
          Adicionar categoria
        </button>
      </form>

      {erro && <p className="text-sm text-red-500 dark:text-red-400 mb-3">{erro}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ListaCategorias titulo="Despesas" categorias={despesas} carregando={carregando} onDelete={handleDelete} />
        <ListaCategorias titulo="Receitas" categorias={receitas} carregando={carregando} onDelete={handleDelete} />
      </div>
    </div>
  );
}

function ListaCategorias({ titulo, categorias, carregando, onDelete }) {
  return (
    <div className="glass-card rounded-xl">
      <h2 className="text-sm font-medium text-gray-600 dark:text-slate-300 px-5 py-3 border-b border-gray-100 dark:border-slate-800">{titulo}</h2>
      <div className="divide-y divide-gray-100 dark:divide-slate-800">
        {!carregando && categorias.length === 0 && (
          <p className="p-5 text-sm text-gray-400 dark:text-slate-500">Nenhuma categoria de {titulo.toLowerCase()} ainda.</p>
        )}
        {categorias.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.cor }} />
              <p className="text-sm text-gray-800 dark:text-slate-200">{c.nome}</p>
            </div>
            <button onClick={() => onDelete(c.id)} className="text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
