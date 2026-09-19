import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkUpcomingBirthdays } from '@/lib/email';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const users = await db.getUsers();
  const students = users.filter((u) => u.role === 'STUDENT');
  const courses = await db.getCourses();
  const certificates = await db.getCertificates();
  const orders = await db.getOrders();
  const enrollments = await db.getEnrollments();

  // Calculate total revenue from approved orders
  const totalRevenue = orders
    .filter((o) => o.status === 'APPROVED')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  // Upcoming birthdays count
  const upcomingBirthdays = await checkUpcomingBirthdays(30);

  // Detailed students data with their courses
  const studentsWithProgress = await Promise.all(
    students.map(async (s) => {
      const studentEnrollments = enrollments.filter((e) => e.userId === s.id);
      const coursesProgress = await Promise.all(
        studentEnrollments.map(async (e) => {
          const course = courses.find((c) => c.id === e.courseId);
          const progressPercent = await db.getCourseProgressPercent(s.id, e.courseId);
          const cert = certificates.find((c) => c.userId === s.id && c.courseId === e.courseId);
          return {
            courseId: e.courseId,
            courseTitle: course?.title || 'Curso desconocido',
            progressPercent,
            hasCertificate: Boolean(cert),
            enrolledAt: e.enrolledAt,
          };
        })
      );

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        birthDate: s.birthDate,
        avatar: s.avatar,
        createdAt: s.createdAt,
        enrolledCount: studentEnrollments.length,
        coursesProgress,
      };
    })
  );

  return NextResponse.json({
    metrics: {
      totalStudents: students.length,
      totalCourses: courses.length,
      totalCertificates: certificates.length,
      totalRevenue,
      upcomingBirthdaysCount: upcomingBirthdays.length,
    },
    recentOrders: orders.slice(-5).reverse(),
    upcomingBirthdays,
    students: studentsWithProgress,
    allUsers: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.createdAt,
    })),
  });
}
