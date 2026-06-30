import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// loadComponent — lazy loading: komponenta se učitava tek kad se ode na rutu
// (Angular ekvivalent React.lazy + Suspense). Standalone komponente ovo podržavaju direktno.
export const routes: Routes = [
  // Početna ruta vodi na meni (logo u navbaru vodi na "/")
  { path: '', pathMatch: 'full', redirectTo: 'meni' },

  {
    path: 'meni',
    loadComponent: () => import('./pages/meni/meni.component').then(m => m.MeniComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
  },

  // istorija je zaštićena — authGuard preusmerava neulogovane na /login
  {
    path: 'istorija',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/istorija/istorija.component').then(m => m.IstorijaComponent),
  },

  // Fallback — sve nepoznate rute na početnu
  { path: '**', redirectTo: 'meni' },
];
