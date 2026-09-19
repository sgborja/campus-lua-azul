import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const wantsAdminView = url.searchParams.get('admin') === 'true';

  if (wantsAdminView) {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const testimonials = await db.getAllTestimonials();
    return NextResponse.json({ testimonials });
  }

  const testimonials = await db.getApprovedTestimonials();
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para enviar un testimonio' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const message = String(body.message || '').trim();
    const rating = Number(body.rating);

    if (!message) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La calificación debe ser de 1 a 5' }, { status: 400 });
    }

    const testimonial = await db.createTestimonial({
      userId: user.id,
      userName: user.name,
      courseTitle: body.courseTitle ? String(body.courseTitle).trim() : undefined,
      message,
      rating,
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    console.error('Error creando testimonio:', error);
    return NextResponse.json({ error: 'Error al enviar el testimonio' }, { status: 500 });
  }
}
