// Usamos a API HTTP do Resend (em vez de SMTP) porque provedores como o Render
// bloqueiam as portas de SMTP (25/465/587) no plano free. A API do Resend
// funciona via HTTPS (porta 443), que não é bloqueada.
const RESEND_API_URL = 'https://api.resend.com/emails';

export async function sendPasswordResetEmail(destinatario, linkRedefinicao) {
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
    body: JSON.stringify({
      from: remetente,
      to: [destinatario],
      subject: 'Redefinição de senha - FinPilot',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">FinPilot</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <p>Clique no link abaixo para criar uma nova senha. Este link expira em 1 hora.</p>
          <p style="margin: 24px 0;">
            <a href="${linkRedefinicao}" style="background: #4F46E5; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;">
              Redefinir senha
            </a>
          </p>
          <p style="color: #6B7280; font-size: 13px;">
            Se você não solicitou isso, pode ignorar este e-mail com segurança — sua senha continuará a mesma.
          </p>
        </div>
      `,
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => '');
    throw new Error(`Falha ao enviar e-mail via Resend (${resposta.status}): ${detalhe}`);
  }
}
