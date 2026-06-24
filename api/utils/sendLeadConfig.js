/**
 * Purpose: Builds structured EmailJS payloads for consultation and booking notifications.
 * Used by: api/send-lead.js serverless email handler and node tests.
 * Main dependencies: none.
 * Public functions: getLeadPayload, buildAutoReplyTemplateParams, buildOwnerTemplateParams.
 * Side effects: none.
 */
const formatFieldValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return String(value);
};

const buildFieldSummary = (payload) =>
  Object.entries(payload.fields)
    .map(([label, value]) => `${label}: ${formatFieldValue(value)}`)
    .join('\n');

const buildLeadDescription = (payload) => {
  if (payload.subject.startsWith('Permintaan Konsultasi')) {
    return 'Permintaan Konsultasi Baru';
  }

  if (payload.subject.startsWith('Booking Inquiry')) {
    return 'Booking Inquiry Baru';
  }

  return payload.subject;
};

export const getLeadPayload = (body) => {
  if (body.type === 'consultation') {
    return {
      subject: `Permintaan Konsultasi Baru - ${body.name || 'Lead BALIORA'}`,
      replyTo: body.email || '',
      autoReplySubject: 'Kami sudah menerima permintaan konsultasi Anda',
      autoReplyHeading: 'Terima kasih sudah menghubungi BALIORA',
      autoReplyIntro: 'Permintaan konsultasi Anda sudah kami terima. Tim kami akan meninjau detail villa Anda dan menghubungi Anda secepatnya.',
      fields: {
        'Nama Lengkap': body.name,
        Email: body.email,
        WhatsApp: body.whatsapp,
        'Lokasi Villa': body.villa_location,
        Kamar: body.bedroom_count,
        'Status Saat Ini': body.current_status,
        Pesan: body.message,
      },
    };
  }

  if (body.type === 'booking') {
    return {
      subject: `Booking Inquiry Baru - ${body.villa_name || 'Villa BALIORA'}`,
      replyTo: body.email || '',
      autoReplySubject: 'Kami sudah menerima inquiry villa Anda',
      autoReplyHeading: 'Terima kasih atas inquiry Anda',
      autoReplyIntro: 'Kami sudah menerima inquiry villa Anda dan tim kami akan meninjau detail tanggal menginap yang Anda minta sesegera mungkin.',
      fields: {
        Villa: body.villa_name,
        Tamu: body.guest_name,
        Email: body.email,
        WhatsApp: body.whatsapp,
        CheckIn: body.check_in,
        CheckOut: body.check_out,
        TamuTotal: body.guests,
        'Permintaan Khusus': body.special_requests,
      },
    };
  }

  return null;
};

export const buildAutoReplyTemplateParams = (payload, formBody) => ({
  to_email: formBody.email,
  reply_to: '',
  subject: payload.autoReplySubject,
  heading: payload.autoReplyHeading,
  intro: payload.autoReplyIntro,
  lead_name: formatFieldValue(formBody.name || formBody.guest_name),
  email: formatFieldValue(formBody.email),
  whatsapp: formatFieldValue(formBody.whatsapp),
  villa_name: formatFieldValue(formBody.villa_name || formBody.villa_location),
  villa_location: formatFieldValue(formBody.villa_location),
  bedroom_count: formatFieldValue(formBody.bedroom_count),
  current_status: formatFieldValue(formBody.current_status),
  check_in: formatFieldValue(formBody.check_in),
  check_out: formatFieldValue(formBody.check_out),
  guests: formatFieldValue(formBody.guests),
  message: formatFieldValue(formBody.message || formBody.special_requests),
  fields_summary: buildFieldSummary(payload),
  html_content: `${payload.autoReplyHeading}\n\n${payload.autoReplyIntro}\n\n${buildFieldSummary(payload)}`,
});

export const buildOwnerTemplateParams = (payload, formBody, ownerEmail) => ({
  to_email: ownerEmail,
  reply_to: formBody.email || '',
  subject: payload.subject,
  heading: buildLeadDescription(payload),
  intro:
    formBody.type === 'booking'
      ? 'Ada inquiry booking baru yang perlu ditinjau.'
      : 'Ada permintaan konsultasi baru yang masuk.',
  lead_name: formatFieldValue(formBody.name || formBody.guest_name),
  email: formatFieldValue(formBody.email),
  whatsapp: formatFieldValue(formBody.whatsapp),
  villa_name: formatFieldValue(formBody.villa_name || formBody.villa_location),
  villa_location: formatFieldValue(formBody.villa_location),
  bedroom_count: formatFieldValue(formBody.bedroom_count),
  current_status: formatFieldValue(formBody.current_status),
  check_in: formatFieldValue(formBody.check_in),
  check_out: formatFieldValue(formBody.check_out),
  guests: formatFieldValue(formBody.guests),
  message: formatFieldValue(formBody.message || formBody.special_requests),
  fields_summary: buildFieldSummary(payload),
  html_content: `${buildLeadDescription(payload)}\n\n${buildFieldSummary(payload)}`,
});
