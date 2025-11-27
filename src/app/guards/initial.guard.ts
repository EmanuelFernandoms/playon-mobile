import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const initialGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se estiver autenticado, redireciona para home
  if (authService.isAuthenticated()) {
    router.navigate(['/home'], { replaceUrl: true });
    return false;
  }

  // Se não estiver autenticado, redireciona para login
  router.navigate(['/login'], { replaceUrl: true });
  return false;
};



