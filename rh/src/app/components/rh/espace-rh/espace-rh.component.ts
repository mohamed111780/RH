import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Employee {
  id: number;
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
}

export interface LeaveRequest {
  id: number;
  name: string;
  initials: string;
  dates: string;
  type: string;
  color: string;
  status: 'pending' | 'approved' | 'rejected';
  days: number;
}

export interface JobOffer {
  id: string;
  type: 'tech' | 'design' | 'data' | 'rh';
  title: string;
  dept: string;
  niveau: 'junior' | 'mid' | 'senior';
  niveauLabel: string;
  date: string;
  candidatures: number;
  tags: string[];
}

export interface Candidature {
  name: string;
  initials: string;
  role: string;
  color: string;
  tc: string;
  tags: string[];
  score: number;
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

  // ───────────────────────── STATE ─────────────────────────
  activePage: string = 'dashboard';
  pageTitle: string = 'Vue d\'ensemble';
  toastMessage: string = '';
  toastVisible: boolean = false;
  private toastTimer: any;

  // Modal offre
  modalOffreOpen: boolean = false;
  newOffreTitre: string = '';
  newOffreDept: string = 'Ingénierie';
  newOffreNiveau: string = 'Mid-level';
  newOffreDesc: string = '';
  newOffreTags: string[] = [];
  tagInputValue: string = '';

  // Modal employé
  modalEmpOpen: boolean = false;
  newEmpNom: string = '';
  newEmpPrenom: string = '';
  newEmpRole: string = '';
  newEmpDept: string = 'Ingénierie';
  newEmpEmail: string = '';

  // Modal congé
  modalCongeOpen: boolean = false;

  // Kanban
  kanbanView: boolean = false;
  kanbanOffre: JobOffer | null = null;
  currentOffres: JobOffer[] = [];

  // Filtre employés
  filterDept: string = 'Tous';

  // Onglet formations
  formationTab: string = 'Toutes';

  // Calendrier mois/année
  calMonth: number = 4; // Mai = index 4
  calYear: number = 2025;

  // ───────────────────────── FAKE DATA ─────────────────────────

