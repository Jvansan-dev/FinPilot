// Usamos a API HTTP do Resend (em vez de SMTP) porque provedores como o Render
// bloqueiam as portas de SMTP (25/465/587) no plano free. A API do Resend
// funciona via HTTPS (porta 443), que não é bloqueada.
const RESEND_API_URL = 'https://api.resend.com/emails';

async function enviarEmail({ destinatario, assunto, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY não configurada');
  }

  const remetente = process.env.MAIL_FROM || 'FinPilot <onboarding@resend.dev>';

  const resposta = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: remetente, to: [destinatario], subject: assunto, html }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => '');
    throw new Error(`Falha ao enviar e-mail via Resend (${resposta.status}): ${detalhe}`);
  }
}

export async function sendPasswordResetEmail(destinatario, linkRedefinicao) {
  await enviarEmail({
    destinatario,
    assunto: 'Redefinição de senha - FinPilot',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #18181b;">FinPilot</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no link abaixo para criar uma nova senha. Este link expira em 1 hora.</p>
        <p style="margin: 24px 0;">
          <a href="${linkRedefinicao}" style="background: #18181b; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;">
            Redefinir senha
          </a>
        </p>
        <p style="color: #6B7280; font-size: 13px;">
          Se você não solicitou isso, pode ignorar este e-mail com segurança — sua senha continuará a mesma.
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(destinatario, nome, linkVerificacao) {
  await enviarEmail({
    destinatario,
    assunto: 'Confirme seu e-mail - FinPilot',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #18181b;">FinPilot</h2>
        <p>Olá${nome ? `, ${nome}` : ''}! Falta só um passo para ativar sua conta.</p>
        <p>Clique no link abaixo para confirmar seu e-mail. Este link expira em 24 horas.</p>
        <p style="margin: 24px 0;">
          <a href="${linkVerificacao}" style="background: #18181b; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;">
            Confirmar e-mail
          </a>
        </p>
        <p style="color: #6B7280; font-size: 13px;">
          Se você não criou uma conta no FinPilot, pode ignorar este e-mail com segurança.
        </p>
      </div>
    `,
  });
}
