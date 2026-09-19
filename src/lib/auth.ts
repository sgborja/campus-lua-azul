import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { Course, User, UserRole } from './types';

export const SESSION_COOKIE = 'campus_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

// Roles con acceso al panel de administración
const ADMIN_ROLES: UserRole[] = ['ADMIN', 'PROFESOR', 'EDITOR'];

function getSessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'Falta la variable de entorno AUTH_SECRET. Configúrala antes de aceptar logins.'
    );
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function sign(userId: string): string {
  const secret = getSessionSecret();
  return createHmac('sha256', secret).update(userId).digest('hex');
}

/** Token de sesión con formato `${userId}.${firma}` */
export function createSessionToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const [userId, signature] = token.split('.');
  if (!userId || !signature) return null;

  let expected: string;
  try {
    expected = sign(userId);
  } catch {
    return null;
  }

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signature);
  if (expectedBuf.length !== receivedBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, receivedBuf)) return null;

  return userId;
}

export function sessionCookieOptions() {
  return {
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };
}

/** Quita el hash de contraseña antes de mandar un usuario al cliente. */
export function publicUser(user: User): Omit<User, 'password'> {
  const { password: _password, ...rest } = user;
  return rest;
}

/** Devuelve el usuario autenticado según la cookie de sesión firmada, o null. */
export async function getSessionUser(req: NextRequest): Promise<User | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  const user = await db.getUserById(userId);
  return user || null;
}

export function isAdminRole(role: UserRole | undefined): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export async function requireAdmin(req: NextRequest): Promise<User | null> {
  const user = await getSessionUser(req);
  if (!user || !isAdminRole(user.role)) return null;
  return user;
}

/**
 * Igual que requireAdmin, pero solo para acciones reservadas al rol ADMIN:
 * gestión de roles de usuario, ajustes del sitio, campañas de cumpleaños y
 * pedidos de Mercado Pago. PROFESOR y EDITOR pueden entrar al panel y
 * gestionar contenido (cursos, exámenes, testimonios), pero no estas.
 */
export async function requireSuperAdmin(req: NextRequest): Promise<User | null> {
  const user = await getSessionUser(req);
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

/**
 * ADMIN y EDITOR gestionan cualquier curso. PROFESOR solo los cursos donde
 * figura como profesor a cargo (un curso puede tener varios profesores).
 */
export function canManageCourse(user: User, course: Course): boolean {
  if (user.role !== 'PROFESOR') return true;
  return !!course.instructorIds?.includes(user.id);
}

/**
 * Verifica que haya una sesión válida y que corresponda al `userId` que el
 * cliente dice estar operando (o que sea un admin actuando en nombre de otro).
 */
export async function requireSelfOrAdmin(req: NextRequest, userId: string | undefined | null): Promise<User | null> {
  const user = await getSessionUser(req);
  if (!user) return null;
  if (user.id === userId || isAdminRole(user.role)) return user;
  return null;
}
