import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { ReactiveFormsModule,
         FormBuilder,
         FormGroup,
         Validators }                    from '@angular/forms';
import { RouterModule, Router }          from '@angular/router';
import { Subject, interval }             from 'rxjs';
import { takeUntil, take }               from 'rxjs/operators';
import { AuthService }                  from '../../services/auth/auth.service';
import {ChangeDetectorRef} from "@angular/core";

@Component({
  selector:    'app-reset-password',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls:   ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  // ── Navigation entre étapes ───────────────────────────────────────
  // Étape 1 : demandeMotDePasse(email)
  // Étape 2 : validationCode(email, code)
  // Étape 3 : changePassword(email, password)
  // Étape 4 : écran de succès
  currentStep = 1;

  // ── Formulaires ───────────────────────────────────────────────────
  step1Form!: FormGroup;   // champ : email
  step2Form!: FormGroup;   // champs : code
  step3Form!: FormGroup;   // champs : password, confirm

  // ── État UI ───────────────────────────────────────────────────────
  isLoading      = false;
  errorMessage   = '';
  successMessage = '';

  // Email conservé entre les étapes (transmis à chaque appel backend)
  submittedEmail = '';

  // Bouton œil
  showPassword = false;
  showConfirm  = false;

  // Vérification concordance des mots de passe
  passwordMismatch = false;

  // Indicateur de force du mot de passe
  strengthScore = 0;   // 0-4
  strengthLabel = '';
  strengthColor = '#e5e7eb';
  strengthLevel = '';

  // Timer renvoi du code (60 secondes)
  resendCountdown = 0;

  private destroy$ = new Subject<void>();

  // Barre de progression selon l'étape
  get progressWidth(): string {
    const map: Record<number, string> = { 1: '33%', 2: '66%', 3: '99%', 4: '100%' };
    return map[this.currentStep] ?? '0%';
  }

 constructor(
  private fb: FormBuilder,
  private router: Router,
  private auth: AuthService   ,
  
) {}

  // ── Initialisation ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.step1Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.step2Form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    this.step3Form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm:  ['', [Validators.required]],
    });
  }

  // ── Helpers validation ─────────────────────────────────────────────
  isInvalid(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  // ── ÉTAPE 1 : demandeMotDePasse({ email }) ────────────────────────
 submitStep1(): void {
  if (this.step1Form.invalid) {
    this.step1Form.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  const email = this.step1Form.get('email')!.value.trim();

  this.auth.requestPasswordReset({ email })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.submittedEmail = email;
        this.currentStep = 2;
        this.startResendTimer();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l’envoi du code.';
      }
    });
}

  // ── ÉTAPE 2 : validationCode({ email, code }) ─────────────────────
 submitStep2(): void {
  if (this.step2Form.invalid) {
    this.step2Form.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  const payload = {
    email: this.submittedEmail,
    code: this.step2Form.get('code')!.value.trim(),
  };

  this.auth.validateResetCode(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;

        setTimeout(() => {
          this.successMessage = '';
          this.currentStep = 3;
        }, 800);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Code invalide ou expiré.';
      }
    });
}

  // ── ÉTAPE 3 : changePassword({ email, password }) ─────────────────
 submitStep3(): void {
  if (this.step3Form.invalid) {
    this.step3Form.markAllAsTouched();
    return;
  }

  const password = this.step3Form.get('password')!.value;
  const confirm = this.step3Form.get('confirm')!.value;

  if (password !== confirm) {
    this.passwordMismatch = true;
    return;
  }

  this.passwordMismatch = false;
  this.isLoading = true;
  this.errorMessage = '';

  const payload = {
    email: this.submittedEmail,
    password: password,
  };

  this.auth.changePassword(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 4;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de la mise à jour.';
      }
    });
}

  // ── Renvoi du code ─────────────────────────────────────────────────
 resendCode(): void {
  if (this.resendCountdown > 0) return;

  this.auth.requestPasswordReset({ email: this.submittedEmail })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.successMessage = 'Code renvoyé avec succès.';
        this.startResendTimer();
      },
      error: () => {
        this.errorMessage = 'Erreur lors du renvoi.';
      }
    });

  this.step2Form.reset();
}

  private startResendTimer(): void {
    this.resendCountdown = 60;
    interval(1000)
      .pipe(take(60), takeUntil(this.destroy$))
      .subscribe(() => { this.resendCountdown--; });
  }

  // ── Retour à l'étape précédente ────────────────────────────────────
  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage   = '';
      this.successMessage = '';
    }
  }

  // ── Toggle affichage mot de passe ──────────────────────────────────
  togglePassword(field: 'password' | 'confirm'): void {
    if (field === 'password') this.showPassword = !this.showPassword;
    else                      this.showConfirm  = !this.showConfirm;
  }

  // ── Indicateur de force du mot de passe ───────────────────────────
  updateStrength(): void {
    const pwd = this.step3Form.get('password')!.value ?? '';
    let score = 0;

    if (pwd.length >= 8)               score++;
    if (/[A-Z]/.test(pwd))             score++;
    if (/[0-9]/.test(pwd))             score++;
    if (/[^A-Za-z0-9]/.test(pwd))      score++;

    this.strengthScore = score;
    this.passwordMismatch = false;

    const map: Record<number, { label: string; color: string }> = {
      0: { label: '',          color: '#e5e7eb' },
      1: { label: 'Faible',    color: '#ef4444' },
      2: { label: 'Moyen',     color: '#f59e0b' },
      3: { label: 'Bon',       color: '#3b82f6' },
      4: { label: 'Excellent', color: '#10b981' },
    };

    this.strengthLabel = map[score].label;
    this.strengthColor = map[score].color;
  }

  // ── Nettoyage ─────────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}