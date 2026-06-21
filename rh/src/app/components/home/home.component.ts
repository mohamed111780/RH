import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CAREER_OFFERS, CareerOffer } from './career-offers';
import { LoginComponent } from '../login/login.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginComponent, ResetPasswordComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  scrolled = false;
  menuOpen = false;
  annuel = false;
  activeSol = 0;
  openFaq: number | null = null;
  loginModalOpen = false;
  authModalMode: 'login' | 'reset' = 'login';

  // Helper to sanitize SVG HTML
  sanitizeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 40; }

  @HostListener('window:keydown.escape')
  onEscape() { this.closeLoginModal(); }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  openDemo()   { console.log('Open demo modal'); }
  toggleFaq(i: number) { this.openFaq = this.openFaq === i ? null : i; }
  openLoginModal(event?: Event) {
    event?.preventDefault();
    this.authModalMode = 'login';
    this.loginModalOpen = true;
    this.menuOpen = false;
  }
  openResetModal(): void {
    this.authModalMode = 'reset';
    this.loginModalOpen = true;
    this.menuOpen = false;
  }
  closeLoginModal() {
    this.loginModalOpen = false;
    if (this.router.url === '/login' || this.router.url === '/reset') {
      this.router.navigate(['/home']);
    }
  }

  clients = ['BIAT', 'Sofrecom', 'Vermeg', 'Poulina', 'Ooredoo'];

  trustItems = [
    { icon: `<svg width="16" height="16" fill="none" stroke="#f47c20" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, label: 'Données hébergées en Tunisie' },
    { icon: `<svg width="16" height="16" fill="none" stroke="#f47c20" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`, label: 'Chiffrement SSL 256-bit' },
    { icon: `<svg width="16" height="16" fill="none" stroke="#f47c20" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`, label: 'Multi-rôles & multi-entités' },
    { icon: `<svg width="16" height="16" fill="none" stroke="#f47c20" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, label: 'Support 7j/7' },
    { icon: `<svg width="16" height="16" fill="none" stroke="#f47c20" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label: 'Disponibilité 99.9%' }
  ];

  features = [
    { title: 'Gestion des congés', bg: 'rgba(244,124,32,.1)',
      desc: 'Automatisez les demandes, approbations et calcul de soldes. Tableau de bord en temps réel pour managers et DRH.',
      icon: `<svg width="24" height="24" fill="none" stroke="#f47c20" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
    { title: 'Recrutement & Talents', bg: 'rgba(37,99,235,.1)',
      desc: 'Publiez vos offres, gérez le pipeline de candidatures et collaborez avec les managers sur une seule plateforme.',
      icon: `<svg width="24" height="24" fill="none" stroke="#2563eb" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>` },
    { title: 'Formations & Compétences', bg: 'rgba(16,185,129,.1)',
      desc: 'Planifiez des plans de formation, inscrivez vos collaborateurs et évaluez les acquis par département.',
      icon: `<svg width="24" height="24" fill="none" stroke="#10b981" stroke-width="1.8" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>` },
    { title: 'Dossiers Employés', bg: 'rgba(139,92,246,.1)',
      desc: 'Dossiers RH centralisés, historiques de carrière, soldes de congés et organigramme interactif.',
      icon: `<svg width="24" height="24" fill="none" stroke="#8b5cf6" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>` },
    { title: 'Analytics & Rapports', bg: 'rgba(245,158,11,.1)',
      desc: 'Visualisez vos KPIs RH, générez des rapports avancés et exportez vos données pour vos audits.',
      icon: `<svg width="24" height="24" fill="none" stroke="#f59e0b" stroke-width="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>` },
    { title: 'Workflow & Alertes', bg: 'rgba(239,68,68,.1)',
      desc: 'Workflows d\'approbation configurables, alertes automatiques et intégrations e-mail.',
      icon: `<svg width="24" height="24" fill="none" stroke="#ef4444" stroke-width="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>` }
  ];

  steps = [
    { title: 'Inscription', desc: 'Créez votre compte entreprise en 2 minutes. Sans carte bancaire.',
      icon: `<svg width="28" height="28" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
    { title: 'Configuration', desc: 'Importez vos employés, définissez les rôles et personnalisez vos workflows.',
      icon: `<svg width="28" height="28" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>` },
    { title: 'Déploiement', desc: 'Invitez vos équipes et déployez dans toute votre organisation.',
      icon: `<svg width="28" height="28" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` },
    { title: 'Pilotage', desc: 'Suivez vos KPIs RH en temps réel et prenez des décisions data-driven.',
      icon: `<svg width="28" height="28" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>` }
  ];

  solTabs = [
    {
      title: 'Gestion des congés',
      desc: 'Centralisez toutes les demandes, gérez les soldes automatiquement et offrez une visibilité totale aux managers.',
      icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      cards: [
        { title: 'Sarra Ben Ali', sub: 'Congé annuel · 5 jours', badge: 'En attente', status: 'pending', bg: 'rgba(244,124,32,.1)', icon: `<svg width="16" height="16" fill="none" stroke="#f47c20" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
        { title: 'Mohamed Trabelsi', sub: 'Congé maladie · 3 jours', badge: 'Approuvé', status: 'approved', bg: 'rgba(16,185,129,.1)', icon: `<svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
        { title: 'Ines Khelifi', sub: 'Congé maternité · 90 jours', badge: 'Approuvé', status: 'approved', bg: 'rgba(37,99,235,.1)', icon: `<svg width="16" height="16" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` }
      ],
      stats: [{ val: '27', lbl: 'Demandes ce mois', color: '#f47c20' }, { val: '94%', lbl: 'Taux d\'approbation', color: '#10b981' }, { val: '2.1j', lbl: 'Délai moyen', color: '#2563eb' }]
    },
    {
      title: 'Recrutement',
      desc: 'Gérez tout le cycle : publication d\'offres, suivi des candidats, entretiens et onboarding.',
      icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
      cards: [
        { title: 'Développeur Full Stack', sub: 'Sofrecom · 12 candidatures', badge: 'Ouverte', status: 'approved', bg: 'rgba(37,99,235,.1)', icon: `<svg width="16" height="16" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>` },
        { title: 'Chef de Projet RH', sub: 'Vermeg · 7 candidatures', badge: 'Ouverte', status: 'approved', bg: 'rgba(244,124,32,.1)', icon: `<svg width="16" height="16" fill="none" stroke="#f47c20" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>` },
        { title: 'Designer UX/UI', sub: 'Telnet · 5 candidatures', badge: 'En cours', status: 'pending', bg: 'rgba(139,92,246,.1)', icon: `<svg width="16" height="16" fill="none" stroke="#8b5cf6" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>` }
      ],
      stats: [{ val: '12', lbl: 'Offres actives', color: '#2563eb' }, { val: '47', lbl: 'Candidatures', color: '#f47c20' }, { val: '8j', lbl: 'Time-to-hire', color: '#10b981' }]
    },
    {
      title: 'Formations',
      desc: 'Planifiez des plans de formation, suivez les inscriptions et mesurez les résultats.',
      icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
      cards: [
        { title: 'DevOps & CI/CD', sub: '12 inscrits · Avril 2025', badge: 'En cours', status: 'pending', bg: 'rgba(16,185,129,.1)', icon: `<svg width="16" height="16" fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>` },
        { title: 'Leadership & Management', sub: '8 inscrits · Mai 2025', badge: 'Planifiée', status: 'approved', bg: 'rgba(244,124,32,.1)', icon: `<svg width="16" height="16" fill="none" stroke="#f47c20" stroke-width="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>` },
        { title: 'Cybersécurité', sub: '20 inscrits · Juin 2025', badge: 'Planifiée', status: 'approved', bg: 'rgba(239,68,68,.1)', icon: `<svg width="16" height="16" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` }
      ],
      stats: [{ val: '9', lbl: 'Formations actives', color: '#10b981' }, { val: '142', lbl: 'Employés formés', color: '#f47c20' }, { val: '96%', lbl: 'Satisfaction', color: '#2563eb' }]
    }
  ];

  statsItems = [
    { val: '500+', lbl: 'Entreprises clientes' },
    { val: '12 000+', lbl: 'Employés gérés' },
    { val: '98%', lbl: 'Taux de satisfaction' },
    { val: '3×', lbl: 'Plus rapide qu\'Excel' }
  ];

  careerOffers: CareerOffer[] = CAREER_OFFERS;

  plans = [
    {
      name: 'Starter', priceMonth: '490', priceYear: '392', featured: false, badge: '',
      desc: 'Pour les PME qui démarrent leur digitalisation RH.',
      cta: 'Essai gratuit 30 jours',
      features: ["Jusqu'à 100 employés", 'Gestion des congés', 'Module recrutement', 'Support email', 'Rapports de base']
    },
    {
      name: 'Business', priceMonth: '990', priceYear: '792', featured: true, badge: 'Le plus populaire',
      desc: 'Pour les ETI avec des besoins RH avancés et multi-sites.',
      cta: 'Démarrer maintenant',
      features: ["Jusqu'à 500 employés", 'Tous les modules RH', 'Analytics avancés', 'Multi-entités', 'Support prioritaire 24/7', 'API & intégrations', 'Formations & compétences']
    },
    {
      name: 'Enterprise', priceMonth: 'Sur devis', priceYear: 'Sur devis', featured: false, badge: '',
      desc: 'Solution sur-mesure pour grands groupes et organisations.',
      cta: 'Contacter les ventes',
      features: ['Employés illimités', 'Déploiement on-premise', 'SSO & LDAP', 'SLA garanti 99.9%', 'Intégrations custom', 'Account Manager dédié', 'Formation & onboarding']
    }
  ];

  testimonials = [
    { text: 'ItVision a transformé notre gestion RH. Nous avons réduit le temps de traitement des congés de 80%. L\'interface est intuitive et nos équipes l\'ont adoptée immédiatement.', name: 'Sarra Khediri', role: 'DRH — Sofrecom Tunisie', initials: 'SK', bg: 'rgba(11,31,79,.1)' },
    { text: 'Le module recrutement nous a permis de centraliser tous nos processus. On gère aujourd\'hui 3× plus de candidatures avec la même équipe RH.', name: 'Mohamed Jebali', role: 'Directeur RH — Vermeg', initials: 'MJ', bg: 'rgba(244,124,32,.1)' },
    { text: 'La qualité du support est remarquable. L\'équipe ItVision nous a accompagnés tout au long du déploiement. Un vrai partenaire stratégique.', name: 'Leila Mansouri', role: 'VP RH — Poulina Group', initials: 'LM', bg: 'rgba(16,185,129,.1)' }
  ];

  faqs = [
    { q: 'Combien de temps faut-il pour déployer ItVision ?', a: 'La plupart de nos clients sont opérationnels en 1 à 2 semaines. Notre équipe vous accompagne lors de la configuration initiale, l\'import des données et la formation des administrateurs.' },
    { q: 'Peut-on intégrer ItVision avec notre SIRH existant ?', a: 'Oui. ItVision dispose d\'une API REST complète et de connecteurs natifs pour les principaux SIRH du marché (SAP, Oracle HCM, etc.). Des intégrations custom sont disponibles dans le plan Enterprise.' },
    { q: 'Où sont hébergées nos données ?', a: 'Vos données sont hébergées en Tunisie dans des data centres certifiés ISO 27001, avec chiffrement AES-256. Nous proposons également un hébergement on-premise pour le plan Enterprise.' },
    { q: 'Y a-t-il un engagement minimum ?', a: 'Non. Les plans Starter et Business sont sans engagement, résiliables à tout moment. Le plan Enterprise inclut un contrat annuel avec SLA garanti.' },
    { q: 'Comment fonctionne l\'essai gratuit ?', a: 'L\'essai de 30 jours donne accès à toutes les fonctionnalités du plan Business, sans carte bancaire. À l\'issue des 30 jours, vous choisissez le plan adapté.' }
  ];

  footerCols = [
    { title: 'Plateforme', links: ['Fonctionnalités', 'Tarifs', 'Sécurité', 'Intégrations', 'Nouveautés'] },
    { title: 'Solutions', links: ['Gestion des congés', 'Recrutement', 'Formations', 'Analytics RH', 'Organigramme'] },
    { title: 'Entreprise', links: ['À propos', 'Carrières', 'Blog RH', 'Partenaires', 'Presse'] },
    { title: 'Support', links: ['Documentation', "Centre d'aide", 'Statut', 'Nous contacter', 'RGPD'] }
  ];

  mockKpis = [{ color: '#f47c20' }, { color: '#2563eb' }, { color: '#10b981' }, { color: '#8b5cf6' }];
  mockBars = [{ h: 40, active: false }, { h: 60, active: false }, { h: 45, active: false }, { h: 80, active: true }, { h: 55, active: false }, { h: 70, active: false }, { h: 50, active: false }];

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const modal = data['authModal'];
      if (modal === 'login' || modal === 'reset') {
        this.authModalMode = modal;
        this.loginModalOpen = true;
        this.menuOpen = false;
      }
    });
  }
}
