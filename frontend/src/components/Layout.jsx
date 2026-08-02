import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, LayoutDashboard, ArrowLeftRight, Wallet, Tags, Rocket } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { path: '/contas', label: 'Contas', icon: Wallet },
  { path: '/categorias', label: 'Categorias', icon: Tags },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 hidden dark:block">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-10 border-b border-neutral-200 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow-sm">
            <Rocket size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold tracking-tight text-neutral-800 dark:text-white">
            Fin<span className="bg-brand-gradient bg-clip-text text-transparent">Pilot</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const ativo = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  ativo
                    ? 'bg-brand-gradient text-white shadow-glow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-100'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}

          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/70 transition-colors"
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={logout}
            className="ml-1 flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
