import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DemandeConge, StatutDemande, TYPE_LABELS, CreateDemandeConge, TypeConge } from '../../../models/demande-conge';
import { CreateEmploye, Employe } from '../../../models/employe';
import { Formation as FormationApi } from '../../../models/formation';
import { OffreEmploi, OffreStatut, OffreType } from '../../../models/offre-emploi';
import { Candidature as BackendCandidature } from '../../../models/candidature';
import { AuthService } from '../../../services/auth/auth.service';
import { DemandeCongeService } from '../../../services/demande-conge.service';
import { EmployeService } from '../../../services/employe.service';
import { FormationService } from '../../../services/formation.service';
import { OffreEmploiService } from '../../../services/offre-emploi.service';
import { CandidatureService } from '../../../services/candidature.service';

export interface Employee {
  id: number;
  matricule: string;
  name: string;
  initials: string;
  role: string;
  dept: string;
  status: 'active' | 'leave' | 'remote' | 'absent';
  color: string;
  textColor: string;
  absences: number;
  joinDate: string;
  phone: string;
  email: string;
  contractType: string;
  leaveBalance: number;
}

interface EmployeeForm {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  matricule: string;
  poste: string;
  departement: string;
  dateEmbauche: string;
  typeContrat: string;
  soldeConge: number;
  motdepasse: string;
}

