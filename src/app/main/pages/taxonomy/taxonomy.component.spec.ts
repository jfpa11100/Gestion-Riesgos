import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaxonomyComponent } from './taxonomy.component';
import { RisksService } from '../../services/risks/risks.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Risk, CategoryRisk } from '../../interfaces/risk.interface';

class MockRisksService {
  getRisksByCategory = jasmine.createSpy().and.returnValue(
    Promise.resolve([
      { topic: 'Product Engineering', category: 'Risk 1' } as CategoryRisk,
      { topic: 'Program Constraints', category: 'Risk 2' } as CategoryRisk,
      { topic: 'Development Environment', category: 'Risk 3' } as CategoryRisk,
    ])
  );

  addRisksToProject = jasmine.createSpy().and.returnValue(Promise.resolve());
}

// Mock Router
class MockRouter {
  navigate = jasmine.createSpy();
}

// Mock ActivatedRoute
const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (key: string) => '123',
    },
  },
};

describe('TaxonomyComponent', () => {
  let component: TaxonomyComponent;
  let fixture: ComponentFixture<TaxonomyComponent>;
  let risksService: MockRisksService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxonomyComponent], // standalone!
      providers: [
        { provide: RisksService, useClass: MockRisksService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaxonomyComponent);
    component = fixture.componentInstance;
    risksService = TestBed.inject(RisksService) as unknown as MockRisksService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load risks on init and split them by category', async () => {
    await component.ngOnInit();

    expect(risksService.getRisksByCategory).toHaveBeenCalled();
    expect(component.productEngineeringRisks.length).toBe(1);
    expect(component.programConstraintRisks.length).toBe(1);
    expect(component.developmentEnvironmentRisks.length).toBe(1);
  });

  it('should add risk to addedRisks when selected = true', () => {
    const risk: Risk = { id: '10', risk: 'Test Risk', category: 'Development'} ;

    component.onRiskChange({ risk, selected: true });

    expect(component.addedRisks).toContain(risk);
  });

  it('should remove risk from addedRisks when selected = false', () => {
    const risk: Risk = { id: '10', risk: 'Test Risk', category: 'Development'};
    component.addedRisks.push(risk);

    component.onRiskChange({ risk, selected: false });

    expect(component.addedRisks).not.toContain(risk);
  });

  it('should call risksService.addRisksToProject and navigate back on save', async () => {
    const risk: Risk = { id: '10', risk: 'Test Risk', category: 'Development'}
    component.addedRisks = [risk];

    component.onSaveRisks();

    expect(risksService.addRisksToProject).toHaveBeenCalledWith('123', ['10']);
  });
});
