import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Rocket, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '../api/client.js';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('carregando'); // 'carregando' | 'sucesso' | 'erro'
  const [mensagem, setMensagem] = useState('');
  const [email, setEmail] = useState('');
  const [reenviando, setReenviando] = useState(false);
  const [avisoReenvio, setAvisoReenvio] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email') || '';
    setEmail(emailParam);

    if (!token || !emailParam) {
      setStatus('erro');
      setMensagem('Link de confirmação inválido.');
      return;
    }

    api
      .verifyEmail(emailParam, token)
      .then((resposta) => {
        setStatus('sucesso');
        setMensagem(resposta.message);
      })
      .catch((err) => {
        setStatus('erro');
        setMensagem(err.message);
      });
  }, [searchParams]);

  async function handleReenviar() {
    setReenviando(true);
    setAvisoReenvio('');
    try {
      const resposta = await api.resendVerification(email);
      setAvisoReenvio(resposta.message);
    } catch (err) {
      setAvisoReenvio(err.message);
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

      <div className="relative z-10 glass-card shadow-xl dark:shadow-glow rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow-sm">
            <Rocket size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-800 dark:text-white">
            Fin<span className="bg-brand-gradient bg-clip-text text-transparent">Pilot</span>
          </h1>
        </div>

        {status === 'carregando' && (
          <>
            <Loader2 size={36} className="mx-auto mb-4 text-neutral-400 dark:text-neutral-500 animate-spin" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Confirmando seu e-mail...</p>
          </>
        )}

        {status === 'sucesso' && (
          <>
            <CheckCircle2 size={36} className="mx-auto mb-4 text-emerald-500 dark:text-emerald-400" />
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">{mensagem}</p>
            <Link
              to="/login"
              className="block w-full bg-brand-gradient hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-medium shadow-glow-sm transition-opacity"
            >
              Ir para o login
            </Link>
          </>
        )}

        {status === 'erro' && (
          <>
            <XCircle size={36} className="mx-auto mb-4 text-red-500 dark:text-red-400" />
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">{mensagem}</p>

            {email && (
              <button
                onClick={handleReenviar}
                disabled={reenviando}
                className="w-full mb-3 bg-brand-gradient hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-medium shadow-glow-sm disabled:opacity-60 transition-opacity"
              >
                {reenviando ? 'Enviando...' : 'Reenviar e-mail de confirmação'}
              </button>
            )}

            {avisoReenvio && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{avisoReenvio}</p>
            )}

            <Link
              to="/login"
              className="block w-full text-center text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              Voltar para o login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
