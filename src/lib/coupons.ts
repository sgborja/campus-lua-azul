import { db } from './db';
import { Coupon, Course } from './types';

export interface CouponCheckResult {
  valid: boolean;
  error?: string;
  coupon?: Coupon;
  discountPercent?: number;
  finalPrice?: number;
}

/**
 * Valida un cupón contra un curso puntual. Se usa tanto para mostrarle el
 * precio con descuento a la alumna como, de nuevo, del lado del servidor al
 * crear la preferencia de pago — nunca hay que confiar en un descuento que
 * calculó el navegador.
 */
export async function validateCouponForCourse(
  code: string,
  course: Course,
  userId?: string
): Promise<CouponCheckResult> {
  const coupon = await db.getCouponByCode(code.trim());

  if (!coupon) return { valid: false, error: 'El cupón no existe.' };
  if (!coupon.active) return { valid: false, error: 'El cupón ya no está activo.' };
  if (coupon.courseId && coupon.courseId !== course.id) {
    return { valid: false, error: 'El cupón no aplica a este curso.' };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { valid: false, error: 'El cupón venció.' };
  }
  if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'El cupón alcanzó su límite de usos.' };
  }
  // Cada cupón se puede usar una sola vez por alumno/a, sin importar el curso.
  if (userId && (await db.hasUserRedeemedCoupon(coupon.id, userId))) {
    return { valid: false, error: 'Ya usaste este cupón anteriormente.' };
  }

  const finalPrice = Math.max(0, Math.round(course.price * (1 - coupon.discountPercent / 100)));
  return { valid: true, coupon, discountPercent: coupon.discountPercent, finalPrice };
}
