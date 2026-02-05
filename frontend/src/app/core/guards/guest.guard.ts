import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Redirige vers / si l'utilisateur est déjà connecté (évite d'afficher login/register). */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isLoggedIn = await auth.waitForAuth();
  if (isLoggedIn) return router.createUrlTree(['/']);
  return true;
};
