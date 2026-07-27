import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { api } from '../api/client.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setCarregando(true);
    try {
      const resposta = await api.forgotPassword(email);
      setMensagem(resposta.message);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 relative overflow-hidden px-4">
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
          <h1 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-white">
            Fin<span className="bg-brand-gradient bg-clip-text text-transparent">Pilot</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Digite seu e-mail para receber um link de redefinição de senha
        </p>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          required
        />

        {erro && <p className="text-sm text-red-500 dark:text-red-400 mb-3">{erro}</p>}
        {mensagem && <p className="text-sm text-green-600 dark:text-green-400 mb-3">{mensagem}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-brand-gradient hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-medium shadow-glow-sm disabled:opacity-60 transition-opacity"
        >
          {carregando ? 'Enviando...' : 'Enviar link de redefinição'}
        </button>

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
