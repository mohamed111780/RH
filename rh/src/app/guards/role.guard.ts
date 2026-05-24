import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const expectedRole = route.data['role'];
    console.log('👤 [RoleGuard] expectedRole:', expectedRole);

    const user = this.authService.getUser();
    console.log('👤 [RoleGuard] user:', user);

    // Vérifier si utilisateur connecté
    if (!user || !user.role) {
      console.log('👤 [RoleGuard] ❌ Utilisateur non connecté - Redirection vers /login');
      this.router.navigate(['/login']);
      return false;
    }

    console.log('👤 [RoleGuard] user.role:', user.role);

    if (user.role === expectedRole) {
      console.log('👤 [RoleGuard] ✅ Rôle correspondant - Accès autorisé');
      return true;
    }

    // Redirection selon le rôle
    console.log('👤 [RoleGuard] ❌ Rôle non correspondant');
    if (user.role === 'RH') {
      console.log('👤 [RoleGuard] → Redirection vers /rh/dashboard');
      this.router.navigate(['/rh/dashboard']);
    } else {
      console.log('👤 [RoleGuard] → Redirection vers /dashboard');
      this.router.navigate(['/dashboard']);
    }

    return false;
  }
}