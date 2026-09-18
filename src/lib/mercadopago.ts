import { MercadoPagoConfig, Preference } from 'mercadopago';
import { Course, User } from './types';

// Access token from environment or test fallback
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

export const isMercadoPagoConfigured = Boolean(MP_ACCESS_TOKEN);

export async function createCoursePreference({
  course,
  user,
  baseUrl,
}: {
  course: Course;
  user: User;
  baseUrl: string;
}) {
  if (!MP_ACCESS_TOKEN) {
    // If not configured, provide simulated response for local testing
    const simulatedPrefId = `pref_sim_${Date.now()}`;
    return {
      id: simulatedPrefId,
      init_point: `${baseUrl}/checkout/simulated?pref_id=${simulatedPrefId}&course_id=${course.id}&user_id=${user.id}`,
      sandbox_init_point: `${baseUrl}/checkout/simulated?pref_id=${simulatedPrefId}&course_id=${course.id}&user_id=${user.id}`,
      isSimulated: true,
    };
  }

  try {
    const client = new MercadoPagoConfig({
      accessToken: MP_ACCESS_TOKEN,
      options: { timeout: 7000 },
    });

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: course.id,
            title: course.title,
            description: course.shortDescription,
            picture_url: course.coverImage,
            unit_price: course.price,
            quantity: 1,
            currency_id: 'ARS',
          },
        ],
        payer: {
          name: user.name,
          email: user.email,
        },
        back_urls: {
          success: `${baseUrl}/checkout/success?course_id=${course.id}&user_id=${user.id}`,
          failure: `${baseUrl}/curso/${course.slug}?status=failure`,
          pending: `${baseUrl}/checkout/pending?course_id=${course.id}&user_id=${user.id}`,
        },
        auto_return: 'approved',
        metadata: {
          course_id: course.id,
          user_id: user.id,
          user_email: user.email,
        },
      },
    });

    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      isSimulated: false,
    };
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    // Fallback to simulated flow if MP call fails (e.g. invalid test token)
    const simulatedPrefId = `pref_fallback_${Date.now()}`;
    return {
      id: simulatedPrefId,
      init_point: `${baseUrl}/checkout/simulated?pref_id=${simulatedPrefId}&course_id=${course.id}&user_id=${user.id}`,
      sandbox_init_point: `${baseUrl}/checkout/simulated?pref_id=${simulatedPrefId}&course_id=${course.id}&user_id=${user.id}`,
      isSimulated: true,
      error: (error as Error).message,
    };
  }
}
