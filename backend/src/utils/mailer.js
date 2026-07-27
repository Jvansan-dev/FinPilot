import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(destinatario, linkRedefinicao) {
  const mailOptions = {
    from: `FinPilot <${process.env.GMAIL_USER}>`,
    to: destinatario,
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
  };

  await getTransporter().sendMail(mailOptions);
}
