// backend/src/services/email.service.ts

import nodemailer from 'nodemailer';

// ── Configuración SMTP (Gmail) ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_NAME = process.env.SMTP_FROM_NAME || 'Sistema de Inventario';

// ── Mapeo de roles a español legible ──
function rolLabel(rol: string): string {
  const map: Record<string, string> = {
    OWNER_PRINCIPAL: 'Dueño Principal',
    CO_OWNER: 'Co-Dueño',
    ADMINISTRADOR: 'Administrador',
    EMPLEADO: 'Empleado',
    SUPER_ADMIN: 'Super Administrador',
  };
  return map[rol] || rol;
}

// ── Interfaz de datos para el correo ──
interface WelcomeEmailData {
  destinatario: string;       // correo del nuevo usuario
  nombreCompleto: string;
  rol: string;
  edad?: number | null;
  nombreEmpresa: string;
  contrasena: string;         // CI (contraseña inicial)
  registradoPor: string;      // nombre de quien registra (owner/admin)
  rolRegistrador: string;     // rol de quien registra
}

// ── Template HTML profesional ──
function buildWelcomeHtml(data: WelcomeEmailData): string {
  const rolText = rolLabel(data.rol);
  const edadText = data.edad ? `${data.edad} años` : 'No especificada';
  const registradorRolText = rolLabel(data.rolRegistrador);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f0f14;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f0f14;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background:linear-gradient(145deg,#1a1a24,#16161e);border-radius:24px;border:1px solid rgba(251,113,133,0.15);overflow:hidden;">

          <!-- Header con gradiente -->
          <tr>
            <td style="background:linear-gradient(135deg,#fb7185,#f59e0b);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                🏢 ${data.nombreEmpresa}
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                Bienvenido al equipo
              </p>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#e2e2ea;font-size:15px;margin:0 0 20px;line-height:1.6;">
                Hola <strong style="color:#fb7185;">${data.nombreCompleto}</strong>,
              </p>
              <p style="color:#9ca3af;font-size:14px;margin:0 0 28px;line-height:1.6;">
                <strong style="color:#e2e2ea;">${data.registradoPor}</strong>
                <span style="color:#6b7280;">(${registradorRolText})</span>
                te ha registrado en <strong style="color:#fbbf24;">${data.nombreEmpresa}</strong>.
                A continuación encontrarás tus datos de acceso:
              </p>

              <!-- Tarjeta: Quién te registró -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(56,189,248,0.05);border:1px solid rgba(56,189,248,0.12);border-radius:16px;margin-bottom:20px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#38bdf8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">👤 Registrado por</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:8px 0;color:#9ca3af;font-size:13px;width:100px;">Nombre</td>
                        <td style="padding:8px 0;color:#e2e2ea;font-size:13px;font-weight:600;">${data.registradoPor}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Cargo</td>
                        <td style="padding:8px 0;">
                          <span style="background:rgba(56,189,248,0.15);color:#38bdf8;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">
                            ${registradorRolText}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Empresa</td>
                        <td style="padding:8px 0;color:#fbbf24;font-size:13px;font-weight:600;">${data.nombreEmpresa}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Tarjeta de datos personales -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;margin-bottom:20px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Tu perfil</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:8px 0;color:#9ca3af;font-size:13px;width:100px;">Nombre</td>
                        <td style="padding:8px 0;color:#e2e2ea;font-size:13px;font-weight:600;">${data.nombreCompleto}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Rol</td>
                        <td style="padding:8px 0;">
                          <span style="background:linear-gradient(135deg,#fb7185,#f59e0b);color:#fff;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">
                            ${rolText}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Edad</td>
                        <td style="padding:8px 0;color:#e2e2ea;font-size:13px;">${edadText}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Empresa</td>
                        <td style="padding:8px 0;color:#fbbf24;font-size:13px;font-weight:600;">${data.nombreEmpresa}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Tarjeta de credenciales -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(251,113,133,0.06);border:1px solid rgba(251,113,133,0.15);border-radius:16px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#fb7185;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">🔐 Credenciales de acceso</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:10px 0;color:#9ca3af;font-size:13px;width:100px;">Correo</td>
                        <td style="padding:10px 0;color:#e2e2ea;font-size:14px;font-weight:600;word-break:break-all;">${data.destinatario}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;color:#9ca3af;font-size:13px;">Contraseña</td>
                        <td style="padding:10px 0;">
                          <code style="background:rgba(251,113,133,0.12);color:#fb7185;font-size:16px;font-weight:700;padding:6px 16px;border-radius:8px;letter-spacing:1px;">
                            ${data.contrasena}
                          </code>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Aviso de cambio de contraseña -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.15);border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#fbbf24;font-size:13px;line-height:1.5;">
                      ⚠️ <strong>Importante:</strong> Al iniciar sesión por primera vez, se te pedirá que cambies tu contraseña por una personal y segura.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
              <p style="margin:0;color:#4b5563;font-size:11px;">
                Este correo fue enviado por <strong>${data.registradoPor}</strong> desde ${data.nombreEmpresa}.
              </p>
              <p style="margin:4px 0 0;color:#374151;font-size:10px;">
                Si no reconoces esta cuenta, ignora este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Función principal: enviar correo de bienvenida ──
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  // Si no hay configuración SMTP, solo loguear advertencia
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP no configurado. No se envió correo de bienvenida a:', data.destinatario);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: data.destinatario,
      subject: `Bienvenido a ${data.nombreEmpresa} — Tus credenciales de acceso`,
      html: buildWelcomeHtml(data),
    });
    console.log('✅ Correo de bienvenida enviado a:', data.destinatario);
  } catch (error) {
    console.error('❌ Error enviando correo de bienvenida a', data.destinatario, ':', error);
    // No lanzamos el error — la creación del usuario no debe fallar por el email
  }
}

// ── Template HTML para PIN ──
function buildPinHtml(pin: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f0f14;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f0f14;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background:linear-gradient(145deg,#1a1a24,#16161e);border-radius:24px;border:1px solid rgba(56,189,248,0.15);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#38bdf8,#0284c7);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                Recuperación de Contraseña
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#e2e2ea;font-size:15px;margin:0 0 20px;line-height:1.6;">
                Has solicitado restablecer tu contraseña. Ingresa el siguiente código de 6 dígitos en la aplicación:
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.15);border-radius:16px;margin-bottom:24px;text-align:center;">
                <tr>
                  <td style="padding:30px;">
                    <code style="color:#38bdf8;font-size:32px;font-weight:700;letter-spacing:6px;">
                      ${pin}
                    </code>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.15);border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#fbbf24;font-size:13px;line-height:1.5;">
                      ⚠️ <strong>Nota:</strong> Este código expira en 15 minutos. Si no solicitaste este código, ignora este mensaje.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Función para enviar PIN de recuperación ──
export async function sendPinEmail(destinatario: string, pin: string): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP no configurado. No se envió PIN a:', destinatario);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: `Código de recuperación de contraseña: ${pin}`,
      html: buildPinHtml(pin),
    });
    console.log('✅ Correo de PIN enviado a:', destinatario);
  } catch (error) {
    console.error('❌ Error enviando correo de PIN a', destinatario, ':', error);
    throw new Error('No se pudo enviar el correo de recuperación');
  }
}

