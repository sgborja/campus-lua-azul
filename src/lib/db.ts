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
