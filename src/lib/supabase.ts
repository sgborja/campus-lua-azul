import { createClient } from '@supabase/supabase-js';

// Cliente de servidor con permisos completos (service_role). Nunca importar
// este archivo desde código que corre en el navegador.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    // Supabase-js hace sus requests con fetch, y Next.js cachea todo fetch
    // por default en el App Router salvo que se le diga lo contrario acá.
    // Sin esto, una fila que se acaba de actualizar en la base puede seguir
    // devolviendo el valor viejo durante mucho tiempo (visto en producción:
    // guardar Ajustes "funcionaba" pero al recargar seguía el dato anterior).
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
