import { createAdminClient } from './supabase';
import {
  User,
  UserRole,
  Course,
  Module,
  Resource,
  Enrollment,
  LessonProgress,
  Certificate,
  Order,
  BirthdayTemplate,
  BirthdayEmailLog,
  QuizAttempt,
  Quiz,
  SiteSettings,
  Testimonial,
  Coupon,
} from './types';

const sb = createAdminClient();

function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`No se encontró: ${what}`);
  return value;
}

// ---------- Mappers: fila de Postgres (snake_case) <-> tipo de la app (camelCase) ----------

function rowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password_hash,
    role: row.role,
    birthDate: row.birth_date ?? undefined,
    avatar: row.avatar ?? undefined,
    createdAt: row.created_at,
  };
}

function userToRow(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password_hash: user.password,
    role: user.role,
    birth_date: user.birthDate ?? null,
    avatar: user.avatar ?? null,
    created_at: user.createdAt,
  };
}

function rowToCourse(row: any): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price),
    isFree: row.is_free,
    priceOnRequest: row.price_on_request ?? false,
    coverImage: row.cover_image,
    category: row.category,
    level: row.level,
    published: row.published,
    durationHours: Number(row.duration_hours),
    certificateEnabled: row.certificate_enabled,
    modules: (row.modules ?? []) as Module[],
    resources: (row.resources ?? []) as Resource[],
    quiz: (row.quiz ?? undefined) as Quiz | undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function courseToRow(course: Course) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    short_description: course.shortDescription,
    description: course.description,
    price: course.price,
    is_free: course.isFree,
    price_on_request: course.priceOnRequest ?? false,
    cover_image: course.coverImage,
    category: course.category,
    level: course.level,
    published: course.published,
    duration_hours: course.durationHours,
    certificate_enabled: course.certificateEnabled,
    modules: course.modules ?? [],
    resources: course.resources ?? [],
    quiz: course.quiz ?? null,
    created_at: course.createdAt,
    updated_at: course.updatedAt,
  };
}

function rowToEnrollment(row: any): Enrollment {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at ?? undefined,
  };
}

function rowToProgress(row: any): LessonProgress {
  return {
    userId: row.user_id,
    courseId: row.course_id,
    lessonId: row.lesson_id,
    completed: row.completed,
    completedAt: row.completed_at ?? undefined,
  };
}

function rowToQuizAttempt(row: any): QuizAttempt {
  return {
    id: row.id,
    quizId: row.quiz_id,
    courseId: row.course_id,
    userId: row.user_id,
    scorePercent: Number(row.score_percent),
    passed: row.passed,
    submittedAt: row.submitted_at,
    userAnswers: row.user_answers ?? [],
  };
}

function rowToCertificate(row: any): Certificate {
  return {
    id: row.id,
    code: row.code,
    userId: row.user_id,
    userName: row.user_name,
    courseId: row.course_id,
    courseTitle: row.course_title,
    issuedAt: row.issued_at,
    passingScore: row.passing_score !== null ? Number(row.passing_score) : undefined,
  };
}

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    courseId: row.course_id,
    courseTitle: row.course_title,
    amount: Number(row.amount),
    currency: row.currency,
    mpPreferenceId: row.mp_preference_id,
    mpPaymentId: row.mp_payment_id ?? undefined,
    status: row.status,
    couponCode: row.coupon_code ?? undefined,
    createdAt: row.created_at,
  };
}

function orderToRow(order: Order) {
  return {
    id: order.id,
    user_id: order.userId,
    user_email: order.userEmail,
    course_id: order.courseId,
    course_title: order.courseTitle,
    amount: order.amount,
    currency: order.currency,
    mp_preference_id: order.mpPreferenceId,
    mp_payment_id: order.mpPaymentId ?? null,
    status: order.status,
    coupon_code: order.couponCode ?? null,
    created_at: order.createdAt,
  };
}

function rowToBirthdayTemplate(row: any): BirthdayTemplate {
  return {
    subject: row.subject,
    title: row.title,
    message: row.message,
    promoCode: row.promo_code,
    discountPercent: Number(row.discount_percent),
    validDays: row.valid_days,
  };
}

