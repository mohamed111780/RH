import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DemandeFormation, StatutDemandeFormation } from '../../../models/demande-formation';
import { DemandeFormationService } from '../../../services/demande-formation.service';

type RequestFilter = 'ALL' | StatutDemandeFormation;

@Component({
  selector: 'app-demandes-formation-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demandes-formation-panel.component.html',
  styleUrls: ['./demandes-formation-panel.component.css']
})
export class DemandesFormationPanelComponent implements OnInit {
  @Input() theme: 'rh' | 'admin' = 'rh';
  @Output() notify = new EventEmitter<string>();

  requests: DemandeFormation[] = [];
  loading = false;
  updatingRequestId: number | null = null;
  searchQuery = '';
  activeFilter: RequestFilter = 'ALL';

  readonly filters: { key: RequestFilter; label: string }[] = [
    { key: 'ALL', label: 'Toutes' },
    { key: 'EN_ATTENTE', label: 'En attente' },
    { key: 'APPROUVEE', label: 'Approuvées' },
    { key: 'REFUSEE', label: 'Refusées' }
  ];

  constructor(private demandeFormationService: DemandeFormationService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  get filteredRequests(): DemandeFormation[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.requests.filter((request) => {
      if (this.activeFilter !== 'ALL' && request.statutDemande !== this.activeFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const employee = `${request.prenomEmploye || ''} ${request.nomEmploye || ''}`.toLowerCase();
      const formation = (request.titreFormation || '').toLowerCase();
      const matricule = (request.matriculeEmploye || '').toLowerCase();
      const justification = (request.justification || '').toLowerCase();
      return employee.includes(query) || formation.includes(query) || matricule.includes(query) || justification.includes(query);
    });
  }

  get pendingRequestsCount(): number {
    return this.requests.filter((request) => request.statutDemande === 'EN_ATTENTE').length;
  }

  setFilter(filter: RequestFilter): void {
    this.activeFilter = filter;
  }

  loadRequests(): void {
    this.loading = true;
    this.demandeFormationService.getAllDemandes().subscribe({
      next: (requests) => {
        this.requests = requests.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify.emit('Impossible de charger les demandes de formation');
      }
    });
  }

  approveRequest(request: DemandeFormation): void {
    this.updateRequestStatus(request, 'APPROUVEE', 'approuvee');
  }

  rejectRequest(request: DemandeFormation): void {
    this.updateRequestStatus(request, 'REFUSEE', 'refusee');
  }

  employeeName(request: DemandeFormation): string {
    return `${request.prenomEmploye || ''} ${request.nomEmploye || ''}`.trim() || request.matriculeEmploye || 'Employe';
  }

  employeeInitials(request: DemandeFormation): string {
    const initials = `${request.prenomEmploye?.charAt(0) || ''}${request.nomEmploye?.charAt(0) || ''}`.toUpperCase();
    return initials || 'EM';
  }

  avatarStyle(request: DemandeFormation): { bg: string; color: string } {
    const palettes = this.theme === 'admin'
      ? [
          { bg: 'rgba(232,68,33,0.14)', color: 'var(--accent)' },
          { bg: 'rgba(34,211,238,0.14)', color: 'var(--accent6)' },
          { bg: 'rgba(74,222,128,0.14)', color: 'var(--accent3)' },
          { bg: 'rgba(245,158,11,0.14)', color: 'var(--accent4)' },
          { bg: 'rgba(244,63,94,0.14)', color: 'var(--accent5)' }
        ]
      : [
          { bg: 'rgba(79,155,138,0.14)', color: 'var(--teal2)' },
          { bg: 'rgba(226,171,62,0.16)', color: '#b8842a' },
          { bg: 'rgba(91,138,153,0.14)', color: 'var(--accent6)' },
          { bg: 'rgba(138,123,181,0.14)', color: 'var(--purple)' },
          { bg: 'rgba(217,104,92,0.12)', color: 'var(--accent5)' }
        ];

    const seed = this.employeeName(request);
    const index = Math.abs(seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % palettes.length;
    return palettes[index];
  }

  statusLabel(statut: StatutDemandeFormation | string): string {
    const labels: Record<string, string> = {
      EN_ATTENTE: 'En attente',
      APPROUVEE: 'Approuvee',
      REFUSEE: 'Refusee',
      ANNULEE: 'Annulee'
    };
    return labels[statut] || statut;
  }

  statusClass(statut: StatutDemandeFormation | string): string {
    const classes: Record<string, string> = {
      EN_ATTENTE: 'pending',
      APPROUVEE: 'active',
      REFUSEE: 'absent',
      ANNULEE: 'leave'
    };
    return classes[statut] || 'pending';
  }

  cardAccentClass(statut: StatutDemandeFormation | string): string {
    const classes: Record<string, string> = {
      EN_ATTENTE: 'accent-pending',
      APPROUVEE: 'accent-approved',
      REFUSEE: 'accent-rejected',
      ANNULEE: 'accent-cancelled'
    };
    return classes[statut] || 'accent-pending';
  }

  private updateRequestStatus(
    request: DemandeFormation,
    statut: StatutDemandeFormation,
    successSuffix: string
  ): void {
    if (!request.id) {
      this.notify.emit('Demande introuvable');
      return;
    }
    if (request.statutDemande === statut) {
      this.notify.emit('La demande est deja dans cet etat');
      return;
    }

    this.updatingRequestId = request.id;
    this.demandeFormationService.changeStatut(request.id, statut).subscribe({
      next: () => {
        this.updatingRequestId = null;
        this.loadRequests();
        this.notify.emit(`Demande de ${this.employeeName(request)} ${successSuffix}`);
      },
      error: (error: HttpErrorResponse) => {
        this.updatingRequestId = null;
        const message = typeof error.error === 'string'
          ? error.error
          : error.error?.message || 'Erreur lors de la mise a jour de la demande';
        this.notify.emit(message);
      }
    });
  }
}
