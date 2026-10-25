import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RECRUITMENT_FORM_NAME, RECRUITMENT_FORM_ENDPOINT, validateCv,
  encodeRecruitmentRequest, sendRecruitmentRequest,
} from '../src/app/services/recruitment.ts';

const sample = {
  name: ' Ana Costa ', email: ' ana@exemplo.pt ', phone: ' 912 345 678 ',
  city: ' Porto ', opportunity: 'Equipa comercial — Porto',
  experience: 'Sem experiência', motivation: ' Gostava de conhecer a equipa RMMJ. ',
  consent: true, 'bot-field': '', cv: null,
};

test('serializes a recruitment application under a distinct form name', () => {
  const body = encodeRecruitmentRequest(sample);
  assert.equal(body.get('form-name'), RECRUITMENT_FORM_NAME);
  assert.equal(body.get('name'), 'Ana Costa');
  assert.equal(body.get('city'), 'Porto');
  assert.equal(body.get('consent'), 'Sim');
  assert.equal(body.get('cv'), null);
});

test('accepts CV and rejects oversized and invalid attachments', () => {
  const pdf = new File(['CV exemplo'], 'curriculo.pdf', { type: 'application/pdf' });
  assert.equal(validateCv(pdf), null);
  assert.equal(encodeRecruitmentRequest({...sample, cv: pdf}).get('cv').name, 'curriculo.pdf');
  assert.match(validateCv(new File(['x'], 'virus.exe', { type: 'application/octet-stream' })), /PDF/);
  assert.match(validateCv(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'curriculo.pdf', {type:'application/pdf'})), /5 MB/);
});

test('uses multipart FormData and no forced content-type header', async () => {
  const body = encodeRecruitmentRequest(sample);
  await sendRecruitmentRequest(body, async (url, init) => {
    assert.equal(url, RECRUITMENT_FORM_ENDPOINT);
    assert.equal(init.method, 'POST');
    assert.strictEqual(init.body, body);
    assert.equal(init.headers, undefined);
    return { ok: true };
  });
});

test('rejects an unsuccessful server response', async () => {
  await assert.rejects(
    () => sendRecruitmentRequest(encodeRecruitmentRequest(sample), async () => ({ok: false, status: 400})),
    /não aceitou/
  );
});
