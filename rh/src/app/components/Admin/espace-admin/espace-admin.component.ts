import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { AdminService } from '../../../services/admin.service';
import { Admin } from '../../../models/admin';

interface Employee {
  initials: string;
  name: string;
  role: string;
  dept: string;
  status: 'active' | 'leave' | 'remote';
  color: string;
  textColor: string;
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
  id: string;
  type: 'tech' | 'design' | 'data';
  title: string;
  dept: string;
  niveau: 'junior' | 'mid' | 'senior';
  niveauLabel: string;
  date: string;
  candidatures: number;
  tags: string[];
}

interface Candidature {
  name: string;
  initials: string;
  role: string;
  color: string;
  tc: string;
  tags: string[];
  score: number;
  daysAgo: number;
}

interface CandidaturesData {
  offreTags: string[];
  trier: Candidature[];
  entretien: Candidature[];
  rejetee: Candidature[];
}

interface LeaveRequest {
  name: string;
  initials: string;
  dates: string;
  type: string;
  color: string;
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
    employes: 'Employés',
    conges: 'Congés & Absences',
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

  // ── UI State ─────────────────────────────────────────────────────────────────
  showModal: boolean = false;
  showKanbanView: boolean = false;
  toastMessage: string = '';
  toastVisible: boolean = false;
  private toastTimer: any;

  searchQuery: string = '';
  selectedDept: string = 'all';
  selectedFormationTab: string = 'all';

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  // ── New Offre Form ────────────────────────────────────────────────────────────
  newOffreTitre: string = '';
  newOffreDesc: string = '';
  newOffreDept: string = 'Ingénierie';
  newOffreNiveau: string = 'Senior';
  newOffreContrat: string = 'CDI';
  newOffreTags: string[] = [];
  tagInputValue: string = '';

  // ── Kanban State ──────────────────────────────────────────────────────────────
  kanbanTitle: string = '';
  kanbanMeta: string = '';
  kanbanData: CandidaturesData | null = null;

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

  formations: Formation[] = [
    { tag: 'tech', tagLabel: 'Tech',        title: 'AWS Cloud Architecture',       desc: "Formation certifiante sur l'architecture cloud AWS, services S3, EC2, Lambda et bonnes pratiques.", duration: '40h', enrolled: 18, rating: '4.8', progress: 68 },
    { tag: 'tech', tagLabel: 'Tech',        title: 'React.js Avancé & TypeScript', desc: 'Maîtrise des hooks avancés, performance, TypeScript et patterns modernes en React.',               duration: '24h', enrolled: 12, rating: '4.9', progress: 82 },
    { tag: 'soft', tagLabel: 'Soft Skills', title: 'Communication & Leadership',   desc: "Développer son impact à l'oral, gérer les conflits et animer des équipes pluridisciplinaires.",    duration: '16h', enrolled: 25, rating: '4.6', progress: 54 },
    { tag: 'lead', tagLabel: 'Leadership',  title: 'Management Agile',             desc: 'Scrum Master, Kanban, OKRs et techniques de management pour équipes tech modernes.',               duration: '32h', enrolled: 8,  rating: '4.7', progress: 71 },
    { tag: 'tech', tagLabel: 'Tech',        title: 'Machine Learning Python',      desc: 'Scikit-learn, TensorFlow, modèles supervisés et non-supervisés avec cas pratiques.',              duration: '48h', enrolled: 15, rating: '4.8', progress: 43 },
    { tag: 'soft', tagLabel: 'Soft Skills', title: 'Gestion du Stress & Bien-être',desc: 'Techniques de mindfulness, gestion des priorités et prévention du burn-out.',                     duration: '8h',  enrolled: 31, rating: '4.5', progress: 90 },
  ];

  offres: Offre[] = [
    { id: 'offre-1', type: 'tech',   title: 'Lead Developer React.js', dept: 'Ingénierie', niveau: 'senior', niveauLabel: 'Senior',   date: '3 jours',   candidatures: 12, tags: ['React','TypeScript','Node.js','Docker','AWS'] },
    { id: 'offre-2', type: 'data',   title: 'Data Engineer',           dept: 'Data & IA',  niveau: 'mid',    niveauLabel: 'Mid-level', date: '5 jours',   candidatures: 9,  tags: ['Python','Spark','Airflow','SQL','Kafka'] },
    { id: 'offre-3', type: 'design', title: 'UX/UI Designer Senior',   dept: 'Design',     niveau: 'senior', niveauLabel: 'Senior',   date: '1 semaine', candidatures: 17, tags: ['Figma','UX Research','Prototyping','Design System'] },
    { id: 'offre-4', type: 'tech',   title: 'DevOps Engineer',         dept: 'Ingénierie', niveau: 'senior', niveauLabel: 'Senior',   date: '2 jours',   candidatures: 8,  tags: ['Kubernetes','Docker','CI/CD','Terraform','AWS'] },
    { id: 'offre-5', type: 'data',   title: 'Machine Learning Engineer',dept: 'IA',        niveau: 'senior', niveauLabel: 'Senior',   date: '1 semaine', candidatures: 7,  tags: ['Python','TensorFlow','MLflow','Docker','NLP'] },
  ];

