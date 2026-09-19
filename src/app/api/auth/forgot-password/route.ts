import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { sendOrSimulateEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Falta el email' }, { status: 400 });
    }

    const user = await db.getUserByEmail(email);

    // Siempre respondemos éxito, exista o no la cuenta, para no revelar
    // qué emails están registrados.
    if (user) {
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora
      await db.setPasswordResetToken(user.id, token, expiresAt);

      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = host.startsWith('localhost') ? 'http' : 'https';
      const resetUrl = `${protocol}://${host}/restablecer/${token}`;

      await sendOrSimulateEmail({
        to: user.email,
        toName: user.name,
        subject: 'Recuperar tu contraseña — Campus Lua Azul',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color:#2E4C82;">Recuperar tu contraseña</h2>
            <p>Hola ${user.name}, recibimos un pedido para restablecer tu contraseña del Campus Lua Azul.</p>
            <p><a href="${resetUrl}" style="background:#2E4C82;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Elegir nueva contraseña</a></p>
            <p style="font-size:12px;color:#666;">Este enlace vence en 1 hora. Si no pediste esto, podés ignorar el mensaje.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