  readonly employees: Employee[] = [
    { id: 1, name: 'Sara Amrani', initials: 'SA', role: 'Dev Full Stack', dept: 'Ingénierie', status: 'active', color: 'rgba(20,184,166,0.2)', textColor: 'var(--teal)', absences: 1, joinDate: '01/03/2024', phone: '+216 22 111 222', email: 'sara.amrani@corp.tn' },
    { id: 2, name: 'Yassine Belkadi', initials: 'YB', role: 'Data Scientist', dept: 'IA', status: 'active', color: 'rgba(168,85,247,0.2)', textColor: 'var(--purple)', absences: 0, joinDate: '15/01/2024', phone: '+216 22 333 444', email: 'y.belkadi@corp.tn' },
    { id: 3, name: 'Nadia Maaloul', initials: 'NM', role: 'UX Designer', dept: 'Design', status: 'remote', color: 'rgba(236,72,153,0.2)', textColor: 'var(--pink)', absences: 2, joinDate: '10/06/2023', phone: '+216 55 555 666', email: 'n.maaloul@corp.tn' },
    { id: 4, name: 'Karim Hamdi', initials: 'KH', role: 'Product Manager', dept: 'Produit', status: 'leave', color: 'rgba(245,158,11,0.2)', textColor: 'var(--amber)', absences: 5, joinDate: '20/09/2022', phone: '+216 98 777 888', email: 'k.hamdi@corp.tn' },
    { id: 5, name: 'Amine Oueslati', initials: 'AO', role: 'DevOps Engineer', dept: 'Ingénierie', status: 'active', color: 'rgba(20,184,166,0.15)', textColor: 'var(--teal)', absences: 3, joinDate: '05/04/2023', phone: '+216 99 121 314', email: 'a.oueslati@corp.tn' },
    { id: 6, name: 'Rania Farhat', initials: 'RF', role: 'Tech Lead', dept: 'Ingénierie', status: 'active', color: 'rgba(20,184,166,0.15)', textColor: 'var(--teal)', absences: 0, joinDate: '11/11/2021', phone: '+216 25 151 617', email: 'r.farhat@corp.tn' },
    { id: 7, name: 'Mehdi Gharbi', initials: 'MG', role: 'Frontend Dev', dept: 'Ingénierie', status: 'active', color: 'rgba(20,184,166,0.15)', textColor: 'var(--teal)', absences: 1, joinDate: '03/07/2023', phone: '+216 20 181 920', email: 'm.gharbi@corp.tn' },
    { id: 8, name: 'Ines Slimani', initials: 'IS', role: 'Backend Dev', dept: 'Ingénierie', status: 'active', color: 'rgba(20,184,166,0.15)', textColor: 'var(--teal)', absences: 2, joinDate: '18/02/2024', phone: '+216 94 212 223', email: 'i.slimani@corp.tn' },
    { id: 9, name: 'Omar Khalil', initials: 'OK', role: 'ML Engineer', dept: 'IA', status: 'remote', color: 'rgba(168,85,247,0.15)', textColor: 'var(--purple)', absences: 0, joinDate: '28/08/2022', phone: '+216 97 242 526', email: 'o.khalil@corp.tn' },
    { id: 10, name: 'Cyrine Bouzid', initials: 'CB', role: 'Marketing Manager', dept: 'Marketing', status: 'absent', color: 'rgba(236,72,153,0.15)', textColor: 'var(--pink)', absences: 7, joinDate: '14/05/2022', phone: '+216 26 272 829', email: 'c.bouzid@corp.tn' },
    { id: 11, name: 'Tarek Salah', initials: 'TS', role: 'Analyste Financier', dept: 'Finance', status: 'active', color: 'rgba(255,255,255,0.08)', textColor: 'var(--text2)', absences: 1, joinDate: '07/01/2023', phone: '+216 52 303 132', email: 't.salah@corp.tn' },
    { id: 12, name: 'Khalil Ben Ali', initials: 'KB', role: 'Architecte Logiciel', dept: 'Ingénierie', status: 'active', color: 'rgba(20,184,166,0.15)', textColor: 'var(--teal)', absences: 0, joinDate: '22/03/2021', phone: '+216 29 333 435', email: 'kb@corp.tn' },
  ];

  readonly leaveRequests: LeaveRequest[] = [
    { id: 1, name: 'Karim Hamdi', initials: 'KH', dates: '24–28 Mai', type: 'Congé annuel', color: 'var(--amber)', status: 'pending', days: 5 },
    { id: 2, name: 'Sara Amrani', initials: 'SA', dates: '2–6 Juin', type: 'Congé maternité', color: 'var(--teal)', status: 'pending', days: 5 },
    { id: 3, name: 'Amine Oueslati', initials: 'AO', dates: '10 Juin', type: 'Absence médicale', color: 'var(--pink)', status: 'pending', days: 1 },
    { id: 4, name: 'Nadia Maaloul', initials: 'NM', dates: '15–16 Juin', type: 'Congé personnel', color: 'var(--pink)', status: 'pending', days: 2 },
    { id: 5, name: 'Mehdi Gharbi', initials: 'MG', dates: '20–24 Juin', type: 'Congé annuel', color: 'var(--teal)', status: 'approved', days: 5 },
    { id: 6, name: 'Omar Khalil', initials: 'OK', dates: '3 Juillet', type: 'Absence médicale', color: 'var(--purple)', status: 'rejected', days: 1 },
  ];

  leaveRequestsState: { [id: number]: 'pending' | 'approved' | 'rejected' } = {};