  candidaturesMap: Record<string, CandidaturesData> = {
    'offre-1': {
      offreTags: ['React','TypeScript','Node.js','Docker','AWS'],
      trier: [
        { name:'Mehdi Gharbi',  initials:'MG', role:'5 ans exp · Frontend',  color:'rgba(108,99,255,0.2)',  tc:'var(--accent2)', tags:['React','TypeScript','Node.js','Docker','Redux'],        score: 92, daysAgo: 2 },
        { name:'Ines Slimani',  initials:'IS', role:'4 ans exp · Full Stack', color:'rgba(74,222,128,0.1)', tc:'var(--accent3)', tags:['React','Node.js','MongoDB','Docker','GraphQL'],          score: 78, daysAgo: 3 },
        { name:'Omar Khalil',   initials:'OK', role:'3 ans exp · Backend',    color:'rgba(34,211,238,0.1)', tc:'var(--accent6)', tags:['Node.js','Express','PostgreSQL','Redis'],               score: 51, daysAgo: 1 },
        { name:'Rania Farhat',  initials:'RF', role:'6 ans exp · Tech Lead',  color:'rgba(245,158,11,0.1)', tc:'var(--accent4)', tags:['React','TypeScript','AWS','Kubernetes','Docker'],       score: 95, daysAgo: 4 },
      ],
      entretien: [
        { name:'Khalil Ben Ali', initials:'KB', role:'7 ans exp · Arch.',     color:'rgba(244,63,94,0.15)',  tc:'var(--accent5)', tags:['React','TypeScript','Node.js','Docker','AWS','Redux'], score: 97, daysAgo: 5 },
        { name:'Sonia Mzabi',    initials:'SM', role:'5 ans exp · Lead Dev',  color:'rgba(108,99,255,0.15)', tc:'var(--accent2)', tags:['React','TypeScript','AWS','CI/CD'],                   score: 88, daysAgo: 6 },
      ],
      rejetee: [
        { name:'Tarek Salah',   initials:'TS', role:'1 an exp · Junior',      color:'rgba(255,255,255,0.06)', tc:'var(--text3)', tags:['HTML','CSS','JavaScript','Vue.js'],                   score: 22, daysAgo: 3 },
        { name:'Cyrine Bouzid', initials:'CB', role:'2 ans exp · Dev Web',    color:'rgba(255,255,255,0.06)', tc:'var(--text3)', tags:['PHP','WordPress','jQuery'],                           score: 15, daysAgo: 7 },
      ]
    }
  };

  leaveRequests: LeaveRequest[] = [
    { name: 'Karim Hamdi',     initials: 'KH', dates: '24–28 Mai',  type: 'Congé annuel',      color: 'var(--accent4)' },
    { name: 'Sara Amrani',     initials: 'SA', dates: '2–6 Juin',   type: 'Congé maternité',   color: 'var(--accent3)' },
    { name: 'Amine Oueslati',  initials: 'AO', dates: '10 Juin',    type: 'Absence médicale',  color: 'var(--accent5)' },
  ];

