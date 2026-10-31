import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { RevealDirective } from '../shared/reveal.directive';
import {
  encodeRecruitmentRequest, sendRecruitmentRequest, validateCv,
} from '../services/recruitment';

interface RecruitmentPath {
  id: string;
  tag: string;
  title: string;
  location: string;
  area?: string;
  label: string;
  description: string;
  attributes: readonly string[];
  note: string;
  responsibilities?: readonly string[];
  profile?: readonly string[];
  benefits?: readonly string[];
}

@Component({
  selector: 'rm-recruitment',
  standalone: true,
  imports: [ReactiveFormsModule, RevealDirective, RouterLink],
  templateUrl: './recruitment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecruitmentComponent {
  private readonly fb = new FormBuilder();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  // Atualizar esta lista para publicar mais oportunidades ou deixar [] quando não existirem vagas.
  // Cada vaga tem um ID único e uma opção própria no formulário.
  readonly vacancies: readonly RecruitmentPath[] = [{
    id: 'porto',
    tag: 'VAGA DISPONÍVEL',
    title: 'Comercial (M/F)',
    location: 'Porto',
    area: 'Equipa comercial',
    label: 'Equipa comercial — Porto',
    description: 'A RMMJ está a recrutar para reforçar a sua equipa comercial no Porto, no setor energético. Procuramos pessoas comunicativas, com iniciativa e motivação para trabalhar com clientes.',
    attributes: ['Área comercial', 'Porto', 'Setor energético'],
    note: 'As condições contratuais, o horário e a remuneração concreta são esclarecidos pela equipa de recrutamento durante o processo de seleção.',
    responsibilities: [
      'Apresentar soluções comerciais a potenciais clientes.',
      'Comunicar com o público e compreender necessidades.',
      'Trabalhar em equipa e desenvolver competências na área comercial.',
    ],
    profile: [
      'Boa capacidade de comunicação e relacionamento interpessoal.',
      'Atitude positiva, iniciativa e orientação para resultados.',
      'Vontade de aprender e evoluir profissionalmente.',
    ],
    benefits: [
      'Formação inicial e acompanhamento contínuo.',
      'Comissões associadas ao desempenho.',
      'Possibilidades de desenvolvimento profissional.',
    ],
  }];
  readonly spontaneous: RecruitmentPath = {
    id: 'espontanea', tag: 'CANDIDATURA ESPONTÂNEA', title: 'Apresenta o teu perfil',
    location: 'Portugal', label: 'Candidatura espontânea',
    description: 'Não te identificas com a vaga disponível? Partilha o teu currículo e indica a área em que gostarias de trabalhar.',
    attributes: ['Outras áreas', 'Apresentação do perfil'],
    note: 'Não corresponde a uma vaga atualmente aberta e não garante contacto ou entrevista.',
  };
  readonly selected = signal<string>(this.vacancies[0]?.id ?? this.spontaneous.id);
  readonly selectedDetail = signal<string | null>(null);
  readonly detailPath = computed(() => this.vacancies.find(vacancy => vacancy.id === this.selectedDetail()) ?? null);
  readonly cv = signal<File | null>(null);
  readonly cvError = signal('');
  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly failed = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+\d\s().-]{9,24}$/)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    opportunity: [this.vacancies[0]?.label ?? this.spontaneous.label, Validators.required],
    experience: ['Sem experiência', Validators.required],
    motivation: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(1800)]],
    consent: [false, Validators.requiredTrue],
    botField: [''],
  });

  constructor() {
    if (this.route.snapshot.queryParamMap.get('tipo') === 'espontanea') {
      this.selected.set('espontanea');
      this.form.patchValue({ opportunity: 'Candidatura espontânea' });
    }
  }

  viewDetails(path: RecruitmentPath): void {
    if (!this.vacancies.some(vacancy => vacancy.id === path.id)) return;
    this.selectedDetail.update(value => value === path.id ? null : path.id);
    if (this.selectedDetail()) {
      requestAnimationFrame(() => document.getElementById('job-detail')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'nearest',
      }));
    }
  }

  closeDetails(): void { this.selectedDetail.set(null); }

  choose(path: RecruitmentPath): void {
    this.selected.set(path.id);
    this.form.patchValue({ opportunity: path.label });
    this.sent.set(false);
    this.failed.set(false);
    void this.router.navigate(['/recrutamento'], {
      queryParams: path.id === 'espontanea' ? { tipo: 'espontanea' } : {},
      fragment: 'candidatura',
      replaceUrl: true,
    });
    document.getElementById('candidatura')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  }

  syncChoice(): void {
    const isSpontaneous = this.form.controls.opportunity.value === 'Candidatura espontânea';
    this.selected.set(isSpontaneous ? this.spontaneous.id : this.vacancies.find(vacancy => vacancy.label === this.form.controls.opportunity.value)?.id ?? this.spontaneous.id);
  }

  onCvChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    this.cvError.set(validateCv(file) ?? '');
    this.cv.set(file && !validateCv(file) ? file : null);
    if (this.cvError()) input.value = '';
    this.sent.set(false);
  }

  async send(): Promise<void> {
    if (this.sending()) return;
    this.failed.set(false);
    this.form.markAllAsTouched();
    this.cvError.set(validateCv(this.cv()) ?? '');
    if (this.form.invalid || this.cvError()) return;
    const value = this.form.getRawValue();
    if (value.botField) { this.sent.set(true); return; }
    this.sending.set(true);
    this.sent.set(false);
    try {
      await sendRecruitmentRequest(encodeRecruitmentRequest({
        name: value.name, email: value.email, phone: value.phone, city: value.city,
        opportunity: value.opportunity, experience: value.experience,
        motivation: value.motivation, consent: value.consent,
        'bot-field': value.botField, cv: this.cv(),
      }));
      this.sent.set(true);
      this.form.reset({
        name: '', email: '', phone: '', city: '',
        opportunity: value.opportunity, experience: 'Sem experiência', motivation: '', consent: false, botField: ''
      });
      this.cv.set(null);
      this.cvError.set('');
      const cvInput = document.getElementById('candidate-cv') as HTMLInputElement | null;
      if (cvInput) cvInput.value = '';
    } catch {
      this.failed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}
