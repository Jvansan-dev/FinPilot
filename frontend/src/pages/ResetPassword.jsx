import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { api } from '../api/client.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (!token || !email) {
      setErro('Link inválido. Solicite uma nova redefinição de senha.');
      return;
    }

    setCarregando(true);
    try {
      await api.resetPassword(email, token, novaSenha);
      setSucesso(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden px-4">
      <div className="pointer-events-none fixed inset-0 hidden dark:block">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-accent-500/15 rounded-full blur-[120px]" />
      </div>

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
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Crie uma nova senha</p>

        {sucesso ? (
          <p className="text-sm text-green-600 dark:text-green-400">
            Senha redefinida com sucesso! Redirecionando para o login...
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full mb-3 px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              required
              minLength={8}
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full mb-4 px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              required
              minLength={8}
            />

            {erro && <p className="text-sm text-red-500 dark:text-red-400 mb-3">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-brand-gradient hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-medium shadow-glow-sm disabled:opacity-60 transition-opacity"
            >
              {carregando ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </>
        )}

        <Link
          to="/login"
          className="block w-full mt-3 text-center text-sm text-brand-600 dark:text-brand-400 hover:underline"
        >
          Voltar para o login
        </Link>
      </form>
    </div>
  );
}
