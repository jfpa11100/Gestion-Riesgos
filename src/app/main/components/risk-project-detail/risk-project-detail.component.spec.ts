import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskProjectDetailComponent } from './risk-project-detail.component';

describe('RiskProjectDetailComponent', () => {
  let component: RiskProjectDetailComponent;
  let fixture: ComponentFixture<RiskProjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskProjectDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
