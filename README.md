# 🌟 Campus Virtual Lua Azul

Plataforma de formación online y Learning Management System (LMS) desarrollada para **Lua Azul**. Diseñada para ofrecer cursos de encuadernación artesanal, diseño de agendas y papelería, con panel de administración, área de miembros para alumnos, lecciones en video y texto enriquecido, envío de documentación descargable, pasarela de pago con Mercado Pago, evaluaciones interactivas, emisión de certificados oficiales verificables y sistema automatizado de felicitación de cumpleaños con cupones.

---

## 🚀 Funcionalidades Principales

### 1. Panel de Administración (`/admin`)
- **Métricas generales**: Alumnos matriculados, cursos publicados, certificados emitidos y total recaudado vía Mercado Pago.
- **Gestor de Cursos y Contenidos (`/admin/cursos`)**:
  - Crear, editar y eliminar cursos.
  - Configuración de precios en ARS ($) o cursos 100% gratuitos.
  - Añadir módulos y lecciones en **Video** (YouTube, Vimeo o URL directa) o **Texto enriquecido/Guía**.
  - Adjuntar documentación y recursos descargables (PDFs de medidas, plantillas, listas de proveedores).
- **Gestor de Exámenes (`/admin/examenes`)**:
  - Creación de evaluaciones con preguntas de opción múltiple, porcentaje mínimo de aprobación y retroalimentación técnica.
- **Alumnos & Envío de Documentación (`/admin/alumnos`)**:
  - Seguimiento del porcentaje de progreso de cada alumno por curso.
  - Modal para despachar documentación exclusiva o comunicados a los estudiantes.
- **Fidelización y Mails de Cumpleaños (`/admin/cumpleanos`)**:
  - Calendario de agasajados del mes.
  - Vista previa en vivo de la tarjeta festiva con cupón de descuento (`CUMPLELUA25`).
  - Envío automático o manual vía **Resend** o simulador local.
- **Pedidos Mercado Pago (`/admin/pedidos`)**:
  - Historial detallado de pagos acreditados con comprobantes.

---

### 2. Área de Miembros / Campus del Alumno (`/campus`)
- **Dashboard del Estudiante**:
  - Cursos matriculados con barra de avance porcentual.
  - Botón "Continuar Aprendiendo" para retomar la última clase.
  - Banner festivo dinámico si el alumno cumple años en el mes, con cupón de regalo.
- **Aula Virtual Interactiva (`/campus/curso/[slug]`)**:
  - Temario lateral colapsable con checkmarks de lecciones completadas.
  - Reproductor de video HD o lector de guías de texto sin distracciones.
  - Pestaña de **Documentación Descargable**: descarga inmediata de PDFs, plantillas y archivos adjuntos con un clic.
  - Navegación fluida entre clases (*Anterior / Siguiente / Marcar como completada*).
- **Sala de Examen (`/campus/curso/[slug]/examen/[id]`)**:
  - Evaluación interactiva con calificación inmediata y retroalimentación explicativa.
  - Al aprobar con el 100% de clases completadas, se desbloquea el diploma oficial con lluvia de confeti.

---

### 3. Certificados Oficiales con Validez Digital
- **Descarga e Impresión (`/campus/certificados/[id]`)**:
  - Diseño apaisado A4 prémium con bordes dorados, tipografía de gala, logo oficial de Lua Azul y firma de Sabrina Borja.
  - Código único alfanumérico (ej: `LUA-2026-T89K2`).
  - Optimizado para impresión directa y guardado en PDF de alta resolución (`Ctrl + P`).
- **Validador Público (`/verificar/[codigo]`)**:
  - Permite a cualquier cliente, institución o empleador verificar la autenticidad del diploma emitido por Lua Azul.

---

### 4. Pasarela de Pago con Mercado Pago
- Integración con SDK oficial de Mercado Pago para Argentina.
- Creación de preferencias de pago con tarjetas de crédito/débito en cuotas o dinero en cuenta.
- Modo simulación de prueba integrado para testeo local instantáneo con acreditación automática.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend & Backend**: Next.js 14 (App Router) + React 18 + TypeScript.
- **Estilos**: Tailwind CSS con paleta personalizada de Lua Azul (Azul noche, Índigo y detalles dorados).
- **Iconografía**: Lucide React.
- **Pasarela de Pagos**: Mercado Pago SDK v2.
- **Emails Transaccionales**: Plantillas HTML con soporte nativo para Resend y fallback a simulación.
- **Efectos Visuales**: Canvas-confetti para celebración de logros.
- **Base de Datos**: Capa persistente en JSON/SQLite de alta velocidad (lista para conectar con Supabase o PostgreSQL en producción).

---

## 💻 Puesta en Marcha Local

1. Clona o abre el repositorio en la carpeta del Campus:
   ```bash
   npm install
   ```

2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre en tu navegador [http://localhost:3000](http://localhost:3000).

### 🔑 Usuarios de Prueba Preconfigurados (Demo Bar)
La plataforma incluye una barra superior de demostración para alternar de rol con 1 solo clic:
- **Modo Alumno**:
  - Email: `alumno@luaazul.com`
  - Contraseña: `alumno123`
  - Perfil: Valeria Gómez (con cumpleaños configurado en el mes actual para probar el banner y cupones).
- **Modo Administrador**:
  - Email: `admin@luaazul.com`
  - Contraseña: `admin123`
  - Acceso total a `/admin`.

---

## ☁️ Despliegue en Vercel y GitHub

Como ya tienes cuentas en **GitHub**, **Vercel** y **Resend**, el despliegue se realiza en 3 pasos:

### 1. Subir el proyecto a GitHub
```bash
git init
git add .
git commit -m "feat: Campus Virtual Lua Azul completo"
git branch -M main
git remote add origin https://github.com/sgborja/campus-lua-azul.git
git push -u origin main
```

### 2. Importar en Vercel
1. Ve a [vercel.com/new](https://vercel.com/new).
2. Selecciona tu repositorio `campus-lua-azul`.
3. Framework Preset: **Next.js**.

### 3. Configurar Variables de Entorno en Vercel
En la sección **Settings > Environment Variables** de tu proyecto en Vercel, agrega:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | URL de tu dominio (ej: `https://campus.luaazul.com.ar` o tu URL de Vercel) |
| `MP_ACCESS_TOKEN` | Tu Token de Acceso de Mercado Pago (desde developers.mercadopago.com) |
| `RESEND_API_KEY` | Tu API Key de Resend (desde resend.com/api-keys) |

¡Y listo! Vercel compilará y desplegará tu Campus automáticamente.
