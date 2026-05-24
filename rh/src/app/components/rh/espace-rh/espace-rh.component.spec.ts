import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EspaceRhComponent } from './espace-rh.component';

describe('EspaceRhComponent', () => {
  let component: EspaceRhComponent;
  let fixture: ComponentFixture<EspaceRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceRhComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EspaceRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with dashboard page', () => {
    expect(component.currentPage).toBe('dashboard');
  });

  it('should open new offre modal', () => {
    component.openNewOffreModal();
    expect(component.showModal).toBe(true);
    expect(component.modalTitle).toBe('Créer une nouvelle offre');
  });

  it('should close modal', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBe(false);
  });

  it('should add tag to new offre', () => {
    component.tagInputValue = 'React';
    component.addTag();
    expect(component.newOffreTags).toContain('React');
    expect(component.tagInputValue).toBe('');
  });

  it('should remove tag from new offre', () => {
    component.newOffreTags = ['React', 'Node.js'];
    component.removeTag('React');
    expect(component.newOffreTags).toEqual(['Node.js']);
  });

  it('should save new offre', () => {
    component.newOffreTitre = 'Developer';
    component.newOffreDesc = 'Test description';
    component.newOffreDept = 'Ingénierie';
    component.newOffreNiveau = 'Senior';
    component.newOffreTags = ['React'];
    
    const initialLength = component.offres.length;
    component.saveNewOffre();
    
    expect(component.offres.length).toBe(initialLength + 1);
    expect(component.showModal).toBe(false);
  });

  it('should filter offres by department', () => {
    component.selectedDept = 'Ingénierie';
    const filtered = component.filteredOffres;
    expect(filtered.every(o => o.dept === 'Ingénierie')).toBe(true);
  });

  it('should calculate total candidatures', () => {
    const total = component.totalCandidatures;
    expect(total).toBe(component.offres.reduce((sum, o) => sum + o.candidatures, 0));
  });

  it('should show page', () => {
    component.showPage('offres');
    expect(component.currentPage).toBe('offres');
    expect(component.pageTitle).toBe('Gestion des Offres d\'Emploi');
  });

  it('should display toast message', () => {
    component.showToast('Test message');
    expect(component.toastVisible).toBe(true);
    expect(component.toastMessage).toBe('Test message');
  });

  it('should delete offre', () => {
    const offreToDelete = component.offres[0];
    spyOn(window, 'confirm').and.returnValue(true);
    
    const initialLength = component.offres.length;
    component.deleteOffre(offreToDelete);
    
    expect(component.offres.length).toBe(initialLength - 1);
  });

  it('should view offre kanban', () => {
    const offre = component.offres[0];
    component.viewOffreKanban(offre);
    
    expect(component.currentPage).toBe('kanban');
    expect(component.kanbanTitle).toBe(offre.title);
  });
});
