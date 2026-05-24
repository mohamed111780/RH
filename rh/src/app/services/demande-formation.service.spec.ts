import { TestBed } from '@angular/core/testing';

import { DemandeFormationService } from './demande-formation.service';

describe('DemandeFormationService', () => {
  let service: DemandeFormationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeFormationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
