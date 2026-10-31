import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const outputDir = 'dist/rmmj-website/browser';
export const pages = {
  home: {
    path: '/',
    title: 'RMMJ — Parceiro oficial Endesa | Eletricidade e gás',
    description: 'RMMJ, parceiro oficial Endesa. Soluções de eletricidade e gás para particulares e empresas, com equipas no Porto, Coimbra, Leiria, Castelo Branco e Beja.',
  },
  careers: {
    path: '/recrutamento/',
    title: 'Recrutamento e candidaturas | RMMJ',
    description: 'Conhece as oportunidades de emprego na RMMJ, incluindo a área comercial no Porto, e apresenta a tua candidatura espontânea.',
  },
};

export function getSiteOrigin(env) {
  const raw = env.PUBLIC_SITE_URL || (env.CONTEXT === 'production' ? env.URL : '');
  if (!raw) return null;
  let url;
  try { url = new URL(raw); } catch { throw new Error('PUBLIC_SITE_URL/URL tem um endereço inválido.'); }
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error('O domínio público deve utilizar HTTPS.');
  if (url.username || url.password || url.search || url.hash || (url.pathname !== '/' && url.pathname !== '')) throw new Error('O domínio público deve conter apenas a origem (sem caminho ou query).');
  return url.origin;
}

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
function meta(html, kind, key, value) {
  const entry = `<meta ${kind}="${key}" content="${esc(value)}">`;
  const re = new RegExp(`<meta\\s+${kind}="${key}"[^>]*>`, 'i');
  return re.test(html) ? html.replace(re, entry) : html.replace('</head>', `  ${entry}\n</head>`);
}
function link(html, rel, href) {
  const entry = `<link rel="${rel}" href="${esc(href)}">`;
  const re = new RegExp(`<link\\s+rel="${rel}"[^>]*>`, 'i');
  return re.test(html) ? html.replace(re, entry) : html.replace('</head>', `  ${entry}\n</head>`);
}
function removeCanonical(html) { return html.replace(/\s*<link\s+rel="canonical"[^>]*>/ig, ''); }
function removeSchema(html) { return html.replace(/\s*<script\s+type="application\/ld\+json"\s+id="rmmj-seo-schema">[\s\S]*?<\/script>/ig,''); }

export function renderPage(baseHtml, page, origin, indexable) {
  const fullUrl = origin ? origin + page.path : null;
  let html = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);
  html = meta(html, 'name', 'description', page.description);
  html = meta(html, 'name', 'robots', indexable ? 'index,follow' : 'noindex,nofollow');
  html = meta(html, 'property', 'og:title', page.title);
  html = meta(html, 'property', 'og:description', page.description);
  html = meta(html, 'name', 'twitter:title', page.title);
  html = meta(html, 'name', 'twitter:description', page.description);
  if (fullUrl && indexable) {
    html = link(html, 'canonical', fullUrl);
    html = meta(html, 'property', 'og:url', fullUrl);
    html = meta(html, 'property', 'og:image', origin + '/rmmj-logo-parceiro-endesa.png');
    html = meta(html, 'name', 'twitter:image', origin + '/rmmj-logo-parceiro-endesa.png');
    const organization = {
      '@type':'Organization', '@id':origin+'/#organization', name:'RMMJ',
      url:origin+'/', logo:origin+'/rmmj-logo-compacto.png',
      email:'geral@rmmj.pt', telephone:'+351225402127',
      address:{'@type':'PostalAddress',streetAddress:'Rua Bartolomeu Dias, 9, Galeria Esquerda',postalCode:'4200-126',addressLocality:'Porto',addressCountry:'PT'},
    };
    const schema = {
      '@context':'https://schema.org','@graph':[
        organization,
        {'@type':'WebSite','@id':origin+'/#website',name:'RMMJ',url:origin+'/',publisher:{'@id':origin+'/#organization'},inLanguage:'pt-PT'},
        {'@type':page.path==='/'?'WebPage':'CollectionPage','@id':fullUrl+'#webpage',url:fullUrl,name:page.title,description:page.description,isPartOf:{'@id':origin+'/#website'},inLanguage:'pt-PT'},
      ]
    };
    html = removeSchema(html).replace('</head>',`  <script type="application/ld+json" id="rmmj-seo-schema">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>\n</head>`);
  } else {
    html = removeSchema(removeCanonical(html));
    html = html.replace(/\s*<meta\s+property="og:url"[^>]*>/ig,'');
    html = html.replace(/\s*<meta\s+name="twitter:image"[^>]*>/ig,'');
  }
  return html;
}

export function finalizeSeo(dir, env) {
  const indexPath = join(dir, 'index.html');
  if (!existsSync(indexPath)) throw new Error(`Build Angular em falta: ${indexPath}`);
  const isProduction = env.CONTEXT === 'production';
  const origin = getSiteOrigin(env);
  if (isProduction && !origin) throw new Error('Deploy de produção sem URL/ PUBLIC_SITE_URL: impossível publicar SEO correto.');
  const isPreview = env.NETLIFY === 'true' && !isProduction;
  // Build local também fica noindex, evitando publicação acidental de um artefacto sem domínio.
  const indexable = isProduction && !isPreview && Boolean(origin);
  const html = readFileSync(indexPath, 'utf8');
  writeFileSync(indexPath, renderPage(html, pages.home, origin, indexable));
  const recruitmentPath = join(dir, 'recrutamento', 'index.html');
  mkdirSync(dirname(recruitmentPath),{recursive:true});
  writeFileSync(recruitmentPath, renderPage(html, pages.careers, origin, indexable));
  const robots = indexable ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n';
  writeFileSync(join(dir,'robots.txt'),robots);
  const sitemapPath = join(dir,'sitemap.xml');
  if (indexable) {
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      + Object.values(pages).map(page=>`  <url><loc>${origin}${page.path}</loc></url>`).join('\n')+'\n</urlset>\n';
    writeFileSync(sitemapPath,xml);
  } else if(existsSync(sitemapPath)) rmSync(sitemapPath);
  return {indexable,origin};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = finalizeSeo(outputDir, process.env);
  console.log('RMMJ SEO:', result.indexable ? `indexável em ${result.origin}` : 'não indexável (pré-visualização ou build local)');
}
