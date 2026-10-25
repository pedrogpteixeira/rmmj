import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

@Directive({ selector: '[rmReveal]', standalone: true })
export class RevealDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  constructor() {
    afterNextRender(() => {
      const element = this.el.nativeElement;
      if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.classList.add('is-visible');
        return;
      }
      element.classList.add('reveal-ready');
      const observer = new IntersectionObserver(entries => {
        if (entries[0]?.isIntersecting) {
          element.classList.add('is-visible');
          observer.disconnect();
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
      observer.observe(element);
    });
  }
}
