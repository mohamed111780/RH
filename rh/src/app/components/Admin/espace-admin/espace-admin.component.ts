import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { AdminService } from '../../../services/admin.service';
import { Admin } from '../../../models/admin';
import { Formation as FormationApi } from '../../../models/formation';
import { Employe } from '../../../models/employe';
import { OffreEmploi, OffreStatut, OffreType } from '../../../models/offre-emploi';
import { OffreEmploiService } from '../../../services/offre-emploi.service';
import { Candidature as BackendCandidature } from '../../../models/candidature';
import { CandidatureService } from '../../../services/candidature.service';
import { FormationService } from '../../../services/formation.service';
import { EmployeService } from '../../../services/employe.service';

interface Employee {
  initials: string;
  name: string;
  role: string;
  dept: string;
  status: 'active' | 'leave' | 'remote';
  color: string;
  textColor: string;
  joinDate?: string;
}

interface Formation {
  tag: 'tech' | 'soft' | 'lead';
  tagLabel: string;
  title: string;
  desc: string;
  duration: string;
  enrolled: number;
  rating: string;
  progress: number;
}

interface Offre {
  id: number;
  type: 'tech' | 'design' | 'data';
  title: string;
  dept: string;
  niveau: 'junior' | 'mid' | 'senior';
  niveauLabel: string;
  date: string;
  candidatures: number;
  tags: string[];
  description: string;
  contrat: string;
  offreType: OffreType;
  statut: OffreStatut;
}

interface KanbanCandidature {
  id: number;
  name: string;
  initials: string;
  role: string;
  color: string;
  tc: string;
  email: string;
  tags: string[];
  score: number;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
}

interface CandidaturesData {
  offreTags: string[];
  trier: KanbanCandidature[];
  entretien: KanbanCandidature[];
  rejetee: KanbanCandidature[];
}

@Component({
  selector: 'app-espace-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './espace-admin.component.html',
  styleUrls: ['./espace-admin.component.css']
})
export class EspaceAdminComponent implements OnInit {

  // ── Navigation ──────────────────────────────────────────────────────────────
  currentPage: string = 'dashboard';
  pageTitle: string = "Vue d'ensemble";

  pageTitles: Record<string, string> = {
    dashboard: "Vue d'ensemble",
    formations: 'Formations',
    offres: 'Offres & Recrutement IA',
    analytics: 'Analytique IA',
    parametres: 'Parametres'
  };

  admin = {
    id: 0,
    matricule: 'ADM-2024-0001',
    nom: 'Mansour',
    prenom: 'Ahmed',
    email: 'ahmed.mansour@nexhr.tn',
    telephone: '+216 55 000 000',
    poste: 'Directeur RH',
    departement: 'Administration',
    dateEmbauche: '2021-01-15',
    typeContrat: 'CDI',
    avatar: 'AM'
  };

  paramForm = {
    nom: 'Mansour',
    prenom: 'Ahmed',
    email: 'ahmed.mansour@nexhr.tn',
    telephone: '+216 55 000 000',
    oldPwd: '',
    newPwd: '',
    confirmPwd: ''
  };

  loadingProfile = false;
  savingProfile = false;
  savingPassword = false;
  loadingOffres = false;
  savingOffre = false;
  savingFormation = false;
  loadingKanban = false;
  loadingFormations = false;
  loadingEmployees = false;

  // ── UI State ─────────────────────────────────────────────────────────────────
  showModal: boolean = false;
  showFormationModal: boolean = false;
  showKanbanView: boolean = false;
  toastMessage: string = '';
  toastVisible: boolean = false;
  private toastTimer: any;

