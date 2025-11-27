import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se está autenticado
  const isAuth = authService.isAuthenticated();
  
  // Se já estiver autenticado, redireciona para home
  if (isAuth) {
    router.navigate(['/home'], { replaceUrl: true });
    return false;
  }

  // Permite acesso à página de login se não estiver autenticado
  return true;
};

