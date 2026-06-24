/**
 * Purpose: Sends lead notifications from frontend forms to the shared email handler.
 * Used by: contact and booking inquiry forms.
 * Main dependencies: browser fetch and the /api/send-lead endpoint.
 * Public functions: sendLeadNotification.
 * Side effects: Performs an HTTP POST to the local or deployed API route.
 */
export const sendLeadNotification = async (payload) => {
  const response = await fetch('/api/send-lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({ ok: false, message: 'Unknown email response' }));

  if (!response.ok) {
    return {
      ok: false,
      message: result.message || 'Email request failed',
    };
  }

  return {
    ok: Boolean(result.ok),
    skipped: Boolean(result.skipped),
    message: result.message || '',
  };
};