  searchQuery: string = '';
  selectedFormationTab: string = 'all';
  currentDate: Date = new Date();

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private employeService: EmployeService,
    private formationService: FormationService,
    private offreEmploiService: OffreEmploiService,
    private candidatureService: CandidatureService,
    private router: Router
  ) {}

  // ── New Offre Form ────────────────────────────────────────────────────────────
  newOffreTitre: string = '';
  newOffreDesc: string = '';
  newOffreDept: string = 'Ingénierie';
  newOffreNiveau: string = 'Senior';
  newOffreContrat: string = 'CDI';
  newOffreType: OffreType = 'EXTERNE';
  newOffreTags: string[] = [];
  tagInputValue: string = '';

  newFormation: FormationApi = {
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    typeFormation: 'EN_LIGNE',
    capacite: 1
  };

  // Edit state
  editingOffre: Offre | null = null;
  editOffreTitre: string = '';
  editOffreDesc: string = '';
  editOffreDept: string = '';
  editOffreNiveau: string = '';
  editOffreTags: string[] = [];

  // ── Kanban State ──────────────────────────────────────────────────────────────
  kanbanTitle: string = '';
  kanbanMeta: string = '';
  kanbanData: CandidaturesData | null = null;
  kanbanOffreId: number | null = null;
  private draggedCandidature: KanbanCandidature | null = null;

  // ── DATA ─────────────────────────────────────────────────────────────────────
  employees: Employee[] = [
    { initials: 'SA', name: 'Sara Amrani',       role: 'Dev Full Stack',    dept: 'Ingénierie', status: 'active', color: 'rgba(108,99,255,0.2)',  textColor: 'var(--accent2)' },
    { initials: 'YB', name: 'Yassine Belkadi',   role: 'Data Scientist',    dept: 'IA',         status: 'active', color: 'rgba(244,63,94,0.15)',  textColor: 'var(--accent5)' },
    { initials: 'NM', name: 'Nadia Maaloul',     role: 'UX Designer',       dept: 'Design',     status: 'remote', color: 'rgba(34,211,238,0.12)', textColor: 'var(--accent6)' },
    { initials: 'KH', name: 'Karim Hamdi',       role: 'Product Manager',   dept: 'Produit',    status: 'leave',  color: 'rgba(74,222,128,0.1)',  textColor: 'var(--accent3)' },
    { initials: 'MB', name: 'Mohamed Bensalem',  role: 'DevOps Engineer',   dept: 'Ingénierie', status: 'active', color: 'rgba(245,158,11,0.12)', textColor: 'var(--accent4)' },
    { initials: 'LT', name: 'Lina Trabelsi',     role: 'Marketing Lead',    dept: 'Marketing',  status: 'active', color: 'rgba(108,99,255,0.15)', textColor: 'var(--accent2)' },
    { initials: 'AO', name: 'Amine Oueslati',    role: 'Backend Engineer',  dept: 'Ingénierie', status: 'active', color: 'rgba(244,63,94,0.12)',  textColor: 'var(--accent5)' },
    { initials: 'RB', name: 'Rania Ben Slama',   role: 'QA Engineer',       dept: 'Ingénierie', status: 'active', color: 'rgba(34,211,238,0.12)', textColor: 'var(--accent6)' },
    { initials: 'HM', name: 'Hichem Mansouri',   role: 'Finance Analyst',   dept: 'Finance',    status: 'active', color: 'rgba(74,222,128,0.1)',  textColor: 'var(--accent3)' },
  ];

  formations: Formation[] = [];

  offres: Offre[] = [];
  topSkills = [
    { name: 'React.js',     count: 38, color: 'var(--accent)'  },
    { name: 'Python',       count: 35, color: 'var(--accent3)' },
    { name: 'TypeScript',   count: 31, color: 'var(--accent6)' },
    { name: 'Docker',       count: 28, color: 'var(--accent4)' },
    { name: 'AWS',          count: 24, color: 'var(--accent5)' },
    { name: 'Node.js',      count: 22, color: 'var(--accent2)' },
  ];

  deptStats = [
    { label: 'Ingénierie', pct: 62, color: 'var(--accent)'  },
    { label: 'Design',     pct: 18, color: 'var(--accent5)' },
    { label: 'Marketing',  pct: 12, color: 'var(--accent4)' },
    { label: 'Finance',    pct: 8,  color: 'var(--accent6)' },
  ];

  recruitmentBars = [40, 55, 70, 85, 100, 65, 35];
  recruitmentDays = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadCurrentAdmin();
    this.loadEmployees();
    this.loadFormations();
    this.loadOffres();
  }

  // ── Navigation ────────────────────────────────────────────────────────────────
  showPage(page: string): void {
    this.currentPage = page;
    this.pageTitle = this.pageTitles[page] || page;
    this.showKanbanView = false;
    if (page === 'offres') {
      this.loadOffres();
    }
  }

  logoutAdmin(): void {
    this.authService.clearSession();
    this.router.navigate(['/home']);
  }

  loadCurrentAdmin(): void {
    const user = this.authService.getUser();
    if (!user?.id) return;

    this.applyAdminFromSession(user);
    this.loadingProfile = true;
    this.adminService.getAdminById(user.id).subscribe({
      next: (admin) => {
        this.applyAdminFromApi(admin);
        this.loadingProfile = false;
      },
      error: () => {
        this.loadingProfile = false;
      }
    });
  }

  saveParams(): void {
    if (!this.admin.id) {
      this.showToast('Session admin introuvable');
      return;
    }

    const payload: Admin = {
      id: this.admin.id,
      nom: this.paramForm.nom,
      prenom: this.paramForm.prenom,
      email: this.paramForm.email,
      telephone: this.paramForm.telephone,
      matricule: this.admin.matricule,
      poste: this.admin.poste,
      departement: this.admin.departement,
      dateEmbauche: this.admin.dateEmbauche,
      typeContrat: this.admin.typeContrat
    };

    this.savingProfile = true;
    this.adminService.updateAdmin(this.admin.id, payload).subscribe({
      next: (updated) => {
        this.applyAdminFromApi(updated);
        this.authService.updateStoredUser({
          id: this.admin.id,
          nom: this.admin.nom,
          prenom: this.admin.prenom,
          email: this.admin.email,
          telephone: this.admin.telephone,
          dateCreation: '',
          role: 'ADMIN'
        });
        this.savingProfile = false;
        this.showToast('Coordonnees admin mises a jour');
      },
      error: () => {
        this.authService.updateUser(this.admin.id, {
          nom: this.paramForm.nom,
          prenom: this.paramForm.prenom,
          email: this.paramForm.email,
          telephone: this.paramForm.telephone
        }).subscribe({
          next: () => {
            this.admin = {
              ...this.admin,
              nom: this.paramForm.nom,
              prenom: this.paramForm.prenom,
              email: this.paramForm.email,
              telephone: this.paramForm.telephone,
              avatar: this.buildAvatar(this.paramForm.prenom, this.paramForm.nom)
            };
            this.authService.updateStoredUser({
              id: this.admin.id,
              nom: this.admin.nom,
              prenom: this.admin.prenom,
              email: this.admin.email,
              telephone: this.admin.telephone,
              dateCreation: '',
              role: 'ADMIN'
            });
            this.savingProfile = false;
            this.showToast('Coordonnees admin mises a jour');
          },
          error: () => {
            this.savingProfile = false;
            this.showToast('Erreur lors de la mise a jour du profil');
          }
        });
      }
    });
  }

  savePassword(): void {
    if (!this.paramForm.oldPwd || !this.paramForm.newPwd) {
      this.showToast('Veuillez remplir tous les champs');
      return;
    }
    if (this.paramForm.newPwd !== this.paramForm.confirmPwd) {
      this.showToast('Les mots de passe ne correspondent pas');
      return;
    }
    if (!this.admin.id) {
      this.showToast('Session admin introuvable');
      return;
    }

    this.savingPassword = true;
    this.authService.ChangePassword(this.admin.id, {
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

  // ── Formations ───────────────────────────────────────────────────────────────
  loadEmployees(): void {
    this.loadingEmployees = true;
    this.employeService.getAllEmployes().subscribe({
      next: (employees) => {
        this.employees = employees
          .map((employee) => this.mapEmployeToDashboard(employee))
          .sort((a, b) => this.compareDatesDesc(a.joinDate, b.joinDate));
        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
        this.showToast('Impossible de charger les employes');
      }
    });
  }

  get totalEmployees(): number {
    return this.employees.length;
  }

  get totalCandidatures(): number {
    return this.offres.reduce((total, offre) => total + offre.candidatures, 0);
  }

  get openOffresCount(): number {
    return this.offres.filter((offre) => offre.statut === 'OUVERTE').length;
  }

  get dashboardSummary(): string {
    return `Vous supervisez actuellement ${this.totalEmployees} employes, ${this.activeFormationsCount} formations actives et ${this.totalCandidatures} candidatures sur ${this.openOffresCount} offre${this.openOffresCount > 1 ? 's' : ''} ouverte${this.openOffresCount > 1 ? 's' : ''}.`;
  }

  get bannerDay(): string {
    return this.currentDate.toLocaleDateString('fr-FR', { day: '2-digit' });
  }

  get bannerMonthYear(): string {
    const formatted = this.currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  get filteredFormations(): Formation[] {
    if (this.selectedFormationTab === 'all') return this.formations;
    return this.formations.filter(f => f.tag === this.selectedFormationTab);
  }

  loadFormations(): void {
    this.loadingFormations = true;
    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.formations = formations.map((formation) => this.mapFormationToUi(formation));
        this.loadingFormations = false;
      },
      error: () => {
        this.loadingFormations = false;
        this.showToast('Impossible de charger les formations');
      }
    });
  }

  get activeFormationsCount(): number {
    return this.formations.filter(f => f.progress > 0 && f.progress < 100).length;
  }

  get completedFormationsCount(): number {
    return this.formations.filter(f => f.progress >= 100).length;
  }

  get formationsEnrolledCount(): number {
    return this.formations.reduce((total, formation) => total + formation.enrolled, 0);
  }

  get formationsAverageRating(): string {
    if (!this.formations.length) return '0.0';
    const total = this.formations.reduce((sum, formation) => sum + Number(formation.rating || 0), 0);
    return (total / this.formations.length).toFixed(1);
  }

  // ── Offres ────────────────────────────────────────────────────────────────────
  openKanban(offre: Offre): void {
    this.kanbanOffreId = offre.id;
    this.kanbanTitle = offre.title;
    this.kanbanMeta  = `${offre.dept} · ${offre.niveauLabel} · ${this.offreStatusLabel(offre.statut)} · Publié ${offre.date}`;
    this.showKanbanView = true;
    this.loadingKanban = true;

    this.candidatureService.getByOffre(offre.id).subscribe({
      next: (candidatures) => {
        this.kanbanData = this.buildKanbanData(offre, candidatures);
        this.loadingKanban = false;
      },
      error: () => {
        this.loadingKanban = false;
        this.showToast('Erreur lors du chargement des candidatures');
      }
    });
  }

  loadOffres(): void {
    this.loadingOffres = true;
    forkJoin({
      offres: this.offreEmploiService.getAllOffres(),
      candidatures: this.candidatureService.getAll()
    }).subscribe({
      next: ({ offres, candidatures }) => {
        const counts = candidatures.reduce((acc, candidature) => {
          if (candidature.offreId != null) {
            acc[candidature.offreId] = (acc[candidature.offreId] || 0) + 1;
          }
          return acc;
        }, {} as Record<number, number>);

        this.offres = offres.map((offre) => this.mapApiOffreToUi(offre, counts[offre.id ?? 0] ?? 0));
        this.loadingOffres = false;
      },
      error: () => {
        this.loadingOffres = false;
        this.showToast('Erreur lors du chargement des offres');
      }
    });
  }

  computeScore(candTags: string[], offreTags: string[]): number {
    if (!offreTags.length) return 0;
    const matches = candTags.filter(t =>
      offreTags.some(ot => ot.toLowerCase() === t.toLowerCase())
    ).length;
    return Math.round((matches / offreTags.length) * 100);
  }

  scoreColor(score: number): string {
    return score >= 75 ? 'var(--accent3)' : score >= 50 ? 'var(--accent4)' : 'var(--accent5)';
  }

  scoreClass(score: number): string {
    return score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low';
  }

  tagClass(tag: string, offreTags: string[]): string {
    const isMatch   = offreTags.some(ot => ot.toLowerCase() === tag.toLowerCase());
    const isPartial = !isMatch && offreTags.some(ot =>
      ot.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(ot.toLowerCase())
    );
    return isMatch ? 'match' : isPartial ? 'partial' : 'no-match';
  }

  onDragStart(candidature: KanbanCandidature): void {
    this.draggedCandidature = candidature;
  }

  onDragEnd(): void {
    this.draggedCandidature = null;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetStatus: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE'): void {
    event.preventDefault();

    if (!this.draggedCandidature || this.draggedCandidature.statut === targetStatus) {
      this.draggedCandidature = null;
      return;
    }

    this.candidatureService.changeStatut(this.draggedCandidature.id, targetStatus).subscribe({
      next: () => {
        const currentOffre = this.offres.find((offre) => offre.id === this.kanbanOffreId);
        if (currentOffre) {
          this.openKanban(currentOffre);
        }
        this.draggedCandidature = null;
        this.showToast('Statut candidature mis a jour');
      },
      error: () => {
        this.draggedCandidature = null;
        this.showToast('Erreur lors de la mise a jour du statut');
      }
    });
  }

  openFormationModal(): void {
    this.resetFormationForm();
    this.showFormationModal = true;
  }

  closeFormationModal(): void {
    this.showFormationModal = false;
    this.savingFormation = false;
  }

  createFormation(): void {
    if (!this.newFormation.titre.trim() || !this.newFormation.description.trim()) {
      this.showToast('Veuillez renseigner le titre et la description');
      return;
    }

    if (!this.newFormation.dateDebut || !this.newFormation.dateFin) {
      this.showToast('Veuillez renseigner les dates de debut et de fin');
      return;
    }

    if (new Date(this.newFormation.dateFin) < new Date(this.newFormation.dateDebut)) {
      this.showToast('La date de fin doit etre apres la date de debut');
      return;
    }

    if (!this.newFormation.capacite || this.newFormation.capacite < 1) {
      this.showToast('La capacite doit etre superieure a 0');
      return;
    }

    this.savingFormation = true;
    this.formationService.createFormation({
      ...this.newFormation,
      titre: this.newFormation.titre.trim(),
      description: this.newFormation.description.trim()
    }).subscribe({
      next: () => {
        this.savingFormation = false;
        this.closeFormationModal();
        this.loadFormations();
        this.showToast('Formation creee avec succes');
      },
      error: () => {
        this.savingFormation = false;
        this.showToast("Erreur lors de la creation de la formation");
      }
    });
  }

  // ── Modal ────────────────────────────────────────────────────────────────────
  openModal(): void {
    this.editingOffre = null;
    this.newOffreTitre = '';
    this.newOffreDesc = '';
    this.newOffreDept = 'Ingénierie';
    this.newOffreNiveau = 'Senior';
    this.newOffreContrat = 'CDI';
    this.newOffreType = 'EXTERNE';
    this.newOffreTags = [];
    this.tagInputValue = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingOffre = null;
  }

  addTag(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const val = this.tagInputValue.trim().replace(',', '');
      if (val && !this.newOffreTags.includes(val)) {
        this.newOffreTags = [...this.newOffreTags, val];
      }
      this.tagInputValue = '';
    }
  }

  removeTag(tag: string): void {
    this.newOffreTags = this.newOffreTags.filter(t => t !== tag);
  }

  createOffre(): void {
    if (!this.newOffreTitre.trim() || !this.newOffreDesc.trim()) {
      this.showToast('Veuillez renseigner le titre et la description');
      return;
    }
    if (!this.newOffreTags.length) {
      this.showToast('Veuillez ajouter au moins une skill');
      return;
    }

    this.savingOffre = true;
    this.offreEmploiService.createOffre(this.buildOffrePayload()).subscribe({
      next: (created) => {
        this.savingOffre = false;
        this.closeModal();
        this.loadOffres();
        this.showToast(`Offre "${created.titre}" publiee avec succes`);
      },
      error: () => {
        this.savingOffre = false;
        this.showToast("Erreur lors de l'ajout de l'offre");
      }
    });
  }

  openEditModal(offre: Offre): void {
    this.editingOffre = offre;
    this.editOffreTitre = offre.title;
    this.editOffreDesc = offre.description;
    this.editOffreDept = offre.dept;
    this.editOffreNiveau = offre.niveauLabel;
    this.editOffreTags = [...offre.tags];
    this.newOffreTitre = offre.title;
    this.newOffreDesc = offre.description;
    this.newOffreDept = offre.dept;
    this.newOffreNiveau = offre.niveauLabel;
    this.newOffreContrat = offre.contrat;
    this.newOffreType = offre.offreType;
    this.newOffreTags = [...offre.tags];
    this.tagInputValue = '';
    this.showModal = true;
  }

  closeEditModal(): void {
    this.closeModal();
  }

  saveEditOffre(): void {
    if (!this.editingOffre) return;
    if (!this.newOffreTitre.trim() || !this.newOffreDesc.trim()) {
      this.showToast('Veuillez renseigner le titre et la description');
      return;
    }
    if (!this.newOffreTags.length) {
      this.showToast('Veuillez ajouter au moins une skill');
      return;
    }

    this.savingOffre = true;
    this.offreEmploiService.updateOffre(this.editingOffre.id, this.buildOffrePayload(this.editingOffre.statut)).subscribe({
      next: (updated) => {
        this.savingOffre = false;
        this.closeEditModal();
        this.loadOffres();
        this.showToast('Offre mise a jour');
      },
      error: () => {
        this.savingOffre = false;
        this.showToast("Erreur lors de la mise a jour de l'offre");
      }
    });
  }

  cloturerOffre(offre: Offre): void {
    this.offreEmploiService.cloturerOffre(offre.id).subscribe({
      next: () => {
        this.loadOffres();
        if (this.showKanbanView) {
          this.showKanbanView = false;
        }
        this.showToast('Offre cloturee avec succes');
      },
      error: () => {
        this.showToast("Erreur lors de la cloture de l'offre");
      }
    });
  }

  

  // ── Toast ────────────────────────────────────────────────────────────────────
  showToast(msg: string): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = msg;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => (this.toastVisible = false), 3000);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  get topSkillsMax(): number { return this.topSkills[0]?.count || 1; }

  formatDate(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  offreStatusLabel(statut: OffreStatut): string {
    if (statut === 'FERMEE') return 'Cloturee';
    if (statut === 'BROUILLON') return 'Brouillon';
    return 'Ouverte';
  }

  offreStatusClass(statut: OffreStatut): string {
    if (statut === 'FERMEE') return 'closed';
    if (statut === 'BROUILLON') return 'draft';
    return 'open';
  }

  private buildOffrePayload(statut: OffreStatut = 'OUVERTE'): OffreEmploi {
    return {
      titre: this.newOffreTitre.trim(),
      description: this.newOffreDesc.trim(),
      type: this.newOffreType,
      departement: this.newOffreDept,
      niveau: this.newOffreNiveau,
      contrat: this.newOffreContrat,
      skills: [...this.newOffreTags],
      statut
    };
  }

  private mapApiOffreToUi(offre: OffreEmploi, candidaturesCount?: number): Offre {
    const niveau = this.mapNiveauValue(offre.niveau);

    return {
      id: offre.id ?? Date.now(),
      type: this.inferCardType(offre.departement, offre.type),
      title: offre.titre,
      dept: offre.departement || 'General',
      niveau,
      niveauLabel: offre.niveau || 'Non precise',
      date: this.formatRelativeDate(offre.datePublication),
      candidatures: candidaturesCount ?? 0,
      tags: offre.skills || [],
      description: offre.description || '',
      contrat: offre.contrat || 'Non precise',
      offreType: (offre.type as OffreType) || 'EXTERNE',
      statut: (offre.statut as OffreStatut) || 'OUVERTE'
    };
  }

  private buildKanbanData(offre: Offre, candidatures: BackendCandidature[]): CandidaturesData {
    const mapped = candidatures.map((candidature) => this.mapBackendCandidatureToKanban(candidature, offre.tags));

    return {
      offreTags: offre.tags,
      trier: mapped.filter((candidature) => candidature.statut === 'EN_ATTENTE').sort((a, b) => b.score - a.score),
      entretien: mapped.filter((candidature) => candidature.statut === 'ACCEPTEE').sort((a, b) => b.score - a.score),
      rejetee: mapped.filter((candidature) => candidature.statut === 'REFUSEE').sort((a, b) => b.score - a.score)
    };
  }

  private mapBackendCandidatureToKanban(candidature: BackendCandidature, offreTags: string[]): KanbanCandidature {
    const tags = this.extractTagsFromCandidature(candidature);
    const palette = this.colorFromName(candidature.nomCandidat);

    return {
      id: candidature.id ?? 0,
      name: candidature.nomCandidat,
      initials: this.buildInitials(candidature.nomCandidat),
      role: candidature.email,
      color: palette.bg,
      tc: palette.text,
      email: candidature.email,
      tags,
      score: this.computeScore(tags, offreTags),
      statut: this.normalizeCandidatureStatus(candidature.statut)
    };
  }

  private extractTagsFromCandidature(candidature: BackendCandidature): string[] {
    const raw = `${candidature.poste || ''},${candidature.departement || ''}`;

    return raw
      .split(',')
      .map((item) => item.trim())
      .filter((item) => !!item);
  }

  private normalizeCandidatureStatus(statut?: string): 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' {
    if (statut === 'REFUSEE') return 'REFUSEE';
    if (statut === 'ACCEPTEE') return 'ACCEPTEE';
    return 'EN_ATTENTE';
  }

  private buildInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private colorFromName(name: string): { bg: string; text: string } {
    const palettes = [
      { bg: 'rgba(108,99,255,0.2)', text: 'var(--accent2)' },
      { bg: 'rgba(34,211,238,0.16)', text: 'var(--accent6)' },
      { bg: 'rgba(74,222,128,0.14)', text: 'var(--accent3)' },
      { bg: 'rgba(245,158,11,0.14)', text: 'var(--accent4)' },
      { bg: 'rgba(244,63,94,0.14)', text: 'var(--accent5)' }
    ];

    const index = Math.abs(name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % palettes.length;
    return palettes[index];
  }

  private inferCardType(departement?: string, offreType?: OffreType): 'tech' | 'design' | 'data' {
    const normalizedDept = (departement || '').toLowerCase();
    if (normalizedDept.includes('design')) return 'design';
    if (normalizedDept.includes('data') || normalizedDept.includes('ia')) return 'data';
    if (offreType === 'INTERNE') return 'design';
    return 'tech';
  }

  private mapNiveauValue(niveau?: string): 'junior' | 'mid' | 'senior' {
    const normalized = (niveau || '').toLowerCase();
    if (normalized.includes('junior')) return 'junior';
    if (normalized.includes('mid')) return 'mid';
    return 'senior';
  }

  private formatRelativeDate(datePublication?: string): string {
    if (!datePublication) return 'a l instant';

    const now = new Date();
    const published = new Date(datePublication);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "a l'instant";
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return this.formatDate(datePublication);
  }

  private applyAdminFromSession(user: { id: number; nom: string; prenom: string; email: string; telephone?: string }): void {
    this.admin = {
      ...this.admin,
      id: user.id,
      nom: user.nom || this.admin.nom,
      prenom: user.prenom || this.admin.prenom,
      email: user.email || this.admin.email,
      telephone: user.telephone || this.admin.telephone,
      avatar: this.buildAvatar(user.prenom, user.nom)
    };
    this.syncParamForm();
  }

  private applyAdminFromApi(apiAdmin: Admin): void {
    this.admin = {
      ...this.admin,
      id: apiAdmin.id ?? this.admin.id,
      nom: apiAdmin.nom || this.admin.nom,
      prenom: apiAdmin.prenom || this.admin.prenom,
      email: apiAdmin.email || this.admin.email,
      telephone: apiAdmin.telephone || this.admin.telephone,
      matricule: apiAdmin.matricule || this.admin.matricule,
      poste: apiAdmin.poste || this.admin.poste,
      departement: apiAdmin.departement || this.admin.departement,
      dateEmbauche: this.toDateInputValue(apiAdmin.dateEmbauche) || this.admin.dateEmbauche,
      typeContrat: apiAdmin.typeContrat || this.admin.typeContrat,
      avatar: this.buildAvatar(apiAdmin.prenom, apiAdmin.nom)
    };
    this.syncParamForm();
  }

  private syncParamForm(): void {
    this.paramForm = {
      ...this.paramForm,
      nom: this.admin.nom,
      prenom: this.admin.prenom,
      email: this.admin.email,
      telephone: this.admin.telephone
    };
  }

  private buildAvatar(prenom?: string, nom?: string): string {
    const initials = `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.trim().toUpperCase();
    return initials || this.admin.avatar;
  }

  private mapEmployeToDashboard(employee: Employe): Employee {
    const fullName = `${employee.prenom || ''} ${employee.nom || ''}`.trim();
    const deptStyle = this.getDeptStyle(employee.departement || '');

    return {
      initials: this.getInitials(employee.prenom, employee.nom),
      name: fullName || employee.email,
      role: employee.poste || 'Poste non renseigne',
      dept: employee.departement || 'Non renseigne',
      status: 'active',
      color: deptStyle.bg,
      textColor: deptStyle.color,
      joinDate: this.toDateInputValue(employee.dateEmbauche || employee.dateCreation)
    };
  }

  private getDeptStyle(dept: string): { bg: string; color: string } {
    const normalizedDept = (dept || '').toLowerCase();
    if (normalizedDept.includes('ingen') || normalizedDept.includes('tech')) {
      return { bg: 'rgba(108,99,255,0.2)', color: 'var(--accent2)' };
    }
    if (normalizedDept.includes('design')) {
      return { bg: 'rgba(244,63,94,0.15)', color: 'var(--accent5)' };
    }
    if (normalizedDept.includes('marketing') || normalizedDept.includes('commercial')) {
      return { bg: 'rgba(245,158,11,0.12)', color: 'var(--accent4)' };
    }
    if (normalizedDept.includes('finance')) {
      return { bg: 'rgba(34,211,238,0.12)', color: 'var(--accent6)' };
    }
    return { bg: 'rgba(74,222,128,0.1)', color: 'var(--accent3)' };
  }

  private getInitials(prenom?: string, nom?: string): string {
    const initials = `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
    return initials || 'EM';
  }

  private compareDatesDesc(a?: string, b?: string): number {
    const aTime = a ? new Date(a).getTime() : 0;
    const bTime = b ? new Date(b).getTime() : 0;
    return bTime - aTime;
  }

  private resetFormationForm(): void {
    this.newFormation = {
      titre: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      typeFormation: 'EN_LIGNE',
      capacite: 1
    };
  }

  private mapFormationToUi(formation: FormationApi): Formation {
    const tag = this.mapFormationTag(formation.typeFormation);
    return {
      tag,
      tagLabel: this.mapFormationTagLabel(tag),
      title: formation.titre,
      desc: formation.description || 'Aucune description disponible.',
      duration: this.formatFormationDuration(formation.dateDebut, formation.dateFin),
      enrolled: formation.capacite ?? 0,
      rating: this.estimateFormationRating(formation.typeFormation),
      progress: this.computeFormationProgress(formation.dateDebut, formation.dateFin)
    };
  }

  private mapFormationTag(typeFormation?: string): Formation['tag'] {
    switch ((typeFormation || '').toUpperCase()) {
      case 'EN_LIGNE':
        return 'tech';
      case 'PRESENTIEL':
        return 'soft';
      case 'HYBRIDE':
        return 'lead';
      default:
        return 'tech';
    }
  }

  private mapFormationTagLabel(tag: Formation['tag']): string {
    const labels: Record<Formation['tag'], string> = {
      tech: 'Tech',
      soft: 'Soft Skills',
      lead: 'Leadership'
    };
    return labels[tag];
  }

  private computeFormationProgress(dateDebut?: string, dateFin?: string): number {
    if (!dateDebut || !dateFin) return 0;

    const start = new Date(dateDebut).getTime();
    const end = new Date(dateFin).getTime();
    const now = Date.now();

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
    if (now <= start) return 0;
    if (now >= end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  }

  private formatFormationDuration(dateDebut?: string, dateFin?: string): string {
    if (!dateDebut || !dateFin) return '-';

    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '-';

    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
    return `${days}j`;
  }

  private estimateFormationRating(typeFormation?: string): string {
    const ratings: Record<string, string> = {
      EN_LIGNE: '4.8',
      PRESENTIEL: '4.6',
      HYBRIDE: '4.7'
    };
    return ratings[(typeFormation || '').toUpperCase()] || '4.7';
  }

  private toDateInputValue(value: string | undefined): string {
    if (!value) return '';
    return value.includes('T') ? value.slice(0, 10) : value;
  }
}
