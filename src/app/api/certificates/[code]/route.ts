import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const cert = db.getCertificateByCode(params.code);
  if (!cert) {
    return NextResponse.json({ error: 'Certificado no encontrado o código inválido', valid: false }, { status: 404 });
  }

  const course = db.getCourseById(cert.courseId);

  return NextResponse.json({
    valid: true,
    certificate: cert,
    courseCategory: course?.category,
    courseDuration: course?.durationHours,
  });
}
