import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { offerings, steps, faqs, teamCities, type Offering } from './data/content';
import { RevealDirective } from './shared/reveal.directive';
import { encodeContactRequest, sendContactRequest } from './services/contact';
import { RecruitmentComponent } from './features/recruitment.component';

@Component({
  selector: 'rm-site-page', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RevealDirective, RecruitmentComponent, RouterLink],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly fb = new FormBuilder();
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  readonly year = new Date().getFullYear();
  readonly recruitmentPage = inject(ActivatedRoute).snapshot.data['recruitment'] === true;
  readonly offerings = offerings;
  readonly teamCities = teamCities;
  readonly steps = steps;
  readonly faqs = faqs;
  readonly menuOpen = signal(false);
  readonly expandedService = signal<string | null>(null);
  readonly expandedFaq = signal<number | null>(0);
  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly failed = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+\d\s().-]{9,24}$/)]],
    audience: ['Particular', Validators.required],
    subject: ['Informações sobre eletricidade', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1800)]],
    consent: [false, Validators.requiredTrue],
    botField: [''],
  });

  constructor() {
    const title = this.recruitmentPage
      ? 'Recrutamento e candidaturas | RMMJ'
      : 'RMMJ — Parceiro oficial Endesa | Eletricidade e gás';
    const description = this.recruitmentPage
      ? 'Conhece as oportunidades de emprego na RMMJ, incluindo a área comercial no Porto, e apresenta a tua candidatura espontânea.'
      : 'RMMJ, parceiro oficial Endesa. Soluções de eletricidade e gás para particulares e empresas, com equipas no Porto, Coimbra, Leiria, Castelo Branco e Beja.';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    // Respeita a origem definida no deploy: não inventa canónicas em previews.
    const canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      const target = new URL(this.recruitmentPage ? '/recrutamento/' : '/', canonical.href).href;
      canonical.href = target;
      this.meta.updateTag({ property: 'og:url', content: target });
    }
  }

  closeMenu(): void { this.menuOpen.set(false); }
  toggleService(number: string): void { this.expandedService.update(current => current === number ? null : number); }
  toggleFaq(index: number): void { this.expandedFaq.update(current => current === index ? null : index); }
  requestSubject(subject: string, audience = 'Particular'): void {
    this.form.patchValue({ subject, audience });
    this.sent.set(false);
    this.closeMenu();
    document.getElementById('contacto')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  requestOffering(offering: Offering): void {
    const subject = offering.title === 'Eletricidade' ? 'Informações sobre eletricidade'
      : offering.title === 'Gás natural' ? 'Informações sobre gás natural'
      : offering.title === 'Soluções para empresas' ? 'Energia para empresas' : 'Eletricidade e gás';
    this.requestSubject(subject, offering.title === 'Soluções para empresas' ? 'Empresa' : 'Particular');
  }
  async send(): Promise<void> {
    this.failed.set(false);
    if (this.sending()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    if (value.botField) { this.sent.set(true); return; }
    this.sending.set(true);
    this.sent.set(false);
    try {
      await sendContactRequest(encodeContactRequest({
        name: value.name, email: value.email, phone: value.phone,
        audience: value.audience, subject: value.subject, message: value.message,
        consent: value.consent, 'bot-field': value.botField,
      }));
      this.sent.set(true);
      this.form.reset({ name: '', email: '', phone: '', audience: 'Particular', subject: 'Informações sobre eletricidade', message: '', consent: false, botField: '' });
    } catch {
      this.failed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}