function rowToCoupon(row: any): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountPercent: Number(row.discount_percent),
    courseId: row.course_id ?? undefined,
    maxUses: row.max_uses ?? undefined,
    usedCount: row.used_count,
    expiresAt: row.expires_at ?? undefined,
    active: row.active,
    createdAt: row.created_at,
  };
}

function rowToTestimonial(row: any): Testimonial {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    userName: row.user_name,
    courseTitle: row.course_title || undefined,
    message: row.message,
    rating: row.rating,
    status: row.status,
    createdAt: row.created_at,
  };
}

function rowToBirthdayLog(row: any): BirthdayEmailLog {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    sentAt: row.sent_at,
    promoCode: row.promo_code,
    status: row.status,
  };
}

export const db = {
  // USERS & ROLES
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await sb.from('users').select('*');
    if (error) throw error;
    return (data ?? []).map(rowToUser);
  },
  getUserById: async (id: string): Promise<User | undefined> => {
    const { data, error } = await sb.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? rowToUser(data) : undefined;
  },
  getUserByEmail: async (email: string): Promise<User | undefined> => {
    const { data, error } = await sb.from('users').select('*').ilike('email', email).maybeSingle();
    if (error) throw error;
    return data ? rowToUser(data) : undefined;
  },
  saveUser: async (user: User): Promise<User> => {
    const { data, error } = await sb.from('users').upsert(userToRow(user)).select().single();
    if (error) throw error;
    return rowToUser(data);
  },
  updateUserRole: async (userId: string, newRole: UserRole): Promise<User | null> => {
    const { data, error } = await sb
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? rowToUser(data) : null;
  },
  deleteUser: async (userId: string): Promise<void> => {
    const { error } = await sb.from('users').delete().eq('id', userId);
    if (error) throw error;
  },
  updateUserAvatar: async (userId: string, avatar: string): Promise<void> => {
    const { error } = await sb.from('users').update({ avatar }).eq('id', userId);
    if (error) throw error;
  },
  updateUserPassword: async (userId: string, passwordHash: string): Promise<void> => {
    const { error } = await sb
      .from('users')
      .update({ password_hash: passwordHash, reset_token: null, reset_token_expires: null })
      .eq('id', userId);
    if (error) throw error;
  },
  setPasswordResetToken: async (userId: string, token: string, expiresAt: string): Promise<void> => {
    const { error } = await sb
      .from('users')
      .update({ reset_token: token, reset_token_expires: expiresAt })
      .eq('id', userId);
    if (error) throw error;
  },
  getUserByResetToken: async (token: string): Promise<User | undefined> => {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .gt('reset_token_expires', new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data ? rowToUser(data) : undefined;
  },

  // COURSES
  getCourses: async (): Promise<Course[]> => {
    const { data, error } = await sb.from('courses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToCourse);
  },
  getCourseById: async (id: string): Promise<Course | undefined> => {
    const { data, error } = await sb.from('courses').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? rowToCourse(data) : undefined;
  },
  getCourseBySlug: async (slug: string): Promise<Course | undefined> => {
    const { data, error } = await sb.from('courses').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data ? rowToCourse(data) : undefined;
  },
  saveCourse: async (course: Course): Promise<Course> => {
    const { data, error } = await sb.from('courses').upsert(courseToRow(course)).select().single();
    if (error) throw error;
    return rowToCourse(data);
  },
  deleteCourse: async (id: string): Promise<void> => {
    const { error } = await sb.from('courses').delete().eq('id', id);
    if (error) throw error;
  },
  saveCourseQuiz: async (courseId: string, quiz: Quiz): Promise<Course | null> => {
    const { data, error } = await sb
      .from('courses')
      .update({ quiz, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCourse(data) : null;
  },
  deleteCourseQuiz: async (courseId: string): Promise<Course | null> => {
    const { data, error } = await sb
      .from('courses')
      .update({ quiz: null, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCourse(data) : null;
  },

  // ENROLLMENTS
  getEnrollments: async (): Promise<Enrollment[]> => {
    const { data, error } = await sb.from('enrollments').select('*');
    if (error) throw error;
    return (data ?? []).map(rowToEnrollment);
  },
  getUserEnrollments: async (userId: string): Promise<Enrollment[]> => {
    const { data, error } = await sb.from('enrollments').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map(rowToEnrollment);
  },
  isEnrolled: async (userId: string, courseId: string): Promise<boolean> => {
    const { data, error } = await sb
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },
  enroll: async (userId: string, courseId: string): Promise<Enrollment> => {
    const { data: existing, error: findErr } = await sb
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    if (findErr) throw findErr;
    if (existing) return rowToEnrollment(existing);

    const newEnrollment = {
      id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
    };
    const { data, error } = await sb.from('enrollments').insert(newEnrollment).select().single();
    if (error) throw error;
    return rowToEnrollment(data);
  },

  // PROGRESS
  getProgress: async (userId: string, courseId: string): Promise<LessonProgress[]> => {
    const { data, error } = await sb
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);
    if (error) throw error;
    return (data ?? []).map(rowToProgress);
  },
  toggleLessonProgress: async (
    userId: string,
    courseId: string,
    lessonId: string,
    completed?: boolean
  ): Promise<boolean> => {
    const { data: existing, error: findErr } = await sb
      .from('lesson_progress')
      .select('completed')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    if (findErr) throw findErr;

    const isComp = completed !== undefined ? completed : existing ? !existing.completed : true;

    const { error } = await sb.from('lesson_progress').upsert({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      completed: isComp,
      completed_at: isComp ? new Date().toISOString() : null,
    });
    if (error) throw error;
    return isComp;
  },
  getCourseProgressPercent: async (userId: string, courseId: string): Promise<number> => {
    const course = await db.getCourseById(courseId);
    if (!course) return 0;

    let totalLessons = 0;
    course.modules.forEach((m) => {
      totalLessons += m.lessons.length;
    });
    if (totalLessons === 0) return 100;

    const { count, error } = await sb
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('completed', true);
    if (error) throw error;

    return Math.min(100, Math.round(((count ?? 0) / totalLessons) * 100));
  },

  // QUIZZES
  getQuizAttempts: async (userId: string, quizId: string): Promise<QuizAttempt[]> => {
    const { data, error } = await sb
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId);
    if (error) throw error;
    return (data ?? []).map(rowToQuizAttempt);
  },
  saveQuizAttempt: async (attempt: Omit<QuizAttempt, 'id' | 'submittedAt'>): Promise<QuizAttempt> => {
    const row = {
      id: `att_${Date.now()}`,
      quiz_id: attempt.quizId,
      course_id: attempt.courseId,
      user_id: attempt.userId,
      score_percent: attempt.scorePercent,
      passed: attempt.passed,
      user_answers: attempt.userAnswers,
      submitted_at: new Date().toISOString(),
    };
    const { data, error } = await sb.from('quiz_attempts').insert(row).select().single();
    if (error) throw error;
    return rowToQuizAttempt(data);
  },

  // CERTIFICATES
  getCertificates: async (): Promise<Certificate[]> => {
    const { data, error } = await sb.from('certificates').select('*');
    if (error) throw error;
    return (data ?? []).map(rowToCertificate);
  },
  getUserCertificates: async (userId: string): Promise<Certificate[]> => {
    const { data, error } = await sb.from('certificates').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map(rowToCertificate);
  },
  getCertificateByCode: async (code: string): Promise<Certificate | undefined> => {
    const { data, error } = await sb
      .from('certificates')
      .select('*')
      .ilike('code', code.trim())
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCertificate(data) : undefined;
  },
  getCertificateForCourse: async (userId: string, courseId: string): Promise<Certificate | undefined> => {
    const { data, error } = await sb
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCertificate(data) : undefined;
  },
  issueCertificate: async (userId: string, courseId: string, passingScore = 100): Promise<Certificate> => {
    const existing = await db.getCertificateForCourse(userId, courseId);
    if (existing) return existing;

    const user = must(await db.getUserById(userId), 'usuario');
    const course = must(await db.getCourseById(courseId), 'curso');

    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const year = new Date().getFullYear();
    const code = `LUA-${year}-${randomPart}`;

    const row = {
      id: `cert_${Date.now()}`,
      code,
      user_id: userId,
      user_name: user.name,
      course_id: courseId,
      course_title: course.title,
      issued_at: new Date().toISOString(),
      passing_score: passingScore,
    };
    const { data, error } = await sb.from('certificates').insert(row).select().single();
    if (error) throw error;

    await sb
      .from('enrollments')
      .update({ completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    return rowToCertificate(data);
  },

  // ORDERS
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToOrder);
  },
  saveOrder: async (order: Order): Promise<Order> => {
    const { data, error } = await sb.from('orders').upsert(orderToRow(order)).select().single();
    if (error) throw error;
    return rowToOrder(data);
  },
  getOrderByPreferenceId: async (prefId: string): Promise<Order | undefined> => {
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('mp_preference_id', prefId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToOrder(data) : undefined;
  },

  // BIRTHDAYS
  getBirthdayTemplate: async (): Promise<BirthdayTemplate> => {
    const { data, error } = await sb.from('birthday_template').select('*').eq('id', true).single();
    if (error) throw error;
    return rowToBirthdayTemplate(data);
  },
  saveBirthdayTemplate: async (template: BirthdayTemplate): Promise<BirthdayTemplate> => {
    const { data, error } = await sb
      .from('birthday_template')
      .update({
        subject: template.subject,
        title: template.title,
        message: template.message,
        promo_code: template.promoCode,
        discount_percent: template.discountPercent,
        valid_days: template.validDays,
      })
      .eq('id', true)
      .select()
      .single();
    if (error) throw error;
    return rowToBirthdayTemplate(data);
  },
  getBirthdayLogs: async (): Promise<BirthdayEmailLog[]> => {
    const { data, error } = await sb.from('birthday_logs').select('*').order('sent_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToBirthdayLog);
  },
  wasBirthdaySentThisYear: async (userId: string): Promise<boolean> => {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const { data, error } = await sb
      .from('birthday_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('sent_at', startOfYear)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },
  logBirthdayEmail: async (log: Omit<BirthdayEmailLog, 'id' | 'sentAt'>): Promise<BirthdayEmailLog> => {
    const row = {
      id: `blog_${Date.now()}`,
      user_id: log.userId,
      user_name: log.userName,
      user_email: log.userEmail,
      sent_at: new Date().toISOString(),
      promo_code: log.promoCode,
      status: log.status,
    };
    const { data, error } = await sb.from('birthday_logs').insert(row).select().single();
    if (error) throw error;
    return rowToBirthdayLog(data);
  },

  // SITE SETTINGS (pie de página, plantilla de certificados)
  getSiteSettings: async (): Promise<SiteSettings> => {
    const { data, error } = await sb.from('site_settings').select('*').eq('id', true).single();
    if (error) throw error;
    return {
      footerDescription: data.footer_description,
      footerTagline: data.footer_tagline ?? 'Hacer las cosas con cuidado y que se note.',
      footerLocation: data.footer_location ?? '',
      certificateTitle: data.certificate_title,
      certificateStatement: data.certificate_statement,
      certificateSignerName: data.certificate_signer_name,
      certificateSignerTitle: data.certificate_signer_title,
      heroBadge: data.hero_badge ?? 'Seminarios Lua Azul · Línea Formación',
      heroTitleMain: data.hero_title_main ?? 'Formación con raíz botánica',
      heroTitleAccent: data.hero_title_accent ?? 'y profundidad simbólica',
      heroSubtitle:
        data.hero_subtitle ??
        'Un camino de estudio serio en terapias florales, energéticas y rúnicas. Para leerte a vos y acompañar a otros, con el tiempo y el cuidado que cada proceso merece.',
    };
  },
  saveSiteSettings: async (settings: SiteSettings): Promise<SiteSettings> => {
    const { data, error } = await sb
      .from('site_settings')
      .update({
        footer_description: settings.footerDescription,
        footer_tagline: settings.footerTagline,
        footer_location: settings.footerLocation,
        certificate_title: settings.certificateTitle,
        certificate_statement: settings.certificateStatement,
        certificate_signer_name: settings.certificateSignerName,
        certificate_signer_title: settings.certificateSignerTitle,
        hero_badge: settings.heroBadge,
        hero_title_main: settings.heroTitleMain,
        hero_title_accent: settings.heroTitleAccent,
        hero_subtitle: settings.heroSubtitle,
      })
      .eq('id', true)
      .select()
      .single();
    if (error) throw error;
    return {
      footerDescription: data.footer_description,
      footerTagline: data.footer_tagline,
      footerLocation: data.footer_location,
      certificateTitle: data.certificate_title,
      certificateStatement: data.certificate_statement,
      certificateSignerName: data.certificate_signer_name,
      certificateSignerTitle: data.certificate_signer_title,
      heroBadge: data.hero_badge,
      heroTitleMain: data.hero_title_main,
      heroTitleAccent: data.hero_title_accent,
      heroSubtitle: data.hero_subtitle,
    };
  },

  // TESTIMONIALS
  getApprovedTestimonials: async (): Promise<Testimonial[]> => {
    const { data, error } = await sb
      .from('testimonials')
      .select('*')
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToTestimonial);
  },
  getAllTestimonials: async (): Promise<Testimonial[]> => {
    const { data, error } = await sb.from('testimonials').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToTestimonial);
  },
  createTestimonial: async (t: Omit<Testimonial, 'id' | 'createdAt' | 'status'>): Promise<Testimonial> => {
    const row = {
      id: `test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      user_id: t.userId || null,
      user_name: t.userName,
      course_title: t.courseTitle || null,
      message: t.message,
      rating: t.rating,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    const { data, error } = await sb.from('testimonials').insert(row).select().single();
    if (error) throw error;
    return rowToTestimonial(data);
  },
  setTestimonialStatus: async (id: string, status: 'PENDING' | 'APPROVED'): Promise<Testimonial | null> => {
    const { data, error } = await sb
      .from('testimonials')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? rowToTestimonial(data) : null;
  },
  deleteTestimonial: async (id: string): Promise<void> => {
    const { error } = await sb.from('testimonials').delete().eq('id', id);
    if (error) throw error;
  },

  // COUPONS
  getCoupons: async (): Promise<Coupon[]> => {
    const { data, error } = await sb.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToCoupon);
  },
  getCouponByCode: async (code: string): Promise<Coupon | undefined> => {
    const { data, error } = await sb
      .from('coupons')
      .select('*')
      .ilike('code', code)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCoupon(data) : undefined;
  },
  createCoupon: async (c: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon> => {
    const row = {
      id: `cpn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      code: c.code.toUpperCase(),
      discount_percent: c.discountPercent,
      course_id: c.courseId || null,
      max_uses: c.maxUses ?? null,
      used_count: 0,
      expires_at: c.expiresAt || null,
      active: c.active,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await sb.from('coupons').insert(row).select().single();
    if (error) throw error;
    return rowToCoupon(data);
  },
  setCouponActive: async (id: string, active: boolean): Promise<Coupon | null> => {
    const { data, error } = await sb.from('coupons').update({ active }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? rowToCoupon(data) : null;
  },
  incrementCouponUsage: async (id: string): Promise<void> => {
    const { data, error: findErr } = await sb.from('coupons').select('used_count').eq('id', id).single();
    if (findErr) throw findErr;
    const { error } = await sb.from('coupons').update({ used_count: (data.used_count || 0) + 1 }).eq('id', id);
    if (error) throw error;
  },
  deleteCoupon: async (id: string): Promise<void> => {
    const { error } = await sb.from('coupons').delete().eq('id', id);
    if (error) throw error;
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
