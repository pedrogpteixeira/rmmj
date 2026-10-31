import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {finalizeSeo, getSiteOrigin, pages, renderPage} from './finalize-seo.mjs';

const src = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
const freshDir = () => {
  const dir = mkdtempSync(join(tmpdir(),'rmmj-seo-'));
  writeFileSync(join(dir,'index.html'),src);
  writeFileSync(join(dir,'robots.txt'),'User-agent: *\nAllow: /\n');
  return dir;
};

test('localhost SEO auditing is not blocked in source HTML',()=>{
  assert.match(src, /<meta name="robots" content="index,follow">/);
  assert.match(readFileSync(new URL('../public/robots.txt',import.meta.url),'utf8'),/Allow: \//);
});

test('production uses Netlify URL, generates both indexable pages, sitemap, metadata and structured data',()=>{
  const dir = freshDir();
  try {
    const result=finalizeSeo(dir,{CONTEXT:'production', NETLIFY:'true',URL:'https://rmmj.netlify.app'});
    assert.deepEqual(result,{indexable:true,origin:'https://rmmj.netlify.app'});
    const main=readFileSync(join(dir,'index.html'),'utf8');
    const careers=readFileSync(join(dir,'recrutamento','index.html'),'utf8');
    const robots=readFileSync(join(dir,'robots.txt'),'utf8');
    const map=readFileSync(join(dir,'sitemap.xml'),'utf8');
    assert.match(main, /content="index,follow"/);
    assert.match(main, /<link rel="canonical" href="https:\/\/rmmj.netlify.app\/">/);
    assert.match(main, /"@type":"Organization"/);
    assert.match(main, /"@type":"WebSite"/);
    assert.match(main, /<meta property="og:image" content="https:\/\/rmmj.netlify.app\/rmmj-logo-parceiro-endesa.png">/);
    assert.match(careers, /<title>Recrutamento e candidaturas \| RMMJ<\/title>/);
    assert.match(careers, /<link rel="canonical" href="https:\/\/rmmj.netlify.app\/recrutamento\/">/);
    assert.match(map, /<loc>https:\/\/rmmj.netlify.app\/recrutamento\/<\/loc>/);
    assert.match(robots, /Allow: \//);
    assert.doesNotMatch(main, /"@type":"JobPosting"/);
  } finally {rmSync(dir,{recursive:true,force:true})}
});

test('preview stays non-indexable even when public domain exists',()=>{
  const dir=freshDir();
  try {
    finalizeSeo(dir,{CONTEXT:'deploy-preview', NETLIFY:'true',PUBLIC_SITE_URL:'https://rmmj.pt',URL:'https://rmmj.netlify.app'});
    const main=readFileSync(join(dir,'index.html'),'utf8');
    assert.match(main, /content="noindex,nofollow"/);
    assert.doesNotMatch(main,/rel="canonical"/);
    assert.match(readFileSync(join(dir,'robots.txt'),'utf8'),/Disallow: \//);
    assert.ok(!existsSync(join(dir,'sitemap.xml')));
  } finally {rmSync(dir,{recursive:true,force:true})}
});

test('local production build without domain stays protected',()=>{
  const dir=freshDir();
  try {
    finalizeSeo(dir,{});
    assert.match(readFileSync(join(dir,'index.html'),'utf8'),/content="noindex,nofollow"/);
    assert.match(readFileSync(join(dir,'robots.txt'),'utf8'),/Disallow: \//);
  } finally {rmSync(dir,{recursive:true,force:true})}
});

test('production prefers explicit official domain and validates URL',()=>{
  assert.equal(getSiteOrigin({CONTEXT:'production',URL:'https://rmmj.netlify.app',PUBLIC_SITE_URL:'https://rmmj.pt'}),'https://rmmj.pt');
  assert.throws(()=>getSiteOrigin({PUBLIC_SITE_URL:'http://not-secure.example'}),/HTTPS/);
  assert.throws(()=>getSiteOrigin({PUBLIC_SITE_URL:'https://rmmj.pt/recrutamento'}),/origem/);
  const dir=freshDir();
  try {assert.throws(()=>finalizeSeo(dir,{CONTEXT:'production'}),/sem URL/)}finally{rmSync(dir,{recursive:true,force:true})}
});

test('header and footer labels contain their visible link texts',()=>{
  const html=readFileSync(new URL('../src/app/app.component.html', import.meta.url),'utf8');
  assert.match(html, /aria-label="RMMJ Parceiro oficial Endesa — voltar ao início"/);
  assert.match(html, /aria-label="Ver morada no mapa — Google Maps/);
});
