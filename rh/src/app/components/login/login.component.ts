import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      rememberMe: [false]
    });

    // remember email
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  // ===== Validation =====

  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getError(field: string, error: string): boolean {
    return !!this.loginForm.get(field)?.hasError(error);
  }

  // ===== Actions =====

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    // remember me
    if (rememberMe) {
      localStorage.setItem('remembered_email', email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    // ⚠️ mapping email → username
    const payload = {
      username: email,
      password: password
    };

    this.authService.login(payload).subscribe({
      next: (res) => this.handleLoginSuccess(res),
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
      }
    });
  }

  private handleLoginSuccess(response: any): void {

    // stocker tokens + user
    this.authService.saveSession(response);

    const user = response.utilisateur;

    this.isLoading = false;
    this.successMessage = `Bienvenue, ${user.prenom} !`;

    setTimeout(() => {

      if (user.role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else if (user.role === 'RH') {
        this.router.navigate(['/rh/dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }

    }, 800);
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/reset']);
  }

  goToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
  }
}