  // Calendar data
  calendarDays: { day: number | null; cls: string }[] = [];
  leaveDays   = [5, 6, 7, 12, 13, 14, 19, 20];
  pendingDays = [25, 26];
  today       = 22;
  weekHeaders = ['L','M','M','J','V','S','D'];

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
    this.buildCalendar();
  }

  // ── Navigation ────────────────────────────────────────────────────────────────
  showPage(page: string): void {
    this.currentPage = page;
    this.pageTitle = this.pageTitles[page] || page;
    this.showKanbanView = false;
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

  // ── Calendar ─────────────────────────────────────────────────────────────────
  buildCalendar(): void {
    this.calendarDays = [];
    // May 2025 starts on Thursday → offset = 3 (Mon=0)
    for (let i = 0; i < 3; i++) {
      this.calendarDays.push({ day: null, cls: 'cal-day empty' });
    }
    for (let d = 1; d <= 31; d++) {
      let cls = 'cal-day';
      if (d === this.today)          cls += ' today';
      else if (this.leaveDays.includes(d))   cls += ' leave-day';
      else if (this.pendingDays.includes(d)) cls += ' leave-day2';
      this.calendarDays.push({ day: d, cls });
    }
  }

  // ── Formations ───────────────────────────────────────────────────────────────
  get filteredFormations(): Formation[] {
    if (this.selectedFormationTab === 'all') return this.formations;
    return this.formations.filter(f => f.tag === this.selectedFormationTab);
  }

  // ── Offres ────────────────────────────────────────────────────────────────────
  openKanban(offre: Offre): void {
    this.kanbanTitle = offre.title;
    this.kanbanMeta  = `${offre.dept} · ${offre.niveauLabel} · Publié il y a ${offre.date}`;
    const data = this.candidaturesMap[offre.id] || this.candidaturesMap['offre-1'];
    // recompute scores
    const recompute = (list: Candidature[]) =>
      list.map(c => ({ ...c, score: this.computeScore(c.tags, offre.tags) }));
    this.kanbanData = {
      offreTags: offre.tags,
      trier:    recompute(data.trier).sort((a, b) => b.score - a.score),
      entretien: recompute(data.entretien),
      rejetee:  recompute(data.rejetee),
    };
    this.showKanbanView = true;
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

  // ── Modal ────────────────────────────────────────────────────────────────────
  openModal(): void {
    this.newOffreTitre   = '';
    this.newOffreDesc    = '';
    this.newOffreDept    = 'Ingénierie';
    this.newOffreNiveau  = 'Senior';
    this.newOffreContrat = 'CDI';
    this.newOffreTags    = [];
    this.tagInputValue   = '';
    this.showModal       = true;
  }

  closeModal(): void { this.showModal = false; }

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
    if (!this.newOffreTitre.trim()) {
      this.showToast('⚠️ Veuillez saisir un titre');
      return;
    }
    const niveauMap: Record<string, 'junior'|'mid'|'senior'> = {
      Junior: 'junior', 'Mid-level': 'mid', Senior: 'senior', Lead: 'senior', Manager: 'senior'
    };
    const newOffre: Offre = {
      id:           'offre-' + Date.now(),
      type:         'tech',
      title:        this.newOffreTitre,
      dept:         this.newOffreDept,
      niveau:       niveauMap[this.newOffreNiveau] || 'mid',
      niveauLabel:  this.newOffreNiveau,
      date:         'maintenant',
      candidatures: 0,
      tags:         [...this.newOffreTags],
    };
    this.offres = [newOffre, ...this.offres];
    this.closeModal();
    this.showToast(`🚀 Offre "${newOffre.title}" publiée avec succès !`);
  }

  // ── Toast ────────────────────────────────────────────────────────────────────
  showToast(msg: string): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = msg;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => (this.toastVisible = false), 3000);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  get filteredEmployees(): Employee[] {
    let list = this.employees;
    if (this.selectedDept !== 'all') {
      list = list.filter(e => e.dept === this.selectedDept);
    }
    return list;
  }

  deptBg(dept: string): string {
    const map: Record<string, string> = {
      'Ingénierie': 'rgba(108,99,255,0.1)', 'IA': 'rgba(34,211,238,0.1)',
      'Design': 'rgba(244,63,94,0.1)',      'Produit': 'rgba(74,222,128,0.1)',
      'Marketing': 'rgba(245,158,11,0.1)',  'Finance': 'rgba(255,255,255,0.05)'
    };
    return map[dept] || 'rgba(255,255,255,0.05)';
  }

  deptText(dept: string): string {
    const map: Record<string, string> = {
      'Ingénierie': 'var(--accent2)', 'IA': 'var(--accent6)',
      'Design': 'var(--accent5)',     'Produit': 'var(--accent3)',
      'Marketing': 'var(--accent4)', 'Finance': 'var(--text2)'
    };
    return map[dept] || 'var(--text2)';
  }

  get topSkillsMax(): number { return this.topSkills[0]?.count || 1; }

  formatDate(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
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

  private toDateInputValue(value: string | undefined): string {
    if (!value) return '';
    return value.includes('T') ? value.slice(0, 10) : value;
  }
}