  readonly formations: Formation[] = [
    { tag: 'tech', tagLabel: 'Tech', title: 'React.js Avancé & Hooks', desc: 'Maîtriser les patterns avancés, hooks personnalisés et l\'optimisation des performances.', duration: '12h', enrolled: 24, rating: '4.8', progress: 72 },
    { tag: 'tech', tagLabel: 'Tech', title: 'Docker & Kubernetes', desc: 'Conteneurisation, orchestration et déploiement cloud-native en production.', duration: '16h', enrolled: 18, rating: '4.9', progress: 55 },
    { tag: 'soft', tagLabel: 'Soft Skills', title: 'Communication Efficace', desc: 'Techniques de présentation, feedback constructif et collaboration cross-équipe.', duration: '6h', enrolled: 41, rating: '4.6', progress: 88 },
    { tag: 'lead', tagLabel: 'Leadership', title: 'Management de Projet Agile', desc: 'Scrum, Kanban, OKRs et pilotage d\'équipes distribuées en environnement incertain.', duration: '10h', enrolled: 15, rating: '4.7', progress: 40 },
    { tag: 'tech', tagLabel: 'Tech', title: 'Python Data Science', desc: 'Pandas, NumPy, visualisation de données et introduction au machine learning.', duration: '20h', enrolled: 29, rating: '4.9', progress: 61 },
    { tag: 'soft', tagLabel: 'Soft Skills', title: 'Gestion du Stress & Bien-être', desc: 'Techniques de mindfulness, gestion des priorités et prévention du burn-out.', duration: '8h', enrolled: 31, rating: '4.5', progress: 93 },
    { tag: 'lead', tagLabel: 'Leadership', title: 'Recrutement & Onboarding', desc: 'Stratégies d\'attraction des talents, conduite d\'entretiens et processus d\'intégration.', duration: '7h', enrolled: 12, rating: '4.7', progress: 30 },
    { tag: 'tech', tagLabel: 'Tech', title: 'AWS Solutions Architect', desc: 'Infrastructure cloud, haute disponibilité, sécurité et optimisation des coûts AWS.', duration: '24h', enrolled: 11, rating: '4.8', progress: 22 },
    { tag: 'soft', tagLabel: 'Soft Skills', title: 'Intelligence Émotionnelle', desc: 'Développer l\'empathie, la gestion des conflits et le leadership collaboratif.', duration: '5h', enrolled: 38, rating: '4.4', progress: 79 },
  ];

  readonly offresBase: JobOffer[] = [
    { id: 'offre-1', type: 'tech', title: 'Lead Developer React.js', dept: 'Ingénierie', niveau: 'senior', niveauLabel: 'Senior', date: '3 jours', candidatures: 12, tags: ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS'] },
    { id: 'offre-2', type: 'data', title: 'Data Engineer', dept: 'Data & IA', niveau: 'mid', niveauLabel: 'Mid-level', date: '5 jours', candidatures: 9, tags: ['Python', 'Spark', 'Airflow', 'SQL', 'Kafka'] },
    { id: 'offre-3', type: 'design', title: 'UX/UI Designer Senior', dept: 'Design', niveau: 'senior', niveauLabel: 'Senior', date: '1 semaine', candidatures: 17, tags: ['Figma', 'UX Research', 'Prototyping', 'Design System'] },
    { id: 'offre-4', type: 'tech', title: 'DevOps Engineer', dept: 'Ingénierie', niveau: 'senior', niveauLabel: 'Senior', date: '2 jours', candidatures: 8, tags: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'AWS'] },
    { id: 'offre-5', type: 'data', title: 'Machine Learning Engineer', dept: 'IA', niveau: 'senior', niveauLabel: 'Senior', date: '1 semaine', candidatures: 7, tags: ['Python', 'TensorFlow', 'MLflow', 'Docker', 'NLP'] },
    { id: 'offre-6', type: 'rh', title: 'Chargé(e) RH & Paie', dept: 'RH', niveau: 'mid', niveauLabel: 'Mid-level', date: '4 jours', candidatures: 5, tags: ['SIRH', 'Paie', 'Recrutement', 'Excel', 'Droit social'] },
  ];

