import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');
const html = read('src/app/app.component.html');
const recruitment = read('src/app/features/recruitment.component.html');
const logic = read('src/app/features/recruitment.component.ts');
const styles = read('src/styles.css');
const content = read('src/app/data/content.ts');
const index = read('src/index.html');
const routes = read('src/app/app.routes.ts');
const main = read('src/main.ts');
const shell = read('src/app/app-shell.component.ts');

// Testes de regressão sobre a estrutura; a compilação real necessita de Angular instalado.
test('header presents official partner exactly once and page has no ribbon', () => {
  assert.doesNotMatch(html, /class="ribbon(?:\s|"|-)/);
  assert.doesNotMatch(styles, /\.ribbon|@keyframes\s+ribbonMove/);
  assert.equal((html.match(/<small>Parceiro oficial Endesa<\/small>/g) ?? []).length, 1);
  assert.doesNotMatch(html, /class="partnership-strip"/);
});

test('home hero highlights official Endesa partnership without duplicating the teams or adding ribbon', () => {
  const hero = html.slice(html.indexOf('<section class="hero hero-local"'), html.indexOf('<section class="about section-pad"'));
  assert.match(hero, /class="hero-local-panel hero-values-panel hero-endesa-panel"/);
  assert.match(hero, /PARCEIRO OFICIAL ENDESA/);
  assert.match(hero, /class="hero-endesa-brandplate"/);
  assert.match(hero, /src="\/rmmj-logo-parceiro-endesa\.png"/);
  assert.doesNotMatch(hero, /class="hero-endesa-name"/);
  assert.match(hero, /href="#servicos"/);
  assert.doesNotMatch(hero, /class="local-city-list"/);
  assert.doesNotMatch(hero, /descontos|poupança garantida|fatura grátis/i);
});

