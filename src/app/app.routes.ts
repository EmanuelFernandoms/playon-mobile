import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./views/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./views/home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'ginasio/:id',
    loadComponent: () => import('./views/ginasio/ginasio.page').then((m) => m.GinasioPage),
    canActivate: [authGuard],
  },
  {
    path: 'explorar',
    loadComponent: () => import('./views/explorar/explorar.page').then((m) => m.ExplorarPage),
    canActivate: [authGuard],
  },
  {
    path: 'reservas',
    loadComponent: () => import('./views/reservas/reservas.page').then((m) => m.ReservasPage),
    canActivate: [authGuard],
  },
  {
    path: 'reserva/:id',
    loadComponent: () => import('./views/reserva/reserva.page').then((m) => m.ReservaPage),
    canActivate: [authGuard],
  },
  {
    path: 'quadra/:id',
    loadComponent: () => import('./views/quadra/quadra.page').then((m) => m.QuadraPage),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () => import('./views/perfil/perfil.page').then((m) => m.PerfilPage),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
]
