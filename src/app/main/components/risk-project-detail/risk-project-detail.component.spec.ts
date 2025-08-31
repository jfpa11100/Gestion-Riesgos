import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiskProjectDetailComponent } from './risk-project-detail.component';
import { RisksService } from '../../services/risks/risks.service';
import { Risk } from '../../interfaces/risk.interface';
import { ProjectComponent } from '../../pages/project/project.component';

describe('RiskProjectDetailComponent', () => {
  let component: RiskProjectDetailComponent;
  let fixture: ComponentFixture<RiskProjectDetailComponent>;
  let mockRisksService: jasmine.SpyObj<RisksService>;

  const mockRisk: Risk = {
    id: '1',
    risk: 'Riesgo prueba',
    category: 'Test Category',
    probability: 2,
    impact: 1,
  };

  beforeEach(async () => {
    mockRisksService = jasmine.createSpyObj('RisksService', [
      'updateRiskProbability',
      'updateRiskImpact',
    ]);

    await TestBed.configureTestingModule({
      imports: [RiskProjectDetailComponent, ProjectComponent],
      providers: [
        { provide: RisksService, useValue: mockRisksService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RiskProjectDetailComponent);
    component = fixture.componentInstance;

    component.risk = mockRisk;
    component.projectId = 'project-123';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set currentProbability and currentImpact correctly', () => {
      component.ngOnInit();
      expect(component.currentProbability).toBe('Alta');
      expect(component.currentImpact).toBe('Medio');
    });
  });

  describe('changeProbability', () => {
    it('should update probability and call service', async () => {
      mockRisksService.updateRiskProbability.and.returnValue(Promise.resolve());

      await component.changeProbability(1);

      expect(component.currentProbability).toBe('Media');
      expect(mockRisksService.updateRiskProbability)
        .toHaveBeenCalledWith('project-123', '1', 1);
    });
  });

  describe('changeImpact', () => {
    it('should update impact and call service', async () => {
      mockRisksService.updateRiskImpact.and.returnValue(Promise.resolve());

      await component.changeImpact(2);

      expect(component.currentImpact).toBe('Alto');
      expect(mockRisksService.updateRiskImpact)
        .toHaveBeenCalledWith('project-123', '1', 2);
    });

    it('should restore previous impact on error', async () => {
      component.currentImpact = 'Medio';
      mockRisksService.updateRiskImpact.and.returnValue(Promise.reject('Error'));

      await component.changeImpact(0);

      expect(component.currentImpact).toBe('Medio'); // restored
    });
  });

  describe('toggles', () => {
    it('should toggle probability menu', () => {
      expect(component.openProbabilityMenu).toBeFalse();
      component.toggleProbabilityMenu();
      expect(component.openProbabilityMenu).toBeTrue();
    });

    it('should toggle impact menu', () => {
      expect(component.openImpactMenu).toBeFalse();
      component.toggleImpactMenu();
      expect(component.openImpactMenu).toBeTrue();
    });
  });
});