test('uses the client-provided logos in the header, hero and footer', () => {
  assert.equal((html.match(/src="\/rmmj-logo-compacto\.png"/g) ?? []).length, 2);
  assert.equal((html.match(/src="\/rmmj-logo-parceiro-endesa\.png"/g) ?? []).length, 1);
  assert.match(html, /class="wordmark wordmark-official"/);
  assert.match(html, /class="footer-logo-link"/);
  assert.doesNotMatch(html, /class="wordmark-symbol"/);
  for (const asset of ['rmmj-logo-compacto.png', 'rmmj-logo-parceiro-endesa.png']) {
    const png = readFileSync(new URL(`../public/${asset}`, import.meta.url));
    assert.ok(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${asset} must be a valid PNG`);
  }
});

test('CSS is balanced and V1.6 recruitment rules are outside responsive media queries', () => {
  let depth = 0;
  let inComment = false;
  let quote = '';
  for (let i = 0; i < styles.length; i++) {
    const c = styles[i];
    const next = styles[i + 1];
    if (inComment) { if (c === '*' && next === '/') { inComment = false; i++; } continue; }
    if (quote) { if (c === '\\') { i++; continue; } if (c === quote) quote = ''; continue; }
    if (c === '/' && next === '*') { inComment = true; i++; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}') { depth--; assert.ok(depth >= 0, `unexpected } at character ${i}`); }
  }
  assert.equal(depth, 0, 'CSS must not have an unclosed brace');
  assert.match(styles, /@media\(max-width:580px\)\{\s*\.recruitment-spontaneous-card/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)\{\.footer-map-link span\{transition:none\}\}/);
  assert.doesNotMatch(styles, /@media\(max-width:580px\)\{\s*@media\(prefers-reduced-motion:reduce\)/);
});

test('presence shows Maia headquarters on the left and four team cities on the right without repetition', () => {
  assert.match(html, /id="presenca"/);
  for (const city of ['Coimbra', 'Leiria', 'Castelo Branco', 'Beja']) {
    assert.ok(content.includes(`'${city}'`));
  }
  assert.match(content, /teamCities = \['Coimbra', 'Leiria', 'Castelo Branco', 'Beja'\]/);
  assert.doesNotMatch(content, /teamCities = \['Maia'/);
  const section = html.slice(html.indexOf('id="presenca"'), html.indexOf('id="clientes"'));
  assert.ok(section.indexOf('<aside class="presence-info"') < section.indexOf('<div class="presence-regions"'), 'headquarters should precede team cards');
  assert.match(section, /<strong>05<\/strong><small>LOCALIDADES<\/small>/);
  assert.match(section, /0\{\{idx\+2\}\}/);
  assert.match(styles, /\.presence-layout\{display:grid;grid-template-columns:minmax\(280px,\.73fr\) minmax\(0,1\.1fr\)/);
  assert.match(html, /class="presence-regions"/);
  assert.doesNotMatch(html, /endesa\.pt\/contactos\/lojas|LOJAS ENDESA|class="presence-shops"/);
});

test('footer contains accessible Google Maps link, opening separately', () => {
  assert.match(html, /class="footer-map-link"/);
  assert.match(html, /google\.com\/maps\/search\/\?api=1/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test('recruitment has actual Angular routing, base href, internal links, and SPA fallback', () => {
  assert.match(routes, /path:\s*'recrutamento'/);
  assert.match(routes, /path:\s*''/);
  assert.match(main, /provideRouter\(appRoutes/);
  assert.match(shell, /RouterOutlet/);
  assert.match(index, /<base href="\/">/);
  assert.match(html, /routerLink="\/recrutamento"/);
  assert.match(html, /\[queryParams\]="\{tipo: 'espontanea'\}"/);
  const netlify = read('netlify.toml');
  assert.match(netlify, /to\s*=\s*"\/index\.html"/);
});

test('header uses route metadata and always targets the recruitment application on its route', () => {
  const appLogic = read('src/app/app.component.ts');
  assert.match(routes, /data: \{ recruitment: true \}/);
  assert.match(appLogic, /snapshot\.data\['recruitment'\]/);
  assert.doesNotMatch(appLogic, /window\.location\.pathname/);
  assert.match(html, /class="header-contact" routerLink="\/recrutamento" fragment="candidatura"/);
  assert.match(html, /routerLink="\/recrutamento" fragment="candidatura" queryParamsHandling="preserve" class="mobile-action"/);
});

test('recruitment hero stays independent of vacancies and avoids the broken flex layout', () => {
  const hero = recruitment.slice(recruitment.indexOf('<section class="recruitment-hero'), recruitment.indexOf('<section class="recruitment-opportunities'));
  assert.match(hero, /class="recruitment-culture-aside|class="recruitment-hero-aside recruitment-culture-aside"/);
  assert.match(hero, /O futuro faz-se/);
  assert.doesNotMatch(hero, /OPORTUNIDADE ATUAL|Comercial|vaga anunciada|01 VAGA/);
  assert.doesNotMatch(styles, /\.recruitment-hero-aside>div\s*\{/);
  assert.match(styles, /\.recruitment-culture-center\s*\{[^}]*min-width:0/);
});

test('vacancy cards scale to zero, one or many without altering the hero', () => {
  assert.match(logic, /readonly vacancies: readonly RecruitmentPath\[\]/);
  assert.match(recruitment, /@for \(vacancy of vacancies; track vacancy.id/);
  assert.match(recruitment, /@empty \{/);
  assert.match(recruitment, /vacancies.length === 0/);
  assert.match(recruitment, /vacancies.length === 1/);
  assert.match(recruitment, /VAGA \{\{idx \+ 1\}\} \/ \{\{vacancies.length\}\}/);
  assert.match(recruitment, /class="recruitment-spontaneous-card"/);
  assert.match(recruitment, /\(click\)="viewDetails\(vacancy\)"/);
  assert.match(recruitment, /\(click\)="choose\(vacancy\)"/);
  assert.match(recruitment, /\(click\)="choose\(spontaneous\)"/);
  assert.match(logic, /readonly spontaneous: RecruitmentPath/);
  assert.match(logic, /vacancies.find\(vacancy => vacancy.id === this.selectedDetail\(\)\)/);
  assert.match(recruitment, /@for \(vacancy of vacancies; track vacancy.id\) \{<option/);
  assert.match(logic, /queryParamMap.get\('tipo'\)/);
  assert.match(logic, /router.navigate\(\['\/recrutamento'\]/);
  assert.match(recruitment, /id="candidatura"/);
  assert.match(recruitment, /formControlName="opportunity"/);
});

test('the footer map action has no hover underline', () => {
  assert.match(styles, /\.footer-address a\.footer-map-link:hover\{[^}]*text-decoration:none!important/);
});


test('headquarters appear only in the Maia aside, while Porto remains a recruitment location', () => {
  const siteSeo = read('scripts/finalize-seo.mjs');
  assert.match(html, /Sede na Maia e equipas em quatro outras cidades\./);
  assert.doesNotMatch(html, /As equipas nas cinco cidades estão identificadas nos cartões ao lado/);
  assert.match(html, /Estamos na Maia/);
  assert.match(html, /SEDE \/ MAIA/);
  assert.equal((html.match(/Av\. Visconde de Barreiros, 15/g) ?? []).length, 3);
  assert.equal((html.match(/4470-157 Maia/g) ?? []).length, 3);
  assert.equal((html.match(/query=Av\.\+Visconde\+de\+Barreiros%2C\+15%2C\+4470-157\+Maia/g) ?? []).length, 2);
  assert.doesNotMatch(html, /Rua Bartolomeu Dias|4200-126|Sede da empresa fica no Porto|SEDE & EQUIPA/);
  assert.match(content, /teamCities = \['Coimbra', 'Leiria', 'Castelo Branco', 'Beja'\]/);
  assert.match(logic, /location: 'Porto'/);
  assert.match(siteSeo, /streetAddress:'Av\. Visconde de Barreiros, 15',postalCode:'4470-157',addressLocality:'Maia'/);
  assert.doesNotMatch(siteSeo, /Rua Bartolomeu Dias|4200-126/);
});

test('opportunity links always stay within the recruitment route despite document base href root', () => {
  assert.equal((recruitment.match(/routerLink="\/recrutamento" fragment="oportunidades" queryParamsHandling="preserve"/g) ?? []).length, 3);
  assert.doesNotMatch(recruitment, /href="#oportunidades"/);
  assert.match(logic, /imports: \[ReactiveFormsModule, RevealDirective, RouterLink\]/);
  assert.match(main, /anchorScrolling: 'enabled'/);
});
