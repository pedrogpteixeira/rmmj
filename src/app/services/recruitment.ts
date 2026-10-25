/** A candidatura é independente do formulário comercial. */
export const RECRUITMENT_FORM_NAME = 'rmmj-recrutamento';
export const RECRUITMENT_FORM_ENDPOINT = '/';
export const CV_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_EXTENSIONS = /\.(pdf|doc|docx)$/i;
const ALLOWED_CV_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export interface RecruitmentRequest {
  name: string;
  email: string;
  phone: string;
  city: string;
  opportunity: string;
  experience: string;
  motivation: string;
  consent: boolean;
  'bot-field': string;
  cv: File | null;
}

export function validateCv(file: File | null): string | null {
  if (!file) return null;
  if (!ALLOWED_CV_EXTENSIONS.test(file.name) || (file.type && !ALLOWED_CV_TYPES.has(file.type))) {
    return 'O currículo deve estar em PDF, DOC ou DOCX.';
  }
  if (file.size > CV_MAX_BYTES) return 'O currículo não pode exceder 5 MB.';
  if (file.size === 0) return 'O ficheiro selecionado está vazio.';
  return null;
}

export function encodeRecruitmentRequest(request: RecruitmentRequest): FormData {
  const data = new FormData();
  data.set('form-name', RECRUITMENT_FORM_NAME);
  const fields: (keyof Omit<RecruitmentRequest, 'cv' | 'consent'>)[] = [
    'name', 'email', 'phone', 'city', 'opportunity', 'experience', 'motivation', 'bot-field'
  ];
  for (const key of fields) data.set(key, request[key].trim());
  data.set('consent', request.consent ? 'Sim' : 'Não');
  if (request.cv) data.set('cv', request.cv, request.cv.name);
  return data;
}

export async function sendRecruitmentRequest(body: FormData, sender: typeof fetch = fetch): Promise<void> {
  const response = await sender(RECRUITMENT_FORM_ENDPOINT, {
    method: 'POST',
    body,
    // O navegador define o boundary multipart automaticamente, inclusive para o CV.
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('O servidor não aceitou a candidatura.');
}