  readonly candidaturesData: { [key: string]: KanbanData } = {
    'offre-1': {
      offreTags: ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS'],
      trier: [
        { name: 'Mehdi Gharbi', initials: 'MG', role: '5 ans exp · Frontend', color: 'rgba(20,184,166,0.2)', tc: 'var(--teal)', tags: ['React', 'TypeScript', 'Node.js', 'Docker', 'Redux'], score: 92 },
        { name: 'Ines Slimani', initials: 'IS', role: '4 ans exp · Full Stack', color: 'rgba(168,85,247,0.2)', tc: 'var(--purple)', tags: ['React', 'Node.js', 'MongoDB', 'Docker', 'GraphQL'], score: 78 },
        { name: 'Omar Khalil', initials: 'OK', role: '3 ans exp · Backend', color: 'rgba(236,72,153,0.2)', tc: 'var(--pink)', tags: ['Node.js', 'Express', 'PostgreSQL', 'Redis'], score: 51 },
        { name: 'Rania Farhat', initials: 'RF', role: '6 ans exp · Tech Lead', color: 'rgba(245,158,11,0.2)', tc: 'var(--amber)', tags: ['React', 'TypeScript', 'AWS', 'Kubernetes', 'Docker'], score: 95 },
      ],
      entretien: [
        { name: 'Khalil Ben Ali', initials: 'KB', role: '7 ans exp · Arch.', color: 'rgba(20,184,166,0.15)', tc: 'var(--teal)', tags: ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS', 'Redux'], score: 97 },
        { name: 'Sonia Mzabi', initials: 'SM', role: '5 ans exp · Lead Dev', color: 'rgba(168,85,247,0.15)', tc: 'var(--purple)', tags: ['React', 'TypeScript', 'AWS', 'CI/CD'], score: 88 },
      ],
      rejetee: [
        { name: 'Tarek Salah', initials: 'TS', role: '1 an exp · Junior', color: 'rgba(255,255,255,0.06)', tc: 'var(--text3)', tags: ['HTML', 'CSS', 'JavaScript', 'Vue.js'], score: 22 },
        { name: 'Cyrine Bouzid', initials: 'CB', role: '2 ans exp · Dev Web', color: 'rgba(255,255,255,0.06)', tc: 'var(--text3)', tags: ['PHP', 'WordPress', 'jQuery'], score: 15 },
      ]
    }
  };

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
  get pendingLeaves(): number { return this.leaveRequests.filter(l => (this.leaveRequestsState[l.id] ?? l.status) === 'pending').length; }
  get totalCandidatures(): number { return this.currentOffres.reduce((a, o) => a + o.candidatures, 0); }

  get filteredEmployees(): Employee[] {
    if (this.filterDept === 'Tous') return this.employees;
    return this.employees.filter(e => e.dept === this.filterDept);
  }

  get filteredFormations(): Formation[] {
    if (this.formationTab === 'Toutes') return this.formations;
    const map: { [k: string]: string } = { 'Tech': 'tech', 'Soft Skills': 'soft', 'Leadership': 'lead' };
    return this.formations.filter(f => f.tag === map[this.formationTab]);
  }

  get currentKanbanData(): KanbanData | null {
    if (!this.kanbanOffre) return null;
    return this.candidaturesData[this.kanbanOffre.id] || this.candidaturesData['offre-1'];
  }

  get calendarDays(): { day: number | null; cls: string }[] {
    const days: { day: number | null; cls: string }[] = [];
    const firstDay = new Date(this.calYear, this.calMonth, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const leaveDays = [5, 6, 7, 12, 13, 14, 19, 20];
    const pendingDays = [25, 26];
    const today = 23;
    for (let i = 0; i < offset; i++) days.push({ day: null, cls: 'cal-day empty' });
    for (let d = 1; d <= daysInMonth; d++) {
      let cls = 'cal-day';
      if (d === today) cls += ' today';
      else if (leaveDays.includes(d)) cls += ' leave-day';
      else if (pendingDays.includes(d)) cls += ' leave-day2';
      days.push({ day: d, cls });
    }
    return days;
  }

  get deptOptions(): string[] {
    return ['Tous', ...Array.from(new Set(this.employees.map(e => e.dept)))];
  }

  getLeaveStatus(req: LeaveRequest): 'pending' | 'approved' | 'rejected' {
    return this.leaveRequestsState[req.id] ?? req.status;
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
      remote: { cls: 'remote', label: 'Remote' },
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
    if (pageId === 'offres') this.kanbanView = false;
  }

  // ───────────────────────── TOAST ─────────────────────────

  showToast(msg: string): void {
    this.toastMessage = msg;
    this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible = false, 3000);
  }

  // ───────────────────────── OFFRES ─────────────────────────

  showKanban(offre: JobOffer): void {
    this.kanbanOffre = offre;
    this.kanbanView = true;
  }

  backToOffres(): void {
    this.kanbanView = false;
    this.kanbanOffre = null;
  }

  openModalOffre(): void {
    this.newOffreTitre = '';
    this.newOffreDept = 'Ingénierie';
    this.newOffreNiveau = 'Mid-level';
    this.newOffreDesc = '';
    this.newOffreTags = [];
    this.tagInputValue = '';
    this.modalOffreOpen = true;
  }

  closeModalOffre(): void { this.modalOffreOpen = false; }

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
    if (!this.newOffreTitre.trim()) { this.showToast('⚠️ Veuillez saisir un titre'); return; }
    const niveauMap: { [k: string]: 'junior' | 'mid' | 'senior' } = { 'Junior': 'junior', 'Mid-level': 'mid', 'Senior': 'senior', 'Lead': 'senior', 'Manager': 'senior' };
    const newOffre: JobOffer = {
      id: 'offre-' + Date.now(),
      type: 'tech',
      title: this.newOffreTitre,
      dept: this.newOffreDept,
      niveau: niveauMap[this.newOffreNiveau] || 'mid',
      niveauLabel: this.newOffreNiveau,
      date: 'maintenant',
      candidatures: 0,
      tags: [...this.newOffreTags],
    };
    this.currentOffres = [newOffre, ...this.currentOffres];
    this.closeModalOffre();
    this.showToast('🚀 Offre "' + this.newOffreTitre + '" publiée avec succès !');
  }

