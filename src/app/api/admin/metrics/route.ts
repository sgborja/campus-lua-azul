import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkUpcomingBirthdays } from '@/lib/email';

export async function GET() {
  const users = db.getUsers();
  const students = users.filter((u) => u.role === 'STUDENT');
  const courses = db.getCourses();
  const certificates = db.getCertificates();
  const orders = db.getOrders();
  const enrollments = db.getEnrollments();

  // Calculate total revenue from approved orders
  const totalRevenue = orders
    .filter((o) => o.status === 'APPROVED')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  // Upcoming birthdays count
  const upcomingBirthdays = checkUpcomingBirthdays(30);

  // Detailed students data with their courses
  const studentsWithProgress = students.map((s) => {
    const studentEnrollments = enrollments.filter((e) => e.userId === s.id);
    const coursesProgress = studentEnrollments.map((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      const progressPercent = db.getCourseProgressPercent(s.id, e.courseId);
      const cert = certificates.find((c) => c.userId === s.id && c.courseId === e.courseId);
      return {
        courseId: e.courseId,
        courseTitle: course?.title || 'Curso desconocido',
        progressPercent,
        hasCertificate: Boolean(cert),
        enrolledAt: e.enrolledAt,
      };
    });

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
  });

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
  });
}
