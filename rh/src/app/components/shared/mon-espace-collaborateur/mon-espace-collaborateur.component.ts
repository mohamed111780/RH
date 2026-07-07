import { Component, OnInit, ChangeDetectorRef, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
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
  selector: 'app-mon-espace-collaborateur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mon-espace-collaborateur.component.html',
  styleUrls: ['./mon-espace-collaborateur.component.css']
})
export class MonEspaceCollaborateurComponent implements OnInit {
  @Input() theme: 'rh' | 'admin' = 'rh';
  @HostBinding('attr.data-theme') get dataTheme(): string { return this.theme; }

  activeTab: 'conges' | 'formations' | 'offres' = 'conges';

  employe = {
    id: 0,
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    poste: '',
    dept: '',
    dateEmbauche: '',
    typeContrat: 'CDI',
    soldeConges: 0,
    congesUtilises: 0
  };

  loadingProfile = false;
  loadingOffresInternes = false;
  postingCandidature = false;
  loadingFormations = false;
  loadingDemandesConge = false;
  submittingConge = false;
  submittingFormationRequest = false;
  updatingFormationRequest = false;
  cancelingFormationRequest = false;

  toastMessage = '';
  toastVisible = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  showCongeModal = false;
  showOffreModal: OffreInterne | null = null;
  showFormationModal: Formation | null = null;
  showDemandeFormationModal = false;
  showEditDemandeFormationModal = false;
  showCancelDemandeFormationModal = false;
  showCancelDemandeModal = false;
  cancelingDemandeId: number | null = null;
  cancelingDemande = false;

  selectedFormationForRequest: Formation | null = null;
  selectedFormationRequest: Formation | null = null;
  demandeFormationForm = { justification: '' };
  editDemandeFormationForm = { justification: '' };
  formationRequestError = '';
  editFormationRequestError = '';

  editingConge: DemandeConge | null = null;
  congeForm: CongeForm = { dateDebut: '', dateFin: '', type: 'PAYE' };
  demandesConge: DemandeConge[] = [];
  activeFormationTab = 'catalogue';
  congeTypeOptions: TypeConge[] = Object.keys(TYPE_LABELS) as TypeConge[];

  offresInternes: OffreInterne[] = [];
  formations: Formation[] = [];

  constructor(
    private authService: AuthService,
    private employeService: EmployeService,
    private formationService: FormationService,
    private demandeFormationService: DemandeFormationService,
    private demandeCongeService: DemandeCongeService,
    private offreEmploiService: OffreEmploiService,
    private candidatureService: CandidatureService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentEmploye();
  }

  get soldeRestant(): number {
    return Math.max(0, this.employe.soldeConges - this.employe.congesUtilises);
  }

  get pendingConges(): number {
    return this.demandesConge.filter(c => c.statutDemande === 'EN_ATTENTE').length;
  }

  get mesFormationsActives(): Formation[] {
    return this.formations.filter(f => f.status !== 'available');
  }

  get formationsCatalogue(): Formation[] {
    return this.formations.filter(f => f.status === 'available');
  }

