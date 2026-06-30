import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// CanActivateFn — funkcija koja se poziva pre navigacije na rutu
// Ako vrati false (ili redirect), korisnik ne sme da uđe
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.jeUlogovan) return true;

  router.navigate(['/login']);
  return false;
};
