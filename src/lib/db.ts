import fs from 'fs';
import path from 'path';
import {
  User,
  UserRole,
  Course,
  Enrollment,
  LessonProgress,
  Certificate,
  Order,
  BirthdayTemplate,
  BirthdayEmailLog,
  QuizAttempt,
  Quiz,
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

const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NODE_ENV === 'production'
);

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(LOCAL_DATA_DIR, 'db.json');
const TMP_DB_FILE = path.join('/tmp', 'lua_azul_db.json');

const globalStore = global as unknown as { __lua_azul_db?: DatabaseSchema };

function getInitialData(): DatabaseSchema {
  const now = new Date().toISOString();

  // ONLY Sabrina Borja as Administrator
  const users: User[] = [
    {
      id: 'usr_sabrina',
      name: 'Sabrina Borja',
      email: 'sgborja@gmail.com',
      password: 'admin123',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
    },
  ];

  // Clean empty courses array for the administrator to populate
  const courses: Course[] = [];
  const enrollments: Enrollment[] = [];
  const progress: LessonProgress[] = [];
  const certificates: Certificate[] = [];
  const orders: Order[] = [];
  const quizAttempts: QuizAttempt[] = [];

  const birthdayTemplate: BirthdayTemplate = {
    subject: 'Un saludo especial en tu día desde Lua Azul',
    title: 'Feliz cumpleaños. Que este nuevo ciclo tenga el tiempo que merece.',
    message: `Hola [NOMBRE]. Hoy celebramos tu día y tus ganas de seguir aprendiendo. Para acompañarte en tu camino de formación, te preparamos un 25% de descuento en cualquiera de nuestros seminarios y libros usando tu código de regalo.`,
    promoCode: 'CUMPLELUA25',
    discountPercent: 25,
    validDays: 15,
  };

  const birthdayLogs: BirthdayEmailLog[] = [];

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
  if (globalStore.__lua_azul_db) {
    return globalStore.__lua_azul_db;
  }

  // 1. Try reading from /tmp if in serverless/production
  if (IS_SERVERLESS && fs.existsSync(TMP_DB_FILE)) {
    try {
      const raw = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const data = JSON.parse(raw) as DatabaseSchema;
      globalStore.__lua_azul_db = data;
      return data;
    } catch (e) {
      console.error('Error reading from TMP_DB_FILE:', e);
    }
  }

  // 2. Try reading from local data/db.json
  if (fs.existsSync(LOCAL_DB_FILE)) {
    try {
      const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
      const data = JSON.parse(raw) as DatabaseSchema;
      globalStore.__lua_azul_db = data;
      return data;
    } catch (e) {
      console.error('Error reading LOCAL_DB_FILE:', e);
    }
  }

  // 3. Fallback to initial data
  const initial = getInitialData();
  globalStore.__lua_azul_db = initial;
  saveDb(initial);
  return initial;
}

export function saveDb(data: DatabaseSchema): void {
  globalStore.__lua_azul_db = data;
  const jsonStr = JSON.stringify(data, null, 2);

  // Write to /tmp in serverless/production environments (where it's writable)
  if (IS_SERVERLESS) {
    try {
      fs.writeFileSync(TMP_DB_FILE, jsonStr, 'utf-8');
    } catch (e) {
      console.error('Error writing to TMP_DB_FILE:', e);
    }
  }

  // Also write to local file system when possible (local dev)
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_FILE, jsonStr, 'utf-8');
  } catch (error) {
    // Expected on read-only serverless filesystems
  }
}

export const db = {
  // USERS & ROLES
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
  updateUserRole: (userId: string, newRole: UserRole) => {
    const data = getDb();
    const user = data.users.find((u) => u.id === userId);
    if (user) {
      user.role = newRole;
      saveDb(data);
      return user;
    }
    return null;
  },
  deleteUser: (userId: string) => {
    const data = getDb();
    data.users = data.users.filter((u) => u.id !== userId);
    data.enrollments = data.enrollments.filter((e) => e.userId !== userId);
    data.progress = data.progress.filter((p) => p.userId !== userId);
    data.certificates = data.certificates.filter((c) => c.userId !== userId);
    saveDb(data);
  },

  // COURSES
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
  saveCourseQuiz: (courseId: string, quiz: Quiz) => {
    const data = getDb();
    const course = data.courses.find((c) => c.id === courseId);
    if (course) {
      course.quiz = quiz;
      course.updatedAt = new Date().toISOString();
      saveDb(data);
      return course;
    }
    return null;
  },
  deleteCourseQuiz: (courseId: string) => {
    const data = getDb();
    const course = data.courses.find((c) => c.id === courseId);
    if (course) {
      course.quiz = undefined;
      course.updatedAt = new Date().toISOString();
      saveDb(data);
      return course;
    }
    return null;
  },

  // ENROLLMENTS
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

  // PROGRESS
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

  // QUIZZES
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

  // CERTIFICATES
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

  // ORDERS
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

  // BIRTHDAYS
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

  resetWithInitialData: () => {
    const initial = getInitialData();
    saveDb(initial);
    return initial;
  },
};

