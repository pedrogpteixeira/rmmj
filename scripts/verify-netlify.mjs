import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const html = 'dist/rmmj-website/browser/netlify-forms.html';
assert.ok(existsSync(html), 'Static Netlify form is missing from the build.');
const source = readFileSync(html, 'utf-8');
for (const field of ['rmmj-contacto','rmmj-recrutamento','form-name','name','email','phone','audience','subject','message','consent','bot-field','city','opportunity','experience','motivation','cv']) {
  assert.ok(source.includes(field), `Missing Netlify field: ${field}`);
}
console.log('Netlify static form: OK');
