import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CareerOffer } from '../career-offers';
import { OffreEmploiService } from '../../../services/offre-emploi.service';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.css']
})
export class OfferDetailComponent implements OnInit {
  offer: CareerOffer | undefined;
  loadingOffer = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offreEmploiService: OffreEmploiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/home']);
      return;
    }

    this.offreEmploiService.getOffreById(id).subscribe({
      next: (offre) => {
        this.offer = {
          ...offre,
          company: 'ItVision',
          location: 'Tunis, Tunisie'
        };
        this.loadingOffer = false;
      },
      error: () => {
        this.loadingOffer = false;
        this.router.navigate(['/home']);
      }
    });
  }
}
