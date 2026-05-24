import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {

    console.log('🔐 [AuthGuard] Vérification...');
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('🔐 [AuthGuard] isLoggedIn:', isLoggedIn);

    const user = this.authService.getUser();
    console.log('🔐 [AuthGuard] user:', user);

    const userRole = this.authService.getUserRole();
    console.log('🔐 [AuthGuard] userRole:', userRole);

    if (isLoggedIn) {
      console.log('🔐 [AuthGuard] ✅ Accès autorisé');
      return true;
    }

    // Pas connecté → rediriger vers login
    console.log('🔐 [AuthGuard] ❌ Accès refusé - Redirection vers /login');
    this.router.navigate(['/login']);
    return false;
  }
}