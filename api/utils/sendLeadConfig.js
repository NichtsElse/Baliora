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

const formatStatus = (status) => {
  if (!status) return '-';
  return String(status).split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

const buildHtmlTable = (fields) => {
  const rows = Object.entries(fields).map(([label, value]) => `
    <tr>
      <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 600; background-color: #f8fafc; width: 35%; color: #334155; font-family: sans-serif; font-size: 14px;">${label}</td>
      <td style="padding: 12px 16px; border: 1px solid #e2e8f0; background-color: #ffffff; color: #475569; font-family: sans-serif; font-size: 14px;">${formatFieldValue(value)}</td>
    </tr>
  `).join('');

  return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 24px; margin-bottom: 24px; text-align: left;">
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

export const buildAutoReplyTemplateParams = (payload, formBody) => {
  // Salin fields dan hapus Email & WhatsApp khusus untuk Auto-Reply
  const autoReplyFields = { ...payload.fields };
  delete autoReplyFields['Email'];
  delete autoReplyFields['WhatsApp'];

  return {
    to_email: formBody.email,
    reply_to: '',
    subject: payload.autoReplySubject,
    heading: payload.autoReplyHeading,
    intro: payload.autoReplyIntro,
    lead_name: formatFieldValue(formBody.name || formBody.guest_name),
    name: formatFieldValue(formBody.name || formBody.guest_name),
    email: formatFieldValue(formBody.email),
    Email: formatFieldValue(formBody.email),
    user_email: formatFieldValue(formBody.email),
    whatsapp: formatFieldValue(formBody.whatsapp),
    WhatsApp: formatFieldValue(formBody.whatsapp),
    wa: formatFieldValue(formBody.whatsapp),
    phone: formatFieldValue(formBody.whatsapp),
    villa_name: formatFieldValue(formBody.villa_name || formBody.villa_location),
    villa_location: formatFieldValue(formBody.villa_location),
    bedroom_count: formatFieldValue(formBody.bedroom_count),
    current_status: formatStatus(formBody.current_status),
    check_in: formatFieldValue(formBody.check_in),
    check_out: formatFieldValue(formBody.check_out),
    guests: formatFieldValue(formBody.guests),
    message: formatFieldValue(formBody.message || formBody.special_requests),
    fields_summary: buildFieldSummary({ fields: autoReplyFields }),
    html_content: `
      <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2b332c; color: #ffffff; padding: 24px; text-align: left;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 600;">${payload.autoReplyHeading}</h2>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="margin-top: 0; margin-bottom: 8px; line-height: 1.6; font-size: 14px;">${payload.autoReplyIntro}</p>
          ${buildHtmlTable(autoReplyFields)}
          <p style="margin-top: 0; margin-bottom: 0; line-height: 1.6; font-size: 14px; color: #64748b;">Jika ada tambahan detail, silakan balas email ini dan tim kami akan membantu Anda.</p>
        </div>
      </div>
    `,
  };
};

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
  name: formatFieldValue(formBody.name || formBody.guest_name),
  email: formatFieldValue(formBody.email),
  Email: formatFieldValue(formBody.email),
  user_email: formatFieldValue(formBody.email),
  whatsapp: formatFieldValue(formBody.whatsapp),
  WhatsApp: formatFieldValue(formBody.whatsapp),
  wa: formatFieldValue(formBody.whatsapp),
  phone: formatFieldValue(formBody.whatsapp),
  villa_name: formatFieldValue(formBody.villa_name || formBody.villa_location),
  villa_location: formatFieldValue(formBody.villa_location),
  bedroom_count: formatFieldValue(formBody.bedroom_count),
  current_status: formatStatus(formBody.current_status),
  check_in: formatFieldValue(formBody.check_in),
  check_out: formatFieldValue(formBody.check_out),
  guests: formatFieldValue(formBody.guests),
  message: formatFieldValue(formBody.message || formBody.special_requests),
  fields_summary: buildFieldSummary(payload),
  html_content: `
    <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2b332c; color: #ffffff; padding: 24px; text-align: left;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">${buildLeadDescription(payload)}</h2>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="margin-top: 0; margin-bottom: 8px; line-height: 1.6; font-size: 14px;">
          ${formBody.type === 'booking' ? 'Ada inquiry booking baru yang perlu ditinjau.' : 'Ada permintaan konsultasi baru yang masuk.'}
        </p>
        ${buildHtmlTable(payload.fields)}
      </div>
    </div>
  `,
});
