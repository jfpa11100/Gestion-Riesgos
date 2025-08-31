import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RisksListComponent } from './risks-list.component';
import { ProjectService } from '../../services/projects/project.service';
import { AuthService } from '../../../auth/services/auth.service';
import { CategoryRisk, Risk } from '../../interfaces/risk.interface';
import { of } from 'rxjs';

// Mocks
const mockProjectService = {
  currentProject: jasmine.createSpy('currentProject').and.returnValue({
    owner: 'owner-123',
  }),
};

const mockAuthService = {
  getUserId: jasmine.createSpy('getUserId').and.resolveTo('owner-123'),
};

describe('RisksListComponent', () => {
  let component: RisksListComponent;
  let fixture: ComponentFixture<RisksListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisksListComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RisksListComponent);
    component = fixture.componentInstance;

    // Mock inputs
    component.category = {
      topic: 'Test Topic',
      category: 'test category',
      risks: []
    } as CategoryRisk;
    component.index = 0;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set isOwner to true if user is project owner', async () => {
      mockAuthService.getUserId.and.resolveTo('owner-123');
      await component.ngOnInit();
      expect(mockProjectService.currentProject).toHaveBeenCalled();
      expect(mockAuthService.getUserId).toHaveBeenCalled();
      expect(component.isOwner).toBeTrue();
    });

    it('should set isOwner to false if user is NOT project owner', async () => {
      mockAuthService.getUserId.and.resolveTo('different-user');
      await component.ngOnInit();
      expect(component.isOwner).toBeFalse();
    });
  });

  describe('onRiskChange', () => {
    it('should emit riskChange event with selected true when checkbox is checked', () => {
      spyOn(component.riskChange, 'emit');
      const risk: Risk = { id: '1', risk: 'Test Risk', category: 'Test Category' };

      const mockEvent = {
        target: { checked: true },
      } as unknown as Event;

      component.onRiskChange(mockEvent, risk);

      expect(component.riskChange.emit).toHaveBeenCalledWith({
        risk,
        selected: true,
      });
    });

    it('should emit riskChange event with selected false when checkbox is unchecked', () => {
      spyOn(component.riskChange, 'emit');
      const risk: Risk = { id: '2', risk: 'Another Risk', category: 'Another Category' };

      const mockEvent = {
        target: { checked: false },
      } as unknown as Event;

      component.onRiskChange(mockEvent, risk);

      expect(component.riskChange.emit).toHaveBeenCalledWith({
        risk,
        selected: false,
      });
    });
  });
});
