import { useEffect, useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ComposedChart, Area, Line,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChartIcon, BarChart3, LineChartIcon } from 'lucide-react';
import { api } from '../api/client.js';

const CORES = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

// Escurece um hex em `percent` (0-1) — usado pra montar o degradê "3D"
// (claro em cima / escuro embaixo, como as barras/pizza do Power BI).
function escurecer(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - percent)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - percent)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - percent)));
  return `rgb(${r}, ${g}, ${b})`;
}

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

  // A partir de agora o backend já manda `valor` com o sinal certo
  // (despesa negativa, receita positiva) — então o saldo é só a soma direta.
  const receitas = transacoes.filter((t) => t.tipo === 'receita').reduce((s, t) => s + Number(t.valor), 0);
  const despesas = Math.abs(transacoes.filter((t) => t.tipo === 'despesa').reduce((s, t) => s + Number(t.valor), 0));
  const saldo = transacoes.reduce((s, t) => s + Number(t.valor), 0);

  const gastosPorCategoria = categorias
    .map((c, i) => ({
      name: c.nome,
      value: Math.abs(
        transacoes
          .filter((t) => t.category_id === c.id && t.tipo === 'despesa')
          .reduce((s, t) => s + Number(t.valor), 0)
      ),
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
      else grupos[chave].despesas += Math.abs(Number(t.valor));
    });
    return Object.values(grupos)
      .sort((a, b) => a.chave.localeCompare(b.chave))
      .slice(-6);
  }, [todasTransacoes]);

  if (carregando) return <p className="text-neutral-500 dark:text-neutral-400">Carregando...</p>;
  if (erro) return <p className="text-red-500 dark:text-red-400">{erro}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-800 dark:text-white mb-6">Este mês</h1>

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
          <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-4 flex items-center gap-2">
            <LineChartIcon size={15} className="text-brand-500 dark:text-brand-400" />
            Evolução (últimos {evolucaoMensal.length} meses)
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={evolucaoMensal} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="areaDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
                <filter id="linhaSombra" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-neutral-200 dark:stroke-neutral-800" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} className="fill-neutral-500 dark:fill-neutral-400" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} className="fill-neutral-500 dark:fill-neutral-400" width={40} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => formatarMoeda(v)}
                contentStyle={{ borderRadius: 10, fontSize: 13, border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.35)' }}
              />
              <Legend />
              <Area type="monotone" dataKey="receitas" name="Receitas" stroke="none" fill="url(#areaReceitas)" />
              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="none" fill="url(#areaDespesas)" />
              <Line
                type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={3}
                dot={{ r: 3.5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} filter="url(#linhaSombra)" legendType="none"
              />
              <Line
                type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={3}
                dot={{ r: 3.5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} filter="url(#linhaSombra)" legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Gastos por categoria</h2>
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/70 rounded-lg p-1">
            <button
              onClick={() => setTipoGrafico('pie')}
              className={`p-1.5 rounded-md transition-colors ${
                tipoGrafico === 'pie' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-400 dark:text-neutral-500'
              }`}
              title="Gráfico de pizza"
            >
              <PieChartIcon size={15} />
            </button>
            <button
              onClick={() => setTipoGrafico('bar')}
              className={`p-1.5 rounded-md transition-colors ${
                tipoGrafico === 'bar' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'text-neutral-400 dark:text-neutral-500'
              }`}
              title="Gráfico de barras"
            >
              <BarChart3 size={15} />
            </button>
          </div>
        </div>

        {gastosPorCategoria.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Nenhuma despesa lançada este mês ainda.</p>
        ) : tipoGrafico === 'pie' ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                {gastosPorCategoria.map((c, i) => (
                  <linearGradient key={i} id={`fatia-${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={c.cor} />
                    <stop offset="100%" stopColor={escurecer(c.cor, 0.35)} />
                  </linearGradient>
                ))}
                <filter id="pizzaSombra" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.28" />
                </filter>
              </defs>
              <Pie
                data={gastosPorCategoria}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={104}
                paddingAngle={2}
                cornerRadius={4}
                stroke="none"
                filter="url(#pizzaSombra)"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {gastosPorCategoria.map((c, i) => (
                  <Cell key={i} fill={`url(#fatia-${i})`} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatarMoeda(v)} contentStyle={{ borderRadius: 10, fontSize: 13, border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.35)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gastosPorCategoria} layout="vertical" margin={{ left: 20 }}>
              <defs>
                {gastosPorCategoria.map((c, i) => (
                  <linearGradient key={i} id={`barra-${i}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={escurecer(c.cor, 0.15)} />
                    <stop offset="100%" stopColor={c.cor} />
                  </linearGradient>
                ))}
                <filter id="barraSombra" x="-20%" y="-40%" width="140%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-neutral-200 dark:stroke-neutral-800" />
              <XAxis type="number" tick={{ fontSize: 12 }} className="fill-neutral-500 dark:fill-neutral-400" axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={100}
                className="fill-neutral-500 dark:fill-neutral-400"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v) => formatarMoeda(v)} contentStyle={{ borderRadius: 10, fontSize: 13, border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.35)' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} filter="url(#barraSombra)" maxBarSize={28}>
                {gastosPorCategoria.map((c, i) => (
                  <Cell key={i} fill={`url(#barra-${i})`} />
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
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{titulo}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${corFundo}`}>
          <Icone size={15} className={corIcone} />
        </div>
      </div>
      <p className={`text-xl font-semibold ${corIcone}`}>{formatarMoeda(valor)}</p>
    </div>
  );
}