  showTab(tab: 'conges' | 'formations' | 'offres'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  private getCurrentUserId(): number {
    return this.employe.id || this.authService.getUser()?.id || 0;
  }

  loadCurrentEmploye(): void {
    const user = this.authService.getUser();
    if (!user?.id) {
      this.showToast('Session utilisateur introuvable');
      return;
    }

    this.applySessionUser(user);
    this.loadingProfile = true;

    this.employeService.getEmployeById(user.id).subscribe({
      next: (employe) => {
        this.applyEmployeFromApi(employe);
        this.refreshAllData();
        this.loadingProfile = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.refreshAllData();
        this.loadingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  private applySessionUser(user: { id?: number; nom?: string; prenom?: string; email?: string; telephone?: string }): void {
    this.employe = {
      ...this.employe,
      id: user.id ?? 0,
      nom: user.nom || this.employe.nom,
      prenom: user.prenom || this.employe.prenom,
      email: user.email || this.employe.email,
      telephone: user.telephone || this.employe.telephone
    };
  }

  private refreshAllData(): void {
    this.loadOffresInternes();
    this.loadFormationsData();
    this.loadDemandesConge();
  }

  openCongeModal(): void {
    this.editingConge = null;
    this.congeForm = { type: 'PAYE', dateDebut: '', dateFin: '' };
    this.showCongeModal = true;
    this.cdr.detectChanges();
  }

  openEditCongeModal(conge: DemandeConge): void {
    if (conge.statutDemande !== 'EN_ATTENTE') {
      this.showToast('Seules les demandes en attente peuvent être modifiées');
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
      this.showToast('Veuillez renseigner les dates');
      return;
    }
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.showToast('Profil introuvable');
      return;
    }
    if (this.editingConge) {
      this.updateConge();
      return;
    }
    this.createDemandeConge();
  }

  openCancelDemandeModal(id: number): void {
    this.cancelingDemandeId = id;
    this.showCancelDemandeModal = true;
  }

  closeCancelDemandeModal(): void {
    this.showCancelDemandeModal = false;
    this.cancelingDemandeId = null;
  }

  confirmCancelDemande(): void {
    if (!this.cancelingDemandeId) return;
    this.cancelingDemande = true;
    this.demandeCongeService.deleteDemande(this.cancelingDemandeId).subscribe({
      next: () => {
        this.cancelingDemande = false;
        this.showCancelDemandeModal = false;
        this.cancelingDemandeId = null;
        this.loadDemandesConge();
        this.showToast('Demande annulée');
        this.cdr.detectChanges();
      },
      error: () => {
        this.cancelingDemande = false;
        this.showToast('Erreur lors de l\'annulation');
        this.cdr.detectChanges();
      }
    });
  }

  openOffreModal(event: MouseEvent, offre: OffreInterne): void {
    event.stopPropagation();
    this.showOffreModal = offre;
  }

  postuler(offre: OffreInterne): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.showToast('Profil introuvable');
      return;
    }
    if (offre.postule) {
      this.showToast('Vous avez déjà postulé à cette offre');
      return;
    }

    const candidaturePayload: BackendCandidature = {
      nomCandidat: `${this.employe.prenom} ${this.employe.nom}`.trim(),
      email: this.employe.email,
      employeId: userId,
      matriculeEmploye: this.employe.matricule,
      telephone: this.employe.telephone,
      poste: this.employe.poste,
      departement: this.employe.dept,
      offreId: offre.id,
      titreOffre: offre.title
    };

    this.postingCandidature = true;
    this.candidatureService.postuler(offre.id, candidaturePayload).subscribe({
      next: () => {
        this.postingCandidature = false;
        this.showOffreModal = null;
        this.loadOffresInternes();
        this.showToast(`Candidature envoyée pour "${offre.title}"`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.postingCandidature = false;
        this.showToast(String(err?.error?.message || err?.error || 'Erreur lors de l\'envoi'));
        this.cdr.detectChanges();
      }
    });
  }

  openDemandeFormationModal(f: Formation): void {
    if (f.status !== 'available') {
      this.showToast('Une demande existe déjà pour cette formation');
      return;
    }
    this.selectedFormationForRequest = f;
    this.demandeFormationForm = { justification: '' };
    this.formationRequestError = '';
    this.showFormationModal = null;
    this.showDemandeFormationModal = true;
  }

  closeDemandeFormationModal(): void {
    this.showDemandeFormationModal = false;
    this.selectedFormationForRequest = null;
    this.demandeFormationForm = { justification: '' };
    this.formationRequestError = '';
  }

  submitDemandeFormation(): void {
    const userId = this.getCurrentUserId();
    if (!userId || !this.selectedFormationForRequest?.id) {
      this.showToast('Profil ou formation introuvable');
      return;
    }
    const justification = this.demandeFormationForm.justification.trim();
    if (justification.length < 8) {
      this.formationRequestError = 'Justification requise (min. 8 caractères)';
      return;
    }

    const formationId = Number(this.selectedFormationForRequest.id);
    this.submittingFormationRequest = true;
    this.demandeFormationService.createDemande(userId, formationId, { justification }).subscribe({
      next: () => {
        this.submittingFormationRequest = false;
        this.closeDemandeFormationModal();
        this.activeFormationTab = 'mes';
        this.loadFormationsData();
        this.showToast('Demande de formation envoyée');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submittingFormationRequest = false;
        this.formationRequestError = String(err?.error?.message || err?.error || 'Erreur lors de l\'envoi');
        this.cdr.detectChanges();
      }
    });
  }

  openEditDemandeFormationModal(event: Event, formation: Formation): void {
    event.preventDefault();
    event.stopPropagation();
    if (formation.status !== 'pending' || !formation.demandeId) return;
    this.selectedFormationRequest = formation;
    this.editDemandeFormationForm = { justification: formation.justification || '' };
    this.editFormationRequestError = '';
    this.showEditDemandeFormationModal = true;
  }

  closeEditDemandeFormationModal(): void {
    this.showEditDemandeFormationModal = false;
    this.selectedFormationRequest = null;
    this.editDemandeFormationForm = { justification: '' };
  }

  updateDemandeFormation(): void {
    if (!this.selectedFormationRequest?.demandeId) return;
    const justification = this.editDemandeFormationForm.justification.trim();
    if (justification.length < 8) {
      this.editFormationRequestError = 'Justification requise (min. 8 caractères)';
      return;
    }
    this.updatingFormationRequest = true;
    this.demandeFormationService.updateDemande(this.selectedFormationRequest.demandeId, {
      justification,
      statutDemande: 'EN_ATTENTE'
    }).subscribe({
      next: () => {
        this.updatingFormationRequest = false;
        this.closeEditDemandeFormationModal();
        this.loadFormationsData();
        this.showToast('Demande mise à jour');
        this.cdr.detectChanges();
      },
      error: () => {
        this.updatingFormationRequest = false;
        this.editFormationRequestError = 'Erreur lors de la modification';
        this.cdr.detectChanges();
      }
    });
  }

  openCancelDemandeFormationModal(event: Event, formation: Formation): void {
    event.preventDefault();
    event.stopPropagation();
    if (!formation.demandeId) return;
    this.selectedFormationRequest = formation;
    this.showCancelDemandeFormationModal = true;
  }

  closeCancelDemandeFormationModal(): void {
    this.showCancelDemandeFormationModal = false;
    this.selectedFormationRequest = null;
  }

  confirmCancelDemandeFormation(): void {
    if (!this.selectedFormationRequest?.demandeId) return;
    this.cancelingFormationRequest = true;
    this.demandeFormationService.cancelDemande(this.selectedFormationRequest.demandeId).subscribe({
      next: () => {
        this.cancelingFormationRequest = false;
        this.closeCancelDemandeFormationModal();
        this.loadFormationsData();
        this.showToast('Demande annulée');
        this.cdr.detectChanges();
      },
      error: () => {
        this.cancelingFormationRequest = false;
        this.showToast('Erreur lors de l\'annulation');
        this.cdr.detectChanges();
      }
    });
  }

  showToast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = msg;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => (this.toastVisible = false), 3200);
  }

  statusLabel(s: StatutDemande): string {
    const labels: Record<StatutDemande, string> = {
      EN_ATTENTE: 'En attente',
      APPROUVEE: 'Approuvé',
      REFUSEE: 'Refusé',
      ANNULEE: 'Annulé'
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
      completed: 'Terminée'
    };
    return labels[status] || status;
  }

  congeStatusClass(status: StatutDemande): string {
    const mapping: Record<StatutDemande, string> = {
      EN_ATTENTE: 'pending',
      APPROUVEE: 'approved',
      REFUSEE: 'rejected',
      ANNULEE: 'rejected'
    };
    return mapping[status] || status.toLowerCase();
  }

  congeDays(conge: DemandeConge): number {
    if (!conge.debut || !conge.fin) return 0;
    const start = new Date(conge.debut);
    const end = new Date(conge.fin);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  offreTypeColor(type: string): string {
    const m: Record<string, string> = {
      tech: 'linear-gradient(90deg, #6c63ff, #22d3ee)',
      design: 'linear-gradient(90deg, #f43f5e, #f59e0b)',
      data: 'linear-gradient(90deg, #4ade80, #22d3ee)',
      mgmt: 'linear-gradient(90deg, #f59e0b, #9d8fff)'
    };
    return m[type] || m['tech'];
  }

  private createDemandeConge(): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.submittingConge = true;
    const payload: CreateDemandeConge = {
      type: this.congeForm.type,
      dateDebut: this.congeForm.dateDebut,
      dateFin: this.congeForm.dateFin
    };
    this.demandeCongeService.createDemande(userId, payload).subscribe({
      next: () => {
        this.submittingConge = false;
        this.closeCongeModal();
        this.loadDemandesConge();
        this.showToast('Demande de congé soumise');
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.submittingConge = false;
        this.showToast(this.getCongeErrorMessage(error, 'Erreur lors de la création'));
        this.cdr.detectChanges();
      }
    });
  }

  private updateConge(): void {
    if (!this.editingConge?.id) return;
    this.submittingConge = true;
    const updated: DemandeConge = {
      ...this.editingConge,
      debut: this.congeForm.dateDebut,
      fin: this.congeForm.dateFin,
      typeConge: this.congeForm.type
    };
    this.demandeCongeService.updateDemande(this.editingConge.id, updated).subscribe({
      next: () => {
        this.submittingConge = false;
        this.closeCongeModal();
        this.loadDemandesConge();
        this.showToast('Demande mise à jour');
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.submittingConge = false;
        this.showToast(this.getCongeErrorMessage(error, 'Erreur lors de la mise à jour'));
        this.cdr.detectChanges();
      }
    });
  }

  private getCongeErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    const serverMessage = error.error?.message || error.error?.error;
    if (typeof serverMessage === 'string' && serverMessage.trim()) return serverMessage;
    return fallback;
  }

