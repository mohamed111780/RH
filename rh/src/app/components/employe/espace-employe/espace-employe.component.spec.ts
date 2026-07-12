import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaceEmployeComponent } from './espace-employe.component';

describe('EspaceEmployeComponent', () => {
  let component: EspaceEmployeComponent;
  let fixture: ComponentFixture<EspaceEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceEmployeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EspaceEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the cancel modal for a pending leave request', () => {
    component.openCancelDemandeModal(42);

    expect(component.showCancelDemandeModal).toBeTrue();
    expect(component.cancelingDemandeId).toBe(42);
  });

  it('should extract a server error message from the HttpErrorResponse payload', () => {
    const error = { error: { message: 'Solde de congé insuffisant' } } as any;

    const message = (component as any).getCongeErrorMessage(error, 'fallback');

    expect(message).toBe('Solde de congé insuffisant');
  });
});
