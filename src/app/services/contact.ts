export const CONTACT_FORM_NAME = 'rmmj-contacto';
export const CONTACT_FORM_ENDPOINT = '/';

export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  audience: string;
  subject: string;
  message: string;
  consent: boolean;
  'bot-field': string;
}

export function encodeContactRequest(payload: ContactRequest): URLSearchParams {
  const form = new URLSearchParams();
  form.set('form-name', CONTACT_FORM_NAME);
  for (const [field, value] of Object.entries(payload)) {
    form.set(field, typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : value.trim());
  }
  return form;
}

export async function sendContactRequest(body: URLSearchParams, sender: typeof fetch = fetch): Promise<void> {
  const response = await sender(CONTACT_FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('O servidor não aceitou o pedido.');
}
