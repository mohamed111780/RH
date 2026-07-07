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
    const expectedRoles: string[] = route.data['roles']
      ?? (route.data['role'] ? [route.data['role']] : []);
    const user = this.authService.getUser();

    if (!user || !user.role) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRoles.includes(user.role)) {
      return true;
    }

    this.redirectByRole(user.role);
    return false;
  }

  private redirectByRole(role: string): void {
    switch (role) {
      case 'ADMIN':
      case 'MANAGER':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'RH':
        this.router.navigate(['/rh/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
}
