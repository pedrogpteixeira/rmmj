import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { AppShellComponent } from './app/app-shell.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppShellComponent, {
  providers: [provideRouter(appRoutes, withInMemoryScrolling({
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  }))],
}).catch(error => console.error('Falha ao iniciar RMMJ:', error));
