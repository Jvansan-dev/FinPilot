import { useEffect, useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChartIcon, BarChart3, LineChartIcon } from 'lucide-react';
import { api } from '../api/client.js';

const CORES = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

const formatarMoeda = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export default function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [todasTransacoes, setTodasTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tipoGrafico, setTipoGrafico] = useState('pie'); // 'pie' | 'bar'

  useEffect(() => {
    async function carregar() {
      try {
        const hoje = new Date();
        const [tx, todas, cat] = await Promise.all([
          api.getTransactions({ mes: hoje.getMonth() + 1, ano: hoje.getFullYear() }),
          api.getTransactions(),
          api.getCategories(),
        ]);
        setTransacoes(tx);
        setTodasTransacoes(todas);
        setCategorias(cat);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const receitas = transacoes.filter((t) => t.tipo === 'receita').reduce((s, t) => s + Number(t.valor), 0);
  const despesas = transacoes.filter((t) => t.tipo === 'despesa').reduce((s, t) => s + Number(t.valor), 0);
  const saldo = receitas - despesas;

  const gastosPorCategoria = categorias
    .map((c, i) => ({
      name: c.nome,
      value: transacoes
        .filter((t) => t.category_id === c.id && t.tipo === 'despesa')
        .reduce((s, t) => s + Number(t.valor), 0),
      cor: CORES[i % CORES.length],
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const evolucaoMensal = useMemo(() => {
    const grupos = {};
    todasTransacoes.forEach((t) => {
      const data = new Date(t.data);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      if (!grupos[chave]) {
        grupos[chave] = { chave, mes: MESES_ABREV[data.getMonth()], receitas: 0, despesas: 0 };
      }
      if (t.tipo === 'receita') grupos[chave].receitas += Number(t.valor);
      else grupos[chave].despesas += Number(t.valor);
    });
    return Object.values(grupos)
      .sort((a, b) => a.chave.localeCompare(b.chave))
      .slice(-6);
  }, [todasTransacoes]);

  if (carregando) return <p className="text-gray-500 dark:text-slate-400">Carregando...</p>;
  if (erro) return <p className="text-red-500 dark:text-red-400">{erro}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Este mês</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card
          titulo="Receitas"
          valor={receitas}
          icone={TrendingUp}
          corIcone="text-emerald-500 dark:text-emerald-400"
          corFundo="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <Card
          titulo="Despesas"
          valor={despesas}
          icone={TrendingDown}
          corIcone="text-red-500 dark:text-red-400"
          corFundo="bg-red-50 dark:bg-red-500/10"
        />
        <Card
          titulo="Saldo"
          valor={saldo}
          icone={Wallet}
          corIcone={saldo >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-500 dark:text-red-400'}
          corFundo={saldo >= 0 ? 'bg-brand-50 dark:bg-brand-500/10' : 'bg-red-50 dark:bg-red-500/10'}
          destaque
        />
      </div>

      {evolucaoMensal.length > 1 && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-4 flex items-center gap-2">
            <LineChartIcon size={15} className="text-brand-500 dark:text-brand-400" />
            Evolução (últimos {evolucaoMensal.length} meses)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-800" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} className="fill-gray-500 dark:fill-slate-400" />
              <YAxis tick={{ fontSize: 12 }} className="fill-gray-500 dark:fill-slate-400" width={40} />
              <Tooltip
                formatter={(v) => formatarMoeda(v)}
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
              />
              <Legend />
              <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-600 dark:text-slate-300">Gastos por categoria</h2>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800/70 rounded-lg p-1">
            <button
              onClick={() => setTipoGrafico('pie')}
              className={`p-1.5 rounded-md transition-colors ${
                tipoGrafico === 'pie' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-400 dark:text-slate-500'
              }`}
              title="Gráfico de pizza"
            >
              <PieChartIcon size={15} />
            </button>
            <button
              onClick={() => setTipoGrafico('bar')}
              className={`p-1.5 rounded-md transition-colors ${
                tipoGrafico === 'bar' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-400 dark:text-slate-500'
              }`}
              title="Gráfico de barras"
            >
              <BarChart3 size={15} />
            </button>
          </div>
        </div>

        {gastosPorCategoria.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500">Nenhuma despesa lançada este mês ainda.</p>
        ) : tipoGrafico === 'pie' ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gastosPorCategoria}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {gastosPorCategoria.map((c, i) => (
                  <Cell key={i} fill={c.cor} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatarMoeda(v)} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gastosPorCategoria} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-gray-200 dark:stroke-slate-800" />
              <XAxis type="number" tick={{ fontSize: 12 }} className="fill-gray-500 dark:fill-slate-400" />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={100}
                className="fill-gray-500 dark:fill-slate-400"
              />
              <Tooltip formatter={(v) => formatarMoeda(v)} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {gastosPorCategoria.map((c, i) => (
                  <Cell key={i} fill={c.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Card({ titulo, valor, icone: Icone, corIcone, corFundo, destaque }) {
  return (
    <div
      className={`glass-card rounded-xl p-5 transition-transform hover:-translate-y-0.5 ${
        destaque ? 'dark:shadow-glow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 dark:text-slate-400">{titulo}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${corFundo}`}>
          <Icone size={15} className={corIcone} />
        </div>
      </div>
      <p className={`text-xl font-semibold ${corIcone}`}>{formatarMoeda(valor)}</p>
    </div>
  );
}
