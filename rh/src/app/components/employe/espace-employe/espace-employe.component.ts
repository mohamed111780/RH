import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { EmployeService } from '../../../services/employe.service';
import { Employe } from '../../../models/employe';
import { FormationService } from '../../../services/formation.service';
import { DemandeFormationService } from '../../../services/demande-formation.service';
import { Formation as FormationApi } from '../../../models/formation';
import { DemandeFormation as DemandeFormationApi } from '../../../models/demande-formation';

export type CongeStatus = 'approved' | 'pending' | 'rejected';
export type FormationStatus = 'enrolled' | 'completed' | 'pending' | 'available';

export interface DemandeConge {
  id: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  status: CongeStatus;
  commentaire?: string;
  dateCreation: string;
}

export interface OffreInterne {
  id: string;
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
  cancelingFormationRequest = false;
  formationRequestSuccess = '';
  formationRequestError = '';
  editFormationRequestError = '';
  activeFormationTab = 'catalogue';

  // â”€â”€ CongÃ© form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  congeForm = {
    type:        'CongÃ© annuel',
    dateDebut:   '',
    dateFin:     '',
    commentaire: '',
  };

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
  demandesConge: DemandeConge[] = [
    { id: 'C1', type: 'CongÃ© annuel',     dateDebut: '2026-06-02', dateFin: '2026-06-06', nbJours: 5, status: 'approved', dateCreation: '2026-05-10' },
    { id: 'C2', type: 'CongÃ© annuel',     dateDebut: '2026-07-14', dateFin: '2026-07-18', nbJours: 5, status: 'pending',  dateCreation: '2026-05-20', commentaire: 'Vacances d\'Ã©tÃ©' },
    { id: 'C3', type: 'Absence mÃ©dicale', dateDebut: '2026-03-03', dateFin: '2026-03-04', nbJours: 2, status: 'approved', dateCreation: '2026-03-01' },
    { id: 'C4', type: 'CongÃ© exceptionnel',dateDebut:'2025-12-24', dateFin: '2025-12-26', nbJours: 3, status: 'approved', dateCreation: '2025-12-10' },
    { id: 'C5', type: 'CongÃ© annuel',     dateDebut: '2025-10-15', dateFin: '2025-10-17', nbJours: 3, status: 'rejected', dateCreation: '2025-10-01', commentaire: 'Charge projet insuffisante' },
  ];

  offresInternes: OffreInterne[] = [
    {
      id: 'OI-1', type: 'tech', title: 'Lead Developer React.js', dept: 'IngÃ©nierie',
      niveau: 'senior', niveauLabel: 'Senior', datePub: 'Il y a 3 jours', postule: false,
      tags: ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS'],
      description: 'Rejoignez l\'Ã©quipe Core pour piloter le dÃ©veloppement de notre plateforme principale. Vous serez en charge de l\'architecture front-end et du mentoring des dÃ©veloppeurs junior.'
    },
    {
      id: 'OI-2', type: 'mgmt', title: 'Tech Lead Backend', dept: 'IngÃ©nierie',
      niveau: 'senior', niveauLabel: 'Senior', datePub: 'Il y a 1 semaine', postule: true,
      tags: ['Node.js', 'PostgreSQL', 'Kubernetes', 'Microservices'],
      description: 'OpportunitÃ© de piloter l\'Ã©quipe backend de 6 personnes. Vous interviendrez sur l\'architecture, le code review et la roadmap technique du produit.'
    },
    {
      id: 'OI-3', type: 'design', title: 'UX/UI Designer Senior', dept: 'Design',
      niveau: 'senior', niveauLabel: 'Senior', datePub: 'Il y a 5 jours', postule: false,
      tags: ['Figma', 'UX Research', 'Design System', 'Prototyping'],
      description: 'CrÃ©ez des expÃ©riences utilisateurs mÃ©morables pour nos produits B2B. Collaboration Ã©troite avec les Ã©quipes produit et ingÃ©nierie.'
    },
    {
      id: 'OI-4', type: 'data', title: 'Data Engineer', dept: 'Data & IA',
      niveau: 'mid', niveauLabel: 'Mid-level', datePub: 'Il y a 2 semaines', postule: false,
      tags: ['Python', 'Spark', 'Airflow', 'SQL', 'Kafka'],
      description: 'Construisez et maintenez nos pipelines de donnÃ©es en temps rÃ©el. Vous travaillerez sur l\'infrastructure data qui alimente nos algorithmes IA.'
    },
    {
      id: 'OI-5', type: 'mgmt', title: 'Product Manager', dept: 'Produit',
      niveau: 'mid', niveauLabel: 'Mid-level', datePub: 'Il y a 3 jours', postule: false,
      tags: ['Roadmap', 'Agile', 'OKRs', 'Stakeholders'],
      description: 'DÃ©finissez la vision produit et pilotez la roadmap en collaboration avec toutes les parties prenantes. Poste stratÃ©gique avec fort impact business.'
    },
  ];

  formations: Formation[] = [];

  // â”€â”€ Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  constructor(
    private authService: AuthService,
    private employeService: EmployeService,
    private formationService: FormationService,
    private demandeFormationService: DemandeFormationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentEmploye();
  }

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  showPage(page: string): void {
    this.currentPage = page;
    this.pageTitle   = this.pageTitles[page] || page;

    if (page === 'formations' && this.employe.id) {
      this.loadFormationsData();
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

  get pendingConges(): number {
    return this.demandesConge.filter(c => c.status === 'pending').length;
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
    this.congeForm = { type: 'CongÃ© annuel', dateDebut: '', dateFin: '', commentaire: '' };
    this.showCongeModal = true;
  }

  submitConge(): void {
    if (!this.congeForm.dateDebut || !this.congeForm.dateFin) {
      this.showToast('âš ï¸ Veuillez renseigner les dates'); return;
    }
    const d1 = new Date(this.congeForm.dateDebut);
    const d2 = new Date(this.congeForm.dateFin);
    const nb = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1);
    const newDemande: DemandeConge = {
      id:           'C' + Date.now(),
      type:         this.congeForm.type,
      dateDebut:    this.congeForm.dateDebut,
      dateFin:      this.congeForm.dateFin,
      nbJours:      nb,
      status:       'pending',
      commentaire:  this.congeForm.commentaire,
      dateCreation: new Date().toISOString().slice(0, 10),
    };
    this.demandesConge.unshift(newDemande);
    this.showCongeModal = false;
    this.showToast('âœ… Demande de congÃ© soumise avec succÃ¨s');
  }

  cancelDemande(id: string): void {
    this.demandesConge = this.demandesConge.filter(c => c.id !== id);
    this.showToast('Demande annulÃ©e');
  }

  // ── Offres ──────────────────────────────────────────────────────────────────────────────────────────
  postuler(offre: OffreInterne): void {
    offre.postule = true;
    this.showOffreModal = null;
    this.showToast(`🚀 Candidature envoyée pour "${offre.title}" !`);
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
        this.loadFormationsData();
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
  statusLabel(s: CongeStatus): string {
    return { approved: 'ApprouvÃ©', pending: 'En attente', rejected: 'RefusÃ©' }[s];
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

