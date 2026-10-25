# RMMJ — Proposta de reestruturação (V1)

Website institucional Angular, com apresentação de soluções de eletricidade e gás, clientes particulares e empresas, equipa/comercial e pedido de contacto.

## Iniciar

Requer Node.js 22.22.3 ou superior (ou versão suportada por Angular 22).

```bash
npm install
npm start
```

Verificações:

```bash
npm run check
npm test
npm run build
```

## Deploy

Preparado para Netlify (`netlify.toml`). O formulário necessita de publicação na Netlify e ativação de Forms. Testar uma submissão real antes de disponibilizar aos clientes. Depois de instalar pela primeira vez, confirmar `npm audit` e versionar o `package-lock.json` atualizado.

## Conteúdos a confirmar com a empresa

- O logótipo e a identidade RMMJ nesta proposta são **provisórios**. Substituir pelos elementos oficiais após aprovação.
- A designação Parceiro Oficial Endesa, a presença nas cidades, o telefone, morada e email resultam de referências públicas indexadas em outubro de 2026; validar antes de publicar.
- As descrições de serviços são informativas. Não prometem poupanças, descontos ou tarifas específicas, que podem mudar.
- Preparar uma **política de privacidade completa** e respetiva base jurídica para os formulários antes da publicação.
- Indexação bloqueada de propósito por `noindex,nofollow` e `public/robots.txt` enquanto protótipo. Definir SEO e domínio final na fase de lançamento.
- O formulário de candidatura **aceita currículo opcional** (PDF, DOC ou DOCX, até 5 MB), sujeito a configuração e testes reais de envio na Netlify.

## Recrutamento independente — V1.2

- Página própria em `/recrutamento/`, com cartões de equipa comercial no Porto (oportunidade **a confirmar**) e candidatura espontânea.
- Formulário Netlify **`rmmj-recrutamento`**, completamente separado de **`rmmj-contacto`**; seleção do cartão pré-preenche o assunto da candidatura.
- Campos: nome, email, telefone, localidade, tipo de candidatura, experiência, motivação e **CV opcional** (PDF/DOC/DOCX até 5 MB).
- Alternativa de envio direto de CV para **sandra.sousa@rmmj.pt**, conforme informação indexada da página de recrutamento em outubro de 2026. Confirmar contacto antes de publicar.
- Netlify SPA rewrite no `netlify.toml`: o acesso direto a `/recrutamento/` e o refresh devem funcionar após deploy.
- É obrigatório configurar **notificações separadas** para as submissões de recrutamento e validar uma candidatura real na Netlify; os envios não são testáveis completamente em desenvolvimento local.
- Antes de publicar: confirmar disponibilidade e condições da vaga no Porto; aprovar a política de privacidade e **retenção dos CVs**, tendo em atenção que a Netlify armazena os anexos associados às submissões.
- A V1.2 preserva a paleta azul da pré-visualização V1.1 e reduz os grafismos decorativos, mas as cores oficiais do site original devem ainda ser confirmadas com o cliente.

## Estrutura

`src/app/app.component.*` — página principal / interações / formulário.
`src/app/data/content.ts` — serviços, etapas e FAQ.
`src/app/features/recruitment.component.*` — página independente de recrutamento.
`src/app/services/recruitment.ts` — validação de CV e envio multipart do formulário exclusivo.
`src/app/shared/reveal.directive.ts` — reveal ao scroll.
`src/app/services/contact.ts` — serialização e transporte do formulário.
`src/styles.css` — design e responsividade.
`public/netlify-forms.html` — registo estático do formulário.

## Fonte editorial

rmmj.pt, páginas indexadas Quem somos, Serviços, Empresas e Contactos, e LinkedIn institucional. Conteúdos devem ser confirmados com a empresa.

## Alterações V1.3 — identidade, equipas e recrutamento

- Homepage renovada com um hero apoiado em factos públicos: atividade desde 2021, particulares/empresas e **cinco cidades onde a RMMJ afirma ter equipas** (Porto, Coimbra, Leiria, Castelo Branco e Beja). Não são estatísticas de clientes nem lojas próprias.
- Ribbon **retirada** do HTML. Parceria com a Endesa apresentada **uma única vez como "Parceiro Oficial"** numa faixa institucional discreta.
- Nova secção `#presenca`: cartões individualizados para as cinco cidades, sede e morada do Porto, e distinção explícita entre **equipas da RMMJ** e **lojas Endesa**, cuja rede pode ser consultada no website oficial. **Não atribuir lojas Endesa à RMMJ sem confirmação contratual.**
- Página `/recrutamento/`: cartões de oportunidade e candidatura espontânea, detalhe aberto por seleção, candidatura pré-selecionada e formulário exclusivo com CV opcional. O link `?tipo=espontanea` pré-seleciona candidaturas espontâneas.
- Vaga do Porto, endereço, telefone, email e regiões a confirmar com a RMMJ antes de publicação; sem promessas de condições de emprego não verificadas.
- Para testar: `npm install`, `npm test`, `npm run check`, `npm run build`; verificar `/recrutamento/`, `/recrutamento/?tipo=espontanea#candidatura` e o formulário publicado na Netlify.
