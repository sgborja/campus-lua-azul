import fs from 'fs';
import path from 'path';
import {
  User,
  Course,
  Enrollment,
  LessonProgress,
  Certificate,
  Order,
  BirthdayTemplate,
  BirthdayEmailLog,
  QuizAttempt,
} from './types';

interface DatabaseSchema {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  progress: LessonProgress[];
  certificates: Certificate[];
  orders: Order[];
  quizAttempts: QuizAttempt[];
  birthdayTemplate: BirthdayTemplate;
  birthdayLogs: BirthdayEmailLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function getInitialData(): DatabaseSchema {
  const now = new Date().toISOString();
  
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentDay = String(today.getDate()).padStart(2, '0');
  const valeriaBirth = `1995-${currentMonth}-${currentDay}`;

  const users: User[] = [
    {
      id: 'usr_admin',
      name: 'Equipo Lua Azul (Admin)',
      email: 'admin@luaazul.com',
      password: 'admin123',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
    },
    {
      id: 'usr_student1',
      name: 'Valeria Gómez',
      email: 'alumno@luaazul.com',
      password: 'alumno123',
      role: 'STUDENT',
      birthDate: valeriaBirth,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
    },
    {
      id: 'usr_student2',
      name: 'Camila Romero',
      email: 'camila@luaazul.com',
      password: 'alumno123',
      role: 'STUDENT',
      birthDate: '1998-10-15',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
    },
  ];

  // REAL COURSES OF SEMINARIOS LUA AZUL (FROM BRAND STYLE GUIDE)
  const courses: Course[] = [
    {
      id: 'course_flores_bach',
      slug: 'formacion-flores-de-bach',
      title: 'Formación Integral en Terapia Floral: Flores de Bach',
      shortDescription: 'Formación con raíz botánica y profundidad simbólica, para leerte a vos y acompañar a otros.',
      description: `Un camino de estudio serio en terapias florales. Trabajamos las 38 esencias florales del Dr. Edward Bach organizadas por grupos emocionales, profundizando en la signatura botánica de cada planta, los mecanismos del miedo y la incertidumbre, y el método de dilución y dosificación en frascos goteros.\n\nEl curso brinda un mapa claro para sostener procesos propios y acompañar a consultantes con rigor y calidez humana. Incluye vademécum floral completo en PDF y libro guía descargable.`,
      price: 16500,
      isFree: false,
      coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
      category: 'Terapia Floral',
      level: 'Principiante',
      published: true,
      durationHours: 12,
      certificateEnabled: true,
      createdAt: now,
      updatedAt: now,
      resources: [
        {
          id: 'res_fb_1',
          courseId: 'course_flores_bach',
          title: 'Vademécum Completo: Las 38 Flores de Bach (PDF)',
          description: 'Documento editorial de referencia con signatura botánica, estado arquetípico y virtudes.',
          fileUrl: '/docs/Guia-Medidas-A5-LuaAzul.pdf',
          fileType: 'PDF',
          fileSize: '3.8 MB',
          downloadCount: 142,
        },
        {
          id: 'res_fb_2',
          courseId: 'course_flores_bach',
          title: 'Guía de Dilución, Vehículos y Preparación de Goteros',
          description: 'Instrucciones paso a paso sobre porcentajes de brandy/conservante, agua mineral y tintura madre.',
          fileUrl: '/docs/Plantilla-Costura-Copta-LuaAzul.pdf',
          fileType: 'PDF',
          fileSize: '1.4 MB',
          downloadCount: 98,
        },
      ],
      modules: [
        {
          id: 'mod_fb_1',
          courseId: 'course_flores_bach',
          title: 'Módulo 1: Raíz botánica y filosofía del Dr. Bach',
          order: 1,
          lessons: [
            {
              id: 'les_fb_1',
              moduleId: 'mod_fb_1',
              courseId: 'course_flores_bach',
              title: '1.1 Introducción y concepto de la salud como armonía',
              type: 'VIDEO',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              durationMinutes: 22,
              order: 1,
              content: `Este módulo profundiza en los mecanismos florales y la observación de la naturaleza. Tomate el tiempo que necesites para atravesarlo, no hay apuro.\n\nEl Dr. Edward Bach concibió su sistema médico a partir de la botánica de campo en Gales, reconociendo en 38 plantas las respuestas a los patrones anímicos humanos.`,
            },
            {
              id: 'les_fb_2',
              moduleId: 'mod_fb_1',
              courseId: 'course_flores_bach',
              title: '1.2 Los siete grupos emocionales y el primer grupo: el Miedo',
              type: 'TEXT',
              durationMinutes: 18,
              order: 2,
              content: `### El primer grupo emocional: el Miedo\n\nEl miedo es una de las emociones que más bloquea el camino propio. En el sistema de Bach encontramos cinco flores para este umbral:\n\n1. **Rock Rose**: Para el pánico paralizante o el terror repentino.\n2. **Mimulus**: Para los miedos a cosas concretas del mundo cotidiano (miedo a la enfermedad, a la soledad, a hablar en público).\n3. **Cherry Plum**: Para el miedo a perder el control mental o desbordarse.\n4. **Aspen**: Para los temores difusos, presentimientos inexplicables e inquietud sin causa aparente.\n5. **Red Chestnut**: Para la preocupación desmedida y angustiante por el bienestar de los seres queridos.`,
            },
          ],
        },
        {
          id: 'mod_fb_2',
          courseId: 'course_flores_bach',
          title: 'Módulo 2: Elaboración y Preparación Práctica',
          order: 2,
          lessons: [
            {
              id: 'les_fb_2_1',
              moduleId: 'mod_fb_2',
              courseId: 'course_flores_bach',
              title: '2.1 Método de solarización y hervor: dosificación exacta',
              type: 'VIDEO',
              videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
              durationMinutes: 28,
              order: 1,
              content: `En esta clase práctica vemos cómo armar un frasco gotero de tratamiento de 30ml:\n\n- Agua mineral de manantial (70%).\n- Conservante: Coñac o brandy de buena calidad (30%) para preservar la información vibracional.\n- 2 gotas de cada esencia floral seleccionada (hasta 6 flores por fórmula recomendada).\n- Posología habitual: 4 gotas, 4 veces al día debajo de la lengua.`,
            },
          ],
        },
      ],
      quiz: {
        id: 'quiz_flores_bach',
        courseId: 'course_flores_bach',
        title: 'Evaluación del Sistema Floral de Bach',
        description: 'Examen de integración teórica y abordaje clínico para acceder al certificado oficial.',
        passingScorePercent: 75,
        questions: [
          {
            id: 'qfb_1',
            question: '¿Cuál es la flor indicada para miedos de causa conocida y cotidiana?',
            options: ['Aspen', 'Mimulus', 'Rock Rose', 'Cherry Plum'],
            correctOptionIndex: 1,
            explanation: 'Mimulus trabaja los temores identificables del mundo real, mientras que Aspen aborda temores vagos o inexplicables.',
          },
          {
            id: 'qfb_2',
            question: '¿Cuántas gotas de tintura madre floral se colocan por lo general en un gotero de 30ml?',
            options: ['10 gotas', '2 gotas de cada flor', '30 gotas', 'Medio gotero'],
            correctOptionIndex: 1,
            explanation: 'La regla tradicional del Dr. Bach son 2 gotas por esencia seleccionada en un frasco de 30ml (4 gotas si es Rescue Remedy).',
          },
          {
            id: 'qfb_3',
            question: '¿Qué método se utiliza principalmente para las flores más leñosas o de floración temprana en primavera?',
            options: ['Solarización en cuenco de cristal', 'Método de hervor', 'Destilación por arrastre de vapor', 'Maceración en alcohol puro'],
            correctOptionIndex: 1,
            explanation: 'El método de hervor se emplea para árboles, arbustos y flores que florecen cuando el sol aún es débil.',
          },
        ],
      },
    },
    {
      id: 'course_reiki',
      slug: 'reiki-tradicional-usui',
      title: 'Iniciación y Práctica de Reiki Tradicional Usui: Nivel I y II',
      shortDescription: 'Un camino sereno de autotratamiento, armonización energética y comprensión de símbolos sagrados.',
      description: `El Reiki es una práctica pausada y profunda de canalización de energía vital universal. En esta formación abordamos la historia de Mikao Usui, la anatomía sutil y los centros energéticos (chakras), las posiciones de manos para autotratamiento y la integración de los símbolos sagrados del Nivel II.\n\nFormación con rigor ético, sin falsas promesas ni atajos. Con material editorial descargable y seguimiento cercano.`,
      price: 19500,
      isFree: false,
      coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
      category: 'Formación Energética',
      level: 'Principiante',
      published: true,
      durationHours: 10,
      certificateEnabled: true,
      createdAt: now,
      updatedAt: now,
      resources: [
        {
          id: 'res_rk_1',
          courseId: 'course_reiki',
          title: 'Manual de Reiki Usui Tradicional (Niveles I y II)',
          description: 'Libro guía con los principios Gokai, posiciones de manos e historia documentada.',
          fileUrl: '/docs/Proveedores-LuaAzul-2026.pdf',
          fileType: 'PDF',
          fileSize: '4.2 MB',
          downloadCount: 76,
        },
      ],
      modules: [
        {
          id: 'mod_rk_1',
          courseId: 'course_reiki',
          title: 'Módulo 1: Fundamentos y los Cinco Principios (Gokai)',
          order: 1,
          lessons: [
            {
              id: 'les_rk_1',
              moduleId: 'mod_rk_1',
              courseId: 'course_reiki',
              title: '1.1 Los principios de vida y la meditación Gassho',
              type: 'VIDEO',
              videoUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
              durationMinutes: 20,
              order: 1,
              content: `Los cinco principios del Reiki según Mikao Usui no son mandatos, sino anclas diarias:\n\n- Solo por hoy, no te enojes.\n- Solo por hoy, no te preocupes.\n- Sé agradecido.\n- Trabaja con dedicación y honestidad.\n- Sé bondadoso con los demás.`,
            },
          ],
        },
        {
          id: 'mod_rk_2',
          courseId: 'course_reiki',
          title: 'Módulo 2: Autotratamiento y Centros Energéticos',
          order: 2,
          lessons: [
            {
              id: 'les_rk_2',
              moduleId: 'mod_rk_2',
              courseId: 'course_reiki',
              title: '2.1 Posiciones de manos de la cabeza a los pies',
              type: 'TEXT',
              durationMinutes: 15,
              order: 1,
              content: `El autotratamiento dura entre 20 y 45 minutos. Cada posición se sostiene entre 3 y 5 minutos, respirando con calma y sin forzar la intención.`,
            },
          ],
        },
      ],
      quiz: {
        id: 'quiz_reiki',
        courseId: 'course_reiki',
        title: 'Evaluación Ética y Teórica de Reiki Usui',
        description: 'Verificación de principios y protocolos de aplicación.',
        passingScorePercent: 80,
        questions: [
          {
            id: 'qrk_1',
            question: '¿Cuál es la función del autotratamiento de 21 días tras la sintonización?',
            options: [
              'Demostrar poderes mágicos',
              'Permitir que el propio cuerpo y mente asimilen el nuevo flujo energético de forma paulatina',
              'Aprender a cobrar por sesiones',
              'No es necesario realizarlo',
            ],
            correctOptionIndex: 1,
            explanation: 'Los 21 días representan un período de introspección y purificación personal fundamental en la tradición Usui.',
          },
        ],
      },
    },
    {
      id: 'course_runas',
      slug: 'sabiduria-runas-vikingas',
      title: 'Sabiduría y Simbología de las Runas Vikingas: El Elder Futhark',
      shortDescription: 'Un estudio de las 24 runas nórdicas como lenguaje arquetípico y oráculo de autoconocimiento.',
      description: `Las runas no predicen un destino cerrado: funcionan como un mapa simbólico para comprender el momento presente. En este seminario recorreremos las 24 runas del Elder Futhark divididas en los tres Aettir (Freyr, Hagal y Tyr), su raíz mitológica, y el arte de interpretar tiradas con sensibilidad y respeto.`,
      price: 14900,
      isFree: false,
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      category: 'Simbología y Runas',
      level: 'Intermedio',
      published: true,
      durationHours: 8,
      certificateEnabled: true,
      createdAt: now,
      updatedAt: now,
      resources: [
        {
          id: 'res_rn_1',
          courseId: 'course_runas',
          title: 'Guía Simbólica de las 24 Runas del Elder Futhark',
          description: 'Documento completo con glifos, significados tradicionales y lecturas sugeridas.',
          fileUrl: '/docs/Plantilla-Agenda-2026-LuaAzul.pdf',
          fileType: 'PDF',
          fileSize: '3.1 MB',
          downloadCount: 88,
        },
      ],
      modules: [
        {
          id: 'mod_rn_1',
          courseId: 'course_runas',
          title: 'Módulo 1: El Primer Aett — La creación y lo material',
          order: 1,
          lessons: [
            {
              id: 'les_rn_1',
              moduleId: 'mod_rn_1',
              courseId: 'course_runas',
              title: '1.1 De Fehu a Wunjo: las primeras ocho fuerzas',
              type: 'VIDEO',
              videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
              durationMinutes: 25,
              order: 1,
              content: `El primer Aett está dedicado a Freyr y Freyja. Comienza con Fehu (el ganado, el alimento, la energía que circula) y culmina en Wunjo (la alegría y el equilibrio alcanzado).`,
            },
          ],
        },
      ],
      quiz: {
        id: 'quiz_runas',
        courseId: 'course_runas',
        title: 'Evaluación de Simbología Rúnica',
        description: 'Reconocimiento de glifos y arquetipos nórdicos.',
        passingScorePercent: 75,
        questions: [
          {
            id: 'qrn_1',
            question: '¿Qué representa la runa Fehu en el Elder Futhark?',
            options: ['La guerra destructiva', 'El ganado, los bienes móviles y la abundancia que circula', 'El hielo inmóvil', 'La muerte final'],
            correctOptionIndex: 1,
            explanation: 'Fehu simboliza la riqueza móvil y viva que debe compartirse para mantener su vitalidad.',
          },
        ],
      },
    },
    {
      id: 'course_california',
      slug: 'introduccion-flores-de-california',
      title: 'Seminario Abierto: Introducción a las Esencias Florales de California',
      shortDescription: 'Taller formativo sin costo sobre el repertorio floral contemporáneo de FES Quintessentials.',
      description: `Las flores de California complementan el sistema tradicional de Bach abordando temáticas del mundo actual: estrés urbano, expresión creativa, límites saludables y vínculos afectivos. Seminario abierto para dar tus primeros pasos en la botánica vibracional.`,
      price: 0,
      isFree: true,
      coverImage: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&auto=format&fit=crop&q=80',
      category: 'Terapia Floral',
      level: 'Principiante',
      published: true,
      durationHours: 3,
      certificateEnabled: true,
      createdAt: now,
      updatedAt: now,
      resources: [
        {
          id: 'res_cal_1',
          courseId: 'course_california',
          title: 'Guía de Inicio: 12 Esencias Clave de California',
          description: 'Resumen de flores para el estrés y la expresión con sus virtudes terapéuticas.',
          fileUrl: '/docs/Guia-Herramientas-3D-LuaAzul.pdf',
          fileType: 'PDF',
          fileSize: '1.9 MB',
          downloadCount: 240,
        },
      ],
      modules: [
        {
          id: 'mod_cal_1',
          courseId: 'course_california',
          title: 'Módulo Único: El sistema de California',
          order: 1,
          lessons: [
            {
              id: 'les_cal_1',
              moduleId: 'mod_cal_1',
              courseId: 'course_california',
              title: 'Cosmos, Madia y Chamomile: equilibrio en la vida moderna',
              type: 'VIDEO',
              videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
              durationMinutes: 18,
              order: 1,
              content: `Aprenderemos cómo estas esencias ayudan a ordenar el pensamiento disperso y serenar el sistema nervioso.`,
            },
          ],
        },
      ],
      quiz: {
        id: 'quiz_california',
        courseId: 'course_california',
        title: 'Quiz de Integración de Flores de California',
        description: 'Breve evaluación de 2 preguntas.',
        passingScorePercent: 100,
        questions: [
          {
            id: 'qcal_1',
            question: '¿Qué flor de California se recomienda para el pensamiento disperso y la dificultad de concentración?',
            options: ['Madia', 'Sunflower', 'Dandelion', 'Bleeding Heart'],
            correctOptionIndex: 0,
            explanation: 'Madia ayuda a enfocar la atención y evitar la dispersión en momentos de sobrecarga mental.',
          },
        ],
      },
    },
  ];

  // Pre-enroll Valeria in Flores de Bach and California
  const enrollments: Enrollment[] = [
    {
      id: 'enr_1',
      userId: 'usr_student1',
      courseId: 'course_flores_bach',
      enrolledAt: now,
    },
    {
      id: 'enr_2',
      userId: 'usr_student1',
      courseId: 'course_california',
      enrolledAt: now,
      completedAt: now,
    },
  ];

  const progress: LessonProgress[] = [
    {
      userId: 'usr_student1',
      courseId: 'course_flores_bach',
      lessonId: 'les_fb_1',
      completed: true,
      completedAt: now,
    },
    {
      userId: 'usr_student1',
      courseId: 'course_flores_bach',
      lessonId: 'les_fb_2',
      completed: true,
      completedAt: now,
    },
    {
      userId: 'usr_student1',
      courseId: 'course_california',
      lessonId: 'les_cal_1',
      completed: true,
      completedAt: now,
    },
  ];

  const certificates: Certificate[] = [
    {
      id: 'cert_1',
      code: 'LUA-2026-F89B2',
      userId: 'usr_student1',
      userName: 'Valeria Gómez',
      courseId: 'course_california',
      courseTitle: 'Seminario Abierto: Introducción a las Esencias Florales de California',
      issuedAt: now,
      passingScore: 100,
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord_1',
      userId: 'usr_student1',
      userEmail: 'alumno@luaazul.com',
      courseId: 'course_flores_bach',
      courseTitle: 'Formación Integral en Terapia Floral: Flores de Bach',
      amount: 16500,
      currency: 'ARS',
      mpPreferenceId: 'pref_demo_123456',
      mpPaymentId: 'pay_987654321',
      status: 'APPROVED',
      createdAt: now,
    },
  ];

  const quizAttempts: QuizAttempt[] = [
    {
      id: 'att_1',
      quizId: 'quiz_california',
      courseId: 'course_california',
      userId: 'usr_student1',
      scorePercent: 100,
      passed: true,
      submittedAt: now,
      userAnswers: [0],
    },
  ];

  // Birthday template according to Lua Azul tone of voice (serene, warm, not hyperactive)
  const birthdayTemplate: BirthdayTemplate = {
    subject: 'Un saludo especial en tu día desde Lua Azul',
    title: 'Feliz cumpleaños, Valeria. Que este nuevo ciclo tenga el tiempo que merece.',
    message: `Hola [NOMBRE]. Hoy celebramos tu día y tus ganas de seguir aprendiendo. Para acompañarte en tu camino de formación, te preparamos un 25% de descuento en cualquiera de nuestros seminarios y libros usando tu código de regalo.`,
    promoCode: 'CUMPLELUA25',
    discountPercent: 25,
    validDays: 15,
  };

  const birthdayLogs: BirthdayEmailLog[] = [
    {
      id: 'blog_1',
      userId: 'usr_student1',
      userName: 'Valeria Gómez',
      userEmail: 'alumno@luaazul.com',
      sentAt: now,
      promoCode: 'CUMPLELUA25-VAL',
      status: 'SENT',
    },
  ];

  return {
    users,
    courses,
    enrollments,
    progress,
    certificates,
    orders,
    quizAttempts,
    birthdayTemplate,
    birthdayLogs,
  };
}

export function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading database, restoring defaults:', error);
    const initial = getInitialData();
    return initial;
  }
}