export function getModelCourse(): Course {
  const ts = Date.now();
  const courseId = `course_${ts}`;
  const mod1Id = `mod_${ts}_1`;
  const mod2Id = `mod_${ts}_2`;

  return {
    id: courseId,
    slug: 'seminario-flores-de-bach',
    title: 'Seminario de Flores de Bach y Arquetipos Florales',
    shortDescription: 'Formación profunda en el sistema floral del Dr. Edward Bach, métodos de preparación y acompañamiento emocional.',
    description: 'Aprende en profundidad los 38 remedios florales, los 7 grupos emocionales y la elaboración de fórmulas personalizadas. Este seminario integra la botánica sutil con la práctica de acompañamiento consciente bajo la filosofía de Lua Azul.',
    price: 18500,
    isFree: false,
    coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
    category: 'Terapia Floral',
    level: 'Principiante',
    published: true,
    durationHours: 12,
    certificateEnabled: true,
    modules: [
      {
        id: mod1Id,
        courseId,
        title: 'Módulo 1: Filosofía Floral y los 7 Grupos Emocionales',
        order: 1,
        lessons: [
          {
            id: `les_${ts}_1`,
            moduleId: mod1Id,
            courseId,
            title: '1.1 Introducción a la filosofía del Dr. Edward Bach',
            type: 'VIDEO',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            durationMinutes: 20,
            order: 1,
            content: 'En esta clase introductoria exploramos los fundamentos de la salud según la perspectiva floral: la armonía entre el alma y la personalidad, y el papel de las flores silvestres.',
          },
          {
            id: `les_${ts}_2`,
            moduleId: mod1Id,
            courseId,
            title: '1.2 Guía de los 7 grupos emocionales y sus 38 esencias',
            type: 'TEXT',
            durationMinutes: 25,
            order: 2,
            content: 'Texto descriptivo completo con las características de cada uno de los 7 grupos emocionales (miedos, incertidumbre, desinterés en el presente, soledad, hipersensibilidad, desesperación y preocupación excesiva por los demás).',
          },
        ],
      },
      {
        id: mod2Id,
        courseId,
        title: 'Módulo 2: Preparación, Posología y Rescue Remedy',
        order: 2,
        lessons: [
          {
            id: `les_${ts}_3`,
            moduleId: mod2Id,
            courseId,
            title: '2.1 Elaboración de goteros y método de solarización',
            type: 'VIDEO',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            durationMinutes: 18,
            order: 1,
            content: 'Paso a paso de la preparación de frascos de tratamiento de 30ml, proporciones de agua mineral y brandy conservante.',
          },
        ],
      },
    ],
    resources: [
      {
        id: `res_${ts}_1`,
        courseId,
        title: 'Guía de Estudio en PDF: Repertorio Floral Lua Azul',
        description: 'Compendio botánico de las 38 flores y fichas de prescripción.',
        fileUrl: '/docs/Guia-Medidas-A5-LuaAzul.pdf',
        fileType: 'PDF',
        fileSize: '3.4 MB',
        downloadCount: 0,
      },
    ],
    quiz: {
      id: `quiz_${ts}`,
      courseId,
      title: 'Evaluación Final: Sistema de Flores de Bach',
      description: 'Cuestionario de acreditación para la emisión de tu certificado oficial Lua Azul.',
      passingScorePercent: 80,
      questions: [
        {
          id: 'q1',
          question: '¿Cuál es el método principal utilizado para flores que florecen en pleno verano bajo sol radiante?',
          options: [
            'Método de ebullición o cocción',
            'Método de maceración solar (solarización)',
            'Destilación por vapor al vacío',
            'Prensado en frío artesanal',
          ],
          correctOptionIndex: 1,
          explanation: 'El método de solarización aprovecha la energía lumínica del sol en la mañana para transferir el patrón energético del pétalo al agua pura de manantial.',
        },
        {
          id: 'q2',
          question: '¿Cuántas esencias componen la fórmula de emergencia clásica (Rescue Remedy)?',
          options: ['3 esencias', '5 esencias', '7 esencias', '12 esencias'],
          correctOptionIndex: 1,
          explanation: 'Rescue Remedy está compuesto por 5 esencias: Rock Rose, Impatiens, Clematis, Star of Bethlehem y Cherry Plum.',
        },
        {
          id: 'q3',
          question: '¿Qué aspecto primordial buscaba equilibrar el Dr. Edward Bach en sus consultantes?',
          options: [
            'Únicamente los síntomas corporales aislados',
            'El conflicto entre el propósito del Alma y los actos de la Personalidad',
            'El rendimiento muscular en tareas pesadas',
            'La temperatura corporal en cambios de estación',
          ],
          correctOptionIndex: 1,
          explanation: 'Bach postulaba que el malestar surge cuando hay una disonancia o tensión entre el camino espiritual del ser y las actitudes de la personalidad cotidiana.',
        },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