  // ───────────────────────── EMPLOYEES ─────────────────────────

  openModalEmp(): void {
    this.newEmpNom = '';
    this.newEmpPrenom = '';
    this.newEmpRole = '';
    this.newEmpDept = 'Ingénierie';
    this.newEmpEmail = '';
    this.modalEmpOpen = true;
  }

  closeModalEmp(): void { this.modalEmpOpen = false; }

  createEmployee(): void {
    if (!this.newEmpNom.trim() || !this.newEmpPrenom.trim()) { this.showToast('⚠️ Prénom et nom requis'); return; }
    this.closeModalEmp();
    this.showToast(`✅ ${this.newEmpPrenom} ${this.newEmpNom} ajouté(e) avec succès`);
  }

  // ───────────────────────── CONGÉS ─────────────────────────

  approveLeave(req: LeaveRequest): void {
    this.leaveRequestsState[req.id] = 'approved';
    this.showToast(`✅ Congé de ${req.name} approuvé`);
  }

  rejectLeave(req: LeaveRequest): void {
    this.leaveRequestsState[req.id] = 'rejected';
    this.showToast(`✗ Congé de ${req.name} refusé`);
  }

  // ───────────────────────── LIFECYCLE ─────────────────────────

  ngOnInit(): void {
    this.currentOffres = [...this.offresBase];
  }

  trackByIndex(index: number): number { return index; }
  trackById(index: number, item: any): any { return item.id ?? index; }
}
