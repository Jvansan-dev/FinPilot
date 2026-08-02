import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, Sun, Moon } from 'lucide-react';
import { api } from '../api/client.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Login() {
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [precisaConfirmar, setPrecisaConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setPrecisaConfirmar(false);
    setCarregando(true);
    try {
      if (modo === 'login') {
        const resposta = await api.login(email, senha);
        localStorage.setItem('token', resposta.token);
        navigate('/');
      } else {
        const resposta = await api.register(nome, email, senha);
        setMensagem(resposta.message);
        setModo('login');
      }
    } catch (err) {
      setErro(err.message);
      if (err.message.includes('Confirme seu e-mail')) {
        setPrecisaConfirmar(true);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function handleReenviarConfirmacao() {
    setReenviando(true);
    setErro('');
    try {
      const resposta = await api.resendVerification(email);
      setMensagem(resposta.message);
      setPrecisaConfirmar(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden px-4">
      <div className="pointer-events-none fixed inset-0 hidden dark:block">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-accent-500/15 rounded-full blur-[120px]" />
      </div>

      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-10 p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/70 transition-colors"
        title="Alternar tema"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 glass-card shadow-xl dark:shadow-glow rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow-sm">
            <Rocket size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-800 dark:text-white">
            Fin<span className="bg-brand-gradient bg-clip-text text-transparent">Pilot</span>
          </h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          {modo === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
        </p>

        {modo === 'registro' && (
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full mb-3 px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            required
          />
        )}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          required
        />

        {mensagem && <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3">{mensagem}</p>}
        {erro && <p className="text-sm text-red-500 dark:text-red-400 mb-3">{erro}</p>}

        {precisaConfirmar && (
          <button
            type="button"
            onClick={handleReenviarConfirmacao}
            disabled={reenviando}
            className="w-full mb-3 text-sm text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-60"
          >
            {reenviando ? 'Enviando...' : 'Reenviar e-mail de confirmação'}
          </button>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-brand-gradient hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-medium shadow-glow-sm disabled:opacity-60 transition-opacity"
        >
          {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
        </button>

        {modo === 'login' && (
          <Link
            to="/esqueci-senha"
            className="block w-full mt-3 text-center text-sm text-brand-600 dark:text-brand-400 hover:underline"
          >
            Esqueci minha senha
          </Link>
        )}

        <button
          type="button"
          onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
          className="w-full mt-3 text-sm text-brand-600 dark:text-brand-400 hover:underline"
        >
          {modo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </button>
      </form>
    </div>
  );
}
