import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { EmployeService } from '../../../services/employe.service';
import { Employe } from '../../../models/employe';
import { FormationService } from '../../../services/formation.service';
import { DemandeFormationService } from '../../../services/demande-formation.service';
import { Formation as FormationApi } from '../../../models/formation';
import { DemandeFormation as DemandeFormationApi } from '../../../models/demande-formation';
import { OffreEmploiService } from '../../../services/offre-emploi.service';
import { OffreEmploi } from '../../../models/offre-emploi';
import { CandidatureService } from '../../../services/candidature.service';
import { Candidature as BackendCandidature } from '../../../models/candidature';
import {
  DemandeConge,
  CreateDemandeConge,
  StatutDemande,
  TypeConge,
  TYPE_LABELS
} from '../../../models/demande-conge';
import { DemandeCongeService } from '../../../services/demande-conge.service';

export type FormationStatus = 'enrolled' | 'completed' | 'pending' | 'available';
export type CongeForm = CreateDemandeConge & { commentaire?: string };

export interface OffreInterne {
  id: number;
  title: string;
  dept: string;
  type: 'tech' | 'design' | 'data' | 'mgmt';
  niveau: 'junior' | 'mid' | 'senior';
  niveauLabel: string;
  tags: string[];
  datePub: string;
  description: string;
  postule: boolean;
}

export interface Formation {
  id: string | number;
  title: string;
  tag: 'tech' | 'soft' | 'lead';
  tagLabel: string;
  desc: string;
  duration: string;
  rating: string;
  enrolled: number;
  progress?: number;
  status: FormationStatus;
  dateInscription?: string;
  dateCompletion?: string;
  demandeId?: number;
  justification?: string;
}

@Component({
  selector: 'app-espace-employe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './espace-employe.component.html',
  styleUrls: ['./espace-employe.component.css']
})
export class EspaceEmployeComponent implements OnInit {

