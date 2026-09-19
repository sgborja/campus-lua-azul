export type UserRole = 'ADMIN' | 'PROFESOR' | 'EDITOR' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  birthDate?: string; // YYYY-MM-DD
  avatar?: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  courseId: string;
  lessonId?: string; // Optional: can be global to the course or specific to a lesson
  title: string;
  description?: string;
  fileUrl: string;
  fileType: 'PDF' | 'ZIP' | 'PPT' | 'IMAGE' | 'DOCUMENT' | 'TEMPLATE';
  fileSize: string;
  downloadCount: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'PPT';
  content: string; // Rich guide / markdown
  videoUrl?: string; // YouTube, Vimeo, MP4 direct
  pptUrl?: string; // Archivo .ppt/.pptx público, se embebe con el visor de Office
  durationMinutes: number;
  order: number;
  resources?: Resource[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  passingScorePercent: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  userId: string;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
  userAnswers: number[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number; // in ARS, 0 if free
  isFree: boolean;
  priceOnRequest?: boolean; // si es true, se muestra "Consultar" en vez del precio
  coverImage: string;
  category: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  published: boolean;
  durationHours: number;
  certificateEnabled: boolean;
  modules: Module[];
  resources: Resource[];
  quiz?: Quiz;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
}

export interface LessonProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Certificate {
  id: string;
  code: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  passingScore?: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  mpPreferenceId: string;
  mpPaymentId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface BirthdayTemplate {
  subject: string;
  title: string;
  message: string;
  promoCode: string;
  discountPercent: number;
  validDays: number;
}

export interface Testimonial {
  id: string;
  userId?: string;
  userName: string;
  courseTitle?: string;
  message: string;
  rating: number;
  status: 'PENDING' | 'APPROVED';
  createdAt: string;
}

export interface SiteSettings {
  footerDescription: string;
  certificateTitle: string;
  certificateStatement: string;
  certificateSignerName: string;
  certificateSignerTitle: string;
}

export interface BirthdayEmailLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sentAt: string;
  promoCode: string;
  status: 'SENT' | 'SIMULATED';
}
