import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CAREER_OFFERS, CareerOffer } from '../career-offers';
import { CandidatureService } from '../../../services/candidature.service';
import { Candidature } from '../../../models/candidature';

@Component({
  selector: 'app-apply-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './apply-form.component.html',
  styleUrls: ['./apply-form.component.css']
})
export class ApplyFormComponent {
  offer: CareerOffer | undefined;
  candidate = { name: '', email: '', phone: '', cv: '', message: '' };
  customSkill = '';
  selectedSkills: string[] = [];
  currentStep = 1;
  submitted = false;
  isSubmitting = false;
  submitError = '';

  readonly steps = [
    { id: 1, label: 'Profil' },
    { id: 2, label: 'Compétences' },
    { id: 3, label: 'Validation' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidatureService: CandidatureService
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.offer = CAREER_OFFERS.find(o => o.id === id);
    if (!this.offer) {
      this.router.navigate(['/home']);
    }
  }

  toggleSkill(skill: string): void {
    if (this.selectedSkills.includes(skill)) {
      this.selectedSkills = this.selectedSkills.filter(item => item !== skill);
      return;
    }

    this.selectedSkills = [...this.selectedSkills, skill];
  }

  addCustomSkill(): void {
    const skill = this.customSkill.trim();
    if (!skill || this.selectedSkills.some(item => item.toLowerCase() === skill.toLowerCase())) {
      this.customSkill = '';
      return;
    }

    this.selectedSkills = [...this.selectedSkills, skill];
    this.customSkill = '';
  }

  removeSkill(skill: string): void {
    this.selectedSkills = this.selectedSkills.filter(item => item !== skill);
  }

  nextStep(): void {
    if (!this.canContinue()) {
      return;
    }

    this.currentStep = Math.min(this.currentStep + 1, this.steps.length);
  }

  previousStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  canContinue(): boolean {
    if (this.currentStep === 1) {
      return !!this.candidate.name.trim() && !!this.candidate.email.trim() && !!this.candidate.phone.trim();
    }

    if (this.currentStep === 2) {
      return this.selectedSkills.length > 0;
    }

    return true;
  }

  canSubmit(): boolean {
    return !!this.candidate.name.trim()
      && !!this.candidate.email.trim()
      && !!this.candidate.phone.trim()
      && this.selectedSkills.length > 0
      && !this.isSubmitting;
  }

  estimatedScore(): number {
    const offerSkills = this.offer?.skills ?? [];
    if (!offerSkills.length || !this.selectedSkills.length) {
      return 0;
    }

    const normalizedCandidateSkills = new Set(this.selectedSkills.map(skill => this.normalizeSkill(skill)));
    const matches = offerSkills.filter(skill => normalizedCandidateSkills.has(this.normalizeSkill(skill))).length;

    return Math.round((matches * 100) / offerSkills.length);
  }

  submitApplication(): void {
    if (!this.offer || !this.canSubmit()) { return; }

    const payload: Candidature = {
      nomCandidat: this.candidate.name.trim(),
      email: this.candidate.email.trim(),
      telephone: this.candidate.phone.trim(),
      cv: this.candidate.cv.trim(),
      lettreMotivation: this.candidate.message.trim(),
      poste: this.offer.titre,
      departement: this.offer.departement,
      competenceTags: this.selectedSkills,
      offreId: this.offer.id,
      titreOffre: this.offer.titre
    };

    this.submitError = '';
    this.isSubmitting = true;
    this.candidatureService.postuler(this.offer.id ?? 0, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitted = true;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = String(err?.error?.message || err?.error || 'Erreur lors de l\'envoi de la candidature');
      }
    });
  }

  private normalizeSkill(skill: string): string {
    return skill.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