export function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

export const db = {
  getUsers: () => getDb().users,
  getUserById: (id: string) => getDb().users.find((u) => u.id === id),
  getUserByEmail: (email: string) =>
    getDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  saveUser: (user: User) => {
    const data = getDb();
    const idx = data.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      data.users[idx] = user;
    } else {
      data.users.push(user);
    }
    saveDb(data);
    return user;
  },

  getCourses: () => getDb().courses,
  getCourseById: (id: string) => getDb().courses.find((c) => c.id === id),
  getCourseBySlug: (slug: string) => getDb().courses.find((c) => c.slug === slug),
  saveCourse: (course: Course) => {
    const data = getDb();
    const idx = data.courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      data.courses[idx] = { ...course, updatedAt: new Date().toISOString() };
    } else {
      data.courses.push({
        ...course,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    saveDb(data);
    return course;
  },
  deleteCourse: (id: string) => {
    const data = getDb();
    data.courses = data.courses.filter((c) => c.id !== id);
    data.enrollments = data.enrollments.filter((e) => e.courseId !== id);
    data.progress = data.progress.filter((p) => p.courseId !== id);
    saveDb(data);
  },

  getEnrollments: () => getDb().enrollments,
  getUserEnrollments: (userId: string) =>
    getDb().enrollments.filter((e) => e.userId === userId),
  isEnrolled: (userId: string, courseId: string) =>
    getDb().enrollments.some((e) => e.userId === userId && e.courseId === courseId),
  enroll: (userId: string, courseId: string) => {
    const data = getDb();
    if (!data.enrollments.some((e) => e.userId === userId && e.courseId === courseId)) {
      const newEnrollment: Enrollment = {
        id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
      };
      data.enrollments.push(newEnrollment);
      saveDb(data);
      return newEnrollment;
    }
    return data.enrollments.find((e) => e.userId === userId && e.courseId === courseId)!;
  },

  getProgress: (userId: string, courseId: string) =>
    getDb().progress.filter((p) => p.userId === userId && p.courseId === courseId),
  toggleLessonProgress: (userId: string, courseId: string, lessonId: string, completed?: boolean) => {
    const data = getDb();
    const existingIdx = data.progress.findIndex(
      (p) => p.userId === userId && p.lessonId === lessonId
    );
    const isComp = completed !== undefined ? completed : (existingIdx >= 0 ? !data.progress[existingIdx].completed : true);
    
    if (existingIdx >= 0) {
      data.progress[existingIdx].completed = isComp;
      data.progress[existingIdx].completedAt = isComp ? new Date().toISOString() : undefined;
    } else {
      data.progress.push({
        userId,
        courseId,
        lessonId,
        completed: isComp,
        completedAt: isComp ? new Date().toISOString() : undefined,
      });
    }
    saveDb(data);
    return isComp;
  },
  getCourseProgressPercent: (userId: string, courseId: string): number => {
    const course = getDb().courses.find((c) => c.id === courseId);
    if (!course) return 0;
    
    let totalLessons = 0;
    course.modules.forEach((m) => {
      totalLessons += m.lessons.length;
    });
    if (totalLessons === 0) return 100;

    const completed = getDb().progress.filter(
      (p) => p.userId === userId && p.courseId === courseId && p.completed
    ).length;

    return Math.min(100, Math.round((completed / totalLessons) * 100));
  },

  getQuizAttempts: (userId: string, quizId: string) =>
    getDb().quizAttempts.filter((a) => a.userId === userId && a.quizId === quizId),
  saveQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'submittedAt'>) => {
    const data = getDb();
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `att_${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    data.quizAttempts.push(newAttempt);
    saveDb(data);
    return newAttempt;
  },

  getCertificates: () => getDb().certificates,
  getUserCertificates: (userId: string) =>
    getDb().certificates.filter((c) => c.userId === userId),
  getCertificateByCode: (code: string) =>
    getDb().certificates.find((c) => c.code.toUpperCase() === code.toUpperCase().trim()),
  getCertificateForCourse: (userId: string, courseId: string) =>
    getDb().certificates.find((c) => c.userId === userId && c.courseId === courseId),
  issueCertificate: (userId: string, courseId: string, passingScore = 100) => {
    const data = getDb();
    const existing = data.certificates.find((c) => c.userId === userId && c.courseId === courseId);
    if (existing) return existing;

    const user = data.users.find((u) => u.id === userId);
    const course = data.courses.find((c) => c.id === courseId);
    if (!user || !course) throw new Error('Usuario o Curso no encontrado');

    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const year = new Date().getFullYear();
    const code = `LUA-${year}-${randomPart}`;

    const newCert: Certificate = {
      id: `cert_${Date.now()}`,
      code,
      userId,
      userName: user.name,
      courseId,
      courseTitle: course.title,
      issuedAt: new Date().toISOString(),
      passingScore,
    };
    data.certificates.push(newCert);

    const enr = data.enrollments.find((e) => e.userId === userId && e.courseId === courseId);
    if (enr) {
      enr.completedAt = new Date().toISOString();
    }

    saveDb(data);
    return newCert;
  },

  getOrders: () => getDb().orders,
  saveOrder: (order: Order) => {
    const data = getDb();
    const idx = data.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      data.orders[idx] = order;
    } else {
      data.orders.push(order);
    }
    saveDb(data);
    return order;
  },
  getOrderByPreferenceId: (prefId: string) =>
    getDb().orders.find((o) => o.mpPreferenceId === prefId),

  getBirthdayTemplate: () => getDb().birthdayTemplate,
  saveBirthdayTemplate: (template: BirthdayTemplate) => {
    const data = getDb();
    data.birthdayTemplate = template;
    saveDb(data);
    return template;
  },
  getBirthdayLogs: () => getDb().birthdayLogs,
  logBirthdayEmail: (log: Omit<BirthdayEmailLog, 'id' | 'sentAt'>) => {
    const data = getDb();
    const newLog: BirthdayEmailLog = {
      ...log,
      id: `blog_${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    data.birthdayLogs.push(newLog);
    saveDb(data);
    return newLog;
  },
  // Reset database with actual brand data
  resetWithInitialData: () => {
    const initial = getInitialData();
    saveDb(initial);
    return initial;
  },
};
