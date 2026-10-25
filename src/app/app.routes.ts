import type { Routes } from '@angular/router';
import { AppComponent } from './app.component';

// Rotas explícitas: a página de recrutamento funciona via navegação Angular
// e quando o endereço /recrutamento/ é aberto diretamente (com fallback SPA).
export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', component: AppComponent, data: { recruitment: false } },
  { path: 'recrutamento', component: AppComponent, data: { recruitment: true } },
  { path: '**', redirectTo: '' },
];
