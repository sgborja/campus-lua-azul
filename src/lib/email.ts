import { db } from './db';
import { BirthdayTemplate } from './types';

export interface EmailPayload {
  to: string;
  toName: string;
  subject: string;
  html: string;
}

export function renderBirthdayEmailHtml({
  userName,
  promoCode,
  discountPercent,
  validDays,
  customMessage,
}: {
  userName: string;
  promoCode: string;
  discountPercent: number;
  validDays: number;
  customMessage?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>¡Feliz Cumpleaños de Lua Azul!</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f5fe; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #c3d8fc; }
    .header { background: linear-gradient(135deg, #0d1838 0%, #203ba7 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: #eab308; color: #0d1838; font-weight: bold; font-size: 13px; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .title { font-size: 26px; font-weight: 800; margin: 0; line-height: 1.2; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .gift-box { background: #f8fafc; border: 2px dashed #437df0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .promo-code { font-family: monospace; font-size: 28px; font-weight: 800; color: #203ba7; letter-spacing: 3px; background: #ffffff; padding: 10px 20px; border-radius: 8px; display: inline-block; border: 1px solid #9ac1f9; margin: 10px 0; }
    .btn { display: inline-block; background: #203ba7; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; text-align: center; margin-top: 15px; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">🎁 ¡Tu Día Especial! 🎂</div>
      <h1 class="title">¡Muy Feliz Cumpleaños, ${userName}!</h1>
      <p style="margin: 8px 0 0; color: #c3d8fc; font-size: 15px;">Te desea todo el equipo de Lua Azul</p>
    </div>
    <div class="content">
      <p>Hola <strong>${userName}</strong>,</p>
      <p>${customMessage || '¡Hoy festejamos tu vida y tus ganas de seguir creando! En Lua Azul creemos que cada año nuevo es una oportunidad perfecta para iniciar proyectos apasionantes.'}</p>
      
      <div class="gift-box">
        <p style="margin: 0 0 6px; font-weight: 600; color: #0d1838;">Tu regalo exclusivo de cumpleaños:</p>
        <div style="font-size: 32px; font-weight: 900; color: #ca8a04;">${discountPercent}% DE DESCUENTO</div>
        <p style="font-size: 13px; color: #64748b; margin: 4px 0 12px;">Válido durante los próximos ${validDays} días para cualquier curso del Campus o insumo en la tienda.</p>
        <div class="promo-code">${promoCode}</div>
        <div>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/campus" class="btn">Ir al Campus y Usar mi Regalo ✨</a>
        </div>
      </div>

      <p style="font-size: 14px; color: #475569;">¡Que disfrutes mucho de tu día rodeada/o de amor y buena energía!</p>
      <p style="margin-top: 20px; font-weight: 600; color: #1e3583;">Con cariño,<br/>Sabrina Borja & Equipo Lua Azul</p>
    </div>
    <div class="footer">
      <p style="margin: 0;">Lua Azul — Encuadernación, Agendas y Creaciones con Alma</p>
      <p style="margin: 4px 0 0;">luaazul.com.ar • Buenos Aires, Argentina</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function renderWelcomeCourseEmailHtml({
  userName,
  courseTitle,
  courseUrl,
}: {
  userName: string;
  courseTitle: string;
  courseUrl: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>¡Bienvenida/o al curso!</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f5fe; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 14px; padding: 32px; box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
    .btn { display: inline-block; background: #203ba7; color: #fff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="color: #0d1838; margin-top: 0;">🎉 ¡Tu acceso ya está activo!</h2>
    <p>Hola <strong>${userName}</strong>,</p>
    <p>Te confirmamos que ya estás matriculada/o en:</p>
    <div style="background: #eef4ff; border-left: 4px solid #2b5ee5; padding: 14px; margin: 16px 0; border-radius: 4px;">
      <strong style="color: #1e3583; font-size: 17px;">${courseTitle}</strong>
    </div>
    <p>Ya puedes acceder a todos los módulos en video, lecturas y descargar las guías en PDF desde tu área de miembros.</p>
    <a href="${courseUrl}" class="btn">Comenzar a Cursar Ahora 📚</a>
  </div>
</body>
</html>
  `.trim();
}

// Send or simulate sending email
export async function sendOrSimulateEmail(payload: EmailPayload): Promise<{ success: boolean; simulated: boolean }> {
  // If RESEND_API_KEY is available, we can send via Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Campus Lua Azul <campus@luaazul.com.ar>',
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });
      if (res.ok) {
        return { success: true, simulated: false };
      }
    } catch (e) {
      console.warn('Resend send failed, fallback to simulation:', e);
    }
  }

  // Local simulated delivery log
  console.log(`[EMAIL SIMULATION] To: ${payload.to} (${payload.toName}) | Subject: ${payload.subject}`);
  return { success: true, simulated: true };
}

// Birthday checker helper
export async function checkUpcomingBirthdays(daysAhead = 7) {
  const users = (await db.getUsers()).filter((u) => u.role === 'STUDENT' && u.birthDate);
  const today = new Date();
  
  const results = [];

  for (const user of users) {
    if (!user.birthDate) continue;
    const parts = user.birthDate.split('-');
    if (parts.length < 3) continue;
    
    const birthMonth = parseInt(parts[1], 10) - 1; // 0-11
    const birthDay = parseInt(parts[2], 10);

    // Date for this year's birthday
    const thisYearBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
    
    // Check diff in days
    const diffTime = thisYearBirthday.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isToday = diffDays === 0;
    const isUpcoming = diffDays > 0 && diffDays <= daysAhead;

    if (isToday || isUpcoming) {
      results.push({
        user,
        diffDays,
        isToday,
        birthdayFormatted: `${String(birthDay).padStart(2, '0')}/${String(birthMonth + 1).padStart(2, '0')}`,
      });
    }
  }

  return results;
}
