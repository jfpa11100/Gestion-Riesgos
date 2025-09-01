import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrioritizationComponent } from './prioritization.component';

describe('PrioritizationComponent', () => {
  let component: PrioritizationComponent;
  let fixture: ComponentFixture<PrioritizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrioritizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrioritizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