  // â”€â”€ Profil employÃ© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  employe = {
    id:            0,
    matricule:     'EMP-2024-0147',
    nom:           'Benali',
    prenom:        'Sami',
    email:         'sami.benali@nexhr.tn',
    telephone:     '+216 55 123 456',
    poste:         'DÃ©veloppeur Full Stack',
    dept:          'IngÃ©nierie',
    dateEmbauche:  '2022-03-15',
    typeContrat:   'CDI',
    soldeConges:   18,
    congesUtilises: 7,
    avatar:        'SB',
    avatarColor:   'rgba(108,99,255,0.25)',
    avatarText:    'var(--accent2)',
  };

  loadingProfile = false;
  savingProfile = false;
  savingPassword = false;
  loadingOffresInternes = false;
  postingCandidature = false;

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  currentPage  = 'dashboard';
  pageTitle    = 'Mon Espace';

  pageTitles: Record<string, string> = {
    dashboard:  'Mon Espace',
    conges:     'Mes CongÃ©s',
    offres:     'Offres Internes',
    formations: 'Formations',
    parametres: 'ParamÃ¨tres',
  };

  // â”€â”€ UI State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  toastMessage  = '';
  toastVisible  = false;
  private toastTimer: any;
  showSuccessModal = false;
  successModalMessage = '';
  private successModalTimer: any;
  showCongeModal    = false;
  showOffreModal: OffreInterne | null = null;
  showFormationModal: Formation | null = null;
  showDemandeFormationModal = false;
  showEditDemandeFormationModal = false;
  showCancelDemandeFormationModal = false;
  selectedFormationForRequest: Formation | null = null;
  selectedFormationRequest: Formation | null = null;
  demandeFormationForm = { justification: '' };
  editDemandeFormationForm = { justification: '' };
  loadingFormations = false;
  submittingFormationRequest = false;
  updatingFormationRequest = false;

  editingConge: DemandeConge | null = null;
  congeForm: CongeForm = { dateDebut: '', dateFin: '', type: 'PAYE' };
  demandesConge: DemandeConge[] = [];
  loadingDemandesConge = false;
  submittingConge = false;
  cancelingFormationRequest = false;
  formationRequestSuccess = '';
  formationRequestError = '';
  editFormationRequestError = '';
  activeFormationTab = 'catalogue';
  congeTypeOptions: TypeConge[] = Object.keys(TYPE_LABELS) as TypeConge[];

  // â”€â”€ CongÃ© form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // â”€â”€ ParamÃ¨tres form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  paramForm = {
    nom:       'Benali',
    prenom:    'Sami',
    email:     'sami.benali@nexhr.tn',
    telephone: '+216 55 123 456',
    oldPwd:    '',
    newPwd:    '',
    confirmPwd:'',
  };

  // â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  offresInternes: OffreInterne[] = [];

  formations: Formation[] = [];

  // â”€â”€ Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  constructor(
    private authService: AuthService,
    private employeService: EmployeService,
    private formationService: FormationService,
    private demandeFormationService: DemandeFormationService,
    private demandeCongeService: DemandeCongeService,
    private offreEmploiService: OffreEmploiService,
    private candidatureService: CandidatureService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentEmploye();
  }

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  showPage(page: string): void {
    this.currentPage = page;
    this.pageTitle   = this.pageTitles[page] || page;

    if (page === 'offres' && this.employe.id) {
      this.loadOffresInternes();
    }
    if (page === 'formations' && this.employe.id) {
      this.loadFormationsData();
    }
    if (page === 'conges' && this.employe.id) {
      this.loadDemandesConge();
    }
  }

  logoutEmploye(): void {
    this.authService.clearSession();
    this.router.navigate(['/home']);
  }

  // â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  get soldeRestant(): number { return this.employe.soldeConges - this.employe.congesUtilises; }

  get anciennete(): string {
    const d = new Date(this.employe.dateEmbauche);
    const now = new Date();
    const years  = now.getFullYear() - d.getFullYear();
    const months = now.getMonth()    - d.getMonth();
    const total  = years * 12 + months;
    if (total < 12) return `${total} mois`;
    const y = Math.floor(total / 12);
    const m = total % 12;
    return m > 0 ? `${y} an${y > 1 ? 's' : ''} ${m} mois` : `${y} an${y > 1 ? 's' : ''}`;
  }

  get mesFormationsActives(): Formation[] {
    return this.formations.filter(f => f.status !== 'available');
  }

  get formationsCatalogue(): Formation[] {
    return this.formations.filter(f => f.status === 'available');
  }

  get dashboardOffresInternes(): OffreInterne[] {
    return this.offresInternes.slice(0, 3);
  }

  get dashboardFormations(): Formation[] {
    return this.formations.slice(0, 2);
  }

  get pendingConges(): number {
    return this.demandesConge.filter(c => c.statutDemande === 'EN_ATTENTE').length;
  }

  loadFormationsData(): void {
    this.loadingFormations = true;
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.formations = formations.map(f => this.mapFormationFromApi(f));
        this.loadDemandesFormation();
      },
      error: () => {
        this.loadingFormations = false;
        this.showToast('Impossible de charger les formations');
      }
    });
  }

  loadDemandesFormation(): void {
    if (!this.employe.id) {
      this.loadingFormations = false;
      return;
    }

    this.demandeFormationService.getByEmploye(this.employe.id).subscribe({
      next: (demandes) => {
        this.applyDemandesFormation(demandes);
        this.loadingFormations = false;
      },
      error: () => {
        this.loadingFormations = false;
        this.showToast('Impossible de charger vos demandes de formation');
      }
    });
  }

  // â”€â”€ CongÃ©s â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  openCongeModal(): void {
    this.editingConge = null;
    this.congeForm = { type: 'PAYE', dateDebut: '', dateFin: '' };
    this.showCongeModal = true;
  }

  openEditCongeModal(conge: DemandeConge): void {
    if (conge.statutDemande !== 'EN_ATTENTE') {
      this.showToast('Seules les demandes en attente peuvent etre modifiees');
      return;
    }
    this.editingConge = conge;
    this.congeForm = {
      type: conge.typeConge,
      dateDebut: this.toDateInputValue(conge.debut),
      dateFin: this.toDateInputValue(conge.fin)
    };
    this.showCongeModal = true;
  }

  closeCongeModal(): void {
    this.showCongeModal = false;
    this.editingConge = null;
  }

  submitConge(): void {
    if (!this.congeForm.dateDebut || !this.congeForm.dateFin) {
      this.showToast('âš ï¸ Veuillez renseigner les dates');
      return;
    }
    if (!this.employe.id) {
      this.showToast('Profil employe introuvable');
      return;
    }
    if (this.editingConge) {
      this.updateConge();
      return;
    }
    this.createDemandeConge();
  }

  private createDemandeConge(): void {
    this.submittingConge = true;
    const payload: CreateDemandeConge = {
      type: this.congeForm.type,
      dateDebut: this.congeForm.dateDebut,
      dateFin: this.congeForm.dateFin
    };
    this.demandeCongeService.createDemande(this.employe.id!, payload).subscribe({
      next: () => {
        this.submittingConge = false;
        this.closeCongeModal();
        this.loadDemandesConge();
        this.showToast('âœ… Demande de congÃ© soumise avec succÃ¨s');
      },
      error: (error: HttpErrorResponse) => {
        this.submittingConge = false;
        this.showToast(this.getCongeErrorMessage(error, 'Erreur lors de la creation de la demande de conge'));
      }
    });
  }

  private updateConge(): void {
    if (!this.editingConge?.id) {
      this.showToast('Impossible de modifier cette demande');
      return;
    }
    this.submittingConge = true;
    const updated: DemandeConge = {
      ...this.editingConge,
      debut: this.congeForm.dateDebut,
      fin: this.congeForm.dateFin,
      typeConge: this.congeForm.type,
      statutDemande: this.editingConge.statutDemande,
      matriculeEmploye: this.editingConge.matriculeEmploye,
      nomEmploye: this.editingConge.nomEmploye,
      prenomEmploye: this.editingConge.prenomEmploye,
    };
    this.demandeCongeService.updateDemande(this.editingConge.id, updated).subscribe({
      next: () => {
        this.submittingConge = false;
        this.closeCongeModal();
        this.loadDemandesConge();
        this.showToast('Demande de congÃ© mise a jour');
      },
      error: (error: HttpErrorResponse) => {
        this.submittingConge = false;
        this.showToast(this.getCongeErrorMessage(error, 'Erreur lors de la mise a jour de la demande'));
      }
    });
  }

  private getCongeErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    const serverMessage = error.error?.message || error.error?.error;
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage;
    }

    return fallback;
  }

  cancelDemande(id: number): void {
    this.demandeCongeService.deleteDemande(id).subscribe({
      next: () => {
        this.loadDemandesConge();
        this.showToast('Demande annulee');
      },
      error: () => {
        this.showToast('Erreur lors de l annulation de la demande');
      }
    });
  }

  private loadDemandesConge(): void {
    if (!this.employe.id) {
      return;
    }

    this.loadingDemandesConge = true;
    this.demandeCongeService.getDemandesByEmployeeId(this.employe.id).subscribe({
      next: (demandes) => {
        this.demandesConge = demandes;
        this.loadingDemandesConge = false;
      },
      error: () => {
        this.loadingDemandesConge = false;
        this.showToast('Impossible de charger vos demandes de congÃ©');
      }
    });
  }

  // ── Offres ──────────────────────────────────────────────────────────────────────────────────────────
  openOffreModal(event: MouseEvent, offre: OffreInterne): void {
    event.stopPropagation();
    console.log('openOffreModal', offre);
    this.showOffreModal = offre;
  }

  postuler(offre: OffreInterne): void {
    console.log('postuler start', offre);
    if (!this.employe.id) {
      console.log('postuler failed: employe introuvable');
      this.showToast('Profil employe introuvable');
      return;
    }
    if (offre.postule) {
      console.log('postuler skipped: deja postule', offre.id);
      this.showToast('Vous avez deja postule a cette offre');
      return;
    }

    const candidaturePayload: BackendCandidature = {
      nomCandidat: `${this.employe.prenom} ${this.employe.nom}`.trim(),
      email: this.employe.email,
      employeId: this.employe.id,
      matriculeEmploye: this.employe.matricule,
      telephone: this.employe.telephone,
      poste: this.employe.poste,
      departement: this.employe.dept,
      offreId: offre.id,
      titreOffre: offre.title
    };

    console.log('postuler payload', candidaturePayload);
    this.postingCandidature = true;
    this.candidatureService.postuler(offre.id, candidaturePayload).subscribe({
      next: () => {
        console.log('postuler success', offre.id);
        this.postingCandidature = false;
        this.showOffreModal = null;
        this.loadOffresInternes();
        this.openSuccessModal(`Votre candidature pour "${offre.title}" a bien été envoyée !`);
      },
      error: (err) => {
        console.error('postuler error', err);
        this.postingCandidature = false;
        this.showToast(String(err?.error?.message || err?.error || 'Erreur lors de l\'envoi de la candidature'));
      }
    });
  }

  openSuccessModal(message: string): void {
    this.successModalMessage = message;
    this.showSuccessModal = true;
    clearTimeout(this.successModalTimer);
    this.successModalTimer = setTimeout(() => this.closeSuccessModal(), 3600);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successModalMessage = '';
    clearTimeout(this.successModalTimer);
  }

  // â”€â”€ Formations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  demanderFormation(f: Formation): void {
    this.openDemandeFormationModal(f);
  }

  onDemandeFormationClick(event: Event, formation: Formation): void {
    event.preventDefault();
    event.stopPropagation();

    this.openDemandeFormationModal(formation);
  }

  openDemandeFormationModal(f: Formation): void {
    if (f.status !== 'available') {
      this.showToast('Une demande existe deja pour cette formation');
      return;
    }

    this.selectedFormationForRequest = f;
    this.demandeFormationForm = { justification: '' };
    this.clearFormationRequestMessages();
    this.showFormationModal = null;
    this.showDemandeFormationModal = true;
    console.log('Ouverture modal demande formation', f);
  }

  closeDemandeFormationModal(): void {
    this.showDemandeFormationModal = false;
    this.selectedFormationForRequest = null;
    this.demandeFormationForm = { justification: '' };
    this.clearFormationRequestMessages();
  }

  submitDemandeFormation(): void {
    if (!this.employe.id || !this.selectedFormationForRequest?.id) {
      this.showToast('Profil employe ou formation introuvable');
      return;
    }

    const justification = this.demandeFormationForm.justification.trim();
    if (justification.length === 0) {
      this.setFormationRequestError('Veuillez saisir une justification');
      return;
    }
    if (justification.length < 8) {
      this.setFormationRequestError('Veuillez saisir une justification plus detaillee (au moins 8 caracteres)');
      return;
    }

    const formationId = Number(this.selectedFormationForRequest.id);
    if (Number.isNaN(formationId)) {
      this.showToast('Formation non synchronisee avec le backend');
      return;
    }

    this.submittingFormationRequest = true;
    this.demandeFormationService.createDemande(this.employe.id, formationId, { justification }).subscribe({
      next: () => {
        const formation = this.formations.find(item => Number(item.id) === formationId);
        if (formation) {
          formation.status = 'pending';
          formation.dateInscription = new Date().toISOString().slice(0, 10);
          formation.justification = justification;
        }
        this.submittingFormationRequest = false;
        this.closeDemandeFormationModal();
        this.activeFormationTab = 'mes';
        this.loadDemandesFormation();
        this.showToast('Demande inscription envoyee');
      },
      error: (err) => {
        this.submittingFormationRequest = false;
        const apiMessage =
          err?.error?.message ||
          err?.error?.error ||
          err?.error?.details ||
          'Erreur lors de envoi de la demande';
        this.setFormationRequestError(String(apiMessage));
      }
    });
  }

  openEditDemandeFormationModal(event: Event, formation: Formation): void {
    event.preventDefault();
    event.stopPropagation();

    if (formation.status !== 'pending' || !formation.demandeId) {
      this.showToast('Seules les demandes en attente peuvent etre modifiees');
      return;
    }

    this.selectedFormationRequest = formation;
    this.editDemandeFormationForm = { justification: formation.justification || '' };
    this.editFormationRequestError = '';
    this.showFormationModal = null;
    this.showEditDemandeFormationModal = true;
  }

  closeEditDemandeFormationModal(): void {
    this.showEditDemandeFormationModal = false;
    this.selectedFormationRequest = null;
    this.editDemandeFormationForm = { justification: '' };
    this.editFormationRequestError = '';
  }

  updateDemandeFormation(): void {
    if (!this.selectedFormationRequest?.demandeId) {
      this.editFormationRequestError = 'Demande introuvable';
      return;
    }

    const justification = this.editDemandeFormationForm.justification.trim();
    if (justification.length < 8) {
      this.editFormationRequestError = 'Veuillez saisir une justification plus detaillee';
      return;
    }

    this.updatingFormationRequest = true;
    this.demandeFormationService.updateDemande(this.selectedFormationRequest.demandeId, {
      justification,
      statutDemande: 'EN_ATTENTE'
    }).subscribe({
      next: () => {
        if (this.selectedFormationRequest) {
          this.selectedFormationRequest.justification = justification;
        }
        this.updatingFormationRequest = false;
        this.closeEditDemandeFormationModal();
        this.loadDemandesFormation();
        this.showToast('Justification mise a jour');
      },
      error: (err) => {
        this.updatingFormationRequest = false;
        this.editFormationRequestError = String(
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de la modification'
        );
      }
    });
  }

  openCancelDemandeFormationModal(event: Event, formation: Formation): void {
    event.preventDefault();
    event.stopPropagation();

    if (formation.status !== 'pending' || !formation.demandeId) {
      this.showToast('Seules les demandes en attente peuvent etre annulees');
      return;
    }

    this.selectedFormationRequest = formation;
    this.showFormationModal = null;
    this.showCancelDemandeFormationModal = true;
  }

  closeCancelDemandeFormationModal(): void {
    this.showCancelDemandeFormationModal = false;
    this.selectedFormationRequest = null;
  }

  cancelDemandeFormation(): void {
    if (!this.selectedFormationRequest?.demandeId) {
      this.showToast('Demande introuvable');
      return;
    }

    this.cancelingFormationRequest = true;
    this.demandeFormationService.cancelDemande(this.selectedFormationRequest.demandeId).subscribe({
      next: () => {
        const formationId = Number(this.selectedFormationRequest?.id);
        const formation = this.formations.find(item => Number(item.id) === formationId);
        if (formation) {
          formation.status = 'available';
          formation.demandeId = undefined;
          formation.justification = undefined;
          formation.dateInscription = undefined;
        }
        this.cancelingFormationRequest = false;
        this.closeCancelDemandeFormationModal();
        this.loadDemandesFormation();
        this.showToast('Demande annulee');
      },
      error: () => {
        this.cancelingFormationRequest = false;
        this.showToast('Erreur lors de annulation de la demande');
      }
    });
  }

  private clearFormationRequestMessages(): void {
    this.formationRequestSuccess = '';
    this.formationRequestError = '';
  }

  private setFormationRequestError(message: string): void {
    this.formationRequestError = message;
    this.formationRequestSuccess = '';
    setTimeout(() => {
      if (this.formationRequestError === message) this.formationRequestError = '';
    }, 3200);
  }

  // â”€â”€ ParamÃ¨tres â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  loadCurrentEmploye(): void {
    const user = this.authService.getUser();
    if (!user?.id) {
      this.showToast('Session utilisateur introuvable');
      return;
    }

    this.loadingProfile = true;
    this.employeService.getEmployeById(user.id).subscribe({
      next: (employe) => {
        this.applyEmployeFromApi(employe);
        this.loadOffresInternes();
        this.loadFormationsData();
        this.loadDemandesConge();
        this.loadingProfile = false;
      },
      error: () => {
        this.loadingProfile = false;
        this.showToast('Impossible de charger le profil employe');
      }
    });
  }

  saveParams(): void {
    if (!this.employe.id) {
      this.showToast('Profil employe introuvable');
      return;
    }

    const payload: Employe = {
      id: this.employe.id,
      nom: this.paramForm.nom,
      prenom: this.paramForm.prenom,
      email: this.paramForm.email,
      telephone: this.paramForm.telephone,
      matricule: this.employe.matricule,
      poste: this.employe.poste,
      departement: this.employe.dept,
      dateEmbauche: this.employe.dateEmbauche,
      typeContrat: this.employe.typeContrat,
      soldeConge: this.employe.soldeConges
    };

    this.savingProfile = true;
    this.employeService.updateEmploye(this.employe.id, payload).subscribe({
      next: (updated) => {
        this.applyEmployeFromApi(updated);
        this.authService.updateStoredUser({
          id: this.employe.id,
          nom: this.employe.nom,
          prenom: this.employe.prenom,
          email: this.employe.email,
          telephone: this.employe.telephone,
          dateCreation: '',
          role: 'EMPLOYE'
        });
        this.savingProfile = false;
        this.showToast('Coordonnees mises a jour');
      },
      error: () => {
        this.savingProfile = false;
        this.showToast('Erreur lors de la mise a jour du profil');
      }
    });
  }

  savePassword(): void {
    if (!this.paramForm.oldPwd || !this.paramForm.newPwd) {
      this.showToast('âš ï¸ Veuillez remplir tous les champs'); return;
    }
    if (this.paramForm.newPwd !== this.paramForm.confirmPwd) {
      this.showToast('âš ï¸ Les mots de passe ne correspondent pas'); return;
    }
    if (!this.employe.id) {
      this.showToast('Profil employe introuvable');
      return;
    }

    this.savingPassword = true;
    this.authService.ChangePassword(this.employe.id, {
      ancienMotDePasse: this.paramForm.oldPwd,
      nouveauMotDePasse: this.paramForm.newPwd
    }).subscribe({
      next: () => {
        this.paramForm.oldPwd = '';
        this.paramForm.newPwd = '';
        this.paramForm.confirmPwd = '';
        this.savingPassword = false;
        this.showToast('Mot de passe mis a jour');
      },
      error: () => {
        this.savingPassword = false;
        this.showToast('Ancien mot de passe incorrect ou erreur serveur');
      }
    });
  }

  // â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  showToast(msg: string): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = msg;
    this.toastVisible = true;
    this.toastTimer   = setTimeout(() => (this.toastVisible = false), 3200);
  }

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  statusLabel(s: StatutDemande): string {
    const labels: Record<StatutDemande, string> = {
      EN_ATTENTE: 'En attente',
      APPROUVE: 'ApprouvÃ©',
      REFUSEE: 'RefusÃ©',
      ANNULE: 'AnnulÃ©'
    };
    return labels[s] || s;
  }

  typeLabel(type: TypeConge): string {
    return TYPE_LABELS[type] || type;
  }

  formationStatusLabel(status: FormationStatus): string {
    const labels: Record<FormationStatus, string> = {
      available: 'Disponible',
      pending: 'En attente',
      enrolled: 'En cours',
      completed: 'Terminee'
    };
    return labels[status] || status;
  }

  congeStatusClass(status: StatutDemande): string {
    const mapping: Record<StatutDemande, string> = {
      EN_ATTENTE: 'pending',
      APPROUVE: 'approved',
      REFUSEE: 'rejected',
      ANNULE: 'rejected'
    };
    return mapping[status] || status.toLowerCase();
  }

  congeDays(conge: DemandeConge): number {
    if (!conge.debut || !conge.fin) {
      return 0;
    }
    const start = new Date(conge.debut);
    const end = new Date(conge.fin);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  }

  formatDate(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  offreTypeColor(type: string): string {
    const m: Record<string, string> = {
      tech: 'linear-gradient(90deg, var(--accent), var(--accent6))',
      design: 'linear-gradient(90deg, var(--accent5), var(--accent4))',
      data: 'linear-gradient(90deg, var(--accent3), var(--accent6))',
      mgmt: 'linear-gradient(90deg, var(--accent4), var(--accent2))',
    };
    return m[type] || m['tech'];
  }

  private applyEmployeFromApi(apiEmploye: Employe): void {
    const prenom = apiEmploye.prenom || '';
    const nom = apiEmploye.nom || '';

    this.employe = {
      ...this.employe,
      id: apiEmploye.id ?? this.employe.id,
      matricule: apiEmploye.matricule || this.employe.matricule,
      nom: nom || this.employe.nom,
      prenom: prenom || this.employe.prenom,
      email: apiEmploye.email || this.employe.email,
      telephone: apiEmploye.telephone || this.employe.telephone,
      poste: apiEmploye.poste || this.employe.poste,
      dept: apiEmploye.departement || this.employe.dept,
      dateEmbauche: this.toDateInputValue(apiEmploye.dateEmbauche) || this.employe.dateEmbauche,
      typeContrat: apiEmploye.typeContrat || this.employe.typeContrat,
      soldeConges: apiEmploye.soldeConge ?? this.employe.soldeConges,
      avatar: this.buildAvatar(prenom, nom)
    };

    this.paramForm = {
      ...this.paramForm,
      nom: this.employe.nom,
      prenom: this.employe.prenom,
      email: this.employe.email,
      telephone: this.employe.telephone
    };
  }

  private buildAvatar(prenom: string, nom: string): string {
    const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.trim().toUpperCase();
    return initials || this.employe.avatar;
  }

  private toDateInputValue(value: string | undefined): string {
    if (!value) return '';
    return value.includes('T') ? value.slice(0, 10) : value;
  }

  private loadOffresInternes(): void {
    if (!this.employe.id) return;

    this.loadingOffresInternes = true;
    forkJoin({
      offres: this.offreEmploiService.getAllOffres(),
      candidatures: this.candidatureService.getAll()
    }).subscribe({
      next: ({ offres, candidatures }) => {
        const candidaturesEmploye = new Set(
          candidatures
            .filter((candidature) => candidature.employeId === this.employe.id)
            .map((candidature) => candidature.offreId)
            .filter((offreId): offreId is number => offreId != null)
        );

        this.offresInternes = offres
          .filter((offre) => offre.type === 'INTERNE')
          .map((offre) => this.mapOffreInterneFromApi(offre, candidaturesEmploye.has(offre.id ?? -1)));
        this.loadingOffresInternes = false;
      },
      error: () => {
        this.loadingOffresInternes = false;
        this.showToast('Impossible de charger les offres internes');
      }
    });
  }

  private mapOffreInterneFromApi(offre: OffreEmploi, postule: boolean): OffreInterne {
    return {
      id: offre.id ?? 0,
      title: offre.titre,
      dept: offre.departement || 'General',
      type: this.offreInterneType(offre.departement),
      niveau: this.offreInterneNiveau(offre.niveau),
      niveauLabel: offre.niveau || 'Non precise',
      tags: offre.skills || [],
      datePub: this.formatRelativeDate(offre.datePublication),
      description: offre.description || 'Aucune description disponible.',
      postule
    };
  }

  private offreInterneType(departement?: string): 'tech' | 'design' | 'data' | 'mgmt' {
    const normalized = (departement || '').toLowerCase();
    if (normalized.includes('design')) return 'design';
    if (normalized.includes('data') || normalized.includes('ia')) return 'data';
    if (normalized.includes('produit') || normalized.includes('marketing') || normalized.includes('finance')) return 'mgmt';
    return 'tech';
  }

  private offreInterneNiveau(niveau?: string): 'junior' | 'mid' | 'senior' {
    const normalized = (niveau || '').toLowerCase();
    if (normalized.includes('junior')) return 'junior';
    if (normalized.includes('mid')) return 'mid';
    return 'senior';
  }

  private formatRelativeDate(datePublication?: string): string {
    if (!datePublication) return 'A l instant';

    const now = new Date();
    const published = new Date(datePublication);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "A l'instant";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return this.formatDate(datePublication);
  }

  private mapFormationFromApi(f: FormationApi): Formation {
    const type = f.typeFormation || 'EN_LIGNE';
    const tag = this.formationTag(type);

    return {
      id: f.id ?? '',
      title: f.titre,
      tag,
      tagLabel: this.formationTagLabel(tag),
      desc: f.description,
      duration: this.formationDuration(f.dateDebut, f.dateFin),
      rating: '4.7',
      enrolled: Math.max(0, f.capacite),
      status: 'available',
    };
  }

  private applyDemandesFormation(demandes: DemandeFormationApi[]): void {
    demandes.forEach(demande => {
      const formation = this.formations.find(f => Number(f.id) === demande.formationId);
      if (!formation) return;

      formation.demandeId = demande.id;
      formation.justification = demande.justification;
      formation.dateInscription = new Date().toISOString().slice(0, 10);
      formation.status = this.mapDemandeFormationStatus(demande.statutDemande);
    });
  }

  private mapDemandeFormationStatus(statut: string): FormationStatus {
    if (statut === 'APPROUVEE') return 'enrolled';
    if (statut === 'REFUSEE' || statut === 'ANNULEE') return 'available';
    return 'pending';
  }

  private formationTag(typeFormation: string): 'tech' | 'soft' | 'lead' {
    if (typeFormation === 'PRESENTIEL') return 'lead';
    if (typeFormation === 'HYBRIDE') return 'soft';
    return 'tech';
  }

  private formationTagLabel(tag: 'tech' | 'soft' | 'lead'): string {
    return { tech: 'Tech', soft: 'Soft Skills', lead: 'Leadership' }[tag];
  }

  private formationDuration(dateDebut: string, dateFin: string): string {
    if (!dateDebut || !dateFin) return 'A definir';
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    return `${days}j`;
  }
}