  private loadDemandesConge(): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.loadingDemandesConge = true;
    this.demandeCongeService.getDemandesByEmployeeId(userId).subscribe({
      next: (demandes) => {
        this.demandesConge = demandes.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        this.employe.congesUtilises = demandes
          .filter(d => d.statutDemande === 'APPROUVEE')
          .reduce((sum, d) => sum + this.congeDays(d), 0);
        this.loadingDemandesConge = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingDemandesConge = false;
        this.showToast('Impossible de charger vos congés');
        this.cdr.detectChanges();
      }
    });
  }

  private loadFormationsData(): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.loadingFormations = true;
    forkJoin({
      formations: this.formationService.getAllFormations(),
      demandes: this.demandeFormationService.getByEmploye(userId)
    }).subscribe({
      next: ({ formations, demandes }) => {
        this.formations = formations.map(f => this.mapFormationFromApi(f));
        this.applyDemandesFormation(demandes);
        this.loadingFormations = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingFormations = false;
        this.showToast('Impossible de charger les formations');
        this.cdr.detectChanges();
      }
    });
  }

  private loadOffresInternes(): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    this.loadingOffresInternes = true;
    forkJoin({
      offres: this.offreEmploiService.getAllOffres(),
      candidatures: this.candidatureService.getAll()
    }).subscribe({
      next: ({ offres, candidatures }) => {
        const userCandidatures = new Set(
          candidatures
            .filter(c => c.employeId === userId)
            .map(c => c.offreId)
            .filter((id): id is number => id != null)
        );
        this.offresInternes = offres
          .filter(o => o.type === 'INTERNE')
          .map(o => this.mapOffreInterneFromApi(o, userCandidatures.has(o.id ?? -1)));
        this.loadingOffresInternes = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingOffresInternes = false;
        this.showToast('Impossible de charger les offres internes');
        this.cdr.detectChanges();
      }
    });
  }

  private applyEmployeFromApi(apiEmploye: Employe): void {
    this.employe = {
      id: apiEmploye.id ?? 0,
      matricule: apiEmploye.matricule || '',
      nom: apiEmploye.nom || '',
      prenom: apiEmploye.prenom || '',
      email: apiEmploye.email || '',
      telephone: apiEmploye.telephone || '',
      poste: apiEmploye.poste || '',
      dept: apiEmploye.departement || '',
      dateEmbauche: this.toDateInputValue(apiEmploye.dateEmbauche),
      typeContrat: apiEmploye.typeContrat || 'CDI',
      soldeConges: apiEmploye.soldeConge ?? 0,
      congesUtilises: 0
    };
  }

  private applyDemandesFormation(demandes: DemandeFormationApi[]): void {
    demandes.forEach((demande) => {
      const formation = this.formations.find(item => Number(item.id) === demande.formationId);
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

  private mapFormationFromApi(f: FormationApi): Formation {
    const tag = this.formationTag(f.typeFormation || 'EN_LIGNE');
    return {
      id: f.id ?? '',
      title: f.titre,
      tag,
      tagLabel: { tech: 'Tech', soft: 'Soft Skills', lead: 'Leadership' }[tag],
      desc: f.description,
      duration: this.formationDuration(f.dateDebut, f.dateFin),
      rating: '4.7',
      enrolled: Math.max(0, f.capacite),
      status: 'available',
      progress: 0
    };
  }

  private mapOffreInterneFromApi(offre: OffreEmploi, postule: boolean): OffreInterne {
    return {
      id: offre.id ?? 0,
      title: offre.titre,
      dept: offre.departement || 'Général',
      type: this.offreInterneType(offre.departement),
      niveau: this.offreInterneNiveau(offre.niveau),
      niveauLabel: offre.niveau || 'Non précisé',
      tags: offre.skills || [],
      datePub: this.formatRelativeDate(offre.datePublication),
      description: offre.description || 'Aucune description disponible.',
      postule
    };
  }

  private formationTag(typeFormation: string): 'tech' | 'soft' | 'lead' {
    if (typeFormation === 'PRESENTIEL') return 'lead';
    if (typeFormation === 'HYBRIDE') return 'soft';
    return 'tech';
  }

  private formationDuration(dateDebut: string, dateFin: string): string {
    if (!dateDebut || !dateFin) return 'À définir';
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    return `${days}j`;
  }

  private offreInterneType(departement?: string): 'tech' | 'design' | 'data' | 'mgmt' {
    const normalized = (departement || '').toLowerCase();
    if (normalized.includes('design')) return 'design';
    if (normalized.includes('data') || normalized.includes('ia')) return 'data';
    if (normalized.includes('rh') || normalized.includes('mgmt')) return 'mgmt';
    return 'tech';
  }

  private offreInterneNiveau(niveau?: string): 'junior' | 'mid' | 'senior' {
    const normalized = (niveau || '').toLowerCase();
    if (normalized.includes('junior')) return 'junior';
    if (normalized.includes('mid')) return 'mid';
    return 'senior';
  }

  private formatRelativeDate(datePublication?: string): string {
    if (!datePublication) return "à l'instant";
    const now = new Date();
    const published = new Date(datePublication);
    const diffHours = Math.max(0, Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return "à l'instant";
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return this.formatDate(datePublication);
  }

  private toDateInputValue(value?: string): string {
    if (!value) return '';
    return value.includes('T') ? value.slice(0, 10) : value;
  }
}
