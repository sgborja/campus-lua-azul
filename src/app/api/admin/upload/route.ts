import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase';

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB, cubre imágenes y PPT/PPTX livianos
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'El archivo supera el tamaño máximo permitido (8MB)' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
    }

    const sb = createAdminClient();
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await sb.storage
      .from('course-images')
      .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('Error subiendo archivo:', uploadError);
      return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
    }

    const { data } = sb.storage.from('course-images').getPublicUrl(path);
    return NextResponse.json({ success: true, url: data.publicUrl });
  } catch (error) {
    console.error('Error en upload:', error);
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
  }
}
