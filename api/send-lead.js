/**
 * Purpose: Sends consultation and booking auto-replies for BALIORA lead forms.
 * Used by: frontend contact and booking inquiry forms deployed on Vercel.
 * Main dependencies: EmailJS REST API, sendLeadConfig helpers, and Vercel Node.js runtime.
 * Public functions: default Vercel API handler.
 * Side effects: Sends outbound emails through EmailJS.
 */
import {
  buildAutoReplyTemplateParams,
  buildOwnerTemplateParams,
  getLeadPayload,
} from './utils/sendLeadConfig.js';

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const sendEmailJsMessage = async ({
  serviceId,
  templateId,
  publicKey,
  privateKey,
  templateParams,
}) => {
  const emailResponse = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: templateParams,
    }),
  });

  if (emailResponse.ok) {
    return;
  }

  const errorText = await emailResponse.text().catch(() => 'Unknown EmailJS error');
  throw new Error(errorText || 'EmailJS send failed');
};

const buildWhatsappMessage = (body) => {
  if (body.type === 'consultation') {
    return [
      `*BALIORA - NOTIFIKASI KONSULTASI BARU*`,
      ``,
      `Nama: ${body.name || '-'}`,
      `Email: ${body.email || '-'}`,
      `WhatsApp: ${body.whatsapp || '-'}`,
      `Lokasi Villa: ${body.villa_location || '-'}`,
      `Jumlah Kamar: ${body.bedroom_count || '-'}`,
      `Status Saat Ini: ${body.current_status || '-'}`,
      `Pesan: ${body.message || '-'}`,
    ].join('\n');
  }

  if (body.type === 'booking') {
    return [
      `*BALIORA - NOTIFIKASI BOOKING BARU*`,
      ``,
      `Villa: ${body.villa_name || '-'}`,
      `Nama Tamu: ${body.guest_name || '-'}`,
      `Email: ${body.email || '-'}`,
      `WhatsApp: ${body.whatsapp || '-'}`,
      `Check-In: ${body.check_in || '-'}`,
      `Check-Out: ${body.check_out || '-'}`,
      `Tamu Total: ${body.guests || '-'}`,
      `Permintaan Khusus: ${body.special_requests || '-'}`,
    ].join('\n');
  }

  return '';
};

const sendFonnteMessage = async ({ token, target, message }) => {
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: new URLSearchParams({
        target: target,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown Fonnte error');
      console.error('Fonnte send failed:', errorText);
    }
  } catch (error) {
    console.error('Fonnte request failed:', error);
  }
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const consultationTemplateId = process.env.EMAILJS_CONSULTATION_TEMPLATE_ID;
  const bookingTemplateId = process.env.EMAILJS_BOOKING_TEMPLATE_ID;

  if (!serviceId || !publicKey || !privateKey || !consultationTemplateId || !bookingTemplateId) {
    return response.status(202).json({
      ok: false,
      skipped: true,
      message: 'Email delivery is not configured yet. Set the EmailJS environment variables in Vercel.',
    });
  }

  const leadPayload = getLeadPayload(request.body || {});

  if (!leadPayload) {
    return response.status(400).json({ ok: false, message: 'Unsupported lead type' });
  }

  try {
    if (request.body?.email) {
      const templateId = request.body.type === 'booking' ? bookingTemplateId : consultationTemplateId;

      // 1. Send auto-reply to the client/sender
      await sendEmailJsMessage({
        serviceId,
        templateId,
        publicKey,
        privateKey,
        templateParams: buildAutoReplyTemplateParams(leadPayload, request.body || {}),
      });

      // 2. Send admin notification to the owner/info@v-teki.com
      const ownerEmail = process.env.LEADS_TO_EMAIL || 'info@v-teki.com';
      await sendEmailJsMessage({
        serviceId,
        templateId,
        publicKey,
        privateKey,
        templateParams: buildOwnerTemplateParams(leadPayload, request.body || {}, ownerEmail),
      });

      // 3. Send optional WhatsApp notification via Fonnte
      const fonnteToken = process.env.FONNTE_TOKEN;
      const whatsappTarget = process.env.WHATSAPP_NOTIFICATION_TARGET;
      if (fonnteToken && whatsappTarget) {
        const waMessage = buildWhatsappMessage(request.body || {});
        if (waMessage) {
          await sendFonnteMessage({
            token: fonnteToken,
            target: whatsappTarget,
            message: waMessage,
          });
        }
      }
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(500).json({ ok: false, message: error.message || 'Unexpected email error' });
  }
}