export interface JobOffer {
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

export interface Candidature {
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

export interface KanbanData {
  offreTags: string[];
  trier: Candidature[];
  entretien: Candidature[];
  rejetee: Candidature[];
}

export interface Formation {
  tag: 'tech' | 'soft' | 'lead';
  tagLabel: string;
  title: string;
  desc: string;
  duration: string;
  enrolled: number;
  rating: string;
  progress: number;
}

export interface ActivityItem {
  color: string;
  message: string;
  time: string;
}

export interface AiInsight {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-espace-rh',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './espace-rh.component.html',
  styleUrls: ['./espace-rh.component.css']
})
export class EspaceRhComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private employeService: EmployeService,
    private demandeCongeService: DemandeCongeService,
    private formationService: FormationService,
    private offreEmploiService: OffreEmploiService,
    private candidatureService: CandidatureService,
    private router: Router
  ) {}

  // ───────────────────────── STATE ─────────────────────────
  activePage: string = 'dashboard';
  pageTitle: string = 'Vue d\'ensemble';
  toastMessage: string = '';
  toastVisible: boolean = false;
  private toastTimer: any;

  // Profil photo (aperçu local)
  rhPhotoUrl: string | null = null;

  // Modal offre
  modalOffreOpen: boolean = false;
  newOffreTitre: string = '';
  newOffreDept: string = 'Ingénierie';
  newOffreNiveau: string = 'Mid-level';
  newOffreDesc: string = '';
  newOffreContrat: string = 'CDI';
  newOffreType: OffreType = 'EXTERNE';
  newOffreTags: string[] = [];
  tagInputValue: string = '';
  editingOffre: JobOffer | null = null;

  // Modal employé
  modalEmpOpen: boolean = false;
  editingEmployee: Employee | null = null;
  loadingEmployees: boolean = false;
  savingEmployee: boolean = false;
  deletingEmployeeId: number | null = null;

  // Confirm delete modal state
  showConfirmDelete: boolean = false;
  confirmDeleteEmployee: Employee | null = null;

  employeeForm: EmployeeForm = this.getEmptyEmployeeForm();

  // Modal congé
  modalCongeOpen: boolean = false;
  loadingLeaveRequests: boolean = false;
  updatingLeaveRequestId: number | null = null;

  // Kanban
  kanbanView: boolean = false;
  kanbanOffre: JobOffer | null = null;
  currentOffres: JobOffer[] = [];
  kanbanData: KanbanData | null = null;
  private draggedCandidature: Candidature | null = null;

  // Filtre employés
  filterDept: string = 'Tous';

  // Onglet formations
  selectedFormationTab: 'all' | 'tech' | 'soft' | 'lead' = 'all';
  loadingFormations: boolean = false;

  // Formation modal state
  modalFormationOpen: boolean = false;
  newFormation: FormationApi = { titre: '', description: '', dateDebut: '', dateFin: '', typeFormation: 'EN_LIGNE', capacite: 1 };
  creatingFormation: boolean = false;
  editingFormationId: number | null = null;
  loadingOffres: boolean = false;
  savingOffre: boolean = false;
  loadingKanban: boolean = false;

  // Calendrier mois/année
  calMonth: number = new Date().getMonth();
  calYear: number = new Date().getFullYear();

  // Calendar interaction state
  selectedCalendarDate: string | null = null; // ISO yyyy-mm-dd
  calendarDayRequests: DemandeConge[] = [];
  calendarDayModalOpen: boolean = false;
  showCreateDayRequestForm: boolean = false;
  creatingDayRequest: boolean = false;

  // payload for create request from calendar
  newDayRequest: { employeeId?: number; dateDebut: string; dateFin: string; type: TypeConge } = { employeeId: undefined, dateDebut: '', dateFin: '', type: 'PAYE' };

  // ───────────────────────── FAKE DATA ─────────────────────────

  employees: Employee[] = [];

  leaveRequests: DemandeConge[] = [];

  formations: Formation[] = [];

  readonly activityFeed: ActivityItem[] = [
    { color: 'var(--teal)', message: '🤖 IA a trié 8 candidatures pour <strong>Lead Dev React</strong>', time: 'Il y a 2h' },
    { color: 'var(--amber)', message: '📅 Demande de congé de <strong>Karim Hamdi</strong> en attente', time: 'Il y a 4h' },
    { color: 'var(--accent)', message: '📋 Nouvelle offre publiée : <strong>DevOps Engineer Senior</strong>', time: 'Hier' },
    { color: 'var(--purple)', message: '🎓 Formation <strong>Cloud AWS</strong> complétée par 12 employés', time: 'Hier' },
    { color: 'var(--pink)', message: '⭐ Score matching record : <strong>97%</strong> pour poste Data Engineer', time: 'Il y a 2j' },
    { color: 'var(--teal)', message: '👤 <strong>Sara Amrani</strong> a été ajoutée à l\'équipe Ingénierie', time: 'Il y a 3j' },
  ];

  readonly aiInsights: AiInsight[] = [
    { icon: 'fa-user-check', label: 'Taux de rétention', value: '94.2%', sub: '+1.8% ce trimestre', color: 'var(--teal)', bg: 'rgba(20,184,166,0.12)' },
    { icon: 'fa-robot', label: 'Score moyen IA matching', value: '73%', sub: 'Basé sur 53 candidatures', color: 'var(--amber)', bg: 'rgba(245,158,11,0.12)' },
    { icon: 'fa-clock', label: 'Délai moyen recrutement', value: '18j', sub: '-3j vs mois dernier', color: 'var(--purple)', bg: 'rgba(168,85,247,0.12)' },
    { icon: 'fa-chart-pie', label: 'Taux d\'absentéisme', value: '3.1%', sub: 'Sous le seuil critique 5%', color: 'var(--pink)', bg: 'rgba(236,72,153,0.12)' },
    { icon: 'fa-graduation-cap', label: 'Complétion formations', value: '67%', sub: '89 employés actifs', color: 'var(--accent)', bg: 'rgba(56,189,248,0.12)' },
    { icon: 'fa-star', label: 'eNPS Score', value: '+42', sub: 'Très satisfaisant', color: 'var(--teal)', bg: 'rgba(20,184,166,0.12)' },
    { icon: 'fa-fire', label: 'Turnover annuel', value: '8.4%', sub: 'Stable vs année passée', color: 'var(--amber)', bg: 'rgba(245,158,11,0.12)' },
    { icon: 'fa-brain', label: 'Candidats pré-qualifiés', value: '31', sub: 'Score IA ≥ 75%', color: 'var(--purple)', bg: 'rgba(168,85,247,0.12)' },
  ];

  readonly topSkills = [
    { name: 'React.js', count: 38, color: 'var(--accent)' },
    { name: 'Python', count: 35, color: 'var(--teal)' },
    { name: 'TypeScript', count: 31, color: 'var(--purple)' },
    { name: 'Docker', count: 28, color: 'var(--amber)' },
    { name: 'AWS', count: 24, color: 'var(--pink)' },
    { name: 'Node.js', count: 22, color: 'var(--accent)' },
  ];

  readonly deptDistrib = [
    { name: 'Ingénierie', pct: 62, color: 'var(--teal)' },
    { name: 'Design', pct: 18, color: 'var(--pink)' },
    { name: 'Marketing', pct: 12, color: 'var(--amber)' },
    { name: 'Finance', pct: 8, color: 'var(--purple)' },
  ];

  readonly recrutWeek = [40, 55, 70, 85, 100, 65, 35];
  readonly recrutDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Kanban column def
  readonly kanbanCols = [
    { key: 'trier', label: 'À Trier', dotClass: 'amber', countClass: 'amber', icon: 'fa-sort' },
    { key: 'entretien', label: 'Entretien', dotClass: 'purple', countClass: 'purple', icon: 'fa-user-tie' },
    { key: 'rejetee', label: 'Rejetée', dotClass: 'pink', countClass: 'pink', icon: 'fa-times-circle' },
  ];

  // ───────────────────────── GETTERS ─────────────────────────

  get activeEmployees(): number { return this.employees.filter(e => e.status === 'active').length; }
  get onLeaveEmployees(): number { return this.employees.filter(e => e.status === 'leave').length; }
  get remoteEmployees(): number { return this.employees.filter(e => e.status === 'remote').length; }
  get absentEmployees(): number { return this.employees.filter(e => e.status === 'absent').length; }
  get pendingLeaves(): number { return this.leaveRequests.filter(l => l.statutDemande === 'EN_ATTENTE').length; }
  get totalCandidatures(): number { return this.currentOffres.reduce((a, o) => a + o.candidatures, 0); }

  get filteredEmployees(): Employee[] {
    if (this.filterDept === 'Tous') return this.employees;
    return this.employees.filter(e => e.dept === this.filterDept);
  }

  get filteredFormations(): Formation[] {
    if (this.selectedFormationTab === 'all') return this.formations;
    return this.formations.filter(f => f.tag === this.selectedFormationTab);
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

  get currentKanbanData(): KanbanData | null { return this.kanbanData; }

  // Formation modal actions
  openModalFormation() {
    this.modalFormationOpen = true;
    this.newFormation = { titre: '', description: '', dateDebut: '', dateFin: '', typeFormation: 'EN_LIGNE', capacite: 1 };
  }

  closeModalFormation() {
    this.modalFormationOpen = false;
  }

  createFormation() {
    if (this.creatingFormation) return;
    // basic validation
    if (!this.newFormation.titre || !this.newFormation.dateDebut) {
      this.showToast('Veuillez renseigner au moins le titre et la date de début.');
      return;
    }

    this.creatingFormation = true;

    // If editing an existing formation, call update
    if (this.editingFormationId) {
      this.formationService.updateFormation(this.editingFormationId, this.newFormation).subscribe({
        next: (res) => {
          this.showToast('Formation mise à jour avec succès');
          if (typeof (this as any).loadFormations === 'function') (this as any).loadFormations();
          this.modalFormationOpen = false;
          this.creatingFormation = false;
          this.editingFormationId = null;
        },
        error: (err: HttpErrorResponse) => {
          const msg = err?.error?.message || 'Erreur lors de la mise à jour';
          this.showToast(msg);
          this.creatingFormation = false;
        }
      });
      return;
    }

    // Otherwise create new
    this.formationService.createFormation(this.newFormation).subscribe({
      next: (res) => {
        this.showToast('Formation créée avec succès');
        if (typeof (this as any).loadFormations === 'function') (this as any).loadFormations();
        this.modalFormationOpen = false;
        this.creatingFormation = false;
      },
      error: (err: HttpErrorResponse) => {
        const msg = err?.error?.message || 'Erreur lors de la création';
        this.showToast(msg);
        this.creatingFormation = false;
      }
    });
  }

  openEditFormation(f: any) {
    // populate modal with selected formation values
    this.editingFormationId = (f && (f.id || f.id === 0)) ? f.id : null;
    // map fields if coming from different shape
    this.newFormation = {
      titre: f.titre || f.title || '',
      description: f.description || f.desc || '',
      dateDebut: f.dateDebut || f.dateDebut || f.start || '',
      dateFin: f.dateFin || f.dateFin || f.end || '',
      typeFormation: (f.typeFormation as any) || 'EN_LIGNE',
      capacite: (f.capacite as any) || (f.enrolled as any) || 1
    };
    this.modalFormationOpen = true;
  }

  deleteFormation(f: any) {
    const id = f && (f.id || f.id === 0) ? f.id : null;
    if (!id) {
      // if no id, remove locally if possible
      this.formations = this.formations.filter(fr => fr !== f);
      this.showToast('Formation supprimée');
      return;
    }
    if (!confirm('Confirmer la suppression de cette formation ?')) return;
    this.formationService.deleteFormation(id).subscribe({
      next: () => {
        this.showToast('Formation supprimée');
        if (typeof (this as any).loadFormations === 'function') (this as any).loadFormations();
      },
      error: (err: HttpErrorResponse) => {
        const msg = err?.error?.message || 'Erreur lors de la suppression';
        this.showToast(msg);
      }
    });
  }

  get calendarDays(): { day: number | null; cls: string; dateISO?: string; leaves?: (DemandeConge & { initials?: string; typeLabel?: string; statutLabel?: string })[] }[] {
    const cells: { day: number | null; cls: string; dateISO?: string; leaves?: (DemandeConge & { initials?: string; typeLabel?: string; statutLabel?: string })[] }[] = [];
    const firstDay = new Date(this.calYear, this.calMonth, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();

    const todayDate = new Date();
    const todayIso = todayDate.toISOString().slice(0, 10);

    // helper to normalize various backend property namings
    const normalize = (raw: any) => {
      return {
        debut: raw.debut || raw.Debut || raw.dateDebut || raw.dateDebut || raw.start || raw.debutDate,
        fin: raw.fin || raw.Fin || raw.dateFin || raw.end || raw.finDate,
        prenomEmploye: raw.prenomEmploye || raw.prenom || raw.PrenomEmploye || raw.prenomEmployee,
        nomEmploye: raw.nomEmploye || raw.nom || raw.NomEmploye || raw.nomEmployee,
        matriculeEmploye: raw.matriculeEmploye || raw.MatriculeEmploye || raw.matricule || raw.matriculeEmploye,
        typeConge: raw.typeConge || raw.TypeConge || raw.type || raw.Type || raw.typeConge,
        statutDemande: raw.statutDemande || raw.StatutDemande || raw.statut || raw.Statut || raw.statutDemande,
        id: raw.id ?? raw.Id ?? raw.ID
      } as DemandeConge;
    };

    // build map of leaves keyed by ISO date, and enrich each leave for display (initials, typeLabel)
    const leavesByDate: Record<string, any[]> = {};
    for (const raw of this.leaveRequests || []) {
      try {
        const r = normalize(raw as any);
        const start = new Date(r.debut);
        const end = new Date(r.fin);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const iso = d.toISOString().slice(0, 10);
          const enriched = Object.assign({}, r, {
            initials: this.getInitials(r.prenomEmploye, r.nomEmploye),
            typeLabel: this.leaveTypeLabel((r as any).typeConge as any),
            statutLabel: this.leaveStatusLabel((r as any).statutDemande as any),
            // keep canonical keys used by template compatibility
            typeConge: (r as any).typeConge,
            statutDemande: (r as any).statutDemande
          });
          (leavesByDate[iso] = leavesByDate[iso] || []).push(enriched);
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    for (let i = 0; i < offset; i++) cells.push({ day: null, cls: 'cal-day empty' });

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this.calYear, this.calMonth, d);
      const iso = date.toISOString().slice(0, 10);
      const leaves = leavesByDate[iso] || [];
      let cls = 'cal-day';
      if (iso === todayIso) cls += ' today';
      if (leaves.length) cls += ' has-leaves';
      cells.push({ day: d, cls, dateISO: iso, leaves });
    }

    return cells;
  }

  get deptOptions(): string[] {
    return ['Tous', ...Array.from(new Set(this.employees.map(e => e.dept)))];
  }

  getKanbanCol(key: string): Candidature[] {
    if (!this.currentKanbanData) return [];
    return (this.currentKanbanData as any)[key] || [];
  }

  computeScore(candTags: string[], offreTags: string[]): number {
    if (!offreTags?.length) return 0;
    const matches = candTags.filter(t => offreTags.some(ot => ot.toLowerCase() === t.toLowerCase())).length;
    return Math.round((matches / offreTags.length) * 100);
  }

  tagMatchClass(tag: string, offreTags: string[]): string {
    const isMatch = offreTags.some(ot => ot.toLowerCase() === tag.toLowerCase());
    const isPartial = !isMatch && offreTags.some(ot => ot.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(ot.toLowerCase()));
    return isMatch ? 'match' : isPartial ? 'partial' : 'no-match';
  }

  scoreClass(score: number): string {
    return score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low';
  }

  scoreColor(score: number): string {
    return score >= 75 ? 'var(--teal)' : score >= 50 ? 'var(--amber)' : 'var(--pink)';
  }

  getStatusPill(status: string): { cls: string; label: string } {
    const map: { [k: string]: { cls: string; label: string } } = {
      active: { cls: 'active', label: 'Actif' },
      leave: { cls: 'leave', label: 'Congé' },
      remote: { cls: 'active', label: 'Actif' },
      absent: { cls: 'absent', label: 'Absent' },
    };
    return map[status] || { cls: '', label: status };
  }

  getDeptStyle(dept: string): { bg: string; color: string } {
    const map: { [k: string]: { bg: string; color: string } } = {
      'Ingénierie': { bg: 'rgba(20,184,166,0.12)', color: 'var(--teal)' },
      'IA': { bg: 'rgba(168,85,247,0.12)', color: 'var(--purple)' },
      'Design': { bg: 'rgba(236,72,153,0.12)', color: 'var(--pink)' },
      'Produit': { bg: 'rgba(20,184,166,0.1)', color: 'var(--teal)' },
      'Marketing': { bg: 'rgba(245,158,11,0.12)', color: 'var(--amber)' },
      'Finance': { bg: 'rgba(255,255,255,0.06)', color: 'var(--text2)' },
      'RH': { bg: 'rgba(56,189,248,0.12)', color: 'var(--accent)' },
    };
    return map[dept] || { bg: 'rgba(255,255,255,0.05)', color: 'var(--text2)' };
  }

  // ───────────────────────── NAVIGATION ─────────────────────────

  showPage(pageId: string): void {
    this.activePage = pageId;
    const titles: { [k: string]: string } = {
      dashboard: 'Vue d\'ensemble',
      employes: 'Employés & Absences',
      conges: 'Congés & Absences',
      formations: 'Formations & Compétences',
      offres: 'Offres & Recrutement IA',
      analytics: 'Analytique IA',
    };
    this.pageTitle = titles[pageId] || pageId;
    if (pageId === 'offres') {
      this.kanbanView = false;
      this.loadOffres();
    }
    if (pageId === 'conges') this.loadLeaveRequests();
  }

  logoutRh(): void {
    this.authService.clearSession();
    this.router.navigate(['/home']);
  }

  // ───────────────────────── TOAST ─────────────────────────

  showToast(msg: string): void {
    this.toastMessage = msg;
    this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible = false, 3000);
  }

  // Photo de profil local — lit le fichier pour prévisualisation et affiche un toast.
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.rhPhotoUrl = String(reader.result || null);
      this.showToast('Photo de profil mise \u00e0 jour');
    };
    reader.readAsDataURL(file);
  }

  // ───────────────────────── OFFRES ─────────────────────────

  showKanban(offre: JobOffer): void {
    this.kanbanOffre = offre;
    this.kanbanView = true;
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

  backToOffres(): void {
    this.kanbanView = false;
    this.kanbanOffre = null;
    this.kanbanData = null;
  }

  openModalOffre(): void {
    this.editingOffre = null;
    this.newOffreTitre = '';
    this.newOffreDept = 'Ingénierie';
    this.newOffreNiveau = 'Mid-level';
    this.newOffreDesc = '';
    this.newOffreContrat = 'CDI';
    this.newOffreType = 'EXTERNE';
    this.newOffreTags = [];
    this.tagInputValue = '';
    this.modalOffreOpen = true;
  }

  closeModalOffre(): void {
    this.modalOffreOpen = false;
    this.editingOffre = null;
  }

  addTag(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const val = this.tagInputValue.trim().replace(',', '');
      if (val && !this.newOffreTags.includes(val)) this.newOffreTags.push(val);
      this.tagInputValue = '';
    }
  }

  removeTag(tag: string): void { this.newOffreTags = this.newOffreTags.filter(t => t !== tag); }

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
        this.closeModalOffre();
        this.loadOffres();
        this.showToast(`Offre "${created.titre}" publiee avec succes`);
      },
      error: () => {
        this.savingOffre = false;
        this.showToast("Erreur lors de l'ajout de l'offre");
      }
    });
  }

  openEditModal(offre: JobOffer): void {
    this.editingOffre = offre;
    this.newOffreTitre = offre.title;
    this.newOffreDesc = offre.description;
    this.newOffreDept = offre.dept;
    this.newOffreNiveau = offre.niveauLabel;
    this.newOffreContrat = offre.contrat;
    this.newOffreType = offre.offreType;
    this.newOffreTags = [...offre.tags];
    this.tagInputValue = '';
    this.modalOffreOpen = true;
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
      next: () => {
        this.savingOffre = false;
        this.closeModalOffre();
        this.loadOffres();
        this.showToast('Offre mise a jour');
      },
      error: () => {
        this.savingOffre = false;
        this.showToast("Erreur lors de la mise a jour de l'offre");
      }
    });
  }

  cloturerOffre(offre: JobOffer): void {
    this.offreEmploiService.cloturerOffre(offre.id).subscribe({
      next: () => {
        this.loadOffres();
        if (this.kanbanView) {
          this.backToOffres();
        }
        this.showToast('Offre cloturee avec succes');
      },
      error: () => {
        this.showToast("Erreur lors de la cloture de l'offre");
      }
    });
  }

  onDragStart(candidature: Candidature): void {
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
        const currentOffre = this.currentOffres.find((offre) => offre.id === this.kanbanOffre?.id);
        if (currentOffre) {
          this.showKanban(currentOffre);
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

  // ───────────────────────── EMPLOYEES ─────────────────────────

  openModalEmp(): void {
    this.editingEmployee = null;
    this.employeeForm = this.getEmptyEmployeeForm();
    this.modalEmpOpen = true;
  }

  openEditEmployee(employee: Employee): void {
    this.editingEmployee = employee;
    this.employeeForm = {
      id: employee.id,
      nom: this.extractNom(employee.name),
      prenom: this.extractPrenom(employee.name),
      email: employee.email,
      telephone: employee.phone,
      matricule: employee.matricule,
      poste: employee.role,
      departement: employee.dept,
      dateEmbauche: employee.joinDate,
      typeContrat: employee.contractType || 'CDI',
      soldeConge: employee.leaveBalance,
      motdepasse: ''
    };
    this.modalEmpOpen = true;
  }

  closeModalEmp(): void {
    this.modalEmpOpen = false;
    this.editingEmployee = null;
    this.savingEmployee = false;
  }

  createEmployee(): void {
    if (!this.employeeForm.nom.trim() || !this.employeeForm.prenom.trim()) {
      this.showToast('Prenom et nom requis');
      return;
    }
    if (!this.employeeForm.email.trim() || !this.employeeForm.matricule.trim()) {
      this.showToast('Email et matricule requis');
      return;
    }
    if (!this.employeeForm.dateEmbauche) {
      this.showToast('Date d embauche requise');
      return;
    }
    if (!this.employeeForm.typeContrat) {
      this.showToast('Type de contrat requis');
      return;
    }

    if (this.editingEmployee?.id) {
      this.updateEmployee();
      return;
    }

    if (!this.employeeForm.motdepasse.trim()) {
      this.showToast('Mot de passe initial requis');
      return;
    }

    this.savingEmployee = true;
    const payload: CreateEmploye = {
      nom: this.employeeForm.nom.trim(),
      prenom: this.employeeForm.prenom.trim(),
      email: this.employeeForm.email.trim(),
      telephone: this.employeeForm.telephone.trim(),
      matricule: this.employeeForm.matricule.trim(),
      poste: this.employeeForm.poste.trim(),
      departement: this.employeeForm.departement,
      dateEmbauche: this.employeeForm.dateEmbauche,
      typeContrat: this.employeeForm.typeContrat,
      soldeConge: Number(this.employeeForm.soldeConge),
      motdepasse: this.employeeForm.motdepasse
    };

    this.employeService.addEmploye(payload).subscribe({
      next: () => {
        this.savingEmployee = false;
        this.closeModalEmp();
        this.loadEmployees();
        this.showToast(`Employe ${payload.prenom} ${payload.nom} ajoute avec succes`);
      },
      error: (error: HttpErrorResponse) => {
        this.savingEmployee = false;
        this.showToast(this.getEmployeeErrorMessage(error, 'Erreur lors de la creation de l employe'));
      }
    });
  }

  // Open confirm delete modal (styled green/yellow)
  openConfirmDelete(employee: Employee): void {
    this.confirmDeleteEmployee = employee;
    this.showConfirmDelete = true;
  }

  cancelConfirmDelete(): void {
    this.confirmDeleteEmployee = null;
    this.showConfirmDelete = false;
  }

  confirmDelete(): void {
    if (!this.confirmDeleteEmployee) return;
    const emp = this.confirmDeleteEmployee;
    this.showConfirmDelete = false;
    // call existing delete flow (will set deletingEmployeeId and call backend)
    this.deleteEmployee(emp);
    this.confirmDeleteEmployee = null;
  }

  deleteEmployee(employee: Employee): void {
    if (!employee.id) {
      return;
    }

    this.deletingEmployeeId = employee.id;
    this.employeService.deleteEmploye(employee.id).subscribe({
      next: () => {
        this.deletingEmployeeId = null;
        this.loadEmployees();
        this.showToast(`Employe ${employee.name} supprime avec succes`);
      },
      error: (error: HttpErrorResponse) => {
        this.deletingEmployeeId = null;
        this.showToast(this.getEmployeeErrorMessage(error, 'Erreur lors de la suppression de l employe'));
      }
    });
  }

  // ───────────────────────── CONGÉS ─────────────────────────

  approveLeave(req: DemandeConge): void {
    this.updateLeaveStatus(req, 'APPROUVE', `Demande de ${this.leaveEmployeeName(req)} approuvee`);
  }

  rejectLeave(req: DemandeConge): void {
    this.updateLeaveStatus(req, 'REFUSEE', `Demande de ${this.leaveEmployeeName(req)} refusee`);
  }

  cancelLeave(req: DemandeConge): void {
    this.updateLeaveStatus(req, 'ANNULE', `Demande de ${this.leaveEmployeeName(req)} annulee`);
  }

  // ───────────────────────── LIFECYCLE ─────────────────────────

  ngOnInit(): void {
    this.loadEmployees();
    this.loadLeaveRequests();
    this.loadFormations();
    this.loadOffres();
  }

  // Calendar navigation
  prevMonth(): void {
    if (this.calMonth === 0) {
      this.calMonth = 11;
      this.calYear -= 1;
    } else {
      this.calMonth -= 1;
    }
  }

  nextMonth(): void {
    if (this.calMonth === 11) {
      this.calMonth = 0;
      this.calYear += 1;
    } else {
      this.calMonth += 1;
    }
  }

  goToToday(): void {
    const now = new Date();
    this.calMonth = now.getMonth();
    this.calYear = now.getFullYear();
  }

  get calendarMonthLabel(): string {
    const names = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return `${names[this.calMonth]} ${this.calYear}`;
  }

  onCalendarDayClick(cell: { day: number | null; dateISO?: string; leaves?: DemandeConge[] }): void {
    if (!cell || !cell.dateISO) return;
    this.selectedCalendarDate = cell.dateISO;
    this.calendarDayRequests = cell.leaves || [];
    this.calendarDayModalOpen = true;
    this.showCreateDayRequestForm = false;

    // prefill new request dates
    this.newDayRequest.dateDebut = cell.dateISO;
    this.newDayRequest.dateFin = cell.dateISO;
    this.newDayRequest.employeeId = this.employees.length ? this.employees[0].id : undefined;
  }

  closeCalendarDayModal(): void {
    this.calendarDayModalOpen = false;
    this.selectedCalendarDate = null;
    this.calendarDayRequests = [];
    this.showCreateDayRequestForm = false;
  }

  // create a new demande from calendar form
  submitNewDayRequest(): void {
    if (!this.newDayRequest.employeeId || !this.newDayRequest.dateDebut || !this.newDayRequest.dateFin) {
      this.showToast('Veuillez choisir un employé et définir une période');
      return;
    }
    this.creatingDayRequest = true;
    const payload: CreateDemandeConge = {
      dateDebut: this.newDayRequest.dateDebut,
      dateFin: this.newDayRequest.dateFin,
      type: this.newDayRequest.type
    };
    this.demandeCongeService.createDemande(this.newDayRequest.employeeId, payload).subscribe({
      next: () => {
        this.creatingDayRequest = false;
        this.showToast('Demande de congé créée');
        this.closeCalendarDayModal();
        this.loadLeaveRequests();
      },
      error: () => {
        this.creatingDayRequest = false;
        this.showToast('Erreur lors de la création');
      }
    });
  }

  trackByIndex(index: number): number { return index; }
  trackById(index: number, item: any): any { return item.id ?? index; }

  private updateEmployee(): void {
    if (!this.editingEmployee?.id) {
      return;
    }

    this.savingEmployee = true;
    const payload: Employe = {
      id: this.editingEmployee.id,
      nom: this.employeeForm.nom.trim(),
      prenom: this.employeeForm.prenom.trim(),
      email: this.employeeForm.email.trim(),
      telephone: this.employeeForm.telephone.trim(),
      matricule: this.employeeForm.matricule.trim(),
      poste: this.employeeForm.poste.trim(),
      departement: this.employeeForm.departement,
      dateEmbauche: this.employeeForm.dateEmbauche,
      typeContrat: this.employeeForm.typeContrat,
      soldeConge: Number(this.employeeForm.soldeConge)
    };

    this.employeService.updateEmploye(this.editingEmployee.id, payload).subscribe({
      next: () => {
        this.savingEmployee = false;
        this.closeModalEmp();
        this.loadEmployees();
        this.showToast(`Employe ${payload.prenom} ${payload.nom} mis a jour`);
      },
      error: (error: HttpErrorResponse) => {
        this.savingEmployee = false;
        this.showToast(this.getEmployeeErrorMessage(error, 'Erreur lors de la mise a jour de l employe'));
      }
    });
  }

  loadEmployees(): void {
    this.loadingEmployees = true;
    this.employeService.getAllEmployes().subscribe({
      next: (employees) => {
        this.employees = employees.map((employee) => this.mapEmployeToUi(employee));
        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
        this.showToast('Impossible de charger les employes');
      }
    });
  }

  loadLeaveRequests(): void {
    this.loadingLeaveRequests = true;
    this.demandeCongeService.getAllDemandes().subscribe({
      next: (requests) => {
        this.leaveRequests = requests.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        this.loadingLeaveRequests = false;
      },
      error: () => {
        this.loadingLeaveRequests = false;
        this.showToast('Impossible de charger les demandes de conge');
      }
    });
  }

  // Search input value for leave requests list
  leaveSearch: string = '';

  // Returns filtered leave requests based on search text
  get filteredLeaveRequests(): DemandeConge[] {
    const q = (this.leaveSearch || '').trim().toLowerCase();
    if (!q) return this.leaveRequests;
    return this.leaveRequests.filter((r) => {
      const name = `${r.prenomEmploye || ''} ${r.nomEmploye || ''}`.trim().toLowerCase();
      const matricule = (r.matriculeEmploye || '').toLowerCase();
      const type = (r.typeConge || '').toString().toLowerCase();
      const dates = `${this.formatDate(r.debut)} ${this.formatDate(r.fin)}`.toLowerCase();
      return name.includes(q) || matricule.includes(q) || type.includes(q) || dates.includes(q);
    });
  }

  // Called by template on ngModelChange — kept for compatibility with previous wiring
  filterLeaveRequests(): void {
    // nothing to do; getter filteredLeaveRequests reads leaveSearch
  }

  // Refresh button in requests card
  refreshLeaveRequests(): void {
    this.loadLeaveRequests();
    this.showToast('Actualisation...');
  }

  // Compute avatar background color for a leave request
  avatarBg(req: DemandeConge): string {
    try {
      const name = this.leaveEmployeeName(req);
      return this.colorFromName(name).bg;
    } catch (e) {
      return 'rgba(58,90,82,0.08)';
    }
  }

  // Open a small details modal for a single leave request
  openLeaveDetails(req: DemandeConge): void {
    this.calendarDayRequests = [req];
    this.selectedCalendarDate = req.debut ? (req.debut.slice ? req.debut.slice(0,10) : this.toDateInputValue(req.debut)) : null;
    this.calendarDayModalOpen = true;
    this.showCreateDayRequestForm = false;
  }

  private loadFormations(): void {
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

  private loadOffres(): void {
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

        this.currentOffres = offres.map((offre) => this.mapApiOffreToUi(offre, counts[offre.id ?? 0] ?? 0));
        this.loadingOffres = false;
      },
      error: () => {
        this.loadingOffres = false;
        this.showToast('Impossible de charger les offres');
      }
    });
  }

  private updateLeaveStatus(req: DemandeConge, statut: StatutDemande, successMessage: string): void {
    if (!req.id) {
      return;
    }

    this.updatingLeaveRequestId = req.id;
    this.demandeCongeService.changeStatut(req.id, statut).subscribe({
      next: () => {
        this.updatingLeaveRequestId = null;
        this.loadLeaveRequests();
        this.showToast(successMessage);
      },
      error: (error: HttpErrorResponse) => {
        this.updatingLeaveRequestId = null;
        this.showToast(this.getEmployeeErrorMessage(error, 'Erreur lors de la mise a jour de la demande'));
      }
    });
  }

  private mapEmployeToUi(employee: Employe): Employee {
    const fullName = `${employee.prenom || ''} ${employee.nom || ''}`.trim();
    const deptStyle = this.getDeptStyle(employee.departement || '');

    return {
      id: employee.id ?? 0,
      matricule: employee.matricule || '-',
      name: fullName || employee.email,
      initials: this.getInitials(employee.prenom, employee.nom),
      role: employee.poste || 'Poste non renseigne',
      dept: employee.departement || 'Non renseigne',
      status: 'active',
      color: deptStyle.bg,
      textColor: deptStyle.color,
      absences: 0,
      joinDate: this.toDateInputValue(employee.dateEmbauche),
      phone: employee.telephone || '-',
      email: employee.email,
      contractType: employee.typeContrat || '-',
      leaveBalance: employee.soldeConge ?? 0
    };
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

  private mapApiOffreToUi(offre: OffreEmploi, candidaturesCount?: number): JobOffer {
    const niveau = this.mapNiveauValue(offre.niveau);

    return {
      id: offre.id ?? 0,
      type: this.inferCardType(offre.departement, offre.type),
      title: offre.titre,
      dept: offre.departement || 'Non precise',
      niveau,
      niveauLabel: offre.niveau || 'Non precise',
      date: this.formatRelativeDate(offre.datePublication),
      candidatures: candidaturesCount ?? 0,
      tags: offre.skills || [],
      description: offre.description || '',
      contrat: offre.contrat || 'Non precise',
      offreType: offre.type || 'EXTERNE',
      statut: offre.statut || 'OUVERTE'
    };
  }

  private buildKanbanData(offre: JobOffer, candidatures: BackendCandidature[]): KanbanData {
    const mapped = candidatures.map((candidature) => this.mapBackendCandidatureToKanban(candidature, offre.tags));

    return {
      offreTags: offre.tags,
      trier: mapped.filter((candidature) => candidature.statut === 'EN_ATTENTE').sort((a, b) => b.score - a.score),
      entretien: mapped.filter((candidature) => candidature.statut === 'ACCEPTEE').sort((a, b) => b.score - a.score),
      rejetee: mapped.filter((candidature) => candidature.statut === 'REFUSEE').sort((a, b) => b.score - a.score)
    };
  }

  private mapBackendCandidatureToKanban(candidature: BackendCandidature, offreTags: string[]): Candidature {
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
      score: candidature.scoreMatching ?? this.computeScore(tags, offreTags),
      statut: this.normalizeCandidatureStatus(candidature.statut)
    };
  }

  private extractTagsFromCandidature(candidature: BackendCandidature): string[] {
    if (candidature.competenceTags?.length) {
      return candidature.competenceTags.map((item) => item.trim()).filter((item) => !!item);
    }

    const raw = `${candidature.poste || ''},${candidature.departement || ''}`;
    return raw.split(',').map((item) => item.trim()).filter((item) => !!item);
  }

  private normalizeCandidatureStatus(statut?: string): 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' {
    if (statut === 'REFUSEE') return 'REFUSEE';
    if (statut === 'ACCEPTEE') return 'ACCEPTEE';
    return 'EN_ATTENTE';
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
    if (!dateDebut || !dateFin) {
      return 0;
    }

    const start = new Date(dateDebut).getTime();
    const end = new Date(dateFin).getTime();
    const now = Date.now();

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      return 0;
    }
    if (now <= start) {
      return 0;
    }
    if (now >= end) {
      return 100;
    }

    return Math.round(((now - start) / (end - start)) * 100);
  }

  private formatFormationDuration(dateDebut?: string, dateFin?: string): string {
    if (!dateDebut || !dateFin) {
      return '-';
    }

    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return '-';
    }

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

  leaveEmployeeName(request: DemandeConge): string {
    return `${request.prenomEmploye || ''} ${request.nomEmploye || ''}`.trim() || request.matriculeEmploye || 'Employe';
  }

  leaveEmployeeInitials(request: DemandeConge): string {
    return this.getInitials(request.prenomEmploye, request.nomEmploye);
  }

  leaveDatesLabel(request: DemandeConge): string {
    return `${this.formatDate(request.debut)} - ${this.formatDate(request.fin)}`;
  }

  leaveDays(request: DemandeConge): number {
    if (!request.debut || !request.fin) {
      return 0;
    }
    const start = new Date(request.debut);
    const end = new Date(request.fin);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  }

  leaveTypeLabel(type: DemandeConge['typeConge']): string {
    return TYPE_LABELS[type] || type;
  }

  leaveStatusClass(status: StatutDemande): string {
    const classes: Record<StatutDemande, string> = {
      EN_ATTENTE: 'pending',
      APPROUVE: 'active',
      REFUSEE: 'absent',
      ANNULE: 'leave'
    };
    return classes[status] || 'pending';
  }

  leaveStatusLabel(status: StatutDemande): string {
    const labels: Record<StatutDemande, string> = {
      EN_ATTENTE: 'En attente',
      APPROUVE: 'Approuve',
      REFUSEE: 'Refuse',
      ANNULE: 'Annule'
    };
    return labels[status] || status;
  }

  private getEmptyEmployeeForm(): EmployeeForm {
    return {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      matricule: '',
      poste: '',
      departement: 'Ingénierie',
      dateEmbauche: '',
      typeContrat: 'CDI',
      soldeConge: 0,
      motdepasse: ''
    };
  }

  private getEmployeeErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    const serverMessage = error.error?.message || error.error?.error;
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage;
    }

    return fallback;
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

  private getInitials(prenom?: string, nom?: string): string {
    return `${prenom?.trim().charAt(0) || ''}${nom?.trim().charAt(0) || ''}`.toUpperCase() || 'EM';
  }

  private buildInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private extractPrenom(fullName: string): string {
    return fullName.split(' ')[0] || '';
  }

  private extractNom(fullName: string): string {
    return fullName.split(' ').slice(1).join(' ') || '';
  }

  private toDateInputValue(value?: string): string {
    if (!value) return '';
    return value.includes('T') ? value.slice(0, 10) : value;
  }

  formatDate(value?: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('fr-FR');
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
}
