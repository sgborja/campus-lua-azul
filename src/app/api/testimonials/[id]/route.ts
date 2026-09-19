import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const status = body.status === 'APPROVED' ? 'APPROVED' : 'PENDING';
    const testimonial = await db.setTestimonialStatus(params.id, status);
    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonio no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    console.error('Error actualizando testimonio:', error);
    return NextResponse.json({ error: 'Error al actualizar el testimonio' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    await db.deleteTestimonial(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando testimonio:', error);
    return NextResponse.json({ error: 'Error al eliminar el testimonio' }, { status: 500 });
  }
}
